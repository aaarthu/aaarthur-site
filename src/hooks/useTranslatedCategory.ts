// src/hooks/useTranslatedCategory.ts
import { useTranslation } from "react-i18next";

// Mapa: o que você digita no WordPress → chave de tradução
const categoryMap: Record<string, string> = {
  // Português
  "identidade visual": "identidadeVisual",
  "branding": "branding",
  "direção de arte": "directionDeArte",
  "direcao de arte": "directionDeArte",
  "editorial": "editorial",
  "motion": "motion",
  "motion design": "motion",
  "apresentações": "apresentacoes",
  "apresentacoes": "apresentacoes",
  "comunicação": "comunicacao",
  "comunicacao": "comunicacao",
  "projeto": "projeto",
  // English (caso cadastre em inglês também)
  "visual identity": "identidadeVisual",
  "art direction": "directionDeArte",
  "presentations": "apresentacoes",
  "communication": "comunicacao",
  "project": "projeto",
};

export function useTranslatedCategory() {
  const { t } = useTranslation();

  return function translateCategory(raw: string): string {
    const key = categoryMap[raw.toLowerCase().trim()];
    if (key) return t(`categories.${key}`);
    // Se não encontrar no mapa, retorna em maiúsculas mesmo
    return raw.toUpperCase();
  };
}
