// src/pages/Slides.tsx
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SlideGallery } from "@/components/SlideGallery";
import { useWordPressSlides } from "@/hooks/useWordPressSlides";

const Slides = () => {
  const { t } = useTranslation();
  const { slides, isLoading, isError, isUsingFallback } = useWordPressSlides();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero */}
      <section className="px-6 pt-32 pb-16 md:px-12 md:pt-40 md:pb-24">
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="heading-hero italic"
          >
            {/* Troque pelo texto que preferir, ou adicione a chave no seu i18n */}
            APRESENTAÇÕES
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 font-dmsans text-sm tracking-[0.18em] uppercase opacity-50"
          >
            Slides selecionados
          </motion.p>

          {isUsingFallback && !isLoading && isError && (
            <p className="text-sm opacity-50 mt-2 font-dmsans">
              Erro ao carregar slides do WordPress.
            </p>
          )}
        </div>
      </section>

      {/* Gallery */}
      <section className="px-6 pb-24 md:px-12">
        <div className="max-w-7xl mx-auto">
          <SlideGallery slides={slides} isLoading={isLoading} />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Slides;
