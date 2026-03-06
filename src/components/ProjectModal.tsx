// src/components/ProjectModal.tsx
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, Play } from "lucide-react";
import { Project } from "@/data/projects";
import { ImageLightbox } from "./ImageLightbox";
import { useTranslation } from "react-i18next";

// ─── Slugs que ativam o modo grade de slides ──────────────────
const SLIDE_GALLERY_SLUGS = ["apresentacoes", "apresentações", "slides", "presentations"];

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

function isValidImageUrl(url: string) {
  return (
    typeof url === "string" &&
    (url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("//") ||
      url.startsWith("/") ||
      url.startsWith("data:") ||
      url.includes("/assets/"))
  );
}

function isVideoUrl(url: string) {
  return (
    /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) ||
    url.includes("videopress.com/v/") ||
    url.includes("videopress.com/embed/")
  );
}

function isVideoPressUrl(url: string) {
  return url.includes("videopress.com/v/") || url.includes("videopress.com/embed/");
}

function toVideoPressEmbed(url: string): string {
  const match = url.match(/videopress\.com\/(?:v|embed)\/([a-zA-Z0-9]+)/);
  if (!match) return url;
  return `https://videopress.com/embed/${match[1]}?cover=true&autoPlay=true`;
}

function videoPressThumbnail(url: string): string {
  const match = url.match(/videopress\.com\/(?:v|embed)\/([a-zA-Z0-9]+)/);
  if (!match) return "";
  return `https://videos.files.wordpress.com/${match[1]}/poster.jpg`;
}

// Gera URL de miniatura via Jetpack CDN (para cards da grade)
function toThumbnailUrl(url: string, width = 600, height = 338): string {
  // Já é uma URL do Jetpack CDN (i0.wp.com)?
  if (url.includes("i0.wp.com") || url.includes(".wp.com/")) {
    // Substitui ou adiciona parâmetros de tamanho
    const base = url.split("?")[0];
    return `${base}?fit=${width}%2C${height}&ssl=1&quality=75`;
  }
  // URL direta do WordPress — tenta construir via Jetpack CDN
  if (url.includes("wp-content/uploads")) {
    const domain = url.match(/https?:\/\/([^/]+)/)?.[1] || "";
    const path = url.replace(/https?:\/\/[^/]+/, "");
    return `https://i0.wp.com/${domain}${path}?fit=${width}%2C${height}&ssl=1&quality=75`;
  }
  return url;
}

// Gera URL fullsize via Jetpack CDN (para lightbox)
function toFullsizeUrl(url: string): string {
  if (url.includes("i0.wp.com") || url.includes(".wp.com/")) {
    const base = url.split("?")[0];
    return `${base}?fit=1920%2C1080&ssl=1&quality=90`;
  }
  return url;
}

// ─── Grade de miniaturas + lightbox ──────────────────────────
function SlideGrid({ images }: { images: string[] }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  const openLightbox = (index: number) => { setCurrent(index); setLightboxOpen(true); };
  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.stopPropagation(); prev(); }
      if (e.key === "ArrowRight") { e.stopPropagation(); next(); }
      if (e.key === "Escape") { e.stopPropagation(); setLightboxOpen(false); }
    };
    window.addEventListener("keydown", handler, { capture: true });
    return () => window.removeEventListener("keydown", handler, { capture: true });
  }, [lightboxOpen, images.length]);

  const currentUrl = images[current] || "";
  const isCurrentVideoPress = isVideoPressUrl(currentUrl);
  const isCurrentVideo = isVideoUrl(currentUrl);

  return (
    <>
      {/* ── Grade ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-10">
        {images.map((img, idx) => {
          const video = isVideoUrl(img);
          const vpThumb = isVideoPressUrl(img) ? videoPressThumbnail(img) : "";
          // Usa miniatura pequena no card, fullsize só no lightbox
          const cardSrc = video ? vpThumb : toThumbnailUrl(img);

          return (
            <motion.button
              key={`${img}-${idx}`}
              onClick={() => openLightbox(idx)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.02 }}
              className="group relative aspect-video rounded-xl overflow-hidden bg-black/5 border border-black/8 hover:border-black/20 transition-all focus:outline-none"
            >
              {video && !vpThumb ? (
                // MP4 direto: usa <video> para capturar primeiro frame
                <video
                  src={`${img}#t=0.5`}
                  preload="metadata"
                  muted
                  playsInline
                  className="w-full h-full object-cover brightness-90 group-hover:brightness-100 transition-all duration-300 group-hover:scale-105 pointer-events-none"
                />
              ) : (
                <img
                  src={cardSrc}
                  alt={video ? `Vídeo ${idx + 1}` : `Slide ${idx + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover brightness-90 group-hover:brightness-100 transition-all duration-300 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/20 border border-white/60 flex items-center justify-center">
                  {video
                    ? <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                    : <ZoomIn className="w-4 h-4 text-white" />
                  }
                </div>
              </div>
              {video && (
                <div className="absolute top-2 right-2 bg-black/70 text-white font-dmsans text-[9px] tracking-widest uppercase px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Play className="w-2 h-2 fill-white" /> Vídeo
                </div>
              )}
              <div className="absolute bottom-2 left-2 font-dmsans text-[9px] tracking-widest text-white/50 opacity-0 group-hover:opacity-100 transition-opacity">
                {String(idx + 1).padStart(2, "0")}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setLightboxOpen(false)} />

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-16 py-20">

              {/* Fechar */}
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Contador */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 font-dmsans text-[11px] tracking-widest uppercase text-white/50 flex items-center gap-2">
                {current + 1} / {images.length}
                {isCurrentVideo && (
                  <span className="bg-white/20 text-white/80 text-[9px] px-2 py-0.5 rounded tracking-widest">VÍDEO</span>
                )}
              </div>

              {/* Mídia em tamanho máximo */}
              <motion.div
                key={current}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.18 }}
                className="w-full max-w-6xl rounded-2xl overflow-hidden bg-black shadow-2xl aspect-video"
              >
                {isCurrentVideoPress ? (
                  <iframe
                    src={toVideoPressEmbed(currentUrl)}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; fullscreen"
                    className="w-full h-full"
                  />
                ) : isCurrentVideo ? (
                  <video src={currentUrl} controls autoPlay className="w-full h-full object-contain bg-black" />
                ) : (
                  <img src={toFullsizeUrl(currentUrl)} alt={`Slide ${current + 1}`} className="w-full h-full object-contain bg-black" />
                )}
              </motion.div>

              {/* Setas */}
              <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors">
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors">
                <ChevronRight className="w-6 h-6 text-white" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 flex-wrap justify-center max-w-sm">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                    className={`transition-all duration-200 rounded-full ${i === current ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Modal principal ──────────────────────────────────────────
