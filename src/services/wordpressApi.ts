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

// ─── Item de mídia ordenado (imagem ou vídeo Vimeo) ──────────
export type MidiaItem =
  | { tipo: "imagem"; url: string }
  | { tipo: "vimeo"; vimeo_id: string };

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
  images: string[]; // apenas imagens, para o ImageLightbox
  midia: MidiaItem[]; // lista ordenada com imagens e vídeos intercalados
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

function toOriginalSize(url: string): string {
  let clean = url.split("?")[0];
  clean = clean.replace(/-\d+x\d+(\.\w+)$/, "$1");
  return clean;
}

function bestImageUrl(img: Element): string {
  const candidates = [
    img.getAttribute("data-orig-file"),
    img.getAttribute("data-large-file"),
    img.getAttribute("data-full-url"),
  ].filter(isValidUrl) as string[];

  if (candidates.length) return candidates[0];

  const srcset = img.getAttribute("srcset") || img.getAttribute("data-srcset") || "";
  if (srcset) {
    const best = bestUrlFromSrcSet(srcset);
    if (isValidUrl(best)) return toOriginalSize(best);
  }

  const src = img.getAttribute("data-src") || img.getAttribute("src") || "";
  return isValidUrl(src) ? toOriginalSize(src) : "";
}

// ── Extrai mídia do HTML do Gutenberg preservando a ordem ────
// Percorre os blocos em sequência para manter intercalagem
// entre imagens e embeds do Vimeo exatamente como no editor.
function extractMediaFromContent(html: string = ""): MidiaItem[] {
  if (!html) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const items: MidiaItem[] = [];
  const seen = new Set<string>();

  for (const block of Array.from(doc.body.children)) {
    // ── Bloco Vimeo embed do Gutenberg ──────────────────────
    // <figure class="wp-block-embed is-type-video is-provider-vimeo">
    //   <div class="wp-block-embed__wrapper">
    //     https://vimeo.com/812345678
    //   </div>
    // </figure>
    const isEmbed = block.classList.contains("wp-block-embed");
    const wrapperText =
      block.querySelector(".wp-block-embed__wrapper")?.textContent || "";
    const isVimeo =
      block.classList.contains("is-provider-vimeo") ||
      wrapperText.includes("vimeo.com");

    if (isEmbed && isVimeo) {
      const match = wrapperText.trim().match(/vimeo\.com\/(?:video\/)?(\d+)/);
      if (match) {
        const vimeo_id = match[1];
        const key = `vimeo:${vimeo_id}`;
        if (!seen.has(key)) {
          seen.add(key);
          items.push({ tipo: "vimeo", vimeo_id });
        }
      }
      continue;
    }

    // ── Imagens dentro de qualquer outro bloco ───────────────
    for (const img of Array.from(block.querySelectorAll("img"))) {
      const url = bestImageUrl(img);
      if (url && !seen.has(url)) {
        seen.add(url);
        items.push({ tipo: "imagem", url });
      }
    }
  }

  return items;
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
  return wp.meta?.[fieldName] || wp.acf?.[fieldName] || "";
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
      acf: first.acf,
      category_pt: getCustomField(first, "category_pt"),
      category_en: getCustomField(first, "category_en"),
      content_preview: first.content?.rendered?.slice(0, 300),
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

  // Lista ordenada de mídia (imagens + vídeos Vimeo intercalados)
  const midia = extractMediaFromContent(contentHtml);
  console.log("MIDIA EXTRAÍDA:", midia);

  // Só as imagens, para o ImageLightbox
  const images = midia
    .filter((m): m is Extract<MidiaItem, { tipo: "imagem" }> => m.tipo === "imagem")
    .map((m) => m.url);

  const thumbnail = featured || images[0] || "";

  const category_pt =
    getCustomField(wp, "category_pt") ||
    wp._embedded?.["wp:term"]?.[0]?.[0]?.name ||
    "Projeto";

  const category_en = getCustomField(wp, "category_en") || category_pt;

  const description_pt =
    getCustomField(wp, "description_pt") ||
    stripHtml(wp.excerpt?.rendered || "") ||
    stripHtml(contentHtml).slice(0, 800);

  const description_en = getCustomField(wp, "description_en") || description_pt;

  const description =
    stripHtml(wp.excerpt?.rendered || "") || stripHtml(contentHtml).slice(0, 220);

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
    midia,
    details: undefined,
  };
}
