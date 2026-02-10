import { useQuery } from "@tanstack/react-query";
import {
  fetchWordPressProjectBySlug,
  isWordPressConfigured,
  TransformedProject,
} from "@/services/wordpressApi";
import { projects as fallbackProjects, Project } from "@/data/projects";

interface Result {
  project: Project | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isUsingFallback: boolean;
  refetch: () => void;
}

export function useWordPressProjectBySlug(slug?: string): Result {
  const isConfigured = isWordPressConfigured();
  const WORDPRESS_URL = import.meta.env.VITE_WORDPRESS_URL || "";

  const enabled = Boolean(isConfigured && slug);

  const { data, isLoading, isError, error, refetch } = useQuery<
    TransformedProject | null,
    Error
  >({
    queryKey: ["wordpress-project", WORDPRESS_URL, slug],
    queryFn: () => fetchWordPressProjectBySlug(slug!),
    enabled,
    staleTime: 0,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // fallback opcional (se seu fallbackProjects não tiver slug, isso só vai retornar null)
  const fallback =
    slug ? (fallbackProjects as any[]).find((p) => p.slug === slug) : null;

  const isUsingFallback = !enabled || isError || !data;
  const project: Project | null = isUsingFallback
    ? (fallback ?? null)
    : ({
        id: data.id,
        title: data.title,
        category: data.category,
        description: data.description,
        thumbnail: data.thumbnail,
        images: data.images,
        details: data.details,
        wordpressId: data.wordpressId,
        // slug é opcional no Project local — se existir no seu tipo, inclua aqui também
        // slug: data.slug,
      } as Project);

  return {
    project,
    isLoading: enabled && isLoading,
    isError,
    error: error || null,
    isUsingFallback,
    refetch,
  };
}
