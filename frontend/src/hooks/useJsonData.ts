import { useEffect, useState } from "react";

interface JsonDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/** Fetches a static JSON file from /public/data. No backend involved -- see project README. */
export function useJsonData<T>(path: string): JsonDataState<T> {
  const [state, setState] = useState<JsonDataState<T>>({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ data: null, loading: false, error: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  return state;
}
