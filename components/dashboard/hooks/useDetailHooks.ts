import { useState, useEffect, useCallback } from "react";
import { API } from "../../../config";

export function useSsDetailApi(id: string | null) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("IDEANO", id);
      const res = await fetch((API as any).SUGGESTION_DETAIL, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setData(json.data?.[0] || null);
      }
    } catch (e) {
      console.error("fetchDetail error:", e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { data, loading, refetch: fetchDetail };
}

export function useQccDetailApi(id: string | null) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setData(null);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${(API as any).QCC_REGISTRATION_DETAIL}/${id}`);
        if (res.ok) {
          const json = await res.json();
          setData(json.data || null);
        }
      } catch (e) {
        console.error("useQccDetailApi error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return { data, loading };
}

export function useProjectDetailApi(id: string | null, type?: string) {
  const ss = useSsDetailApi(type === "SS" ? id : null);
  const qcc = useQccDetailApi(type === "QCC" ? id : null);
  // can add more for QCP if needed

  if (type === "SS") return ss;
  if (type === "QCC") return qcc;
  return { data: null, loading: false };
}
