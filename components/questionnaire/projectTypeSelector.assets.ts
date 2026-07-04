// src/components/questionnaire/projectTypeSelector.assets.ts

// Logo + background
import logoInovaSIS from "figma:asset/61a2558e1c35ada4e51acfac6fd341f0b4d33ce0.png";
import bgPattern from "figma:asset/5196d977f06817f07707778e03629c906a4b28fe.png";

// Flowcharts (pakai yang kamu sudah punya)
import ssFlowchart from "figma:asset/9ac0cb77a5f1f566898183ff5c0a72aee59581ca.png";
import qccFlowchart from "figma:asset/21c80549c69bd0555b9e648c1edfe6e3a80e0de7.png";
import qcpFlowchart from "figma:asset/4ce1dedd466016611d17cea28dbc3fc09a1a8e22.png";
// tebp kamu pakai yang sama di kode lama (kalau ada yang beda, ganti id-nya)
import tebpFlowchart from "figma:asset/4ce1dedd466016611d17cea28dbc3fc09a1a8e22.png";
// CRP belum ada gambar flowchart di snippet kamu — nanti bisa isi
// import crpFlowchart from "figma:asset/xxxx.png";

export const ASSETS = {
  logoInovaSIS,
  bgPattern,
  flowcharts: {
    ss: ssFlowchart,
    qcc: qccFlowchart,
    qcp: qcpFlowchart,
    tebp: tebpFlowchart,
    // crp: crpFlowchart,
  },
} as const;
