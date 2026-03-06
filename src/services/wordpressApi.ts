const WORDPRESS_URL = import.meta.env.VITE_WORDPRESS_URL || "";

export interface WordPressProject {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt?: { rendered: string };
  content?: { rendered: string };
  meta?: Record<string, any>;
  category_pt?: string;
  category_en?: string;
  description_pt?: string;
  description_en?: string;
  acf?: Record<string, any>;
  _embedded?: {
    "wp:featuredmedia"?: Array<any>;
    "wp:term"?: Array<any>;
  };
}

export interface TransformedProject {
  id: string;
  wordpressId: number;
  slug: string;
  title: string;
  category: string;       // fallback / pt
  category_pt: string;
  category_en: string;
  description: string;
  description_pt: string;
  description_en: string;
  thumbnail: string;
  images: string[];
  details?: {
    year?: string;
    client?: string;
    role?: string;
  };
}

export function isWordPressConfigured(): boolean {
  return Boolean(WORDPRESS_URL);
}

function stripHtml(html: string = "") {
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").trim();
}

function isValidUrl(u: unknown): u is string {
  return (
    typeof u === "string" &&
    u.length > 0 &&
    (u.startsWith("http://") ||
      u.startsWith("https://") ||
      u.startsWith("//") ||
      u.startsWith("/") ||
      u.startsWith("data:"))
  );
}

function bestUrlFromSrcSet(srcset: string | null): string {
  if (!srcset) return "";
  const entries = srcset.split(",").map((entry) => {
    const parts = entry.trim().split(/\s+/);
    const url = parts[0] || "";
    const width = parseInt(parts[1] || "0", 10) || 0;
    return { url, width };
  });
  entries.sort((a, b) => b.width - a.width);
  return entries[0]?.url || "";
}

function extractImagesFromContent(html: string = ""): string[] {
  if (!html) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const imgs = Array.from(doc.querySelectorAll("img"));
  const urls = imgs
    .map((img) => {
      const src =
        img.getAttribute("data-orig-file") ||
        img.getAttribute("data-large-file") ||
        bestUrlFromSrcSet(img.getAttribute("srcset")) ||
        img.getAttribute("data-src") ||
        img.getAttribute("src");
      return src || "";
    })
    .filter(isValidUrl);
  return Array.from(new Set(urls));
}

function featuredFromEmbedded(wp: WordPressProject): string {
  const fm = wp._embedded?.["wp:featuredmedia"]?.[0];
  const url =
    fm?.media_details?.sizes?.full?.source_url ||
    fm?.media_details?.sizes?.large?.source_url ||
    fm?.source_url ||
    fm?.guid?.rendered ||
    "";
  return isValidUrl(url) ? url : "";
}

// Lê um campo customizado tentando meta, acf e _embedded
function getCustomField(wp: WordPressProject, fieldName: string): string {
  // Tenta direto na raiz (register_rest_field), depois meta e acf
  const root = (wp as any)[fieldName];
  if (root) return root;
  return (
    wp.meta?.[fieldName] ||
    wp.acf?.[fieldName] ||
    ""
  );
}

export async function fetchWordPressProjects(): Promise<TransformedProject[]> {
  if (!WORDPRESS_URL) throw new Error("WordPress URL not configured");

  const res = await fetch(
    `${WORDPRESS_URL}/wp-json/wp/v2/projeto?per_page=100&_embed&acf_format=standard`,
    { headers: { "Content-Type": "application/json" } }
  );

  if (!res.ok) throw new Error(`Failed to fetch projects: ${res.statusText}`);

  const data: WordPressProject[] = await res.json();

  const first = data?.[0];
  if (first) {
    console.log("WP CHECK:", {
      id: first.id,
      meta: first.meta,
      acf: first.acf,
      category_pt: getCustomField(first, "category_pt"),
      category_en: getCustomField(first, "category_en"),
    });
  }

  return data.map(transformProject);
}

export async function fetchWordPressProjectById(
  id: number
): Promise<TransformedProject | null> {
  if (!WORDPRESS_URL) throw new Error("WordPress URL not configured");
  const res = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/projeto/${id}?_embed&acf_format=standard`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch project: ${res.statusText}`);
  }
  const wp: WordPressProject = await res.json();
  return transformProject(wp);
}

export async function fetchWordPressProjectBySlug(
  slug: string
): Promise<TransformedProject | null> {
  if (!WORDPRESS_URL) throw new Error("WordPress URL not configured");
  const res = await fetch(
    `${WORDPRESS_URL}/wp-json/wp/v2/projeto?slug=${encodeURIComponent(slug)}&_embed&acf_format=standard`,
    { headers: { "Content-Type": "application/json" } }
  );
  if (!res.ok) throw new Error(`Failed to fetch project by slug: ${res.statusText}`);
  const data: WordPressProject[] = await res.json();
  const wp = data?.[0];
  if (!wp) return null;
  return transformProject(wp);
}

