import { useState, useCallback } from "react";
import { API } from "../../../config";

export function useSsActions() {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  function validateRequired(state: any) {
    if (!state.masalah?.trim()) return "Masalah wajib diisi.";
    if (!state.uraianMasalah?.trim()) return "Uraian masalah wajib diisi.";
    if (!state.ideDiajukan?.trim()) return "Ide diajukan wajib diisi.";
    if (!state.uraianProcess?.trim()) return "Uraian process wajib diisi.";
    return "";
  }

  function buildFormData(state: any) {
    const fd = new FormData();
    fd.append("Action", "2");
    fd.append("CreatedBy", state.createdBy || "");
    fd.append("IDEANO", state.itemKey || "");
    fd.append("Masalah", state.masalah || "");
    fd.append("UraianMasalah", state.uraianMasalah || "");
    fd.append("IdeDiajukan", state.ideDiajukan || "");
    fd.append("UraianProcess", state.uraianProcess || "");
    fd.append("EvalQuality", state.evalQuality || "");
    fd.append("EvalCost", state.evalCost || "");
    fd.append("EvalDelivery", state.evalDelivery || "");
    fd.append("EvalSafety", state.evalSafety || "");
    fd.append("EvalMorale", state.evalMorale || "");
    fd.append("EvalProductivity", state.evalProductivity || "");
    fd.append("Status", "Review by leader");
    return fd;
  }

  function resolveApiUrl(v: any): string {
    return typeof v === "function" ? v() : String(v ?? "");
  }

  const handleSaveEdit = useCallback(async (form: any, onSuccess: () => void) => {
    const err = validateRequired(form);
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const fd = buildFormData(form);
      const url = resolveApiUrl((API as any).SUGGESTION_EXECUTE);

      const res = await fetch(url, {
        method: "POST",
        body: fd,
        credentials: "include",
      });

      const text = await res.text().catch(() => "");
      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = null;
      }

      if (!res.ok) {
        setError(json?.message ?? text ?? `HTTP ${res.status}`);
        return;
      }

      const rawCode = json?.code ?? json?.responseCode ?? json?.ResponseCode ?? json?.Code ?? null;
      const code = rawCode != null ? Number(rawCode) : null;
      const success = code === 200 || (code == null && res.ok);

      if (!success) {
        setError(json?.message || (code != null ? `Gagal submit (code: ${code})` : "Gagal submit IDE"));
        return;
      }

      onSuccess();
    } catch (e: any) {
      setError(e?.message || "Terjadi kesalahan saat menyimpan");
    } finally {
      setLoading(false);
    }
  }, []);

  return { error, loading, handleSaveEdit, setError };
}
