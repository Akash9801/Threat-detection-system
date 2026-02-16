export const getRiskLevel = (score) => {
  if (score >= 0.7) return { label: "Critical", color: "#ef4444" };
  if (score >= 0.4) return { label: "High", color: "#f97316" };
  if (score >= 0.2) return { label: "Medium", color: "#eab308" };
  return { label: "Low", color: "#22c55e" };
};
