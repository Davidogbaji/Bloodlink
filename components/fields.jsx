"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────────────────
 * Form controls with one look across the site.
 *
 *   <Select>            listbox with keyboard support and optional search
 *   <BloodGroupPicker>  the eight blood groups as a radio grid
 *   <DatePicker>        calendar popover with quick picks, value YYYY-MM-DD
 *
 * Each takes `id`, so an existing <label htmlFor={id}> still names it.
 * ───────────────────────────────────────────────────────────────────────── */

const Chevron = ({ className = "h-4 w-4", dir = "down" }) => {
  const d = { down: "m6 9 6 6 6-6", left: "m15 18-6-6 6-6", right: "m9 18 6-6-6-6" }[dir];
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={d} />
    </svg>
  );
};
const Check = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);
const Search = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
const Calendar = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </svg>
);

/** Closes a popover on an outside press or Escape. */
function useDismiss(open, setOpen, refs) {
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (refs.every((r) => !r.current || !r.current.contains(e.target))) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, setOpen, refs]);
}

const triggerCls =
  "group flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-3.5 py-2.5 text-left text-sm text-ink transition " +
  "hover:border-muted focus:outline-none focus-visible:border-blood focus-visible:ring-2 focus-visible:ring-blood/20 " +
  "disabled:cursor-not-allowed disabled:bg-mist disabled:text-muted";

const popoverCls =
  "absolute left-0 right-0 z-40 mt-2 origin-top overflow-hidden rounded-2xl border border-line bg-white shadow-[0_18px_40px_-12px_rgba(42,7,16,0.28)]";

/* ── Select ─────────────────────────────────────────────────────────────── */

const norm = (o) => (typeof o === "string" ? { value: o, label: o } : o);

