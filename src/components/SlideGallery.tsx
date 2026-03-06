// src/components/SlideGallery.tsx
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Play, ZoomIn } from "lucide-react";
import { TransformedSlide } from "@/services/wordpressApi";

interface SlideGalleryProps {
  slides: TransformedSlide[];
  isLoading?: boolean;
}

// ─── Skeleton card ────────────────────────────────────────────
function SlideSkeleton() {
  return (
    <div className="aspect-video w-full rounded-2xl bg-white/5 animate-pulse" />
  );
}

// ─── Lightbox ─────────────────────────────────────────────────
interface LightboxProps {
  slides: TransformedSlide[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

function SlideLightbox({ slides, initialIndex, isOpen, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) setCurrent(initialIndex);
  }, [isOpen, initialIndex]);

  const prev = useCallback(() =>
    setCurrent((c) => (c - 1 + slides.length) % slides.length), [slides.length]);
  const next = useCallback(() =>
    setCurrent((c) => (c + 1) % slides.length), [slides.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler, { capture: true });
    return () => window.removeEventListener("keydown", handler, { capture: true });
  }, [isOpen, prev, next, onClose]);

  const slide = slides[current];
  if (!slide) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Header fixo — mesmo estilo do ProjectModal */}
          <div className="fixed top-0 left-0 right-0 z-[210]">
            <div className="mx-auto w-full max-w-6xl px-4 md:px-8 pt-4">
              <div className="rounded-2xl bg-white/90 backdrop-blur-md border border-black/10 shadow-lg">
                <div className="px-5 md:px-8 py-4 flex items-center justify-between gap-4">
                  <button
                    onClick={onClose}
                    className="flex items-center gap-2 font-dmsans text-xs tracking-[0.18em] uppercase text-black/70 hover:text-black transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    VOLTAR
                  </button>
                  <div className="flex-1 text-center">
                    <span className="font-dmsans text-[11px] tracking-[0.22em] uppercase text-black/60">
                      {current + 1} / {slides.length}
                      {slide.type === "video" && (
                        <span className="ml-3 bg-black text-white text-[9px] px-2 py-0.5 rounded tracking-widest">
                          VÍDEO
                        </span>
                      )}
                    </span>
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

          {/* Media */}
          <div className="relative h-full flex items-center justify-center pt-24 pb-20 px-4 md:px-20">
            <div className="relative w-full max-w-5xl">
              <motion.div
                key={current}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl aspect-video"
              >
                {slide.type === "video" ? (
                  <video
                    src={slide.url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  <img
                    src={slide.url}
                    alt={slide.title || `Slide ${current + 1}`}
                    className="w-full h-full object-contain bg-black"
                  />
                )}
              </motion.div>

              {/* Setas */}
              <button
                onClick={prev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 hidden md:flex w-11 h-11 rounded-full bg-white/10 border border-white/20 items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={next}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 hidden md:flex w-11 h-11 rounded-full bg-white/10 border border-white/20 items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Dots */}
          <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-1.5 z-[210]">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-200 rounded-full
                  ${i === current
                    ? "w-5 h-2 bg-white"
                    : "w-2 h-2 bg-white/30 hover:bg-white/60"
                  }
                  ${s.type === "video" ? "rounded-sm" : "rounded-full"}
                `}
              />
            ))}
          </div>

          {/* Setas mobile */}
          <div className="fixed bottom-14 left-0 right-0 flex justify-center gap-4 md:hidden z-[210]">
            <button
              onClick={prev}
              className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={next}
              className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Card da grade ────────────────────────────────────────────
interface SlideCardProps {
  slide: TransformedSlide;
  index: number;
  onClick: () => void;
}

function SlideCard({ slide, index, onClick }: SlideCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: (index % 12) * 0.04 }}
      onClick={onClick}
      className="group relative w-full aspect-video rounded-2xl overflow-hidden bg-black/20 border border-white/5 hover:border-white/20 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
    >
      {/* Thumbnail */}
      {slide.thumbnail ? (
        <img
          src={slide.thumbnail}
          alt={slide.title || `Slide ${index + 1}`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-90 group-hover:brightness-100"
        />
      ) : (
        <div className="w-full h-full bg-white/5 flex items-center justify-center">
          <span className="font-dmsans text-xs tracking-widest uppercase text-white/30">
            Sem imagem
          </span>
        </div>
      )}

      {/* Overlay hover */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        {slide.type === "video" ? (
          <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/60 flex items-center justify-center">
            <Play className="w-6 h-6 text-white fill-white ml-1" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-white/20 border border-white/60 flex items-center justify-center">
            <ZoomIn className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Badge vídeo */}
      {slide.type === "video" && (
        <div className="absolute top-3 right-3 bg-black/80 text-white font-dmsans text-[9px] tracking-[0.15em] uppercase px-2 py-1 rounded-md flex items-center gap-1">
          <Play className="w-2.5 h-2.5 fill-white" />
          Vídeo
        </div>
      )}

      {/* Número */}
      <div className="absolute bottom-3 left-3 font-dmsans text-[10px] tracking-[0.15em] text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
        {String(index + 1).padStart(2, "0")}
      </div>
    </motion.button>
  );
}

// ─── Componente principal ─────────────────────────────────────
export function SlideGallery({ slides, isLoading }: SlideGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <SlideSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!slides.length) {
    return (
      <div className="py-24 text-center">
        <p className="font-dmsans text-sm tracking-widest uppercase opacity-40">
          Nenhum slide encontrado
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {slides.map((slide, index) => (
          <SlideCard
            key={slide.id}
            slide={slide}
            index={index}
            onClick={() => openLightbox(index)}
          />
        ))}
      </div>

      <SlideLightbox
        slides={slides}
        initialIndex={selectedIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
