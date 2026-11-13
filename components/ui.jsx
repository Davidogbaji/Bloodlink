import { CheckCircleIcon, AlertIcon, XCircleIcon, ClockIcon } from "./Icons";

// Page intro band used by every inner page, so titles sit at the same
// height, size and weight everywhere.
export function PageHeader({ eyebrow, title, children, aside }) {
  return (
    <section className="border-b border-line bg-mist">
      <div className="page flex flex-col gap-6 py-12 md:flex-row md:items-end md:justify-between md:py-16">
        <div className="max-w-2xl">
          {eyebrow && <p className="eyebrow text-blood">{eyebrow}</p>}
          <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">{title}</h1>
          {children && <div className="mt-4 text-base leading-relaxed text-muted md:text-lg">{children}</div>}
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
    </section>
  );
}

// Stock status: always glyph + word + tint, never colour alone.
const STOCK = {
  in: { label: "In Stock", Icon: CheckCircleIcon, cls: "bg-safe-bg text-safe-text" },
  low: { label: "Low", Icon: AlertIcon, cls: "bg-warn-bg text-warn-text" },
  out: { label: "Out of Stock", Icon: XCircleIcon, cls: "bg-blood-bg text-blood" },
};

export function stockLevel(units) {
  if (units <= 0) return "out";
  if (units <= 2) return "low";
  return "in";
}

export function StockBadge({ units }) {
  const s = STOCK[stockLevel(units)];
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>
      <s.Icon className="h-3.5 w-3.5" />
      {s.label}
    </span>
  );
}

const EXPIRY = {
  safe: { label: "Safe", Icon: CheckCircleIcon, cls: "bg-safe-bg text-safe-text" },
  warning: { label: "Use Soon", Icon: ClockIcon, cls: "bg-warn-bg text-warn-text" },
  critical: { label: "Critical", Icon: AlertIcon, cls: "bg-blood-bg text-blood" },
  expired: { label: "Expired", Icon: XCircleIcon, cls: "bg-blood-bg text-burgundy" },
};

export function ExpiryBadge({ level }) {
  const s = EXPIRY[level] || EXPIRY.safe;
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>
      <s.Icon className="h-3.5 w-3.5" />
      {s.label}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="panel flex flex-col items-center px-6 py-12 text-center">
      {Icon && (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-blood">
          <Icon className="h-6 w-6" />
        </span>
      )}
      <p className="mt-4 font-display text-xl font-semibold text-ink">{title}</p>
      {children && <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SectionTitle({ eyebrow, title, children, tone = "light" }) {
  const dark = tone === "dark";
  return (
    <div className="max-w-2xl">
      {eyebrow && <p className={`eyebrow ${dark ? "text-amber" : "text-blood"}`}>{eyebrow}</p>}
      <h2 className={`mt-3 text-3xl font-semibold leading-tight md:text-4xl ${dark ? "text-white" : "text-ink"}`}>{title}</h2>
      {children && <p className={`mt-3 text-base leading-relaxed ${dark ? "text-rose" : "text-muted"}`}>{children}</p>}
    </div>
  );
}
