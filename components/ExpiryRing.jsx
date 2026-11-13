import { expiryStatus } from "../lib/utils";

const COLOR_MAP = {
  safe: "#2E7D5B",
  warning: "#E0A030",
  critical: "#C8102E",
  expired: "#5A0F1E",
};

export const EXPIRY_LABEL = {
  safe: "Safe",
  warning: "Use Soon",
  critical: "Critical",
  expired: "Expired",
};

// Radial shelf-life ring: sweep = days left / 42 (maximum shelf life).
// The number of days is printed inside and the level is exposed as an
// accessible label, so the ring never relies on colour alone.
export default function ExpiryRing({ expiryDate, size = 64, label }) {
  const { daysLeft, level } = expiryStatus(expiryDate);
  const fraction = Math.max(0, Math.min(1, daysLeft / 42));
  const stroke = size >= 40 ? 4 : 3;
  const radius = size / 2 - stroke - 1;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - fraction);
  const color = COLOR_MAP[level];
  const days = level === "expired" ? 0 : daysLeft;

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${EXPIRY_LABEL[level]}: ${days} day${days === 1 ? "" : "s"} of shelf life left`}
      title={`${EXPIRY_LABEL[level]} · ${days} day${days === 1 ? "" : "s"} left`}
    >
      <svg width={size} height={size} className="expiry-ring" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E7DFE0" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center leading-none">
        <span className={`font-semibold tabular-nums text-ink ${size >= 40 ? "text-xs" : "text-[10px]"}`}>{days}</span>
        {label && <span className="mt-0.5 text-[9px] text-muted">{label}</span>}
      </div>
    </div>
  );
}
