import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft } from "lucide-react";
import { Project } from "@/data/projects";
import { ImageLightbox } from "./ImageLightbox";

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

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  /* Lock scroll */
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* ESC behaviour */
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;

      if (lightboxOpen) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setLightboxOpen(false);
        return;
      }

      onClose();
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });

    return () =>
      window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [isOpen, onClose, lightboxOpen]);

  const allImages = useMemo(() => {
    if (!project) return [];

    const imgs = [project.thumbnail, ...(project.images || [])]
      .filter(Boolean)
      .filter(isValidImageUrl);

    return Array.from(new Set(imgs));
  }, [project]);

  if (!project) return null;

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setLightboxOpen(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 bg-black/55 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* HEADER FIXO */}
          <div className="fixed top-0 left-0 right-0 z-[110]">
            <div className="mx-auto w-full max-w-6xl px-4 md:px-8 pt-4">
              <div className="rounded-2xl bg-white/90 backdrop-blur-md border border-black/10 shadow-lg">
                <div className="px-5 md:px-8 py-4 flex items-center justify-between gap-4">
                  <button
                    onClick={onClose}
                    className="flex items-center gap-2 font-dmsans text-xs tracking-[0.18em] uppercase text-black/70 hover:text-black transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Voltar
                  </button>

                  <div className="flex-1 text-center">
                    <div className="font-dmsans text-[11px] tracking-[0.22em] uppercase text-black/60 truncate">
                      {project.title}
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-black/5 transition-colors"
                  >
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
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mx-auto w-full max-w-6xl rounded-3xl bg-white text-black shadow-2xl border border-black/10 overflow-hidden"
              >
                <div className="px-5 md:px-8 pt-8 md:pt-10 pb-8 md:pb-10">

                  {/* TEXTO + IMAGENS COMPARTILHAM CONTAINER */}
                  <div className="max-w-4xl mx-auto text-left">

                    <h1 className="block w-full font-zuume italic text-5xl md:text-6xl leading-[0.95]">
                      {project.title}
                    </h1>

                    <p className="mt-7 font-dmsans text-base leading-[1.9] text-black/80">
                      {project.description}
                    </p>

                    {(project.details?.year ||
                      project.details?.client ||
                      project.details?.role) && (
                      <div className="mt-9 pt-7 border-t border-black/10">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

                          {project.details?.year && (
                            <div>
                              <div className="font-dmsans text-[11px] uppercase tracking-[0.2em] text-black/45">
                                Ano
                              </div>
                              <div className="mt-2 text-lg text-black/85">
                                {project.details.year}
                              </div>
                            </div>
                          )}

                          {project.details?.client && (
                            <div>
                              <div className="font-dmsans text-[11px] uppercase tracking-[0.2em] text-black/45">
                                Cliente
                              </div>
                              <div className="mt-2 text-lg text-black/85">
                                {project.details.client}
                              </div>
                            </div>
                          )}

                          {project.details?.role && (
                            <div>
                              <div className="font-dmsans text-[11px] uppercase tracking-[0.2em] text-black/45">
                                Função
                              </div>
                              <div className="mt-2 text-lg text-black/85">
                                {project.details.role}
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    )}

                    {/* IMAGENS */}
                    <div className="mt-10 space-y-5">
                      {allImages.length === 0 ? (
                        <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-6">
                          Nenhuma imagem disponível.
                        </div>
                      ) : (
                        allImages.map((img, idx) => (
                          <motion.button
                            key={`${img}-${idx}`}
                            onClick={() => openLightbox(idx)}
                            className="w-full rounded-2xl overflow-hidden bg-black/[0.03] border border-black/10 hover:border-black/20 transition-colors"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="relative aspect-[16/9]">
                              <img
                                src={img}
                                alt={`${project.title} - ${idx + 1}`}
                                loading={idx === 0 ? "eager" : "lazy"}
                                className="absolute inset-0 w-full h-full object-cover md:object-contain"
                              />
                            </div>
                          </motion.button>
                        ))
                      )}
                    </div>

                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* LIGHTBOX */}
          <ImageLightbox
            images={allImages}
            initialIndex={selectedImageIndex}
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
