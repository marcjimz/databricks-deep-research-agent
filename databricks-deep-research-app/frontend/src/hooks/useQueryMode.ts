import { useState, useCallback, useEffect } from 'react';
import { preferencesApi } from '../api/client';
import { getEnabledQueryModes } from '../api/config';
import type { QueryMode } from '../types';

const STORAGE_KEY = 'deep-research-query-mode';

interface UseQueryModeOptions {
  /** Initial mode if nothing is persisted */
  initialMode?: QueryMode;
  /** Sync with user preferences API (default: false) */
  syncWithPreferences?: boolean;
}

interface UseQueryModeReturn {
  /** Current query mode */
  mode: QueryMode;
  /** Set the query mode (persists to localStorage) */
  setMode: (mode: QueryMode) => void;
  /** Set mode and save as user's default preference */
  setModeAsDefault: (mode: QueryMode) => Promise<void>;
  /** Whether the current mode is deep research */
  isDeepResearch: boolean;
  /** Whether the current mode is simple (no web search) */
  isSimple: boolean;
  /** Whether the current mode is web search */
  isWebSearch: boolean;
  /** Whether syncing with preferences */
  isSyncing: boolean;
  /** List of enabled query mode names from server config (undefined while loading) */
  enabledModes: string[] | undefined;
}

/**
 * Hook for managing query mode selection with localStorage persistence.
 *
 * Mode persists within the browser session and across sessions via localStorage.
 * Optionally syncs with the user preferences API for cross-device persistence.
 *
 * @example
 * ```tsx
 * const { mode, setMode, setModeAsDefault, isDeepResearch } = useQueryMode();
 *
 * // Show depth selector only for deep research
 * {isDeepResearch && <ResearchDepthSelector />}
 *
 * // Set as user's default preference
 * <button onClick={() => setModeAsDefault(mode)}>Set as Default</button>
 * ```
 */
export function useQueryMode(
  options: UseQueryModeOptions = {}
): UseQueryModeReturn {
  const { initialMode = 'simple', syncWithPreferences = false } = options;
  const [isSyncing, setIsSyncing] = useState(false);
  const [enabledModes, setEnabledModes] = useState<string[] | undefined>(undefined);

  // Fetch enabled modes from server config on mount
  useEffect(() => {
    const fetchModes = async () => {
      try {
        const resp = await getEnabledQueryModes();
        setEnabledModes(resp.modes);
      } catch {
        // On error, leave undefined (show all modes)
      }
    };
    fetchModes();
  }, []);

  // Initialize from localStorage or default
  const [mode, setModeState] = useState<QueryMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && isValidQueryMode(stored)) {
        return stored as QueryMode;
      }
    } catch {
      // localStorage may be unavailable in some contexts
    }
    return initialMode;
  });

  // Fetch user's default from preferences API on mount
  useEffect(() => {
    if (!syncWithPreferences) return;

    const fetchDefaultMode = async () => {
      try {
        const prefs = await preferencesApi.get();
        if (prefs.defaultQueryMode && isValidQueryMode(prefs.defaultQueryMode)) {
          // Only update if localStorage doesn't have a value
          const stored = localStorage.getItem(STORAGE_KEY);
          if (!stored) {
            setModeState(prefs.defaultQueryMode);
            localStorage.setItem(STORAGE_KEY, prefs.defaultQueryMode);
          }
        }
      } catch {
        // Ignore errors - localStorage value is sufficient
      }
    };
    fetchDefaultMode();
  }, [syncWithPreferences]);

  // Persist mode changes to localStorage
  const setMode = useCallback((newMode: QueryMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Set mode and save as user's default preference
  const setModeAsDefault = useCallback(async (newMode: QueryMode) => {
    setMode(newMode);
    setIsSyncing(true);
    try {
      await preferencesApi.update({ default_query_mode: newMode });
    } finally {
      setIsSyncing(false);
    }
  }, [setMode]);

  // Auto-switch to first enabled mode if current mode is disabled
  useEffect(() => {
    if (enabledModes && enabledModes.length > 0 && !enabledModes.includes(mode)) {
      const fallback = enabledModes[0] as QueryMode;
      setModeState(fallback);
      try {
        localStorage.setItem(STORAGE_KEY, fallback);
      } catch {
        // Ignore storage errors
      }
    }
  }, [enabledModes, mode]);

  // Sync with localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue && isValidQueryMode(e.newValue)) {
        setModeState(e.newValue as QueryMode);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    mode,
    setMode,
    setModeAsDefault,
    isDeepResearch: mode === 'deep_research',
    isSimple: mode === 'simple',
    isWebSearch: mode === 'web_search',
    isSyncing,
    enabledModes,
  };
}

function isValidQueryMode(value: string): value is QueryMode {
  return value === 'simple' || value === 'web_search' || value === 'deep_research';
}
