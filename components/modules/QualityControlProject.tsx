import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { AlertCircle, CheckCircle2, FileText, X } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { ModuleLayout } from '../layout/ModuleLayout';
import { Badge } from '../ui/badge';
import { API, CONFIG } from '../../config';
import { getCookieJson } from '../../libs/cookie';
import SelectReact from "react-select";

function resolveApiUrl(v: any): string {
  return typeof v === "function" ? v() : String(v ?? "");
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
function getLoginNrp() {
  try {
    const c = getCookieJson<any>("inovasis_auth");
    return c?.nrp ?? c?.NRP ?? c?.username ?? null;
  } catch {
    return null;
  }
}

type EmployeeItem = {
  NRP?: string;
  NAMA?: string;
  JOBSITE?: string;
  ATASAN1?: string;
  ATASAN2?: string;
  ACTORTYPE?: string;
  EMAIL?: string;
};
type EmployeeOption = { value: string; label: string; raw: EmployeeItem };
type EmployeeRetrieveRow = {
  department?: string;
  section?: string;
};
function safeStr(v: any, fallback = "") {
  const s = String(v ?? "").trim();
  return s ? s : fallback;
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
      return { value: nrp, label: nama ? `${nrp} - ${nama}` : nrp, raw: x };
    })
    .filter(Boolean) as EmployeeOption[];
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
function parseEmployeeRetrieve(json: any): EmployeeRetrieveRow | null {
  const arr = json?.data ?? [];
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr[0] as EmployeeRetrieveRow;
}

interface QualityControlProjectProps {
  user: any;
  onBack: () => void;
  onSubmit: (data: any) => void;
}

