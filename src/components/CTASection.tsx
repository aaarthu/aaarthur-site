import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SocialIcons } from "./SocialIcons";
import ctaButtonPT from "@/assets/BOTAO_TRAB_PT.svg";
import ctaButtonEN from "@/assets/BOTAO_TRAB_EN.svg";

export function CTASection() {
  const { t, i18n } = useTranslation();

  // Seleciona botão conforme idioma
  const ctaButton = i18n.language === "en" ? ctaButtonEN : ctaButtonPT;

  return (
    <section
      id="contact"
      className="bg-[#db2432] px-6 py-16 md:px-12 md:py-24 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-12 md:gap-8">
          
          {/* ================= SVG CTA ================= */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 w-full md:w-auto md:flex-shrink-0"
          >
            <Link
              to="/contact"
              aria-label={
                i18n.language === "en"
                  ? "Go to contact page"
                  : "Ir para página de contato"
              }
            >
              <img
                src={ctaButton}
                alt={
                  i18n.language === "en"
                    ? "Let's Work Together"
                    : "Bora Trabalhar"
                }
                className="w-full md:w-[500px] lg:w-[600px] h-auto cursor-pointer hover:opacity-90 transition-opacity"
              />
            </Link>
          </motion.div>

          {/* ================= TEXTO + SOCIAL ================= */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-col items-center gap-8 z-20"
          >
            {/* Texto principal */}
            <a
              href="mailto:arthurgomesdecastro@gmail.com"
              className="
                font-zuume italic
                text-4xl md:text-6xl lg:text-7xl
                tracking-wide
                text-[#fdf4e3]
                whitespace-nowrap
                hover:opacity-90
                transition-opacity
                link-editorial
              "
            >
              {t("cta.getInTouch")}
            </a>

            {/* Social Icons */}
            <SocialIcons size="lg" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
