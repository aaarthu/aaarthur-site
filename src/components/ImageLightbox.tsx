import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
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

  if (!isOpen || safeImages.length === 0) return null;

  // “área útil” bem grande, sem ficar pequena
  // (top bar + dots)
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

          {/* Image wrapper: garante centralização */}
          <div className="w-full h-full flex items-center justify-center px-0 md:px-0">
            <motion.img
              key={current} // anima troca
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.18 }}
              src={current}
              alt={`Imagem ${currentIndex + 1}`}
              className="w-full h-full object-contain block"
              draggable={false}
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
