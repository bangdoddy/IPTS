import { useState, useEffect, useCallback } from "react";
import demoData from "../DashboardDemoData.json";
import { getSsDummySourceRows } from "../../../libs/projectStatusDummy";

export function useSsDetailApi(id: string | null) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const item = getSsDummySourceRows().find(
      (p) => String(p.id) === id || String(p.ideano) === id || String(p.itemKey) === id
    );
    setData(item || null);
  }, [id]);

  return { data, loading, refetch: () => {} };
}

export function useQccDetailApi(id: string | null) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setData(null);
      return;
    }
    const item = [...demoData.qccList, ...demoData.qcpList].find(p => String(p.id) === id);
    setData(item || null);
  }, [id]);

  return { data, loading };
}

export function useProjectDetailApi(id: string | null, type?: string) {
  const ss = useSsDetailApi(type === "SS" ? id : null);
  const qcc = useQccDetailApi(type === "QCC" ? id : null);

  if (type === "SS") return ss;
  if (type === "QCC" || type === "QCP") return qcc;
  return { data: null, loading: false };
}
