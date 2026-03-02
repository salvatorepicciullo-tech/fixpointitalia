export function getFlowData() {
  if (typeof window === "undefined") return null;
  const data = sessionStorage.getItem("preventivo_flow");
  return data ? JSON.parse(data) : null;
}

export function saveFlowData(data: any) {
  sessionStorage.setItem("preventivo_flow", JSON.stringify(data));
}

export function clearFlowData() {
  sessionStorage.removeItem("preventivo_flow");
}