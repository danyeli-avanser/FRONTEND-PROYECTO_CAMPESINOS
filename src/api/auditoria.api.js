import { axiosClient } from "./axiosClient";

export async function getTimeline(caseId) {
  const { data } = await axiosClient.get(`/api/cases/${caseId}/timeline/`);
  return data; // array de eventos
}
