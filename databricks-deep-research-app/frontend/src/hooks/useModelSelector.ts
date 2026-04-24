import { useState, useCallback, useEffect } from 'react';
import { useModelCatalog } from './useModelCatalog';

const STORAGE_KEY = 'deep-research-selected-model';

interface UseModelSelectorReturn {
  /** Selected model endpoint name, or null for Auto/defaults */
  selectedModel: string | null;
  /** Set the selected model (persists to localStorage) */
  setSelectedModel: (model: string | null) => void;
}

/**
 * Hook for managing per-chat model selection with localStorage persistence.
 *
 * Follows the same pattern as useQueryMode for localStorage persistence.
 * Validates that the stored model still exists in the endpoint catalog on mount.
 */
export function useModelSelector(): UseModelSelectorReturn {
  const { endpoints } = useModelCatalog();

  const [selectedModel, setSelectedModelState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  // Validate stored model still exists in catalog when endpoints load
  useEffect(() => {
    if (!selectedModel || Object.keys(endpoints).length === 0) return;
    if (!(selectedModel in endpoints)) {
      setSelectedModelState(null);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
    }
  }, [selectedModel, endpoints]);

  const setSelectedModel = useCallback((model: string | null) => {
    setSelectedModelState(model);
    try {
      if (model) {
        localStorage.setItem(STORAGE_KEY, model);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  return { selectedModel, setSelectedModel };
}
