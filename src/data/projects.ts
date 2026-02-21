import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";
import project4 from "@/assets/project-4.jpg";

// Quintalzinho Café images
import quintalzinho01 from "@/assets/quintalzinho/quintalzinho-01.png";
import quintalzinho02 from "@/assets/quintalzinho/quintalzinho-02.png";
import quintalzinho03 from "@/assets/quintalzinho/quintalzinho-03.png";
import quintalzinho04 from "@/assets/quintalzinho/quintalzinho-04.png";
import quintalzinho05 from "@/assets/quintalzinho/quintalzinho-05.png";
import quintalzinho06 from "@/assets/quintalzinho/quintalzinho-06.png";
import quintalzinho07 from "@/assets/quintalzinho/quintalzinho-07.png";
import quintalzinhoGif1 from "@/assets/quintalzinho/quintalzinho-gif-1.gif";
import quintalzinhoGif2 from "@/assets/quintalzinho/quintalzinho-gif-2.gif";

export interface Project {
  id: string;
  slug?: string; 
  title: string;
  category: string;
  category_pt?: string;
  category_en?: string;
  description: string;
  thumbnail: string;
  images: string[];
  details?: {
    year?: string;
    client?: string;
    role?: string;
  };
  wordpressId?: number;
}


export const projects: Project[] = [
  {
    id: "quintalzinho-cafe",
    title: "QUINTALZINHO CAFÉ",
    category: "IDENTIDADE VISUAL",
    description:
      "Desenvolvimento completo de identidade visual para cafeteria artesanal. O projeto envolveu criação de logotipo, paleta de cores, tipografia, aplicações em papelaria, sinalização e materiais de marketing. A proposta visual traduz a essência acolhedora e artesanal do espaço.",
    thumbnail: quintalzinho01,
    images: [
      quintalzinho02,
      quintalzinho03,
      quintalzinhoGif1,
      quintalzinho04,
      quintalzinho05,
      quintalzinhoGif2,
      quintalzinho06,
      quintalzinho07,
    ],
    details: {
      year: "2024",
      client: "Quintalzinho Café",
      role: "Art Direction & Design",
    },
  },
  {
    id: "marca-x-motion",
    title: "MARCA X",
    category: "MOTION DESIGN",
    description:
      "Animação de logo e vinheta institucional para marca de tecnologia. O projeto explorou movimento fluido e transições dinâmicas para comunicar inovação e modernidade.",
    thumbnail: project2,
    images: ["Video 1", "Video 2"],
    details: {
      year: "2024",
      client: "Marca X",
      role: "Motion Designer",
    },
  },
  {
    id: "festival-cultura",
    title: "FESTIVAL DE CULTURA",
    category: "IDENTIDADE VISUAL",
    description:
      "Sistema de identidade visual para festival de cultura urbana. Desenvolvimento de logo, grid modular, aplicações em cartazes, banners digitais e materiais promocionais.",
    thumbnail: project3,
    images: ["Image 1", "Image 2", "Image 3", "Image 4"],
    details: {
      year: "2023",
      client: "Prefeitura Municipal",
      role: "Lead Designer",
    },
  },
  {
    id: "startup-tech",
    title: "STARTUP TECH",
    category: "MOTION DESIGN",
    description:
      "Série de animações para redes sociais e apresentações corporativas. Motion graphics explicativos e transições branded para comunicação da marca.",
    thumbnail: project4,
    images: ["Video 1", "Video 2", "Video 3"],
    details: {
      year: "2023",
      client: "TechStartup Inc.",
      role: "Motion Designer",
    },
  },
  {
    id: "editorial-magazine",
    title: "REVISTA CONCEITO",
    category: "DESIGN EDITORIAL",
    description:
      "Design editorial completo para revista de arte e cultura. Layout, tipografia, grid system e direção de arte para edição especial de 120 páginas.",
    thumbnail: project1,
    images: ["Spread 1", "Spread 2", "Spread 3", "Cover"],
    details: {
      year: "2023",
      client: "Editora Arte",
      role: "Art Director",
    },
  },
  {
    id: "branding-studio",
    title: "STUDIO CRIATIVO",
    category: "IDENTIDADE VISUAL",
    description:
      "Rebranding completo para estúdio de design. Nova identidade visual, manual de marca, website e materiais de comunicação.",
    thumbnail: project2,
    images: ["Logo", "Stationery", "Website", "Applications"],
    details: {
      year: "2022",
      client: "Studio Criativo",
      role: "Brand Designer",
    },
  },
];
