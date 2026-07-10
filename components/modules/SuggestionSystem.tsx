// SuggestionSystem.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Select from "react-select";

import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { AlertCircle, FileText, CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { ModuleLayout } from "../layout/ModuleLayout";
import { Checkbox } from "../ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";

import { API } from "../../config";

// =====================================================
// Types
// =====================================================
type BenefitKey =
  | "menciptakan"
  | "meningkatkanJumlah"
  | "mencontoh"
  | "quality"
  | "cost"
  | "delivery"
  | "she"
  | "morale"
  | "productivity";

type HubunganInt = 0 | 1 | 2;

type EmployeeItem = {
  NRP?: string;
  NAMA?: string;
  JOBSITE?: string;
  ATASAN1?: string;
  NAMA_ATASAN1?: string;
  ATASAN2?: string;
  NAMA_ATASAN2?: string;
  ACTORTYPE?: string;
  EMAIL?: string;
};

type EmployeeOption = { value: string; label: string; raw: EmployeeItem };

type EmployeeRetrieveRow = {
  nrp?: string;
  completeName?: string;
  directorate?: string;
  division?: string;
  department?: string;
  section?: string;
};

interface FormState {
  nrpSelected: string;
  submittedByName: string;

  Action: number;
  Ideano?: string | null;

  CreatedBy: string;
  Atasan1: string;
  Atasan2: string;
  NamaAtasan1: string;
  NamaAtasan2: string;

  Judul: string;
  Masalah: string;
  HubunganPenemuan: HubunganInt;
  UraianMasalah: string;

  IdeDiajukan: string;
  UraianProcess: string;

  Directorate: string;
  Division: string;
  Department: string;
  Section: string;

  EvalQuality: string;
  EvalCost: string;
  EvalDelivery: string;
  EvalSafety: string;
  EvalMorale: string;
  EvalProductivity: string;

  fileDocuments: File[];
}

interface SuggestionSystemProps {
  user: any;
  onBack: () => void;
  onSubmit?: (projectForDashboard: any) => void;
}

// =====================================================
// Constants
// =====================================================
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const STATUS_DEFAULT = "Review by leader";
const REDIRECT_AFTER_SUCCESS = "/project-status-ss";

const BENEFIT_ITEMS: Array<{ key: BenefitKey; label: string }> = [
  { key: "menciptakan", label: "Menciptakan" },
  { key: "meningkatkanJumlah", label: "Meningkatkan Jumlah" },
  { key: "mencontoh", label: "Mencontoh" }
];
const BENEFIT_ITEMS_2: Array<{ key: BenefitKey; label: string }> = [
  { key: "quality", label: "Quality" },
  { key: "cost", label: "Efficiency" },
  { key: "she", label: "Culture Development" },
];

const BENEFIT_LABEL_MAP: Record<BenefitKey, string> = {
  menciptakan: "Menciptakan",
  meningkatkanJumlah: "Meningkatkan Jumlah",
  mencontoh: "Mencontoh",
  quality: "Quality",
  cost: "Cost",
  delivery: "Delivery",
  she: "SHE",
  morale: "Morale",
  productivity: "Productivity",
};

const BLOCKED_MEDIA_EXT = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "heic",
  "heif",
  "tif",
  "tiff",
  "svg",
  "mp4",
  "mov",
  "avi",
  "mkv",
  "webm",
  "3gp",
  "mpeg",
  "mpg",
  "m4v",
  "mp3",
  "wav",
  "m4a",
  "aac",
  "ogg",
  "flac",
  "opus",
]);

// =====================================================
// Utils
// =====================================================
function resolveApiUrl(v: any): string {
  return typeof v === "function" ? v() : String(v ?? "");
}

function safeStr(v: any, fallback = "") {
  const s = String(v ?? "").trim();
  return s ? s : fallback;
}

function readFileSizeKB(file: File) {
  return (file.size / 1024).toFixed(2);
}

function getFileExt(name: string) {
  const n = (name ?? "").trim().toLowerCase();
  const i = n.lastIndexOf(".");
  if (i < 0) return "";
  return n.slice(i + 1);
}