export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const isSlideGalleryMode = Boolean(
    project?.slug && SLIDE_GALLERY_SLUGS.includes(project.slug.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (lightboxOpen) {
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        setLightboxOpen(false); return;
      }
      onClose();
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [isOpen, onClose, lightboxOpen]);

  const allImages = useMemo(() => {
    if (!project) return [];
    const imgs = [project.thumbnail, ...(project.images || [])].filter(Boolean).filter(isValidImageUrl);
    return Array.from(new Set(imgs));
  }, [project]);

  if (!project) return null;

  const displayDescription = isEn ? (project.description_en || project.description) : (project.description_pt || project.description);
  const displayCategory = isEn ? (project.category_en || project.category) : (project.category_pt || project.category);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[100]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="fixed inset-0 bg-black/55 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />

          {/* HEADER */}
          <div className="fixed top-0 left-0 right-0 z-[110]">
            <div className="mx-auto w-full max-w-6xl px-4 md:px-8 pt-4">
              <div className="rounded-2xl bg-white/90 backdrop-blur-md border border-black/10 shadow-lg">
                <div className="px-5 md:px-8 py-4 flex items-center justify-between gap-4">
                  <button onClick={onClose} className="flex items-center gap-2 font-dmsans text-xs tracking-[0.18em] uppercase text-black/70 hover:text-black transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                    {t("modal.back")}
                  </button>
                  <div className="flex-1 text-center">
                    <div className="font-dmsans text-[11px] tracking-[0.22em] uppercase text-black/60 truncate">{project.title}</div>
                  </div>
                  <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition-colors">
                    <X className="w-5 h-5 text-black/70" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CONTEÚDO */}
          <div className="relative h-full overflow-y-auto">
            <div className="relative min-h-full px-4 pb-6 pt-28 md:px-8 md:pb-10 md:pt-32">
              <motion.div
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ duration: 0.3 }}
                className="mx-auto w-full max-w-6xl rounded-3xl bg-white text-black shadow-2xl border border-black/10 overflow-hidden"
              >
                <div className="px-5 md:px-8 pt-8 md:pt-10 pb-8 md:pb-10">
                  <div className="max-w-4xl mx-auto text-left">
                    <h1 className="block w-full font-zuume italic text-5xl md:text-6xl leading-[0.95]">{project.title}</h1>
                    {displayCategory && <p className="mt-3 font-dmsans text-sm tracking-wider opacity-50 uppercase">{displayCategory}</p>}
                    <p className="mt-6 font-dmsans text-base leading-[1.9] text-black/80">{displayDescription}</p>

                    {(project.details?.year || project.details?.client || project.details?.role) && (
                      <div className="mt-9 pt-7 border-t border-black/10">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          {project.details?.year && <div><div className="font-dmsans text-[11px] uppercase tracking-[0.2em] text-black/45">{t("modal.year")}</div><div className="mt-2 text-lg text-black/85">{project.details.year}</div></div>}
                          {project.details?.client && <div><div className="font-dmsans text-[11px] uppercase tracking-[0.2em] text-black/45">{t("modal.client")}</div><div className="mt-2 text-lg text-black/85">{project.details.client}</div></div>}
                          {project.details?.role && <div><div className="font-dmsans text-[11px] uppercase tracking-[0.2em] text-black/45">{t("modal.role")}</div><div className="mt-2 text-lg text-black/85">{project.details.role}</div></div>}
                        </div>
                      </div>
                    )}

                    {isSlideGalleryMode ? (
                      <SlideGrid images={allImages} />
                    ) : (
                      <div className="mt-10 space-y-5">
                        {allImages.length === 0 ? (
                          <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-6">{t("modal.noImages")}</div>
                        ) : (
                          allImages.map((img, idx) => (
                            <motion.button
                              key={`${img}-${idx}`}
                              onClick={() => { setSelectedImageIndex(idx); setLightboxOpen(true); }}
                              className="w-full rounded-2xl overflow-hidden bg-black/[0.03] border border-black/10 hover:border-black/20 transition-colors"
                              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                            >
                              <div className="relative aspect-[16/9]">
                                <img src={img} alt={`${project.title} - ${idx + 1}`} loading={idx === 0 ? "eager" : "lazy"} className="absolute inset-0 w-full h-full object-contain" />
                              </div>
                            </motion.button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {!isSlideGalleryMode && (
            <ImageLightbox images={allImages} initialIndex={selectedImageIndex} isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
