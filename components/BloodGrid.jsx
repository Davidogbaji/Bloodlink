import ExpiryRing from "./ExpiryRing";
import { StockBadge, stockLevel } from "./ui";
import { expiryStatus } from "../lib/utils";

const NOTE = { "O-": "Universal donor", "AB+": "Universal recipient" };

const TONE = {
  in: { bar: "bg-safe", card: "border-line bg-white hover:border-safe/40", glow: "from-safe/10" },
  low: { bar: "bg-amber", card: "border-amber/50 bg-white hover:border-amber", glow: "from-amber/15" },
  out: { bar: "bg-blood", card: "border-blood/30 bg-blood-bg/50 hover:border-blood/60", glow: "from-blood/15" },
};

const pretty = (g) => g.replace("-", "−");

function soonest(batches) {
  const live = batches.map((b) => expiryStatus(b.batch_expiry_date)).filter((s) => s.daysLeft >= 0);
  if (!live.length) return null;
  return live.reduce((a, b) => (b.daysLeft < a.daysLeft ? b : a));
}

function expiryText(s) {
  if (!s) return "No batches in date";
  if (s.daysLeft === 0) return "Next batch expires today";
  return `Next batch expires in ${s.daysLeft} ${s.daysLeft === 1 ? "day" : "days"}`;
}

/** One card per blood group: units, a stock bar, status, and batch shelf life. */
export function BloodGrid({ types, byType }) {
  const peak = Math.max(10, ...types.map((t) => byType[t].units));

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {[
            ["bg-safe", "In stock (3+ units)"],
            ["bg-amber", "Low (1–2 units)"],
            ["bg-blood", "Out of stock"],
          ].map(([c, l]) => (
            <span key={l} className="inline-flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${c}`} aria-hidden />
              {l}
            </span>
          ))}
        </div>
        <span className="inline-flex items-center gap-1.5 font-semibold text-safe-text">
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-safe opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-safe" />
          </span>
          Updating live
        </span>
      </div>

      <ul className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4">
        {types.map((type) => {
          const entry = byType[type];
          const level = stockLevel(entry.units);
          const tone = TONE[level];
          const next = soonest(entry.batches);
          const pct = entry.units === 0 ? 0 : Math.max(6, Math.round((entry.units / peak) * 100));

          return (
            <li
              key={type}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-18px_rgba(42,7,16,0.35)] ${tone.card}`}
            >
              <div aria-hidden className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${tone.glow} to-transparent`} />

              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-4xl font-semibold leading-none tracking-tight text-ink">
                    <span className="sr-only">Blood group </span>
                    {pretty(type)}
                  </h3>
                  <p className="mt-2 h-4 text-xs font-medium text-muted">{NOTE[type] || ""}</p>
                </div>
                <StockBadge units={entry.units} />
              </div>

              <p className="relative mt-5 flex items-baseline gap-1.5">
                <span className={`font-display text-5xl font-semibold tabular-nums ${level === "out" ? "text-blood" : "text-ink"}`}>
                  {entry.units}
                </span>
                <span className="text-sm text-muted">{entry.units === 1 ? "unit" : "units"}</span>
              </p>

              <div
                className="relative mt-3 h-2 w-full overflow-hidden rounded-full bg-line/70"
                role="meter"
                aria-label={`${pretty(type)} stock level`}
                aria-valuemin={0}
                aria-valuemax={peak}
                aria-valuenow={entry.units}
              >
                <div className={`h-full rounded-full ${tone.bar} transition-[width] duration-700 ease-out`} style={{ width: `${pct}%` }} />
              </div>

              <div className="relative mt-5 border-t border-line/80 pt-4">
                {entry.batches.length > 0 ? (
                  <>
                    <p className="text-xs font-medium text-ink">
                      {entry.batches.length} {entry.batches.length === 1 ? "batch" : "batches"}
                      <span className="text-muted"> · {expiryText(next)}</span>
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {[...entry.batches]
                        .sort((a, b) => (a.batch_expiry_date > b.batch_expiry_date ? 1 : -1))
                        .slice(0, 5)
                        .map((b) => (
                          <ExpiryRing key={b.id} expiryDate={b.batch_expiry_date} size={30} />
                        ))}
                      {entry.batches.length > 5 && <span className="text-xs text-muted">+{entry.batches.length - 5}</span>}
                    </div>
                  </>
                ) : (
                  <p className="text-xs font-medium text-blood">No units on the shelf. Call donors for {pretty(type)}.</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Placeholder with the same footprint, so the page does not jump on load. */
export function BloodGridSkeleton({ count = 8 }) {
  return (
    <ul className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="card p-5">
          <div className="flex justify-between">
            <div className="skeleton h-9 w-14" />
            <div className="skeleton h-6 w-20 rounded-full" />
          </div>
          <div className="skeleton mt-6 h-11 w-20" />
          <div className="skeleton mt-4 h-2 w-full rounded-full" />
          <div className="skeleton mt-6 h-4 w-3/4" />
          <div className="mt-3 flex gap-1.5">
            {[0, 1, 2].map((j) => (
              <div key={j} className="skeleton h-[30px] w-[30px] rounded-full" />
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
