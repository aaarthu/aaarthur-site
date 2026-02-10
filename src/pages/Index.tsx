import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Marquee } from "@/components/Marquee";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectModal } from "@/components/ProjectModal";
import { ProjectGridSkeleton } from "@/components/ProjectCardSkeleton";
import { useWordPressProjects } from "@/hooks/useWordPressProjects";
import { Project } from "@/data/projects";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Lottie from "lottie-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import headerAnimation from "../assets/HeaderAnimation.json";

const Index = () => {
  const { t } = useTranslation();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { projects: featuredProjects, isLoading } = useWordPressProjects(4);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* ================= HERO ================= */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden"
      >
        {/* ✅ MOBILE: menos alto (remove vazio)
            🔧 TABLET: mantém (quase ideal)
            ✅ DESKTOP: xl mantém clamp original */}
        <div
          className="
            relative w-full
            h-[300px] sm:h-[360px]
            md:h-[460px]
            lg:max-xl:h-[460px]
            xl:h-[clamp(520px,72vh,760px)]
          "
        >
          {/* ✅ MOBILE: animação “encosta” embaixo
              🔧 TABLET: start
              ✅ DESKTOP: center */}
          <div
            className="
              absolute inset-0 flex justify-center
              max-md:items-end
              md:items-start
              lg:max-xl:items-start
              xl:items-center
            "
          >
            <div
              className="
                h-full

                max-md:w-[120vw] max-md:translate-y-0 max-md:scale-100
                sm:w-[120vw] sm:translate-y-0 sm:scale-100

                md:w-[185vw] md:-translate-y-4 md:scale-[1.08]
                lg:max-xl:w-[185vw] lg:max-xl:-translate-y-4 lg:max-xl:scale-[1.08]

                xl:w-[120vw] xl:translate-y-10 xl:scale-100
              "
            >
              <Lottie animationData={headerAnimation} loop className="w-full h-full" />
            </div>
          </div>
        </div>
      </motion.section>

      {/* ================= BLOCO AZUL ================= */}
      <section
        className="
          px-6 pb-6
          md:px-12 md:pb-8

          /* MOBILE: sobe mais (reduz espaço vazio) */
          -mt-16 sm:-mt-18

          /* TABLET: sobe menos (evita slogan invadir o hero) */
          md:-mt-18
          lg:max-xl:-mt-18

          /* DESKTOP intacto */
          xl:mt-0

          pt-0 sm:pt-0 md:pt-0
          xl:pt-10
        "
        style={{ backgroundColor: "#2374c4" }}
      >
        <div className="max-w-7xl mx-auto">
          {/* ===== SLOGAN ===== */}
          <div
            className="
              flex justify-center

              /* MOBILE: aproxima bastante do hero */
              -mt-12 sm:-mt-14

              /* TABLET: desce (para não ultrapassar o hero) */
              md:-mt-8
              lg:max-xl:-mt-8

              /* DESKTOP intacto */
              xl:mt-0
            "
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.01, 1] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileHover={{ scale: 1.015 }}
                className="will-change-transform"
              >
                <div
                  className="
                    font-zuume italic text-white
                    leading-[0.82] tracking-wide
                    text-[clamp(56px,7.8vw,140px)]
                    drop-shadow-[0_2px_0_rgba(0,0,0,0.10)]
                  "
                >
                  {t("home.slogan")}
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* ===== CARD MANIFESTO ===== */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="
              mt-5

              /* TABLET: desce um pouco (a partir do slogan) */
              md:mt-6
              lg:max-xl:mt-6

              /* DESKTOP intacto */
              xl:mt-10
            "
          >
            <div
              className="
                mx-auto max-w-4xl
                rounded-3xl
                shadow-xl
                border border-black/10
                px-6 py-7 md:px-9 md:py-8
              "
              style={{ backgroundColor: "#feb21a" }}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7">
                  <h2 className="font-zuume italic text-2xl md:text-4xl leading-[1.05] text-black">
                    {t("home.manifestoTitle")}
                  </h2>
                </div>

                <div className="md:col-span-5">
                  <p className="font-dmsans text-sm leading-[1.7] text-black/80">
                    {t("home.aboutTeaser")}
                  </p>

                  <div className="mt-5 flex gap-3 flex-wrap">
                    <Link
                      to="/about"
                      className="
                        px-5 py-2.5 rounded-xl
                        bg-black text-white
                        font-zuume italic text-base
                        hover:opacity-90 transition
                      "
                    >
                      {t("home.aboutCta")}
                    </Link>

                    <Link
                      to="/projects"
                      className="
                        px-5 py-2.5 rounded-xl
                        border border-black/40
                        text-black
                        font-zuume italic text-base
                        hover:bg-black/10 transition
                      "
                    >
                      {t("home.projectsCta")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= MARQUEE ================= */}
      <div
        className="
          relative z-10
          mt-6

          /* TABLET: desce um pouco junto com o card */
          md:mt-8
          lg:max-xl:mt-8

          /* DESKTOP intacto */
          xl:mt-0
        "
      >
        <Marquee />
      </div>

      {/* ================= PROJECTS ================= */}
      <section className="px-6 pt-10 pb-20 md:px-12 md:pt-14 md:pb-24">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="heading-section italic mb-12"
          >
            {t("home.projectsTitle")}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {isLoading ? (
              <ProjectGridSkeleton count={4} />
            ) : (
              featuredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  onClick={() => handleProjectClick(project)}
                />
              ))
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex justify-end mt-12"
          >
            <Link
              to="/projects"
              className="
                inline-flex items-center justify-center
                px-7 py-3
                bg-accent-red text-accent-red-foreground
                font-zuume italic text-lg tracking-wider
                rounded-xl
                hover:opacity-90 transition-opacity
              "
            >
              {t("home.seeMoreProjects")}
            </Link>
          </motion.div>
        </div>
      </section>

      <CTASection />
      <Footer />

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Index;
