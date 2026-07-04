export { USE_DUMMY_PROJECT_STATUS, DUMMY_LOAD_DELAY_MS } from "./config";
export { getCurrentYearIsoRange, getYearIsoRange } from "./dateRange";
export {
  simulateDummyDelay,
  fetchDummySsList,
  findDummySsByIdeano,
  fetchDummySsDetail,
  fetchDummyQccList,
  fetchDummyQcpList,
  fetchDummyQccStepHistory,
  fetchDummyQcpStepHistory,
  mapSsDemoToSuggestionRow,
  getSsDummySourceRows,
  computeSsDummyStatusTotals,
  computeSsDummyMonitoringTotals,
  ssStatusEquals,
  ssStatusKey,
  getSsDummyRowsAll,
} from "./dummyData";
export {
  buildSsTotalFromDummy,
  buildSsCollectedChartFromDummy,
  buildSsMonthlyAllSitesFromDummy,
  buildSsSiteDashboardFromDummy,
  resolveSsDashboardMock,
  normalizeSsSite,
  resolveMonthNum,
} from "./buildSsDashboardCharts";
export type { SsDashboardChartBody, SsMonthlyRow } from "./buildSsDashboardCharts";
export {
  getStaticSsTotal,
  getStaticSsMonthlyAllSites,
  getStaticSsChart,
  getStaticSiteDashboard,
} from "./ssDashboardStatic";
export type { DummySsListResult } from "./dummyData";
export type { DummyQccQcpProject, DummyStepRow, DummySuggestionRow } from "./types";
