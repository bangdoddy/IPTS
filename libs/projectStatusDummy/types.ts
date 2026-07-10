export type DummySuggestionRow = {
  ideano?: string;
  itemKey?: string;
  judul?: string;
  masalah?: string;
  uraianMasalah?: string;
  ideDiajukan?: string;
  status?: string;
  createdAt?: string;
  atasan1?: string;
  createdBy?: string;
  site?: string;
  jobsite?: string;
  division?: string;
  department?: string;
  section?: string;
  totalRows?: number;
  totalPages?: number;
  [k: string]: unknown;
};

export type DummySuggestionRetrieveData = DummySuggestionRow & {
  hubunganPenemuan?: string;
  uraianProcess?: string;
  pembuat?: string;
  nrpAtasan1?: string;
  documentCount?: number;
  hasDocument?: boolean;
  suggestionDocumentResponseDtos?: unknown[];
};

export type DummyQccQcpProject = {
  id?: number;
  itemKey?: string;
  namaGroupQccp?: string;
  department?: string;
  section?: string;
  createdAt?: string;
  createdBy?: string;
  leaderNrp?: string;
  leader?: string;
  status?: string;
  step?: string;
  stepStatus?: string;
  namaTim?: string;
  SupportingDocument?: string;
  [k: string]: unknown;
};

export type DummyStepRow = {
  step: string;
  status: string;
  tanggal: string;
  file?: string;
  reason?: string;
};
