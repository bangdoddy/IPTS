import { useState, useEffect } from "react";
import { API } from "../../../config";

export function useOrgMasterOnce(params: { enabled: boolean }) {
  const [divRows, setDivRows] = useState<any[]>([]);
  const [deptRows, setDeptRows] = useState<any[]>([]);
  const [secRows, setSecRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!params.enabled) return;

    (async () => {
      setLoading(true);
      try {
        const [rDiv, rDept, rSec] = await Promise.all([
          fetch((API as any).MASTER_DIVISION),
          fetch((API as any).MASTER_DEPARTMENT),
          fetch((API as any).MASTER_SECTION),
        ]);

        if (rDiv.ok) {
          const j = await rDiv.json();
          setDivRows(Array.isArray(j.data) ? j.data : []);
        }
        if (rDept.ok) {
          const j = await rDept.json();
          setDeptRows(Array.isArray(j.data) ? j.data : []);
        }
        if (rSec.ok) {
          const j = await rSec.json();
          setSecRows(Array.isArray(j.data) ? j.data : []);
        }
      } catch (e) {
        console.error("useOrgMasterOnce error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.enabled]);

  return { divRows, deptRows, secRows, loading };
}
