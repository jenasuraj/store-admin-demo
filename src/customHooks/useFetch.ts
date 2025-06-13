"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";

interface UseFetchOptions {
  immediate?: boolean;
  params?: Record<string, any>;
}

interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: (newParams?: Record<string, any>) => Promise<void>;
}

export function useFetch<T>(
  url: string,
  options: UseFetchOptions = {}
): UseFetchReturn<T> {
  const { immediate = true, params = {} } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (fetchParams: Record<string, any> = {}) => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${BASE_URL}${url}`, {
          params: { ...params, ...fetchParams },
        });

        setData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    },
    [url, params]
  );

  const refetch = useCallback(
    (newParams?: Record<string, any>) => {
      return fetchData(newParams);
    },
    [fetchData]
  );

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, []);

  return { data, loading, error, refetch };
}
