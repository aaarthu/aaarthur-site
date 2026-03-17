import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectModal } from "@/components/ProjectModal";
import { ProjectGridSkeleton } from "@/components/ProjectCardSkeleton";
import { useWordPressProjects } from "@/hooks/useWordPressProjects";
import { Project } from "@/data/projects";

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();

  const { projects, isLoading, isError, isUsingFallback } = useWordPressProjects();

  // ✅ 1) Se a URL tiver slug, abre o projeto automaticamente
 useEffect(() => {
  if (isLoading) return;
  if (!projects.length) return; // ← linha nova

  if (!slug) {
    setIsModalOpen(false);
    setSelectedProject(null);
    return;
  }

  const found = projects.find((p) => p.slug === slug);

  if (found) {
    setSelectedProject(found);
    setIsModalOpen(true);
  } else {
    navigate("/projects", { replace: true });
  }
}, [slug, isLoading, projects, navigate]);

  const handleProjectClick = (project: Project) => {
    console.log("CLICK CARD:", project.title);
    console.log("DEBUG SLUG:", project.slug);

    setSelectedProject(project);
    setIsModalOpen(true);

    // ✅ 2) Atualiza a URL quando clicar no card
    if (project.slug) {
      navigate(`/projects/${project.slug}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);

    // ✅ 3) Volta para /projects quando fechar
    navigate("/projects");
  };

  // Lock/unlock body scroll reliably (even if modal closes via ESC/backdrop)
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup if component unmounts while modal is open
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  console.log("MODAL STATE:", {
    isModalOpen,
    selected: selectedProject?.title,
    urlSlug: slug,
    isUsingFallback,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section */}
      <section className="px-6 pt-32 pb-16 md:px-12 md:pt-40 md:pb-24">
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="heading-hero italic"
          >
            {t("projects.title")}
          </motion.h1>

          {/* Optional helper text if fallback is being used */}
          {isUsingFallback && !isLoading && (
            <p className="text-sm opacity-50 mt-2 font-dmsans">
              {isError ? t("projects.errorLoading") : ""}
            </p>
          )}
        </div>
      </section>

      {/* Projects Grid */}
      <section className="px-6 pb-24 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {isLoading ? (
              <ProjectGridSkeleton count={6} />
            ) : (
              projects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  onClick={() => handleProjectClick(project)}
                />
              ))
            )}
          </div>
        </div>
      </section>

      <Footer />

      {/* Project Modal */}
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

export default Projects;
