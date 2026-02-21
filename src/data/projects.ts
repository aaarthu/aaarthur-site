// Projetos de fallback — exibidos apenas se o WordPress estiver inacessível
export interface Project {
  id: string;
  slug?: string;
  title: string;
  category: string;
  category_pt?: string;
  category_en?: string;
  description: string;
  description_pt?: string;
  description_en?: string;
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
    id: "placeholder",
    title: "CARREGANDO PROJETOS...",
    category: "—",
    description: "",
    thumbnail: "",
    images: [],
  },
];
