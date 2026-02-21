import { motion } from "framer-motion";
import { Project } from "@/data/projects";
import { useTranslation } from "react-i18next";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  index: number;
}

export function ProjectCard({ project, onClick, index }: ProjectCardProps) {
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en");

  // Usa category_pt / category_en se disponível, senão cai no category genérico
  const displayCategory = isEn
    ? (project.category_en || project.category)
    : (project.category_pt || project.category);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={onClick}
      className="group cursor-pointer h-full flex flex-col"
    >
      {/* Thumbnail */}
      <div
        className="
          card-editorial
          w-full
          mb-4
          overflow-hidden
          h-[clamp(190px,19vw,300px)]
        "
      >
        <img
          src={project.thumbnail}
          alt={project.title}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h3 className="heading-project group-hover:opacity-70 transition-opacity">
          {project.title}
        </h3>

        <p className="font-dmsans text-sm tracking-wider opacity-60">
          {displayCategory}
        </p>
      </div>
    </motion.article>
  );
}
