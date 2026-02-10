const WORDPRESS_URL = import.meta.env.VITE_WORDPRESS_URL || "";

export interface WordPressProject {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt?: { rendered: string };
  content?: { rendered: string };
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
  category: string;
  description: string;
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

function firstUrlFromSrcSet(srcset: string | null): string {
  // srcset: "url1 300w, url2 1024w" -> pega o primeiro url
  if (!srcset) return "";
  const first = srcset.split(",")[0]?.trim();
  if (!first) return "";
  return first.split(" ")[0]?.trim() || "";
}

function extractImagesFromContent(html: string = ""): string[] {
  if (!html) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const imgs = Array.from(doc.querySelectorAll("img"));
  const urls = imgs
    .map((img) => {
      // WP.com / lazyload: pode usar data-src / data-orig-file
      const src =
        img.getAttribute("src") ||
        img.getAttribute("data-src") ||
        img.getAttribute("data-orig-file") ||
        img.getAttribute("data-large-file") ||
        firstUrlFromSrcSet(img.getAttribute("srcset"));

      return src || "";
    })
    .filter(isValidUrl);

  // dedup
  return Array.from(new Set(urls));
}

function featuredFromEmbedded(wp: WordPressProject): string {
  const fm = wp._embedded?.["wp:featuredmedia"]?.[0];
  const url =
    fm?.source_url ||
    fm?.media_details?.sizes?.full?.source_url ||
    fm?.media_details?.sizes?.large?.source_url ||
    fm?.guid?.rendered ||
    "";
  return isValidUrl(url) ? url : "";
}

export async function fetchWordPressProjects(): Promise<TransformedProject[]> {
  if (!WORDPRESS_URL) throw new Error("WordPress URL not configured");

  const res = await fetch(
    `${WORDPRESS_URL}/wp-json/wp/v2/projeto?per_page=100&_embed`,
    { headers: { "Content-Type": "application/json" } }
  );

  if (!res.ok) throw new Error(`Failed to fetch projects: ${res.statusText}`);

  const data: WordPressProject[] = await res.json();

  // 🔎 Debug útil (não quebra nada). Veja no console UMA vez.
  const first = data?.[0];
  if (first) {
    console.log("WP CHECK:", {
      id: first.id,
      slug: first.slug,
      hasEmbedded: !!first._embedded,
      featured: featuredFromEmbedded(first),
      contentHasImgTag: (first.content?.rendered || "").includes("<img"),
      extractedImagesCount: extractImagesFromContent(first.content?.rendered || "")
        .length,
    });
  }

  return data.map(transformProject);
}

export async function fetchWordPressProjectById(
  id: number
): Promise<TransformedProject | null> {
  if (!WORDPRESS_URL) throw new Error("WordPress URL not configured");

  const res = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/projeto/${id}?_embed`, {
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
    `${WORDPRESS_URL}/wp-json/wp/v2/projeto?slug=${encodeURIComponent(slug)}&_embed`,
    { headers: { "Content-Type": "application/json" } }
  );

  if (!res.ok) {
    // WP costuma retornar 200 com array vazio; mas se der erro real, tratamos
    throw new Error(`Failed to fetch project by slug: ${res.statusText}`);
  }

  const data: WordPressProject[] = await res.json();
  const wp = data?.[0];
  if (!wp) return null;

  return transformProject(wp);
}

function transformProject(wp: WordPressProject): TransformedProject {
  const featured = featuredFromEmbedded(wp);

  const contentHtml = wp.content?.rendered || "";
  const contentImages = extractImagesFromContent(contentHtml);

  const category = wp._embedded?.["wp:term"]?.[0]?.[0]?.name || "PROJETO";

  const description =
    stripHtml(wp.excerpt?.rendered || "") || stripHtml(contentHtml).slice(0, 220);

  // thumbnail: featured, senão primeira imagem do conteúdo
  const thumbnail = featured || contentImages[0] || "";

  // images: conteúdo, e se estiver vazio, usa thumbnail se existir
  const images = contentImages.length ? contentImages : [thumbnail].filter(Boolean);

  return {
    id: `wp-${wp.id}`,
    wordpressId: wp.id,
    slug: wp.slug,
    title: stripHtml(wp.title?.rendered || "").toUpperCase(),
    category: stripHtml(category).toUpperCase(),
    description,
    thumbnail,
    images,
    details: undefined,
  };
}