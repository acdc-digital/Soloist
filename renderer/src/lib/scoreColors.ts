export function getColorClass(score: number | null | undefined) {
  // Always color by score, even for future days
  if (score == null) return "bg-zinc-800/60";
  if (score >= 90) return "bg-indigo-500";
  if (score >= 80) return "bg-blue-500";
  if (score >= 70) return "bg-sky-500";
  if (score >= 60) return "bg-teal-500";
  if (score >= 50) return "bg-green-500";
  if (score >= 40) return "bg-lime-500";
  if (score >= 30) return "bg-yellow-500";
  if (score >= 20) return "bg-amber-600";
  if (score >= 10) return "bg-orange-600";
  return "bg-rose-700";
} 