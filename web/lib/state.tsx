"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { DEFAULT_APP_STATE } from "./data";
import type { AppState } from "./types";

const STORAGE_KEY = "nestnear:state:v1";

interface AppStateContext {
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
}

const Ctx = createContext<AppStateContext | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(DEFAULT_APP_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppState>;
        setState((prev) => ({ ...prev, ...parsed, settingsOpen: false }));
      }
    } catch {
      // ignore parse errors — fall back to defaults
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const { settingsOpen: _ignored, ...persisted } = state;
      void _ignored;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // ignore quota or serialization errors
    }
  }, [state, hydrated]);

  return <Ctx.Provider value={{ state, setState }}>{children}</Ctx.Provider>;
}

export function useAppState(): AppStateContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}

export function useUpdate<K extends keyof AppState>() {
  const { setState } = useAppState();
  return useCallback(
    (key: K, value: AppState[K]) =>
      setState((s) => ({ ...s, [key]: value })),
    [setState],
  );
}
