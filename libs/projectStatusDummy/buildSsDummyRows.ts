/** Baris SS dummy tambahan — rentang 2025–2026, Complete > Review Leader / Review BPI */

type SsDummySeed = {
  site: string;
  status: "Complete" | "Review by leader" | "Review by bpi";
  year: 25 | 26;
  month: number;
  day: number;
  judul: string;
  pembuat: string;
  section: string;
  department: string;
  division: string;
  nri: string;
};

const SEEDS: SsDummySeed[] = [
  // Complete (9) — sedikit lebih banyak dari leader / bpi
  { site: "ADMO", status: "Complete", year: 25, month: 2, day: 12, judul: "Standardisasi Checklist Pre-Start Unit HD785", pembuat: "AGUS SETIAWAN", section: "MNT", department: "MNT", division: "TSUD", nri: "0112341" },
  { site: "ADMO", status: "Complete", year: 25, month: 5, day: 8, judul: "Pengurangan Downtime Conveyor dengan Auto Lubrication", pembuat: "RINA WULANDARI", section: "PLT", department: "PLT", division: "POPD", nri: "80004521" },
  { site: "SERA", status: "Complete", year: 25, month: 7, day: 19, judul: "Visual Management Board Shift Operation", pembuat: "DIDIK PRASETYO", section: "OPR", department: "OPR SERA", division: "POPD", nri: "0810123" },
  { site: "MACO", status: "Complete", year: 25, month: 9, day: 3, judul: "Optimasi Ritase Hauling dengan GPS Geofence", pembuat: "YULI HANDAYANI", section: "HUL", department: "HUL", division: "OPS", nri: "0210456" },
  { site: "JAHO-NARO", status: "Complete", year: 25, month: 11, day: 21, judul: "5S Area Tool Crib Workshop", pembuat: "BAMBANG SUTRISNO", section: "WRK", department: "WRK", division: "MFG", nri: "0115678" },
  { site: "ADMO", status: "Complete", year: 26, month: 2, day: 6, judul: "Digital Logbook Daily Equipment Inspection", pembuat: "SITI AMINAH", section: "EQP", department: "ENG", division: "TSUD", nri: "80007890" },
  { site: "SERA", status: "Complete", year: 26, month: 3, day: 14, judul: "Reduksi Konsumsi Fuel Idle Time Fleet", pembuat: "HERMAN SUSILO", section: "FLD", department: "OPR SERA", division: "POPD", nri: "0810789" },
  { site: "MACO", status: "Complete", year: 26, month: 4, day: 2, judul: "Kanban Sparepart Critical Pump", pembuat: "DEWI LESTARI", section: "STO", department: "LOG", division: "SCM", nri: "0210890" },
  { site: "JAHO-NARO", status: "Complete", year: 26, month: 5, day: 9, judul: "Safety Briefing Card Bahasa Lokal", pembuat: "JOKO SANTOSO", section: "HSE", department: "HSE", division: "HSE", nri: "0119012" },
  // Review by leader (5)
  { site: "ADMO", status: "Review by leader", year: 25, month: 3, day: 18, judul: "Template Laporan Harian OEE Line", pembuat: "ANDI PRATAMA", section: "PPD", department: "HRE", division: "HRDD", nri: "0113456" },
  { site: "SERA", status: "Review by leader", year: 25, month: 6, day: 25, judul: "SOP Penggantian Tire Off-The-Road", pembuat: "FAJAR NUGROHO", section: "TYR", department: "MNT SERA", division: "TSUD", nri: "0810345" },
  { site: "MACO", status: "Review by leader", year: 25, month: 10, day: 11, judul: "Alarm Early Warning Hydraulic Pressure", pembuat: "PUTRI MAHARANI", section: "CTL", department: "CTL", division: "OPS", nri: "0210567" },
  { site: "JAHO-NARO", status: "Review by leader", year: 26, month: 1, day: 28, judul: "Mapping Loss Time Code Produksi", pembuat: "RUDI HARTONO", section: "PRD", department: "PRD", division: "MFG", nri: "0116789" },
  { site: "ADMO", status: "Review by leader", year: 26, month: 4, day: 16, judul: "Integrasi CMMS dengan Work Order", pembuat: "LIA KUSUMA", section: "ITM", department: "IT", division: "DIG", nri: "80009123" },
  // Review by bpi (5)
  { site: "SERA", status: "Review by bpi", year: 25, month: 4, day: 7, judul: "Analisis Root Cause Delay Blasting", pembuat: "TONI WIJAYA", section: "BLT", department: "MNE SERA", division: "MNE", nri: "0810567" },
  { site: "MACO", status: "Review by bpi", year: 25, month: 8, day: 30, judul: "Benchmarking Cycle Time Loading", pembuat: "NINA PERMATASARI", section: "LDR", department: "LDR", division: "OPS", nri: "0210678" },
  { site: "ADMO", status: "Review by bpi", year: 25, month: 12, day: 5, judul: "Standard Cost Tracking Komponen Overhaul", pembuat: "YOGI SAPUTRA", section: "CST", department: "FIN", division: "FAED", nri: "80010234" },
  { site: "JAHO-NARO", status: "Review by bpi", year: 26, month: 3, day: 22, judul: "Validasi MTBF Sensor Vibration", pembuat: "ARIEF BUDIMAN", section: "REL", department: "REL", division: "ENG", nri: "0117890" },
  { site: "SERA", status: "Review by bpi", year: 26, month: 5, day: 2, judul: "Dashboard Realtime Water Truck Utilization", pembuat: "MELATI SARI", section: "WTR", department: "OPR SERA", division: "POPD", nri: "0810901" },
];

function pad4(n: number) {
  return String(n).padStart(4, "0");
}

function toIso(year: 25 | 26, month: number, day: number) {
  const y = year === 25 ? 2025 : 2026;
  const d = new Date(Date.UTC(y, month - 1, day, 8, 0, 0));
  return d.toISOString();
}

function siteSlug(site: string) {
  if (site === "JAHO-NARO") return "NARO";
  return site;
}

export function buildExtraSsDummyRows(startId: number): Record<string, unknown>[] {
  return SEEDS.map((seed, index) => {
    const id = startId + index + 1;
    const seq = pad4(id);
    const site = seed.site;
    const ideano = `${siteSlug(site)}/01/${seed.year}/SS/${seq}`;
    const createdAt = toIso(seed.year, seed.month, seed.day);
    return {
      id,
      type: "SS",
      ideano,
      itemKey: ideano,
      judul: seed.judul,
      pembuat: seed.pembuat,
      status: seed.status,
      createdAt,
      submittedDate: createdAt,
      site,
      jobsite: site,
      nri: seed.nri,
      section: seed.section,
      department: seed.department,
      division: seed.division,
    };
  });
}
