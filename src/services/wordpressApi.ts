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
  category: string;
  category_pt: string;
  category_en: string;
  description: string;
  description_pt: string;
  description_en: string;
  thumbnail: string;
  images: string[]; // inclui URLs de vídeo (.mp4 etc.) para projetos de slides
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

// ── Remove sufixo de tamanho da URL (ex: -1024x768) para obter original ──
function toOriginalSize(url: string): string {
  // WordPress gera URLs como: imagem-1024x768.jpg → imagem.jpg
  return url.replace(/-\d+x\d+(\.\w+)$/, "$1");
}

// ── Melhor URL de imagem: prioriza original/full, remove resize ──
function bestImageUrl(img: Element): string {
  const candidates = [
    img.getAttribute("data-orig-file"),         // Jetpack: URL original
    img.getAttribute("data-large-file"),         // Jetpack: large
    img.getAttribute("data-full-url"),           // alguns temas
  ].filter(isValidUrl) as string[];

  if (candidates.length) return candidates[0];

  // Tenta pegar a maior do srcset
  const srcset = img.getAttribute("srcset") || img.getAttribute("data-srcset") || "";
  if (srcset) {
    const best = bestUrlFromSrcSet(srcset);
    if (isValidUrl(best)) return toOriginalSize(best);
  }

  // Fallback: src normal, remove sufixo de tamanho
  const src = img.getAttribute("data-src") || img.getAttribute("src") || "";
  return isValidUrl(src) ? toOriginalSize(src) : "";
}

// ── Extrai imagens E vídeos do conteúdo HTML ─────────────────
function extractMediaFromContent(html: string = ""): string[] {
  if (!html) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const urls: string[] = [];

  // ── Imagens (bloco Image e bloco Gallery do Gutenberg) ──
  Array.from(doc.querySelectorAll("img")).forEach((img) => {
    const url = bestImageUrl(img);
    if (url) urls.push(url);
  });

  // ── Vídeos: bloco wp-block-video do Gutenberg ──
  Array.from(doc.querySelectorAll(".wp-block-video video, figure.wp-block-video video")).forEach((v) => {
    const src = v.getAttribute("src") || "";
    if (isValidUrl(src)) urls.push(src);
    v.querySelectorAll("source").forEach((source) => {
      const s = source.getAttribute("src") || "";
      if (isValidUrl(s)) urls.push(s);
    });
  });

  // ── Vídeos: tag <video> genérica ──
  Array.from(doc.querySelectorAll("video")).forEach((video) => {
    const src = video.getAttribute("src") || "";
    if (isValidUrl(src)) urls.push(src);
    video.querySelectorAll("source").forEach((source) => {
      const s = source.getAttribute("src") || "";
      if (isValidUrl(s)) urls.push(s);
    });
  });

  // ── VideoPress: decodifica &amp; e varre o HTML bruto ──
  // O WordPress salva a URL como texto dentro de .wp-block-embed__wrapper
  // Ex: "https://videopress.com/v/SVa110Vu?resizeToParent=true&amp;cover=true"
  const htmlDecoded = html.replace(/&amp;/g, "&").replace(/&#038;/g, "&");
  const seen = new Set<string>();
  for (const source of [html, htmlDecoded]) {
    const vpMatches = source.matchAll(/https?:\/\/videopress\.com\/v\/([a-zA-Z0-9]+)/g);
    for (const m of vpMatches) {
      const vpUrl = `https://videopress.com/v/${m[1]}`;
      if (!seen.has(vpUrl)) { seen.add(vpUrl); urls.push(vpUrl); }
    }
  }

  // ── VideoPress via textContent dos wrappers ──
  Array.from(doc.querySelectorAll(".wp-block-embed__wrapper, .wp-block-embed")).forEach((wrapper) => {
    const text = (wrapper.textContent || "").trim();
    const match = text.match(/https?:\/\/videopress\.com\/v\/([a-zA-Z0-9]+)/);
    if (match) {
      const vpUrl = `https://videopress.com/v/${match[1]}`;
      if (!seen.has(vpUrl)) { seen.add(vpUrl); urls.push(vpUrl); }
    }
  });

  // ── Vídeos: links diretos para arquivo de vídeo ──
  Array.from(doc.querySelectorAll("a[href]")).forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (isValidUrl(href) && /\.(mp4|webm|ogg|mov)(\?|$)/i.test(href)) {
      urls.push(href);
    }
  });

  return Array.from(new Set(urls.filter(Boolean)));
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

function getCustomField(wp: WordPressProject, fieldName: string): string {
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
  const res = await fetch(
    `${WORDPRESS_URL}/wp-json/wp/v2/projeto/${id}?_embed&acf_format=standard`,
    { headers: { "Content-Type": "application/json" } }
  );
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

  // Agora extrai imagens E vídeos
  const contentMedia = extractMediaFromContent(contentHtml);

  const category_pt =
    getCustomField(wp, "category_pt") ||
    wp._embedded?.["wp:term"]?.[0]?.[0]?.name ||
    "Projeto";

  const category_en =
    getCustomField(wp, "category_en") ||
    category_pt;

  const description_pt =
    getCustomField(wp, "description_pt") ||
    stripHtml(wp.excerpt?.rendered || "") ||
    stripHtml(contentHtml).slice(0, 800);

  const description_en =
    getCustomField(wp, "description_en") ||
    description_pt;

  const description =
    stripHtml(wp.excerpt?.rendered || "") || stripHtml(contentHtml).slice(0, 220);

  const thumbnail = featured || contentMedia[0] || "";
  const images = contentMedia.length ? contentMedia : [thumbnail].filter(Boolean);

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
