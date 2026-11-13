"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { BLOOD_TYPES, COLD_CHAIN_RISK_HOURS, expiryStatus, outageRisk } from "../../lib/utils";
import { writeOrQueue, getQueueLength, flushQueue } from "../../lib/offlineQueue";
import ExpiryRing from "../../components/ExpiryRing";
import { PageHeader, ExpiryBadge, EmptyState } from "../../components/ui";
import {
  AlertIcon,
  BoltIcon,
  CheckCircleIcon,
  DropIcon,
  MinusIcon,
  PlusIcon,
  RefreshIcon,
  ShieldIcon,
} from "../../components/Icons";

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function Dashboard() {
  const [hospitals, setHospitals] = useState([]);
  const [hospitalId, setHospitalId] = useState("");
  const [inventory, setInventory] = useState([]);
  const [outages, setOutages] = useState([]);
  const [queueLen, setQueueLen] = useState(0);
  const [form, setForm] = useState({ blood_type: "O+", units_available: 1, batch_expiry_date: "" });
  const [savingOutage, setSavingOutage] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    supabase.from("hospitals").select("*").order("name").then(({ data }) => {
      setHospitals(data || []);
      if (data?.length) setHospitalId(data[0].id);
    });
    setQueueLen(getQueueLength());
  }, []);

  useEffect(() => {
    if (!hospitalId) return;
    async function load() {
      const { data: inv } = await supabase
        .from("blood_inventory").select("*").eq("hospital_id", hospitalId).order("batch_expiry_date");
      const { data: out } = await supabase
        .from("outage_logs").select("*").eq("hospital_id", hospitalId).order("start_time", { ascending: false }).limit(5);
      setInventory(inv || []);
      setOutages(out || []);
    }
    load();

    const channel = supabase
      .channel(`dashboard-${hospitalId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "blood_inventory", filter: `hospital_id=eq.${hospitalId}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "outage_logs", filter: `hospital_id=eq.${hospitalId}` }, load)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [hospitalId]);

  async function addBatch(e) {
    e.preventDefault();
    if (!hospitalId) return; // nothing to attach the batch to; would queue a write that can never sync
    if (!form.batch_expiry_date) {
      setFormError("Choose the batch expiry date.");
      return;
    }
    setFormError("");
    const payload = { hospital_id: hospitalId, ...form, units_available: Number(form.units_available) };
    const res = await writeOrQueue({ table: "blood_inventory", type: "insert", payload });
    setQueueLen(getQueueLength());
    if (!res.queued) {
      const { data } = await supabase.from("blood_inventory").select("*").eq("hospital_id", hospitalId).order("batch_expiry_date");
      setInventory(data || []);
    } else {
      setInventory((prev) => [...prev, { ...payload, id: `local-${Date.now()}` }]);
    }
    setForm({ blood_type: "O+", units_available: 1, batch_expiry_date: "" });
  }

  async function adjustUnits(item, delta) {
    const newUnits = Math.max(0, item.units_available + delta);
    await writeOrQueue({
      table: "blood_inventory", type: "update",
      payload: { units_available: newUnits }, match: { id: item.id },
    });
    setQueueLen(getQueueLength());
    setInventory((prev) => prev.map((i) => (i.id === item.id ? { ...i, units_available: newUnits } : i)));
  }

  async function startOutage(generatorBackup) {
    setSavingOutage(true);
    await writeOrQueue({
      table: "outage_logs", type: "insert",
      payload: { hospital_id: hospitalId, generator_backup: generatorBackup, start_time: new Date().toISOString() },
    });
    setQueueLen(getQueueLength());
    const { data } = await supabase.from("outage_logs").select("*").eq("hospital_id", hospitalId).order("start_time", { ascending: false }).limit(5);
    setOutages(data || []);
    setSavingOutage(false);
  }

  async function endOutage(outageId) {
    await writeOrQueue({
      table: "outage_logs", type: "update",
      payload: { end_time: new Date().toISOString() }, match: { id: outageId },
    });
    setQueueLen(getQueueLength());
    const { data } = await supabase.from("outage_logs").select("*").eq("hospital_id", hospitalId).order("start_time", { ascending: false }).limit(5);
    setOutages(data || []);
  }

  const ongoingOutage = outages.find((o) => !o.end_time);
  const risk = ongoingOutage ? outageRisk(ongoingOutage) : null;
  const hospital = hospitals.find((h) => h.id === hospitalId);

  const syncPill =
    queueLen > 0 ? (
      <button
        type="button"
        onClick={() => flushQueue(() => setQueueLen(getQueueLength()))}
        className="inline-flex animate-pulse-ring items-center gap-2 rounded-full bg-warn-bg px-4 py-2 text-sm font-semibold text-warn-text"
      >
        <RefreshIcon className="h-4 w-4" />
        {queueLen} {queueLen === 1 ? "Update" : "Updates"} Not Yet Synced · Retry
      </button>
    ) : (
      <span className="inline-flex items-center gap-2 rounded-full bg-safe-bg px-4 py-2 text-sm font-semibold text-safe-text">
        <CheckCircleIcon className="h-4 w-4" />
        All Changes Synced
      </span>
    );

  return (
    <>
      <PageHeader eyebrow="For Hospital Staff" title="Staff Dashboard" aside={syncPill}>
        Log blood batches, adjust stock and record power cuts. Every change appears on the public board straight
        away, and changes made offline are sent when the connection returns.
      </PageHeader>

      <div className="page py-10 md:py-14">
        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber/60 bg-warn-bg p-4 text-sm text-warn-text">
          <ShieldIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            <span className="font-semibold">Demo access.</span> This dashboard does not require a sign-in yet. During
            the pilot, access will be limited to authorised blood bank staff.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left column: hospital, power, add batch */}
          <div className="space-y-6 lg:col-span-5">
            <section className="card p-6">
              <label htmlFor="hospital" className="label">
                Hospital
              </label>
              <select
                id="hospital"
                value={hospitalId}
                onChange={(e) => setHospitalId(e.target.value)}
                className="input"
                disabled={hospitals.length === 0}
              >
                {hospitals.length === 0 && <option value="">No hospitals registered yet</option>}
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
              {hospital && (
                <p className="hint">
                  {hospital.address}
                  {hospital.has_generator_backup ? " · Generator on site" : ""}
                </p>
              )}
            </section>

            <section className="card p-6" aria-labelledby="power-title">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mist text-burgundy">
                  <BoltIcon className="h-5 w-5" />
                </span>
                <h2 id="power-title" className="text-xl font-semibold">
                  Power Status
                </h2>
              </div>

              {ongoingOutage ? (
                <div
                  role="status"
                  className={`mt-5 rounded-xl p-4 ${risk.atRisk ? "bg-blood text-white" : "bg-warn-bg text-warn-text"}`}
                >
                  <p className="flex items-center gap-2 font-semibold">
                    <AlertIcon className="h-5 w-5" />
                    {risk.atRisk ? "Cold-Chain Risk: Spoilage Possible" : "Power Outage in Progress"}
                  </p>
                  <p className={`mt-1 text-sm ${risk.atRisk ? "text-white" : ""}`}>
                    Running for {risk.hours} {risk.hours === 1 ? "hour" : "hours"}{" "}
                    {ongoingOutage.generator_backup ? "with the generator on." : "with no backup power."}{" "}
                    {risk.atRisk
                      ? "Move refrigerated units to a facility with power."
                      : !ongoingOutage.generator_backup
                        ? `A warning is raised after ${COLD_CHAIN_RISK_HOURS} hours.`
                        : ""}
                  </p>
                  <button
                    type="button"
                    onClick={() => endOutage(ongoingOutage.id)}
                    className={`btn-sm btn mt-4 ${risk.atRisk ? "bg-white text-blood hover:bg-rose" : "bg-white text-ink hover:bg-mist"}`}
                  >
                    Mark Power Restored
                  </button>
                </div>
              ) : (
                <>
                  <p className="mt-4 text-sm text-muted">
                    Power is on. If it goes off, log it here so the board can warn you before blood is at risk.
                  </p>
                  <p className="mt-5 text-sm font-medium text-ink">Log a Power Outage</p>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <button type="button" onClick={() => startOutage(false)} disabled={savingOutage || !hospitalId} className="btn-dark">
                      No Generator
                    </button>
                    <button type="button" onClick={() => startOutage(true)} disabled={savingOutage || !hospitalId} className="btn-outline">
                      Generator Running
                    </button>
                  </div>
                </>
              )}
            </section>

            <section className="card p-6" aria-labelledby="add-title">
              <h2 id="add-title" className="text-xl font-semibold">
                Add a Batch
              </h2>
              <form onSubmit={addBatch} className="mt-5 grid gap-4 sm:grid-cols-2" noValidate>
                <div>
                  <label htmlFor="blood_type" className="label">
                    Blood Group
                  </label>
                  <select
                    id="blood_type"
                    value={form.blood_type}
                    onChange={(e) => setForm({ ...form, blood_type: e.target.value })}
                    className="input"
                  >
                    {BLOOD_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="units" className="label">
                    Units
                  </label>
                  <input
                    id="units"
                    type="number"
                    min="1"
                    inputMode="numeric"
                    value={form.units_available}
                    onChange={(e) => setForm({ ...form, units_available: e.target.value })}
                    className="input"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="expiry" className="label">
                    Batch Expiry Date
                  </label>
                  <input
                    id="expiry"
                    type="date"
                    value={form.batch_expiry_date}
                    onChange={(e) => setForm({ ...form, batch_expiry_date: e.target.value })}
                    className="input"
                    aria-invalid={Boolean(formError)}
                    aria-describedby={formError ? "expiry-error" : "expiry-hint"}
                  />
                  {formError ? (
                    <p id="expiry-error" className="mt-1.5 text-xs font-medium text-blood">
                      {formError}
                    </p>
                  ) : (
                    <p id="expiry-hint" className="hint">
                      As printed on the bag label.
                    </p>
                  )}
                </div>
                <button type="submit" disabled={!hospitalId} className="btn-primary sm:col-span-2">
                  <PlusIcon className="h-4 w-4" />
                  Add Batch
                </button>
              </form>
            </section>
          </div>

          {/* Right column: inventory */}
          <section className="lg:col-span-7" aria-labelledby="inv-title">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="inv-title" className="text-2xl font-semibold">
                Current Stock
              </h2>
              <p className="text-sm text-muted">Soonest expiry first</p>
            </div>

            <div className="mt-5 space-y-3">
              {inventory.map((item) => {
                const { level, daysLeft } = expiryStatus(item.batch_expiry_date);
                return (
                  <article key={item.id} className="card flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
                    <div className="flex items-center gap-4">
                      <ExpiryRing expiryDate={item.batch_expiry_date} size={48} />
                      <div>
                        <p className="flex items-center gap-2">
                          <span className="font-display text-xl font-semibold">{item.blood_type}</span>
                          <ExpiryBadge level={level} />
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          Expires {formatDate(item.batch_expiry_date)}
                          {level !== "expired" && ` · ${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" role="group" aria-label={`Units of ${item.blood_type}`}>
                      <button
                        type="button"
                        onClick={() => adjustUnits(item, -1)}
                        aria-label={`Remove one unit of ${item.blood_type}`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ink hover:border-blood hover:text-blood"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center">
                        <span className="block font-display text-xl font-semibold tabular-nums">{item.units_available}</span>
                        <span className="block text-[11px] text-muted">{item.units_available === 1 ? "unit" : "units"}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustUnits(item, 1)}
                        aria-label={`Add one unit of ${item.blood_type}`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ink hover:border-safe hover:text-safe-text"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                );
              })}
              {inventory.length === 0 && (
                <EmptyState icon={DropIcon} title="No Batches Logged Yet">
                  Add the first batch on the left. It will appear here and on the public board straight away.
                </EmptyState>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
