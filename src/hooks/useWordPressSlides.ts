// src/hooks/useWordPressSlides.ts
import { useQuery } from "@tanstack/react-query";
import {
  fetchWordPressSlides,
  isWordPressConfigured,
  TransformedSlide,
} from "@/services/wordpressApi";

interface UseWordPressSlidesResult {
  slides: TransformedSlide[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isUsingFallback: boolean;
  refetch: () => void;
}

export function useWordPressSlides(): UseWordPressSlidesResult {
  const isConfigured = isWordPressConfigured();
  const WORDPRESS_URL = import.meta.env.VITE_WORDPRESS_URL || "";

  const { data, isLoading, isError, error, refetch } = useQuery<
    TransformedSlide[],
    Error
  >({
    queryKey: ["wordpress-slides", WORDPRESS_URL],
    queryFn: fetchWordPressSlides,
    enabled: isConfigured,
    staleTime: 0,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const isUsingFallback = !isConfigured || isError || !data;
  const slides: TransformedSlide[] = isUsingFallback ? [] : data;

  return {
    slides,
    isLoading: isConfigured && isLoading,
    isError,
    error: error || null,
    isUsingFallback,
    refetch,
  };
}