function validateAttachment(file: File) {
  if (!file) return "File tidak valid.";
  if (file.size > MAX_FILE_SIZE_BYTES) return "Ukuran file maksimal 5 MB.";

  const mime = (file.type || "").toLowerCase();
  const ext = getFileExt(file.name);

  if (mime.startsWith("image/")) return "File media (gambar/foto) tidak diperbolehkan.";
  if (mime.startsWith("video/")) return "File media (video) tidak diperbolehkan.";
  if (mime.startsWith("audio/")) return "File media (audio) tidak diperbolehkan.";

  if (ext && BLOCKED_MEDIA_EXT.has(ext)) return "File media (gambar/audio/video) tidak diperbolehkan.";

  return "";
}

function validateAttachments(files: File[]) {
  if (!files || files.length === 0) {
    return "Dokumen pendukung wajib diupload (max 5MB per file, non-media).";
  }

  for (const file of files) {
    const err = validateAttachment(file);
    if (err) return `${file.name}: ${err}`;
  }

  return "";
}

function parseEmployeeItems(json: any): EmployeeItem[] {
  const arr = json?.data ?? json?.items ?? json?.rows ?? [];
  return Array.isArray(arr) ? arr : [];
}

function toEmployeeOptions(items: EmployeeItem[]): EmployeeOption[] {
  return items
    .map((x) => {
      const nrp = safeStr(x?.NRP);
      const nama = safeStr(x?.NAMA);
      if (!nrp) return null;
      return { value: nrp, label: `${nrp} - ${nama}`, raw: x } as EmployeeOption;
    })
    .filter(Boolean) as EmployeeOption[];
}

function parseEmployeeRetrieve(json: any): EmployeeRetrieveRow | null {
  const arr = json?.data ?? [];
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr[0] as EmployeeRetrieveRow;
}

function buildImprovementCodes(benefits: Record<BenefitKey, boolean>) {
  return Object.entries(benefits)
    .filter(([, v]) => v)
    .map(([k]) => BENEFIT_LABEL_MAP[k as BenefitKey])
    .join(",");
}