export function QualityControlProject({ user, onBack, onSubmit }: QualityControlProjectProps) {
  const [employeeOptionsCreator, setEmployeeOptionsCreator] = useState<EmployeeOption[]>([]);
  const [employeeOptionsSuperior, setEmployeeOptionsSuperior] = useState<EmployeeOption[]>([]);
  const [loadingEmployeesCreator, setLoadingEmployeesCreator] = useState(false);
  const [loadingEmployeesSuperior, setLoadingEmployeesSuperior] = useState(false);
  const [loadingOrg, setLoadingOrg] = useState(false);
  const [klasifikasiOptions, setKlasifikasiOptions] = useState<{ value: string; label: string }[]>([]);
  const [loadingKlasifikasi, setLoadingKlasifikasi] = useState(false);
  const [lockedDepartment, setLockedDepartment] = useState("");

  const [formData, setFormData] = useState({
    // DATA TEAM QCP
    nrpSelected: '',
    lokasi: '',
    department: (user?.department ? [user.department] : []) as string[],
    section: '',
    namaGroupQCCP: '',
    klasifikasi: '',
    fasilitatorNRP: '',
    fasilitator: '',
    fasilitatorDepartment: '',
    fasilitatorSection: '',
    leaderNRP: '',
    leader: '',
    leaderDepartment: '',
    leaderSection: '',
    members: Array(10).fill({ name: '', department: '', section: '', nrp: '' }),

    // SASARAN QCP
    temaQCCP: '',
    kpiDidukung: '',

    // PERNYATAAN MASALAH / PELUANG PERBAIKAN
    masalahPeluang1: '',
    masalahPeluang2: '',
    masalahPeluang3: '',
    masalahPeluang4: '',

    // PERNYATAAN TARGET
    apaTargetnya: '',
    berapaTargetnya: '',
    kapanDicapai: '',

    // KONDISI SEBELUM QCP
    kondisiSebelum: '',

    supportingDocument: null as File | null
  });

  const [validationError, setValidationError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Department search states
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [showDepartmentSuggestions, setShowDepartmentSuggestions] = useState(false);
  const departmentInputRef = useRef<HTMLDivElement>(null);

  const [masterDepartments, setMasterDepartments] = useState<string[]>([]);
  const [masterDepartmentsLoading, setMasterDepartmentsLoading] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setMasterDepartmentsLoading(true);
        const url = `${CONFIG.apiBaseUrl}/api/master/masterdata`;
        const res = await fetch(url, { method: "GET", credentials: "include", signal: ctrl.signal });
        const json = await res.json().catch(() => ({}));
        const deptList = Array.isArray(json?.departmentList) ? json.departmentList : [];
        const names = deptList
          .map((d: any) => safeStr(d?.departmentName ?? d?.DepartmentName ?? d?.name ?? d?.Name, ""))
          .filter(Boolean);
        setMasterDepartments(Array.from(new Set(names)).sort((a, b) => a.localeCompare(b)));
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setMasterDepartments([]);
      } finally {
        setMasterDepartmentsLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  const filteredDepartments = useMemo(() => {
    const q = String(departmentSearch || "").trim().toLowerCase();
    const base = masterDepartments.filter((dept) => dept && dept !== lockedDepartment);
    if (!q) return base;
    return base.filter((dept) => dept.toLowerCase().includes(q));
  }, [departmentSearch, masterDepartments, lockedDepartment]);

  useEffect(() => {
    const ctrl = new AbortController();
    const run = async () => {
      try {
        setLoadingEmployeesCreator(true);
        const url = resolveApiUrl((API as any).EMPLOYEE_GET_LIST);
        if (!url) throw new Error("API.EMPLOYEE_GET_LIST is empty.");
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: 1 }),
          credentials: "include",
          signal: ctrl.signal,
        });
        const { json, text } = await readResponse(res);
        if (!res.ok) throw new Error(json?.message ?? text ?? `HTTP ${res.status}`);
        setEmployeeOptionsCreator(toEmployeeOptions(parseEmployeeItems(json)));
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        setValidationError(err?.message ?? "Gagal mengambil data employee (NRP) Creator.");
      } finally {
        setLoadingEmployeesCreator(false);
      }
    };
    run();
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    const run = async () => {
      try {
        setLoadingEmployeesSuperior(true);
        const url = resolveApiUrl((API as any).EMPLOYEE_GET_LIST);
        if (!url) throw new Error("API.EMPLOYEE_GET_LIST is empty.");
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: 1 }),
          credentials: "include",
          signal: ctrl.signal,
        });
        const { json, text } = await readResponse(res);
        if (!res.ok) throw new Error(json?.message ?? text ?? `HTTP ${res.status}`);
        setEmployeeOptionsSuperior(toEmployeeOptions(parseEmployeeItems(json)));
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        setValidationError(err?.message ?? "Gagal mengambil data employee (NRP) SUPERIOR.");
      } finally {
        setLoadingEmployeesSuperior(false);
      }
    };
    run();
    return () => ctrl.abort();
  }, []);

  // Fetch Klasifikasi list
  useEffect(() => {
    const ctrl = new AbortController();
    const fetchKlasifikasi = async () => {
      try {
        setLoadingKlasifikasi(true);
        const url = resolveApiUrl(API.KLASIFIKASI_LIST);
        if (!url) throw new Error("API.KLASIFIKASI_LIST is empty.");
        const res = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          signal: ctrl.signal,
        });
        const { json, text } = await readResponse(res);
        if (!res.ok) throw new Error(json?.message ?? text ?? `HTTP ${res.status}`);

        const dataList = json?.data || [];
        const opts = dataList.map((item: any) => ({
          value: String(item.id || item.Id),
          label: String(item.classificationName || item.ClassificationName),
        }));
        setKlasifikasiOptions(opts);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error(err);
      } finally {
        setLoadingKlasifikasi(false);
      }
    };
    fetchKlasifikasi();
    return () => ctrl.abort();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (departmentInputRef.current && !departmentInputRef.current.contains(event.target as Node)) {
        setShowDepartmentSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectDepartment = (dept: string) => {
    if (!lockedDepartment) {
      setValidationError('Pilih Pembuat Lokasi terlebih dahulu.');
      return;
    }
    // Check if department already selected
    if (formData.department.includes(dept)) {
      setValidationError('Department already selected');
      setDepartmentSearch('');
      setShowDepartmentSuggestions(false);
      return;
    }
    if (formData.department.length >= 2) {
      setValidationError('Maksimal 2 department.');
      setDepartmentSearch('');
      setShowDepartmentSuggestions(false);
      return;
    }

    setFormData({ ...formData, department: [...formData.department, dept] });
    setDepartmentSearch('');
    setShowDepartmentSuggestions(false);
    setValidationError('');
  };

  const handleRemoveDepartment = (deptToRemove: string) => {
    if (deptToRemove === lockedDepartment) return;
    setFormData({
      ...formData,
      department: formData.department.filter(d => d !== deptToRemove)
    });
  };

  const updateMember = (index: number, field: 'name' | 'department' | 'section' | 'nrp', value: string) => {
    const newMembers = [...formData.members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setFormData({ ...formData, members: newMembers });
    setValidationError('');
  };

  const retrieveEmployeeOrg = useCallback(async (nrp: string) => {
    const url = resolveApiUrl((API as any).EMPLOYEE_RETRIEVE);
    if (!url) throw new Error("API.EMPLOYEE_RETRIEVE is empty.");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: 2, nrp }),
      credentials: "include",
    });
    const { json, text } = await readResponse(res);
    if (!res.ok) throw new Error(json?.message ?? text ?? `HTTP ${res.status}`);
    if (!isSuccess(json, true)) {
      const code = getApiCode(json);
      throw new Error(json?.message || (code != null ? `Retrieve gagal (code: ${code})` : "Retrieve gagal"));
    }
    const row = parseEmployeeRetrieve(json);
    if (!row) throw new Error("Data employee tidak ditemukan.");
    return row;
  }, []);

  const selectedCreatorOpt = useMemo(
    () => employeeOptionsCreator.find((o) => o.value === formData.nrpSelected) ?? null,
    [employeeOptionsCreator, formData.nrpSelected]
  );

  const handleCreatorSelect = useCallback(
    async (opt: EmployeeOption | null) => {
      const nrp = opt?.value ?? "";
      const jobsite = safeStr(opt?.raw?.JOBSITE, "");

      if (!nrp) {
        setLockedDepartment("");
        setFormData((prev) => ({
          ...prev,
          nrpSelected: "",
          lokasi: "",
          section: "",
        }));
        return;
      }

      setLoadingOrg(true);
      try {
        const row = await retrieveEmployeeOrg(nrp);
        const creatorDept = safeStr(row?.department, "");
        const creatorSection = safeStr(row?.section, "");

        setLockedDepartment(creatorDept);
        setFormData((prev) => {
          const existing = Array.isArray(prev.department) ? prev.department : [];
          const rest = existing.filter((d) => d && d !== creatorDept);
          const deptArr = creatorDept ? [creatorDept, ...rest] : rest;

          return {
            ...prev,
            nrpSelected: nrp,
            lokasi: jobsite,
            section: creatorSection,
            department: deptArr.length ? deptArr : prev.department,
          };
        });

        setValidationError("");
      } catch (err: any) {
        setValidationError(err?.message ?? "Gagal retrieve data employee.");
      } finally {
        setLoadingOrg(false);
      }
    },
    [retrieveEmployeeOrg]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // Check file size (5MB = 5242880 bytes)
      if (file.size > 5242880) {
        setValidationError('File size must be less than 5 MB');
        e.target.value = '';
        return;
      }

      setFormData({ ...formData, supportingDocument: file });
      setValidationError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Must have minimum 2 departments
    if (formData.department.length < 2) {
      setValidationError('Please select minimum 2 departments');
      return;
    }

    // Validation: Must have minimum 3 members
    const validMembers = formData.members.filter(m => m.name.trim() !== '');
    if (validMembers.length < 3) {
      setValidationError('Quality Control Project requires minimum 3 team members');
      return;
    }

    // Validate that supporting document is uploaded
    if (!formData.supportingDocument) {
      setValidationError('Please upload a supporting document (PDF, max 5MB)');
      return;
    }

    //leader
    const ctrl = new AbortController();
    const url = resolveApiUrl((API as any).EMPLOYEE_RETRIEVE);
    if (!url) throw new Error("API.EMPLOYEE_RETRIEVE is empty.");

    let leaderName = '';
    let leaderDepartment = '';
    let leaderSection = '';

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 2, nrp: user?.nrp }),
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
      console.log("Employee retrieve result:", { json, row });
      if (!row) throw new Error("Data employee tidak ditemukan.");

      setValidationError("");
      leaderDepartment = row?.department || '-';
      leaderSection = row?.section || '-';

    } finally {
      setLoadingOrg(false);
    }

    const payload = {
      ...formData,
      klasifikasi: formData.klasifikasi,
      leaderNRP: user?.nrp,
      leader: user?.nama,
      leaderDepartment: leaderDepartment,
      leaderSection: leaderSection,
      members: validMembers,
      section: formData.section || '-',
      type: 'QCP',
      submittedBy: user?.name,
      status: 'submitted',
      documentName: formData.supportingDocument?.name,
      createdBy: formData.nrpSelected || getLoginNrp() || user?.nrp || user?.NRP || user?.username || '',
    };

    try {
      setValidationError('');
      const url = resolveApiUrl((API as any).QCP_CREATE);
      if (!url) throw new Error('API endpoint untuk submit QCP tidak tersedia.');

      const form = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (key === 'supportingDocument' && value) {
          form.append('supportingDocument', value as File);
        } else if (key === 'members') {
          form.append('membersRaw', JSON.stringify(value));
        } else {
          form.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''));
        }
      });

      const response = await fetch(url, {
        method: 'POST',
        body: form,
        credentials: 'include',
      });
      const { json, text } = await readResponse(response);
      if (!response.ok) throw new Error(json?.message ?? text ?? `HTTP ${response.status}`);

      setShowSuccess(true);
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (err: any) {
      setValidationError(err?.message || 'Gagal submit QCP.');
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-background">
        <Card className="w-full max-w-md text-center bg-card">
          <CardContent className="pt-6">
            <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: '#5FCEA0' }} />
            <h3 className="mb-2">QCP Project Submitted!</h3>
            <p className="text-muted-foreground text-sm sm:text-base">Your Quality Control Project has been submitted</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ModuleLayout onBack={onBack}>
      <Card className="shadow-lg bg-card">
        {/* Header with Form Number */}
        <div className="border-b p-3 sm:p-4 flex justify-between items-start bg-card">
          <div>
            <h2 className="text-base sm:text-lg mb-1">PENDAFTARAN PROJECT QCP</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Quality Control Project Registration</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Form No : MSI08/F-007</p>
          </div>
        </div>

        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* DATA TEAM QCP */}
            <div className="border rounded-lg p-3 sm:p-4 bg-card">
              <h3 className="text-sm sm:text-base mb-4 uppercase">Quality Control Project</h3>
              <div className="mb-3 pb-2 border-b">
                <h4 className="text-xs sm:text-sm">DATA TEAM QCP</h4>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">1. Pembuat Lokasi *</Label>
                    <SelectReact<EmployeeOption, false>
                      inputId="nrp"
                      isClearable
                      isLoading={loadingEmployeesCreator}
                      options={employeeOptionsCreator}
                      placeholder={loadingEmployeesCreator ? "Loading..." : "Pilih NRP"}
                      value={selectedCreatorOpt}
                      onChange={handleCreatorSelect}
                      className="text-sm"
                      classNamePrefix="rs"
                      styles={{
                        control: (base) => ({ ...base, minHeight: 36, borderRadius: 6 }),
                        valueContainer: (base) => ({ ...base, padding: "0 10px" }),
                        input: (base) => ({ ...base, margin: 0, padding: 0 }),
                        indicatorsContainer: (base) => ({ ...base, height: 36 }),
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lokasi" className="text-xs sm:text-sm">2. Lokasi *</Label>
                    <Input
                      id="lokasi"
                      value={formData.lokasi}
                      placeholder="Lokasi"
                      required
                      readOnly
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-xs sm:text-sm">
                      3. Department (Minimum 2 required) *
                    </Label>
                    <div className="relative" ref={departmentInputRef}>
                      <div className="border rounded-md p-2 bg-background min-h-[42px]">
                        {/* Display selected departments as badges */}
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.department.map((dept, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1 px-3 py-1"
                              style={{ background: 'linear-gradient(135deg, #006187 0%, #007B5F 100%)', color: 'white' }}
                            >
                              {dept}
                              <button
                                type="button"
                                onClick={() => handleRemoveDepartment(dept)}
                                disabled={dept === lockedDepartment}
                                className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>

                        {/* Search input - always visible */}
                        <Input
                          id="department"
                          placeholder={
                            !lockedDepartment
                              ? "Pilih Pembuat Lokasi terlebih dahulu"
                              : formData.department.length >= 2
                                ? "Maksimal 2 department"
                                : masterDepartmentsLoading
                                  ? "Loading department..."
                                  : formData.department.length === 0
                                    ? "Search and add departments..."
                                    : "Add more departments..."
                          }
                          value={departmentSearch}
                          disabled={!lockedDepartment || formData.department.length >= 2 || masterDepartmentsLoading}
                          onChange={(e) => {
                            setDepartmentSearch(e.target.value);
                            setShowDepartmentSuggestions(true);
                          }}
                          onFocus={() => setShowDepartmentSuggestions(true)}
                          className="text-sm border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>

                      {/* Suggestions dropdown */}
                      {showDepartmentSuggestions && filteredDepartments.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-card border rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredDepartments
                            .filter(dept => !formData.department.includes(dept))
                            .map((dept, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => handleSelectDepartment(dept)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                              >
                                {dept}
                              </button>
                            ))}
                        </div>
                      )}

                      {/* Counter indicator */}
                      <p className={`text-xs mt-1 ${formData.department.length >= 2 ? 'text-green-600' : 'text-red-600'}`}>
                        {formData.department.length} department(s) selected
                        {formData.department.length >= 2 ? ' ✓' : ' (Minimum 2 required)'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="klasifikasi" className="text-xs sm:text-sm">4. Klasifikasi *</Label>
                    <SelectReact<{ value: string; label: string }, false>
                      inputId="klasifikasi"
                      isClearable
                      isLoading={loadingKlasifikasi}
                      options={klasifikasiOptions}
                      placeholder={loadingKlasifikasi ? "Loading..." : "Pilih Klasifikasi"}
                      value={klasifikasiOptions.find(o => o.label === formData.klasifikasi) || null}
                      onChange={(opt) => setFormData({ ...formData, klasifikasi: opt?.label || "" })}
                      className="text-sm"
                      classNamePrefix="rs"
                      styles={{
                        control: (base) => ({ ...base, minHeight: 36, borderRadius: 6 }),
                        valueContainer: (base) => ({ ...base, padding: "0 10px" }),
                        input: (base) => ({ ...base, margin: 0, padding: 0 }),
                        indicatorsContainer: (base) => ({ ...base, height: 36 }),
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="section" className="text-xs sm:text-sm">5. Section *</Label>
                    <Input
                      id="section"
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      placeholder="e.g., Talent Management & ERP & Integration System"
                      required
                      readOnly
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="namaGroupQCCP" className="text-xs sm:text-sm">5. Nama Group QCP *</Label>
                    <Input
                      id="namaGroupQCCP"
                      value={formData.namaGroupQCCP}
                      onChange={(e) => setFormData({ ...formData, namaGroupQCCP: e.target.value })}
                      placeholder="Group Name"
                      required
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Fasilitator Section */}
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">5. Fasilitator *</Label>
                  <div className="border rounded-lg p-3 bg-background space-y-3">
                    {/* NRP Search Row */}
                    <div className="flex gap-2">
                      <SelectReact<EmployeeOption, false>
                        inputId="fasilitator-nrp"
                        isClearable
                        isLoading={loadingEmployeesSuperior}
                        options={employeeOptionsSuperior}
                        placeholder={loadingEmployeesSuperior ? "Loading..." : "Pilih NRP"}
                        value={employeeOptionsSuperior.find((o) => o.value === formData.fasilitatorNRP) || null}
                        onChange={async (opt) => {
                          const nrp = opt?.value || "";
                          const nama = safeStr(opt?.raw?.NAMA, "");
                          if (!nrp) {
                            setFormData({
                              ...formData,
                              fasilitatorNRP: "",
                              fasilitator: "",
                              fasilitatorDepartment: "",
                              fasilitatorSection: "",
                            });
                            return;
                          }
                          setLoadingOrg(true);
                          try {
                            const row = await retrieveEmployeeOrg(nrp);
                            setFormData({
                              ...formData,
                              fasilitatorNRP: nrp,
                              fasilitator: nama,
                              fasilitatorDepartment: safeStr(row?.department, ""),
                              fasilitatorSection: safeStr(row?.section, ""),
                            });
                            setValidationError("");
                          } catch (err: any) {
                            setValidationError(err?.message ?? "Gagal retrieve data employee.");
                          } finally {
                            setLoadingOrg(false);
                          }
                        }}
                        className="text-sm flex-1"
                        classNamePrefix="rs"
                        styles={{
                          control: (base) => ({ ...base, minHeight: 36, borderRadius: 6 }),
                          valueContainer: (base) => ({ ...base, padding: "0 10px" }),
                          input: (base) => ({ ...base, margin: 0, padding: 0 }),
                          indicatorsContainer: (base) => ({ ...base, height: 36 }),
                        }}
                      />
                    </div>

                    {/* Details Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Input
                        placeholder="Fasilitator Name"
                        value={formData.fasilitator}
                        onChange={(e) => setFormData({ ...formData, fasilitator: e.target.value })}
                        required
                        className="text-sm"
                        readOnly
                      />
                      <Input
                        placeholder="Department"
                        value={formData.fasilitatorDepartment}
                        onChange={(e) => setFormData({ ...formData, fasilitatorDepartment: e.target.value })}
                        className="text-sm"
                        readOnly
                      />
                      <Input
                        placeholder="Section"
                        value={formData.fasilitatorSection}
                        onChange={(e) => setFormData({ ...formData, fasilitatorSection: e.target.value })}
                        className="text-sm"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Leader Section */}
                <div className="space-y-2" style={{ display: "none" }}>
                  <Label className="text-xs sm:text-sm">6. Leader *</Label>
                  <div className="border rounded-lg p-3 bg-background space-y-3">
                    {/* NRP Search Row */}
                    <div className="flex gap-2">
                      <SelectReact<EmployeeOption, false>
                        inputId="leader-nrp"
                        isClearable
                        isLoading={loadingEmployeesSuperior}
                        options={employeeOptionsSuperior}
                        placeholder={loadingEmployeesSuperior ? "Loading..." : "Pilih NRP"}
                        value={employeeOptionsSuperior.find((o) => o.value === formData.leaderNRP) || null}
                        onChange={async (opt) => {
                          const nrp = opt?.value || "";
                          const nama = safeStr(opt?.raw?.NAMA, "");
                          if (!nrp) {
                            setFormData({
                              ...formData,
                              leaderNRP: "",
                              leader: "",
                              leaderDepartment: "",
                              leaderSection: "",
                            });
                            return;
                          }
                          setLoadingOrg(true);
                          try {
                            const row = await retrieveEmployeeOrg(nrp);
                            setFormData({
                              ...formData,
                              leaderNRP: nrp,
                              leader: nama,
                              leaderDepartment: safeStr(row?.department, ""),
                              leaderSection: safeStr(row?.section, ""),
                            });
                            setValidationError("");
                          } catch (err: any) {
                            setValidationError(err?.message ?? "Gagal retrieve data employee.");
                          } finally {
                            setLoadingOrg(false);
                          }
                        }}
                        className="text-sm flex-1"
                        classNamePrefix="rs"
                        styles={{
                          control: (base) => ({ ...base, minHeight: 36, borderRadius: 6 }),
                          valueContainer: (base) => ({ ...base, padding: "0 10px" }),
                          input: (base) => ({ ...base, margin: 0, padding: 0 }),
                          indicatorsContainer: (base) => ({ ...base, height: 36 }),
                        }}
                      />
                    </div>

                    {/* Details Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Input
                        placeholder="Leader Name"
                        value={formData.leader}
                        onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
                        required
                        className="text-sm"
                        readOnly
                      />
                      <Input
                        placeholder="Department"
                        value={formData.leaderDepartment}
                        onChange={(e) => setFormData({ ...formData, leaderDepartment: e.target.value })}
                        className="text-sm"
                        readOnly
                      />
                      <Input
                        placeholder="Section"
                        value={formData.leaderSection}
                        onChange={(e) => setFormData({ ...formData, leaderSection: e.target.value })}
                        className="text-sm"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Members Section */}
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">7. Anggota + NRP (Minimum 3 required) *</Label>

                  {/* Search and Insert Section */}
                  <div className="border rounded-lg p-3 bg-background space-y-3">
                    <div className="flex gap-2">
                      <SelectReact<EmployeeOption, false>
                        inputId="member-nrp"
                        isClearable
                        isLoading={loadingEmployeesCreator}
                        options={employeeOptionsCreator}
                        placeholder={loadingEmployeesCreator ? "Loading..." : "Pilih NRP Anggota"}
                        value={null}
                        onChange={async (opt) => {
                          const nrp = opt?.value || "";
                          const nama = safeStr(opt?.raw?.NAMA, "");
                          if (!nrp) return;

                          if (formData.members.some((m) => m.nrp === nrp)) {
                            setValidationError("NRP sudah ada di daftar anggota.");
                            return;
                          }

                          const emptyIndex = formData.members.findIndex((m) => !m.name.trim());
                          if (emptyIndex === -1) {
                            setValidationError("All member slots are filled. Please clear a slot first.");
                            return;
                          }

                          setLoadingOrg(true);
                          try {
                            const row = await retrieveEmployeeOrg(nrp);
                            const newMembers = [...formData.members];
                            newMembers[emptyIndex] = {
                              name: nama,
                              department: safeStr(row?.department, ""),
                              section: safeStr(row?.section, ""),
                              nrp,
                            };
                            setFormData({ ...formData, members: newMembers });
                            setValidationError("");
                          } catch (err: any) {
                            setValidationError(err?.message ?? "Gagal retrieve data employee.");
                          } finally {
                            setLoadingOrg(false);
                          }
                        }}
                        className="text-sm flex-1"
                        classNamePrefix="rs"
                        styles={{
                          control: (base) => ({ ...base, minHeight: 36, borderRadius: 6 }),
                          valueContainer: (base) => ({ ...base, padding: "0 10px" }),
                          input: (base) => ({ ...base, margin: 0, padding: 0 }),
                          indicatorsContainer: (base) => ({ ...base, height: 36 }),
                        }}
                        key={formData.members.map((m) => m.nrp).join(",")}
                      />
                    </div>

                    {/* Members Table */}
                    <div className="overflow-x-auto">
                      <div className="min-w-[600px]">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-2 mb-2 pb-2 border-b bg-muted/50 p-2 rounded">
                          <span className="text-xs col-span-1">#</span>
                          <span className="text-xs col-span-3">Member Name</span>
                          <span className="text-xs col-span-3">Department</span>
                          <span className="text-xs col-span-3">Section</span>
                          <span className="text-xs col-span-2">NRP</span>
                        </div>

                        {/* Table Rows */}
                        <div className="space-y-2">
                          {formData.members.map((member, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-center">
                              <span className="text-xs col-span-1">{index + 1}</span>
                              <Input
                                placeholder="Name"
                                value={member.name}
                                onChange={(e) => updateMember(index, 'name', e.target.value)}
                                className="text-sm col-span-3"
                              />
                              <Input
                                placeholder="Department"
                                value={member.department}
                                onChange={(e) => updateMember(index, 'department', e.target.value)}
                                className="text-sm col-span-3"
                              />
                              <Input
                                placeholder="Section"
                                value={member.section}
                                onChange={(e) => updateMember(index, 'section', e.target.value)}
                                className="text-sm col-span-3"
                              />
                              <Input
                                placeholder="NRP"
                                value={member.nrp}
                                onChange={(e) => updateMember(index, 'nrp', e.target.value)}
                                className="text-sm col-span-2"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 p-2 bg-card rounded border">
                      <p className="text-xs text-muted-foreground">Total Members:
                        <span className={`ml-2 ${formData.members.filter(m => m.name.trim()).length >= 3 ? 'text-green-600' : 'text-red-600'}`}>
                          {formData.members.filter(m => m.name.trim()).length}
                          {formData.members.filter(m => m.name.trim()).length >= 3 ? ' ✓' : ' (Minimum 3 required)'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SASARAN QCP */}
            <div className="border rounded-lg p-3 sm:p-4 bg-card">
              <h4 className="text-xs sm:text-sm mb-3 uppercase">SASARAN QCP</h4>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="temaQCCP" className="text-xs sm:text-sm">1. Tema QCP *</Label>
                  <Textarea
                    id="temaQCCP"
                    value={formData.temaQCCP}
                    onChange={(e) => setFormData({ ...formData, temaQCCP: e.target.value })}
                    placeholder="Jelaskan tema QCP..."
                    rows={3}
                    required
                    className="text-sm resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kpiDidukung" className="text-xs sm:text-sm">2. KPI yang didukung *</Label>
                  <Textarea
                    id="kpiDidukung"
                    value={formData.kpiDidukung}
                    onChange={(e) => setFormData({ ...formData, kpiDidukung: e.target.value })}
                    placeholder="Jelaskan KPI yang didukung..."
                    rows={4}
                    required
                    className="text-sm resize-none"
                  />
                </div>
              </div>
            </div>

            {/* PERNYATAAN MASALAH / PELUANG PERBAIKAN */}
            <div className="border rounded-lg p-3 sm:p-4 bg-card">
              <h4 className="text-xs sm:text-sm mb-3 uppercase">PERNYATAAN MASALAH / PELUANG PERBAIKAN</h4>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="masalahPeluang1" className="text-xs sm:text-sm">
                    1. Siapa, atau kelompok mana, serta perangkat/mesin untuk melakukan review terhadap masalah yang bisa memunculkan keinginan atau alasan mengapa review dilaksanakan?
                  </Label>
                  <Textarea
                    id="masalahPeluang1"
                    value={formData.masalahPeluang1}
                    onChange={(e) => setFormData({ ...formData, masalahPeluang1: e.target.value })}
                    placeholder="Jawaban..."
                    rows={2}
                    required
                    className="text-sm resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="masalahPeluang2" className="text-xs sm:text-sm">
                    2. Kapan masalah terjadi?
                  </Label>
                  <Textarea
                    id="masalahPeluang2"
                    value={formData.masalahPeluang2}
                    onChange={(e) => setFormData({ ...formData, masalahPeluang2: e.target.value })}
                    placeholder="Jawaban..."
                    rows={2}
                    required
                    className="text-sm resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="masalahPeluang3" className="text-xs sm:text-sm">
                    3. Dimana masalah terjadi?
                  </Label>
                  <Textarea
                    id="masalahPeluang3"
                    value={formData.masalahPeluang3}
                    onChange={(e) => setFormData({ ...formData, masalahPeluang3: e.target.value })}
                    placeholder="Jawaban..."
                    rows={2}
                    required
                    className="text-sm resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="masalahPeluang4" className="text-xs sm:text-sm">
                    4. Apa dampak dari masalah tersebut bagi pelanggan dan perusahaan?
                  </Label>
                  <Textarea
                    id="masalahPeluang4"
                    value={formData.masalahPeluang4}
                    onChange={(e) => setFormData({ ...formData, masalahPeluang4: e.target.value })}
                    placeholder="Jawaban..."
                    rows={2}
                    required
                    className="text-sm resize-none"
                  />
                </div>
              </div>
            </div>

            {/* PERNYATAAN TARGET */}
            <div className="border rounded-lg p-3 sm:p-4 bg-card">
              <h4 className="text-xs sm:text-sm mb-3 uppercase">PERNYATAAN TARGET</h4>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apaTargetnya" className="text-xs sm:text-sm">1. Apa targetnya? *</Label>
                  <Textarea
                    id="apaTargetnya"
                    value={formData.apaTargetnya}
                    onChange={(e) => setFormData({ ...formData, apaTargetnya: e.target.value })}
                    placeholder="Jelaskan target yang ingin dicapai..."
                    rows={2}
                    required
                    className="text-sm resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="berapaTargetnya" className="text-xs sm:text-sm">2. Berapa targetnya? *</Label>
                  <Textarea
                    id="berapaTargetnya"
                    value={formData.berapaTargetnya}
                    onChange={(e) => setFormData({ ...formData, berapaTargetnya: e.target.value })}
                    placeholder="Berapa target yang ingin dicapai..."
                    rows={2}
                    required
                    className="text-sm resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kapanDicapai" className="text-xs sm:text-sm">3. Kapan akan dicapai? *</Label>
                  <Input
                    id="kapanDicapai"
                    type="date"
                    value={formData.kapanDicapai}
                    onChange={(e) => setFormData({ ...formData, kapanDicapai: e.target.value })}
                    required
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* KONDISI SEBELUM QCP */}
            <div className="border rounded-lg p-3 sm:p-4 bg-card">
              <h4 className="text-xs sm:text-sm mb-3 uppercase">KONDISI SEBELUM QCP</h4>
              <Textarea
                id="kondisiSebelum"
                value={formData.kondisiSebelum}
                onChange={(e) => setFormData({ ...formData, kondisiSebelum: e.target.value })}
                placeholder="Jelaskan kondisi sebelum QCP dilaksanakan..."
                rows={5}
                required
                className="text-sm resize-none"
              />
            </div>

            {/* Supporting Document Upload */}
            <div className="border rounded-lg p-3 sm:p-4" style={{ backgroundColor: 'rgba(238, 100, 46, 0.05)', borderColor: '#EE642E' }}>
              <Label htmlFor="supportingDocument" className="text-xs sm:text-sm mb-2 block">
                Lampiran Dokumen Pendukung (KPI/Saving Cost/Data Permasalahan/Analisa Data Permasalahan) *
              </Label>
              <p className="text-xs text-muted-foreground mb-3">
                Upload bukti dokumentasi (PDF), maksimal 5 MB
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    id="supportingDocument"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    required
                    className="text-sm"
                  />
                </div>
                {formData.supportingDocument && (
                  <div className="flex items-center gap-2 p-2 bg-white rounded border border-green-200">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600">
                      {formData.supportingDocument.name} ({(formData.supportingDocument.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {validationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button type="submit" style={{ background: 'linear-gradient(135deg, #ED8330 0%, #EE642E 100%)' }}>
                Submit QCP Project
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ModuleLayout>
  );
}