export function Select({ id, value, onChange, options, placeholder = "Choose…", disabled, searchable, invalid, describedBy }) {
  const opts = useMemo(() => options.map(norm), [options]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const searchRef = useRef(null);
  const btnRef = useRef(null);
  const listId = useId();
  const showSearch = searchable ?? opts.length > 10;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? opts.filter((o) => o.label.toLowerCase().includes(q)) : opts;
  }, [opts, query]);

  const selected = opts.find((o) => o.value === value);
  useDismiss(open, setOpen, [rootRef]);

  const openList = useCallback(() => {
    if (disabled) return;
    setQuery("");
    setActive(Math.max(0, opts.findIndex((o) => o.value === value)));
    setOpen(true);
  }, [disabled, opts, value]);

  useEffect(() => {
    if (!open) return;
    (showSearch ? searchRef.current : listRef.current)?.focus();
  }, [open, showSearch]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function choose(o) {
    onChange(o.value);
    setOpen(false);
    btnRef.current?.focus();
  }

  function onListKey(e) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(filtered.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === "Home") { e.preventDefault(); setActive(0); }
    else if (e.key === "End") { e.preventDefault(); setActive(filtered.length - 1); }
    else if (e.key === "Enter") { e.preventDefault(); if (filtered[active]) choose(filtered[active]); }
    else if (e.key === "Escape" || e.key === "Tab") { setOpen(false); if (e.key === "Escape") btnRef.current?.focus(); }
    else if (!showSearch && e.key.length === 1) {
      const i = filtered.findIndex((o) => o.label.toLowerCase().startsWith(e.key.toLowerCase()));
      if (i >= 0) setActive(i);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={btnRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={(e) => {
          if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); openList(); }
        }}
        className={`${triggerCls} ${open ? "border-blood ring-2 ring-blood/20" : invalid ? "border-blood" : "border-line"}`}
      >
        <span className={`min-w-0 truncate ${selected ? "font-medium" : "text-muted"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <Chevron className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180 text-blood" : ""}`} />
      </button>

      {open && (
        <div className={popoverCls}>
          {showSearch && (
            <div className="flex items-center gap-2 border-b border-line px-3.5 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-muted" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActive(0); }}
                onKeyDown={onListKey}
                placeholder="Search…"
                aria-label="Search options"
                aria-controls={listId}
                aria-activedescendant={filtered[active] ? `${listId}-${active}` : undefined}
                className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
              />
            </div>
          )}
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-labelledby={id}
            aria-activedescendant={filtered[active] ? `${listId}-${active}` : undefined}
            onKeyDown={onListKey}
            className="max-h-64 overflow-y-auto p-1.5 focus:outline-none"
          >
            {filtered.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">No matches</li>}
            {filtered.map((o, i) => {
              const isSel = o.value === value;
              return (
                <li
                  key={o.value}
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={isSel}
                  onPointerEnter={() => setActive(i)}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => choose(o)}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    i === active ? "bg-mist" : ""
                  } ${isSel ? "font-semibold text-blood" : "text-ink"}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate">{o.label}</span>
                    {o.description && <span className="mt-0.5 block truncate text-xs font-normal text-muted">{o.description}</span>}
                  </span>
                  {isSel && <Check className="h-4 w-4 shrink-0" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ── Blood group picker ─────────────────────────────────────────────────── */

const GROUPS = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];
const pretty = (g) => g.replace("-", "−");

export function BloodGroupPicker({ id, value, onChange, groups = GROUPS, tone = "light", labelledBy }) {
  const refs = useRef([]);
  const dark = tone === "dark";

  function onKey(e, i) {
    const cols = 4;
    const move = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key];
    if (move === undefined) return;
    e.preventDefault();
    const next = (i + move + groups.length) % groups.length;
    onChange(groups[next]);
    refs.current[next]?.focus();
  }

  return (
    <div id={id} role="radiogroup" aria-labelledby={labelledBy} className="grid grid-cols-4 gap-2">
      {groups.map((g, i) => {
        const on = g === value;
        return (
          <button
            key={g}
            ref={(el) => (refs.current[i] = el)}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={`Blood group ${g.replace("-", " negative").replace("+", " positive")}`}
            tabIndex={on || (!value && i === 0) ? 0 : -1}
            onClick={() => onChange(g)}
            onKeyDown={(e) => onKey(e, i)}
            className={`relative flex h-12 items-center justify-center rounded-xl border font-display text-lg font-semibold tabular-nums transition
              focus:outline-none focus-visible:ring-2 focus-visible:ring-blood/40 focus-visible:ring-offset-2
              ${on
                ? "border-blood bg-blood text-white shadow-[0_8px_18px_-8px_rgba(200,16,46,0.7)]"
                : dark
                  ? "border-white/20 bg-white/5 text-white hover:border-white/60"
                  : "border-line bg-white text-ink hover:border-blood/50 hover:text-blood"}`}
          >
            {pretty(g)}
            {on && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-blood">
                <Check className="h-3 w-3" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Date picker ────────────────────────────────────────────────────────── */

const pad = (n) => String(n).padStart(2, "0");
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromISO = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const sameDay = (a, b) => a && b && a.toDateString() === b.toDateString();
const startOfToday = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; };

const MONTH = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });
const LONG = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function DatePicker({ id, value, onChange, min, quickPicks, placeholder = "Pick a date", invalid, describedBy }) {
  const selected = fromISO(value);
  const minDate = min ? fromISO(min) : null;
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => selected || startOfToday());
  const [focus, setFocus] = useState(() => selected || startOfToday());
  const rootRef = useRef(null);
  const btnRef = useRef(null);
  const gridRef = useRef(null);
  const dialogId = useId();
  useDismiss(open, setOpen, [rootRef]);

  useEffect(() => {
    if (open) gridRef.current?.querySelector('[data-focus="true"]')?.focus();
  }, [open, focus]);

  const disabledDay = (d) => Boolean(minDate && d < minDate);

  function openCal() {
    const start = selected || (minDate && minDate > startOfToday() ? minDate : startOfToday());
    setView(start);
    setFocus(start);
    setOpen(true);
  }

  function pick(d) {
    if (disabledDay(d)) return;
    onChange(toISO(d));
    setOpen(false);
    btnRef.current?.focus();
  }

  function moveFocus(d) {
    setFocus(d);
    if (d.getMonth() !== view.getMonth() || d.getFullYear() !== view.getFullYear()) setView(d);
  }

  function onGridKey(e) {
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 }[e.key];
    if (step !== undefined) { e.preventDefault(); moveFocus(addDays(focus, step)); }
    else if (e.key === "PageDown") { e.preventDefault(); moveFocus(new Date(focus.getFullYear(), focus.getMonth() + 1, focus.getDate())); }
    else if (e.key === "PageUp") { e.preventDefault(); moveFocus(new Date(focus.getFullYear(), focus.getMonth() - 1, focus.getDate())); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(focus); }
    else if (e.key === "Escape") { setOpen(false); btnRef.current?.focus(); }
  }

  // Monday-first month grid, always 6 rows so the popover never jumps.
  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const lead = (first.getDay() + 6) % 7;
  const cells = Array.from({ length: 42 }, (_, i) => addDays(first, i - lead));
  const today = startOfToday();
  const daysFromToday = selected ? Math.round((selected - today) / 86400000) : null;

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={btnRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={() => (open ? setOpen(false) : openCal())}
        className={`${triggerCls} ${open ? "border-blood ring-2 ring-blood/20" : invalid ? "border-blood" : "border-line"}`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <Calendar className={`h-4 w-4 shrink-0 ${selected ? "text-blood" : "text-muted"}`} />
          <span className={`truncate ${selected ? "font-medium" : "text-muted"}`}>{selected ? LONG.format(selected) : placeholder}</span>
        </span>
        {selected && daysFromToday !== null && (
          <span className="shrink-0 rounded-full bg-mist px-2 py-0.5 text-xs font-semibold text-muted">
            {daysFromToday === 0 ? "Today" : daysFromToday > 0 ? `in ${daysFromToday} d` : `${-daysFromToday} d ago`}
          </span>
        )}
      </button>

      {open && (
        <div id={dialogId} role="dialog" aria-label="Choose a date" className={`${popoverCls} p-4 sm:right-auto sm:w-[22rem]`}>
          {quickPicks?.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {quickPicks.map((q) => {
                const d = addDays(today, q.days);
                const on = sameDay(d, selected);
                return (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => pick(d)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      on ? "border-blood bg-blood text-white" : "border-line text-ink hover:border-blood/50 hover:text-blood"
                    }`}
                  >
                    {q.label}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mb-3 flex items-center justify-between">
            <button type="button" aria-label="Previous month" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-mist hover:text-ink">
              <Chevron dir="left" />
            </button>
            <p className="font-display text-base font-semibold text-ink" aria-live="polite">{MONTH.format(view)}</p>
            <button type="button" aria-label="Next month" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-mist hover:text-ink">
              <Chevron dir="right" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wider text-muted">
            {WEEKDAYS.map((w) => <span key={w} className="py-1">{w}</span>)}
          </div>
          <div ref={gridRef} role="grid" onKeyDown={onGridKey} className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((d) => {
              const inMonth = d.getMonth() === view.getMonth();
              const isSel = sameDay(d, selected);
              const isToday = sameDay(d, today);
              const off = disabledDay(d);
              const isFocus = sameDay(d, focus);
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  role="gridcell"
                  tabIndex={isFocus ? 0 : -1}
                  data-focus={isFocus}
                  aria-selected={isSel}
                  aria-disabled={off || undefined}
                  aria-label={LONG.format(d)}
                  onClick={() => pick(d)}
                  className={`relative flex h-9 items-center justify-center rounded-lg text-sm tabular-nums transition
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-blood/40
                    ${isSel ? "bg-blood font-semibold text-white" : off ? "cursor-not-allowed text-line" : inMonth ? "text-ink hover:bg-mist" : "text-muted/60 hover:bg-mist"}
                    ${isToday && !isSel ? "font-semibold text-blood" : ""}`}
                >
                  {d.getDate()}
                  {isToday && !isSel && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-blood" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
