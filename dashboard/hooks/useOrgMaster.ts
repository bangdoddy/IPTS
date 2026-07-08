import { useState, useEffect } from "react";

export function useOrgMasterOnce(params: { enabled: boolean }) {
  const [divRows] = useState<any[]>([
    { divisionCode: "HC", divisionName: "Human Capital" },
    { divisionCode: "MFG", divisionName: "Manufacturing" },
    { divisionCode: "COMM", divisionName: "Commercial" },
    { divisionCode: "OPS", divisionName: "Operations" },
    { divisionCode: "FA", divisionName: "Finance & Accounting" }
  ]);
  const [deptRows] = useState<any[]>([
    { divisionCode: "HC", divisionName: "Human Capital", departmentCode: "IT", departmentName: "IT" },
    { divisionCode: "HC", divisionName: "Human Capital", departmentCode: "HR", departmentName: "HR" },
    { divisionCode: "MFG", divisionName: "Manufacturing", departmentCode: "Production", departmentName: "Production" },
    { divisionCode: "MFG", divisionName: "Manufacturing", departmentCode: "Quality", departmentName: "Quality" }
  ]);
  const [secRows] = useState<any[]>([]);
  const [siteRows] = useState<any[]>([
    { siteCode: "ADMO", siteName: "ADMO" },
    { siteCode: "JAHO", siteName: "JAHO" },
    { siteCode: "MACO", siteName: "MACO" }
  ]);
  const [loading] = useState(false);

  return { siteRows, divRows, deptRows, secRows, loading, ready: true };
}
