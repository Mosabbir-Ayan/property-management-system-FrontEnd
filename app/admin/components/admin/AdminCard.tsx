type AdminCardProps = { title: string; value: string | number; hint?: string;
  tone?: "primary" | "success" | "warning" | "error" | "neutral";};

const TONE_TEXT: Record<string, string> = {
  primary: "text-dwellix-500",
  success: "text-green-600",
  warning: "text-amber-500",
  error: "text-red-600",
  neutral: "text-gray-900",
};

export default function AdminCard({ title, value, hint, tone = "neutral",}: AdminCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-3xl font-bold ${TONE_TEXT[tone]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}