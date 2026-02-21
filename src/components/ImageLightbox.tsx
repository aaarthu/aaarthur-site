import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

// Gera uma URL de preview menor a partir da URL original do WordPress
function getThumbUrl(url: string): string {
  // WordPress: troca sufixo de tamanho, ex: image-1920x1080.jpg → image-400x225.jpg
  const resized = url.replace(/(-\d+x\d+)(\.\w+)$/, "-400x225$2");
  if (resized !== url) return resized;
  // Se não tiver sufixo de tamanho, retorna a própria URL (sem preview)
  return url;
}

function ProgressiveImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const thumbSrc = getThumbUrl(src);
  const [loaded, setLoaded] = useState(false);

  // Reseta quando a src muda (troca de imagem)
  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Preview borrado (carrega rápido) */}
      {!loaded && (
        <img
          src={thumbSrc}
          alt={alt}
          className="absolute inset-0 w-full h-full object-contain block blur-sm scale-105 transition-opacity duration-200"
          draggable={false}
        />
      )}

      {/* Imagem em alta qualidade */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 w-full h-full object-contain block transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        draggable={false}
      />

      {/* Spinner enquanto carrega */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

export function ImageLightbox({
  images,
  initialIndex,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  const safeImages = useMemo(
    () => (Array.isArray(images) ? images.filter(Boolean) : []),
    [images]
  );

  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Sync initialIndex on open
  useEffect(() => {
    if (isOpen) setCurrentIndex(initialIndex);
  }, [isOpen, initialIndex]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + safeImages.length) % safeImages.length);
  }, [safeImages.length]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % safeImages.length);
  }, [safeImages.length]);

  // Keyboard nav
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    },
    [isOpen, onClose, goPrev, goNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Pré-carrega a próxima imagem em segundo plano
  useEffect(() => {
    if (!isOpen || safeImages.length <= 1) return;
    const nextIndex = (currentIndex + 1) % safeImages.length;
    const img = new Image();
    img.src = safeImages[nextIndex];
  }, [currentIndex, safeImages, isOpen]);

  if (!isOpen || safeImages.length === 0) return null;

  const TOP = 20;
  const DOTS = 20;

  const current = safeImages[Math.min(currentIndex, safeImages.length - 1)];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex flex-col"
        style={{ backgroundColor: "#0e2233" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
      >
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-4 md:px-8"
          style={{ height: TOP }}
        >
          <span className="font-dmsans text-white/70 text-sm">
            {currentIndex + 1} / {safeImages.length}
          </span>

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stage */}
        <div
          className="relative w-full flex items-center justify-center"
          style={{ height: `calc(100vh - ${TOP + DOTS}px)` }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Prev */}
          <button
            onClick={goPrev}
            className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-10 p-3 text-white/45 hover:text-white transition-colors"
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          <div className="w-full h-full">
            <ProgressiveImage
              key={current}
              src={current}
              alt={`Imagem ${currentIndex + 1}`}
            />
          </div>

          {/* Next */}
          <button
            onClick={goNext}
            className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-10 p-3 text-white/45 hover:text-white transition-colors"
            aria-label="Próxima imagem"
          >
            <ChevronRight className="w-10 h-10" />
          </button>
        </div>

        {/* Dots */}
        <div
          className="flex items-center justify-center gap-2 px-6"
          style={{ height: DOTS }}
          onClick={(e) => e.stopPropagation()}
        >
          {safeImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? "bg-white w-8"
                  : "bg-white/35 w-2 hover:bg-white/55"
              }`}
              aria-label={`Ir para imagem ${index + 1}`}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
