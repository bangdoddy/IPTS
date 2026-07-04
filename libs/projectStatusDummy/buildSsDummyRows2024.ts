/** Baris SS dummy tahun 2024 — pola mirip 2025, untuk list/monitoring */

type SsDummySeed2024 = {
  site: string;
  status: "Complete" | "Review by leader" | "Review by bpi";
  month: number;
  day: number;
  judul: string;
  pembuat: string;
  section: string;
  department: string;
  division: string;
  nri: string;
};

const SEEDS_2024: SsDummySeed2024[] = [
  { site: "ADMO", status: "Complete", month: 3, day: 10, judul: "Pengurangan Waste Material Scrap Baja", pembuat: "BUDI SANTOSO", section: "MNT", department: "MNT", division: "TSUD", nri: "0112100" },
  { site: "ADMO", status: "Complete", month: 6, day: 14, judul: "Standardisasi Tagging Peralatan Workshop", pembuat: "ANI WIDYASTUTI", section: "PLT", department: "PLT", division: "POPD", nri: "80002001" },
  { site: "SERA", status: "Complete", month: 5, day: 22, judul: "Improvement Hose Reeling Unit Maintenance", pembuat: "DEDI KURNIAWAN", section: "OPR", department: "OPR SERA", division: "POPD", nri: "0810200" },
  { site: "MACO", status: "Complete", month: 8, day: 7, judul: "Optimasi Blasting Pattern Fragmentasi", pembuat: "SARI DEWI", section: "HUL", department: "HUL", division: "OPS", nri: "0210300" },
  { site: "JAHO-NARO", status: "Complete", month: 10, day: 18, judul: "Visual Control Inventory Consumable", pembuat: "HENDRA GUNAWAN", section: "WRK", department: "WRK", division: "MFG", nri: "0110400" },
  { site: "ADMO", status: "Review by leader", month: 4, day: 20, judul: "SOP Emergency Response Fuel Spill", pembuat: "RIKO PRASETYA", section: "PPD", department: "HRE", division: "HRDD", nri: "0112200" },
  { site: "SERA", status: "Review by leader", month: 7, day: 11, judul: "Checklist Pre-Start Dump Truck Shift", pembuat: "GILANG RAMADHAN", section: "TYR", department: "MNT SERA", division: "TSUD", nri: "0810300" },
  { site: "MACO", status: "Review by leader", month: 9, day: 25, judul: "Monitoring Wear Life GET Bucket", pembuat: "PUTRI LESTARI", section: "CTL", department: "CTL", division: "OPS", nri: "0210400" },
  { site: "SERA", status: "Review by bpi", month: 2, day: 8, judul: "Analisis Delay Watering Road Network", pembuat: "TONO WIJAYA", section: "BLT", department: "MNE SERA", division: "MNE", nri: "0810500" },
  { site: "MACO", status: "Review by bpi", month: 11, day: 3, judul: "Benchmark Payload Truck vs Plan", pembuat: "NINA ANGGRAINI", section: "LDR", department: "LDR", division: "OPS", nri: "0210500" },
  { site: "ADMO", status: "Review by bpi", month: 12, day: 15, judul: "Tracking Biaya Overhaul Komponen Utama", pembuat: "YOGI MAULANA", section: "CST", department: "FIN", division: "FAED", nri: "80003001" },
];

function pad4(n: number) {
  return String(n).padStart(4, "0");
}

function siteSlug(site: string) {
  if (site === "JAHO-NARO") return "NARO";
  return site;
}

export function buildExtraSsDummyRows2024(startId: number): Record<string, unknown>[] {
  return SEEDS_2024.map((seed, index) => {
    const id = startId + index + 1;
    const seq = pad4(id);
    const site = seed.site;
    const ideano = `${siteSlug(site)}/01/24/SS/${seq}`;
    const createdAt = new Date(Date.UTC(2024, seed.month - 1, seed.day, 8, 0, 0)).toISOString();
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