function getApiCode(json: any): number | null {
  const raw = json?.code ?? json?.responseCode ?? json?.ResponseCode ?? json?.Code ?? null;
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

function isSuccess(json: any, httpOk: boolean) {
  if (!httpOk) return false;
  const code = getApiCode(json);
  if (code == null) return true;
  if (code === -1) return false;
  return code === 200;
}

async function readResponse(res: Response) {
  const text = await res.text().catch(() => "");
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { text, json };
}

function initialState(user: any): FormState {
  return {
    nrpSelected: "",
    submittedByName: safeStr(user?.name, ""),

    Action: 1,
    Ideano: null,

    CreatedBy: "",
    Atasan1: "",
    Atasan2: "",

    Judul: "",
    Masalah: "",
    HubunganPenemuan: 0,
    UraianMasalah: "",

    IdeDiajukan: "",
    UraianProcess: "",

    Directorate: "",
    Division: "",
    Department: "",
    Section: "",

    EvalQuality: "",
    EvalCost: "",
    EvalDelivery: "",
    EvalSafety: "",
    EvalMorale: "",
    EvalProductivity: "",

    fileDocuments: [],
  };
}

function validateRequired(state: FormState, benefits: Record<BenefitKey, boolean>) {
  if (!state.CreatedBy.trim()) return "NRP pembuat (CreatedBy) wajib dipilih.";

  if (!state.Judul.trim()) return "Judul wajib diisi.";
  if (!state.Masalah.trim()) return "Masalah wajib diisi.";
  if (state.HubunganPenemuan === 0) return "Mohon pilih Hubungan.";
  if (!state.UraianMasalah.trim()) return "Uraian masalah wajib diisi.";
  if (!state.IdeDiajukan.trim()) return "Ide diajukan wajib diisi.";
  if (!state.UraianProcess.trim()) return "Uraian process wajib diisi.";

  if (!state.Directorate.trim()) return "Directorate wajib diisi.";
  if (!state.Division.trim()) return "Division wajib diisi.";

  // Hanya wajib jika benefit terkait dicentang
  if (benefits.quality && !state.EvalQuality.trim()) return "Eval Quality wajib diisi.";
  if (benefits.cost && !state.EvalCost.trim()) return "Eval Efficiency wajib diisi.";
  if (benefits.she && !state.EvalSafety.trim()) return "Eval Culture Development wajib diisi.";

  // Aktifkan kembali jika checkbox terkait ditampilkan di UI
  // if (benefits.delivery && !state.EvalDelivery.trim()) return "Eval Delivery wajib diisi.";
  // if (benefits.morale && !state.EvalMorale.trim()) return "Eval Morale wajib diisi.";
  // if (benefits.productivity && !state.EvalProductivity.trim()) return "Eval Productivity wajib diisi.";

  const fileErr = validateAttachments(state.fileDocuments);
  if (fileErr) return fileErr;

  return "";
}

// =====================================================
// Component
// =====================================================
export function SuggestionSystem({ user, onBack, onSubmit }: SuggestionSystemProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [state, setState] = useState<FormState>(() => initialState(user));
  const [validationError, setValidationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const draftKey = searchParams.get("itemKey");

  useEffect(() => {
    if (!draftKey) return;

    const url = resolveApiUrl((API as any).SUGGESTION_RETRIEVE);
    if (!url) return;

    const ctrl = new AbortController();
    setValidationError("");

    (async () => {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemKey: draftKey,
            status: "Draft",
            action: 4,
          }),
          credentials: "include",
          signal: ctrl.signal,
        });

        const { json, text } = await readResponse(res);
        if (!res.ok) throw new Error(json?.message ?? text ?? `HTTP ${res.status}`);

        console.log(json);
        const isSuccessOk = json?.responseCode === 200 || json?.data != null;
        if (!isSuccessOk) {
          throw new Error(json?.message ?? "Gagal load data draft.");
        }

        const data = json?.data;
        if (!data) throw new Error("Data draft tidak ditemukan.");

        setState((prev) => ({
          ...prev,
          nrpSelected: data.createdBy || "",
          submittedByName: data.pembuat || "",

          Action: 7,
          Ideano: data.itemKey || data.ideano || null,

          CreatedBy: data.createdBy || "",
          Atasan1: data.nrpAtasan1 || "",
          Atasan2: data.nrpAtasan2 || "",

          Judul: data.judul || "",
          Masalah: data.masalah || "",
          HubunganPenemuan: data.hubunganPenemuan === "Pekerjanya" ? 1 : (data.hubunganPenemuan === "Bukan Pekerja" ? 2 : 0),
          UraianMasalah: data.uraianMasalah || "",

          IdeDiajukan: data.ideDiajukan || "",
          UraianProcess: data.uraianProcess || "",

          Directorate: data.directorate || "",
          Division: data.division || "",
          Department: data.department || "",
          Section: data.section || "",

          EvalQuality: data.evalQuality || "",
          EvalCost: data.evalCost || "",
          EvalDelivery: data.evalDelivery || "",
          EvalSafety: data.evalSafety || "",
          EvalMorale: data.evalMorale || "",
          EvalProductivity: data.evalProductivity || "",
          Sifat: data.sifat || "",
        }));

        const activeCodes = new Set(
          (data.suggestionImprovementResponseDtos || [])
            .map((imp: any) => String(imp.typeCode || imp.TypeCode || "").trim())
            .filter(Boolean)
        );

        setBenefits({
          menciptakan: activeCodes.has("Menciptakan"),
          meningkatkanJumlah: activeCodes.has("Meningkatkan Jumlah"),
          mencontoh: activeCodes.has("Mencontoh"),
          quality: !!data.evalQuality,
          cost: !!data.evalCost,
          delivery: !!data.evalDelivery,
          she: !!data.evalSafety,
          morale: !!data.evalMorale,
          productivity: !!data.evalProductivity,
        });

      } catch (err: any) {
        if (err.name === "AbortError") return;
        setValidationError(err.message || "Gagal memuat data draft.");
      }
    })();

    return () => ctrl.abort();
  }, [draftKey]);

  const [benefits, setBenefits] = useState<Record<BenefitKey, boolean>>({
    menciptakan: false,
    meningkatkanJumlah: false,
    mencontoh: false,
    quality: false,
    cost: false,
    delivery: false,
    she: false,
    morale: false,
    productivity: false,
  });

  // Set enable/disable per kolom evaluasi sesuai checkbox manfaat perbaikan
  const evalEnabled = {
    EvalQuality: benefits.quality,
    EvalCost: benefits.cost,
    EvalDelivery: benefits.delivery,
    EvalSafety: benefits.she,
    EvalMorale: benefits.morale,
    EvalProductivity: benefits.productivity,
  };

  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [loadingOrg, setLoadingOrg] = useState(false);
  const retrieveAbortRef = useRef<AbortController | null>(null);

  const [resultModal, setResultModal] = useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
    redirectPath?: string;
  }>({ open: false, type: "success", message: "" });

  const selectedEmployee = useMemo(
    () => employeeOptions.find((o) => o.value === state.nrpSelected) ?? null,
    [employeeOptions, state.nrpSelected]
  );

  const orgLocked = !!state.nrpSelected;

  const setField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setOrgFields = useCallback(
    (row: EmployeeRetrieveRow | null) => {
      setField("Directorate", safeStr(row?.directorate));
      setField("Division", safeStr(row?.division));
      setField("Department", safeStr(row?.department));
      setField("Section", safeStr(row?.section));
      if (row?.completeName) setField("submittedByName", safeStr(row.completeName));
    },
    [setField]
  );

  const toggleBenefit = useCallback((key: BenefitKey, checked: boolean) => {
    setBenefits((prev) => ({ ...prev, [key]: checked }));

    // Jika uncheck, kosongkan nilai evaluasi terkait
    if (!checked) {
      setState((prev) => {
        const map: Record<BenefitKey, keyof FormState | null> = {
          quality: "EvalQuality",
          cost: "EvalCost",
          delivery: "EvalDelivery",
          she: "EvalSafety",
          morale: "EvalMorale",
          productivity: "EvalProductivity",
          menciptakan: null,
          meningkatkanJumlah: null,
          mencontoh: null,
        };
        const evalKey = map[key];
        if (!evalKey) return prev;
        return { ...prev, [evalKey]: "" };
      });
    }
  }, []);

  const handleBenefitCheckedChange = useCallback(
    (key: BenefitKey, checked: unknown) => {
      toggleBenefit(key, Boolean(checked));
    },
    [toggleBenefit]
  );

  const openSuccess = useCallback((message: string, redirectPath?: string) => {
    setResultModal({ open: true, type: "success", message, redirectPath });
  }, []);

  const openError = useCallback((message: string) => {
    setResultModal({ open: true, type: "error", message });
  }, []);

  const closeModal = useCallback(() => {
    setResultModal((p) => ({ ...p, open: false }));
  }, []);

  const handleResultModalOpenChange = useCallback(
    (open: boolean) => {
      if (!open) closeModal();
    },
    [closeModal]
  );

  // =========================
  // Fetch employees
  // =========================
  useEffect(() => {
    const ctrl = new AbortController();

    const run = async () => {
      try {
        setLoadingEmployees(true);
        setValidationError("");

        const url = resolveApiUrl((API as any).EMPLOYEE_GET_LIST);
        if (!url) throw new Error("API.EMPLOYEE_GET_LIST is empty.");

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: 1, jobsite: user.jobsite }),
          credentials: "include",
          signal: ctrl.signal,
        });

        const { json, text } = await readResponse(res);
        if (!res.ok) throw new Error(json?.message ?? text ?? `HTTP ${res.status}`);

        setEmployeeOptions(toEmployeeOptions(parseEmployeeItems(json)));
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error(err);
        setValidationError(err?.message ?? "Gagal mengambil data employee (NRP).");
      } finally {
        setLoadingEmployees(false);
      }
    };

    run();
    return () => ctrl.abort();
  }, []);

  // =========================
  // Retrieve employee org by NRP
  // =========================
  const fetchEmployeeOrg = useCallback(
    async (nrp: string) => {
      retrieveAbortRef.current?.abort();
      const ctrl = new AbortController();
      retrieveAbortRef.current = ctrl;

      const url = resolveApiUrl((API as any).EMPLOYEE_RETRIEVE);
      if (!url) throw new Error("API.EMPLOYEE_RETRIEVE is empty.");

      setLoadingOrg(true);
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: 2, nrp }),
          credentials: "include",
          signal: ctrl.signal,
        });

        const { json, text } = await readResponse(res);
        if (!res.ok) throw new Error(json?.message ?? text ?? `HTTP ${res.status}`);
        if (!isSuccess(json, true)) {
          const code = getApiCode(json);
          throw new Error(json?.message || (code != null ? `Retrieve gagal (code: ${code})` : "Retrieve gagal"));
        }

        const row = parseEmployeeRetrieve(json);
        if (!row) throw new Error("Data employee tidak ditemukan.");

        setOrgFields(row);
      } finally {
        setLoadingOrg(false);
      }
    },
    [setOrgFields]
  );

  const handleEmployeeSelect = useCallback(
    async (opt: EmployeeOption | null) => {
      const nrp = opt?.value ?? "";
      const nama = safeStr(opt?.raw?.NAMA, "");
      const atasan1 = safeStr(opt?.raw?.ATASAN1, "");
      const atasan2 = safeStr(opt?.raw?.ATASAN2, "");
      const nama_atasan1 = safeStr(opt?.raw?.NAMA_ATASAN1, "");
      const nama_atasan2 = safeStr(opt?.raw?.NAMA_ATASAN2, "");

      setValidationError("");
      setField("nrpSelected", nrp);
      setField("CreatedBy", nrp);
      setField("Atasan1", atasan1);
      setField("Atasan2", atasan2);
      setField("NamaAtasan1", nama_atasan1);
      setField("NamaAtasan2", nama_atasan2);


      if (!nrp) {
        retrieveAbortRef.current?.abort();
        setField("submittedByName", safeStr(user?.name, ""));
        setOrgFields(null);
        return;
      }

      if (nama) setField("submittedByName", nama);

      try {
        await fetchEmployeeOrg(nrp);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error(err);
        setOrgFields(null);
        setValidationError(err?.message ?? "Gagal retrieve data employee.");
      }
    },
    [fetchEmployeeOrg, setField, setOrgFields, user]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files ?? []);

      if (!selectedFiles.length) return;

      setState((prev) => {
        const merged = [...prev.fileDocuments, ...selectedFiles];

        const uniqueFiles = merged.filter(
          (file, index, arr) =>
            arr.findIndex(
              (f) =>
                f.name === file.name &&
                f.size === file.size &&
                f.lastModified === file.lastModified
            ) === index
        );

        const err = validateAttachments(uniqueFiles);
        if (err) {
          setValidationError(err);
          return prev;
        }

        setValidationError("");
        return {
          ...prev,
          fileDocuments: uniqueFiles,
        };
      });

      e.target.value = "";
    },
    []
  );

  const removeFile = useCallback(
    (index: number) => {
      setState((prev) => ({
        ...prev,
        fileDocuments: prev.fileDocuments.filter((_, i) => i !== index),
      }));
    },
    []
  );

  const buildFormData = useCallback((action: number, status: string = STATUS_DEFAULT) => {
    const fd = new FormData();

    fd.append("Action", String(action));
    if (state.Ideano) fd.append("Ideano", state.Ideano);

    fd.append("CreatedBy", state.CreatedBy);
    fd.append("Judul", state.Judul);
    fd.append("Masalah", state.Masalah);
    fd.append("HubunganPenemuan", String(state.HubunganPenemuan));
    fd.append("UraianMasalah", state.UraianMasalah);
    fd.append("IdeDiajukan", state.IdeDiajukan);
    fd.append("UraianProcess", state.UraianProcess);

    fd.append("EvalQuality", state.EvalQuality);
    fd.append("EvalCost", state.EvalCost);
    fd.append("EvalDelivery", state.EvalDelivery);
    fd.append("EvalSafety", state.EvalSafety);
    fd.append("EvalMorale", state.EvalMorale);
    fd.append("EvalProductivity", state.EvalProductivity);

    fd.append("Directorate", state.Directorate);
    fd.append("Division", state.Division);
    fd.append("Department", state.Department);
    fd.append("Section", state.Section);
    fd.append("Status", status);

    const codes = buildImprovementCodes(benefits);
    if (codes) fd.append("ImprovementCodes", codes);

    state.fileDocuments.forEach((file) => {
      fd.append("fileDocuments", file, file.name);
    });

    return fd;
  }, [benefits, state]);

  const resetFormAfterSuccess = useCallback(() => {
    setState(initialState(user));
    setBenefits({
      menciptakan: false,
      meningkatkanJumlah: false,
      mencontoh: false,
      quality: false,
      cost: false,
      delivery: false,
      she: false,
      morale: false,
      productivity: false,
    });
    setValidationError("");
  }, [user]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (loadingOrg) {
        setValidationError("Sedang mengambil data organisasi dari NRP, tunggu sebentar.");
        return;
      }

      const err = validateRequired(state, benefits);
      console.log('err', err);
      if (err) {
        setValidationError(err);
        return;
      }

      setValidationError("");
      setIsSubmitting(true);

      try {
        const url = resolveApiUrl((API as any).SUGGESTION_EXECUTE);
        if (!url) throw new Error("API.SUGGESTION_EXECUTE is empty.");

        const fd = buildFormData(1);

        const res = await fetch(url, {
          method: "POST",
          body: fd,
          credentials: "include",
        });

        const { json, text } = await readResponse(res);

        if (!res.ok) {
          openError(json?.message ?? text ?? `HTTP ${res.status}`);
          return;
        }

        if (!isSuccess(json, true)) {
          const code = getApiCode(json);
          openError(json?.message || (code != null ? `Gagal submit (code: ${code})` : "Gagal submit IDE"));
          return;
        }

        openSuccess(json?.message || "Sukses submit Suggestion IDE");
      } catch (ex: any) {
        console.error(ex);
        openError(ex?.message || "Gagal submit IDE");
      } finally {
        setIsSubmitting(false);
      }
    },
    [buildFormData, loadingOrg, openError, openSuccess, state]
  );

  const handleSaveDraft = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();

      if (loadingOrg) {
        setValidationError("Sedang mengambil data organisasi dari NRP, tunggu sebentar.");
        return;
      }

      if (!state.CreatedBy.trim()) {
        setValidationError("NRP pembuat (CreatedBy) wajib dipilih untuk menyimpan draft.");
        return;
      }

      setValidationError("");
      setIsSubmitting(true);

      try {
        const url = resolveApiUrl((API as any).SUGGESTION_EXECUTE);
        if (!url) throw new Error("API.SUGGESTION_EXECUTE is empty.");

        // Update action state
        setState(prev => ({ ...prev, Action: 7 }));

        const fd = buildFormData(7, "Draft");

        const res = await fetch(url, {
          method: "POST",
          body: fd,
          credentials: "include",
        });

        const { json, text } = await readResponse(res);

        if (!res.ok) {
          openError(json?.message ?? text ?? `HTTP ${res.status}`);
          return;
        }

        if (!isSuccess(json, true)) {
          const code = getApiCode(json);
          openError(json?.message || (code != null ? `Gagal simpan draft (code: ${code})` : "Gagal simpan draft"));
          return;
        }

        openSuccess(json?.message || "Sukses menyimpan draft Suggestion IDE", "/project-status-draft");
      } catch (ex: any) {
        console.error(ex);
        openError(ex?.message || "Gagal simpan draft");
      } finally {
        setIsSubmitting(false);
      }
    },
    [benefits, loadingOrg, openError, openSuccess, state]
  );

  useEffect(() => {
    return () => retrieveAbortRef.current?.abort();
  }, []);

  const handleBack = useCallback(() => {
    const hasSs = searchParams.has("ss") || window.location.pathname.includes("/ss");
    const hasItemKey = searchParams.has("itemKey") || searchParams.has("ITEMKEY") || searchParams.has("itemkey") || !!draftKey;
    if (hasSs && hasItemKey) {
      navigate("/project-status-draft");
    } else {
      onBack();
    }
  }, [searchParams, draftKey, navigate, onBack]);

  return (
    <ModuleLayout onBack={handleBack}>
      <Card className="shadow-lg bg-card">
        <div className="border-b p-3 sm:p-4 flex justify-between items-start bg-card">
          <div>
            <h2 className="text-base sm:text-lg mb-1">Suggestion System (SS)</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">IDE PERBAIKAN - SS</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Form No : MSII08/BF-001</p>
          </div>
        </div>

        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border rounded-lg p-3 sm:p-4 bg-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Label className="text-xs sm:text-sm mb-2 block">Pembuat (NRP) (*)</Label>
                  <p className="text-[11px] text-muted-foreground">
                    NRP yang dipilih akan menjadi <b>Nama pembuat SS</b> dan digunakan untuk autofill organisasi.
                  </p>
                </div>
              </div>

              <div className="space-y-2 mt-3">
                <Label className="text-xs sm:text-sm">NRP</Label>

                <Select<EmployeeOption, false>
                  inputId="nrp"
                  isClearable
                  isLoading={loadingEmployees}
                  options={employeeOptions}
                  placeholder={loadingEmployees ? "Loading..." : "Pilih NRP"}
                  value={selectedEmployee}
                  onChange={(opt) => handleEmployeeSelect(opt as EmployeeOption | null)}
                  className="text-sm"
                  classNamePrefix="rs"
                  styles={{
                    control: (base) => ({ ...base, minHeight: 36, borderRadius: 6 }),
                    valueContainer: (base) => ({ ...base, padding: "0 10px" }),
                    input: (base) => ({ ...base, margin: 0, padding: 0 }),
                    indicatorsContainer: (base) => ({ ...base, height: 36 }),
                  }}
                />

                {loadingOrg && (
                  <p className="text-xs text-muted-foreground">
                    Mengambil data Directorate/Division/Department/Section...
                  </p>
                )}

                {!!state.CreatedBy && (
                  <>
                    {/* <p className="text-xs text-muted-foreground">
                      CreatedBy: <span className="font-medium">{state.CreatedBy}</span>
                    </p> */}
                    <p className="text-xs text-muted-foreground">
                      Atasan 1: <span className="font-medium">{state.Atasan1 + " - " + state.NamaAtasan1}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Atasan 2: <span className="font-medium">{state.Atasan2 + " - " + state.NamaAtasan2}</span>
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="border rounded-lg p-3 sm:p-4 bg-card">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="Judul" className="text-xs sm:text-sm">
                    Judul <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="Judul"
                    value={state.Judul}
                    onChange={(e) => setField("Judul", e.target.value)}
                    placeholder="Judul ide perbaikan"
                    required
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="HubunganPenemuan" className="text-xs sm:text-sm">
                    Hubungan <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="HubunganPenemuan"
                    value={state.HubunganPenemuan}
                    onChange={(e) => setField("HubunganPenemuan", Number(e.target.value) as HubunganInt)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    required
                  >
                    <option value={0}>Pilih Hubungan</option>
                    <option value={1}>Pekerjanya</option>
                    <option value={2}>Bukan Pekerja</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Directorate" className="text-xs sm:text-sm">
                    Directorate <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="Directorate"
                    value={state.Directorate}
                    onChange={(e) => setField("Directorate", e.target.value)}
                    placeholder={loadingOrg ? "Loading..." : "Directorate"}
                    required
                    className="text-sm"
                    readOnly={orgLocked}
                    disabled={orgLocked && loadingOrg}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Division" className="text-xs sm:text-sm">
                    Division <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="Division"
                    value={state.Division}
                    onChange={(e) => setField("Division", e.target.value)}
                    placeholder={loadingOrg ? "Loading..." : "Division"}
                    required
                    className="text-sm"
                    readOnly={orgLocked}
                    disabled={orgLocked && loadingOrg}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Department" className="text-xs sm:text-sm">
                    Department
                  </Label>
                  <Input
                    id="Department"
                    value={state.Department}
                    onChange={(e) => setField("Department", e.target.value)}
                    placeholder={loadingOrg ? "Loading..." : "Department"}
                    required
                    className="text-sm"
                    readOnly={orgLocked}
                    disabled={orgLocked && loadingOrg}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Section" className="text-xs sm:text-sm">
                    Section
                  </Label>
                  <Input
                    id="Section"
                    value={state.Section}
                    onChange={(e) => setField("Section", e.target.value)}
                    placeholder={loadingOrg ? "Loading..." : "Section"}
                    className="text-sm"
                    readOnly={orgLocked}
                    disabled={orgLocked && loadingOrg}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="Masalah" className="text-xs sm:text-sm">
                Masalah <span className="text-red-500">*</span>
              </Label>
              <Input
                id="Masalah"
                value={state.Masalah}
                onChange={(e) => setField("Masalah", e.target.value)}
                placeholder="Ringkas masalah yang dihadapi"
                required
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="UraianMasalah" className="text-xs sm:text-sm">
                Uraian Masalah <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="UraianMasalah"
                value={state.UraianMasalah}
                onChange={(e) => setField("UraianMasalah", e.target.value)}
                placeholder="Jelaskan masalah yang dihadapi..."
                rows={5}
                required
                className="text-sm resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="IdeDiajukan" className="text-xs sm:text-sm">
                Ide Diajukan <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="IdeDiajukan"
                value={state.IdeDiajukan}
                onChange={(e) => setField("IdeDiajukan", e.target.value)}
                placeholder="Tuliskan ide yang diajukan..."
                rows={4}
                required
                className="text-sm resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="UraianProcess" className="text-xs sm:text-sm">
                Uraian Process / Cara Pembuatannya <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="UraianProcess"
                value={state.UraianProcess}
                onChange={(e) => setField("UraianProcess", e.target.value)}
                placeholder="Jelaskan proses / cara implementasi..."
                rows={5}
                required
                className="text-sm resize-none"
              />
            </div>

            <div className="border rounded-lg p-3 sm:p-4 bg-card">
              <Label className="text-xs sm:text-sm mb-3 block">Sifat perbaikan</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {BENEFIT_ITEMS.map((b) => (
                  <div key={b.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`benefit-${b.key}`}
                      checked={benefits[b.key]}
                      onCheckedChange={handleBenefitCheckedChange.bind(null, b.key)}
                    />
                    <label htmlFor={`benefit-${b.key}`} className="text-xs sm:text-sm cursor-pointer">
                      {b.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="border rounded-lg p-3 sm:p-4 bg-card">
              <Label className="text-xs sm:text-sm mb-3 block">Manfaat perbaikan</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {BENEFIT_ITEMS_2.map((b) => (
                  <div key={b.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`benefit-${b.key}`}
                      checked={benefits[b.key]}
                      onCheckedChange={handleBenefitCheckedChange.bind(null, b.key)}
                    />
                    <label htmlFor={`benefit-${b.key}`} className="text-xs sm:text-sm cursor-pointer">
                      {b.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="border rounded-lg p-3 sm:p-4"
              style={{ backgroundColor: "rgba(0, 97, 135, 0.05)", borderColor: "#006187" }}
            >
              <Label htmlFor="fileDocuments" className="text-xs sm:text-sm mb-2 block leading-6">
                <span className="block">
                  Lampiran dokumen (max 5mb, pdf): <span className="text-red-500">*</span>
                </span>
                <span className="block">- Kondisi before after (Wajib)</span>
                <span className="block">- Perhitungan saving cost (Jika ada)</span>
                <span className="block">- Lampiran lainnya</span>
              </Label>

              <div className="space-y-2">
                <Input id="fileDocuments" type="file" multiple onChange={handleFileChange} className="text-sm" />

                {state.fileDocuments.length > 0 && (
                  <div className="space-y-2">
                    {state.fileDocuments.map((file, idx) => (
                      <div
                        key={`${file.name}-${idx}`}
                        className="flex items-center justify-between gap-2 p-2 bg-white rounded border border-green-200"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-green-600 shrink-0" />
                          <span className="text-xs text-green-600 break-all">
                            {file.name} ({readFileSizeKB(file)} KB)
                          </span>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFile(idx)}
                          className="shrink-0"
                        >
                          Hapus
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border rounded-lg p-3 sm:p-4" style={{ backgroundColor: "rgba(0, 97, 135, 0.05)" }}>
              <Label className="text-xs sm:text-sm mb-3 block">Evaluasi / Hasil</Label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Quality *</Label>
                  <Textarea
                    value={state.EvalQuality}
                    onChange={(e) => setField("EvalQuality", e.target.value)}
                    rows={3}
                    className="text-sm resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Efficiency *</Label>
                  <Textarea
                    value={state.EvalCost}
                    onChange={(e) => setField("EvalCost", e.target.value)}
                    rows={3}
                    className="text-sm resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Culture Development</Label>
                  <Textarea
                    value={state.EvalSafety}
                    onChange={(e) => setField("EvalSafety", e.target.value)}
                    rows={3}
                    className="text-sm resize-none"
                  />
                </div>
              </div>
            </div>

            {validationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSubmitting || loadingOrg}
                style={{ background: "linear-gradient(135deg, #006187 0%, #007B5F 100%)" }}
              >
                Save As Draft
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || loadingOrg}
                style={{ background: "linear-gradient(135deg, #006187 0%, #007B5F 100%)" }}
              >
                {isSubmitting ? "Mengirim..." : loadingOrg ? "Loading NRP..." : "Submit"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={resultModal.open} onOpenChange={handleResultModalOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {resultModal.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              {resultModal.type === "success" ? "Sukses" : "Gagal"}
            </DialogTitle>
            <DialogDescription className="text-sm">{resultModal.message}</DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant={resultModal.type === "success" ? "default" : "destructive"}
              style={
                resultModal.type === "success"
                  ? { background: "linear-gradient(135deg, #006187 0%, #007B5F 100%)" }
                  : undefined
              }
              onClick={() => {
                const ok = resultModal.type === "success";
                closeModal();

                if (ok) {
                  onSubmit?.({
                    type: "SS",
                    title: state.Judul,
                    projectTitle: state.Judul,
                    description: state.UraianMasalah,
                    currentSituation: state.Masalah,
                    proposedSolution: state.IdeDiajukan,
                    submittedBy: state.submittedByName || user?.name || state.CreatedBy,
                    status: "pending",
                    fileDocuments: state.fileDocuments.map((f) => f.name),
                  });

                  resetFormAfterSuccess();
                  navigate(resultModal.redirectPath || REDIRECT_AFTER_SUCCESS);
                }
              }}
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}