function transformProject(wp: WordPressProject): TransformedProject {
  const featured = featuredFromEmbedded(wp);
  const contentHtml = wp.content?.rendered || "";
  const contentImages = extractImagesFromContent(contentHtml);

  // Categoria: prioriza campos customizados, cai na taxonomia como último recurso
  const category_pt =
    getCustomField(wp, "category_pt") ||
    wp._embedded?.["wp:term"]?.[0]?.[0]?.name ||
    "Projeto";

  const category_en =
    getCustomField(wp, "category_en") ||
    category_pt; // fallback: mostra o PT se EN não tiver preenchido

  const description_pt =
    getCustomField(wp, "description_pt") ||
    stripHtml(wp.excerpt?.rendered || "") ||
    stripHtml(contentHtml).slice(0, 800);

  const description_en =
    getCustomField(wp, "description_en") ||
    description_pt;

  const description =
    stripHtml(wp.excerpt?.rendered || "") || stripHtml(contentHtml).slice(0, 220);

  const thumbnail = featured || contentImages[0] || "";
  const images = contentImages.length ? contentImages : [thumbnail].filter(Boolean);

  return {
    id: `wp-${wp.id}`,
    wordpressId: wp.id,
    slug: wp.slug,
    title: stripHtml(wp.title?.rendered || "").toUpperCase(),
    category: category_pt.toUpperCase(),
    category_pt: category_pt.toUpperCase(),
    category_en: category_en.toUpperCase(),
    description,
    description_pt,
    description_en,
    thumbnail,
    images,
    details: undefined,
  };
}
export interface WordPressSlide {
  id: number;
  slug: string;
  title: { rendered: string };
  acf?: Record<string, any>;
  meta?: Record<string, any>;
  mime_type?: string;
  source_url?: string;
  media_details?: {
    sizes?: {
      full?: { source_url: string };
      large?: { source_url: string };
      medium_large?: { source_url: string };
    };
  };
  _embedded?: {
    "wp:featuredmedia"?: Array<any>;
  };
}

export interface TransformedSlide {
  id: string;
  wordpressId: number;
  slug: string;
  title: string;
  url: string;        // URL da imagem ou vídeo
  type: "image" | "video";
  thumbnail: string;  // sempre uma imagem (para o card da grade)
  order: number;
}

function bestMediaUrl(item: WordPressSlide): string {
  return (
    item.media_details?.sizes?.full?.source_url ||
    item.media_details?.sizes?.large?.source_url ||
    item.media_details?.sizes?.medium_large?.source_url ||
    item.source_url ||
    ""
  );
}

function isVideo(item: WordPressSlide): boolean {
  return (
    (item.mime_type?.startsWith("video/") ?? false) ||
    (item.source_url?.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) != null)
  );
}

export async function fetchWordPressSlides(): Promise<TransformedSlide[]> {
  if (!WORDPRESS_URL) throw new Error("WordPress URL not configured");

  // Busca itens do custom post type "slide" — ajuste o endpoint se necessário
  // Opção A: Custom Post Type "slide"
  const res = await fetch(
    `${WORDPRESS_URL}/wp-json/wp/v2/slide?per_page=100&_embed&acf_format=standard`,
    { headers: { "Content-Type": "application/json" } }
  );

  // Opção B (alternativa): buscar da galeria de mídia com categoria/tag específica
  // const res = await fetch(
  //   `${WORDPRESS_URL}/wp-json/wp/v2/media?per_page=100&media_type=image&_embed`,
  //   { headers: { "Content-Type": "application/json" } }
  // );

  if (!res.ok) throw new Error(`Failed to fetch slides: ${res.statusText}`);

  const data: WordPressSlide[] = await res.json();

  return data.map((item, index) => {
    const video = isVideo(item);
    const mediaUrl = bestMediaUrl(item);

    // Para vídeos, tenta pegar thumbnail do campo ACF ou featured media
    const featuredMedia = item._embedded?.["wp:featuredmedia"]?.[0];
    const thumbnailFromFeatured =
      featuredMedia?.media_details?.sizes?.large?.source_url ||
      featuredMedia?.source_url ||
      "";

    const thumbnail = video
      ? (item.acf?.thumbnail || thumbnailFromFeatured || "")
      : mediaUrl;

    return {
      id: `slide-${item.id}`,
      wordpressId: item.id,
      slug: item.slug,
      title: stripHtml(item.title?.rendered || ""),
      url: mediaUrl,
      type: video ? "video" : "image",
      thumbnail,
      order: item.acf?.order ?? index,
    };
  }).sort((a, b) => a.order - b.order);
}

