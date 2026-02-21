// src/hooks/useWordPressProjects.ts
import { useQuery } from "@tanstack/react-query";
import {
  fetchWordPressProjects,
  isWordPressConfigured,
  TransformedProject,
} from "@/services/wordpressApi";
import { projects as fallbackProjects, Project } from "@/data/projects";

interface UseWordPressProjectsResult {
  projects: Project[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isUsingFallback: boolean;
  refetch: () => void;
}

export function useWordPressProjects(limit?: number): UseWordPressProjectsResult {
  const isConfigured = isWordPressConfigured();
  const WORDPRESS_URL = import.meta.env.VITE_WORDPRESS_URL || "";

  const {
    data: wpProjects,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<TransformedProject[], Error>({
    queryKey: ["wordpress-projects", WORDPRESS_URL],
    queryFn: fetchWordPressProjects,
    enabled: isConfigured,
    staleTime: 0, // forçar refetch enquanto ajusta
    gcTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const isUsingFallback = !isConfigured || isError || !wpProjects;

  let projects: Project[];

  if (isUsingFallback) {
    projects = fallbackProjects;
  } else {
    projects = wpProjects.map((wp) => ({
      id: wp.id,
      wordpressId: wp.wordpressId,
      slug: wp.slug, // ✅ AQUI é a parte importante
      title: wp.title,
      category: wp.category,
      description: wp.description,
      description_pt: wp.description_pt,
      description_en: wp.description_en,
      thumbnail: wp.thumbnail,
      images: wp.images,
      details: wp.details,
    }));
  }

  if (limit && limit > 0) {
    projects = projects.slice(0, limit);
  }

  return {
    projects,
    isLoading: isConfigured && isLoading,
    isError,
    error: error || null,
    isUsingFallback,
    refetch,
  };
}
