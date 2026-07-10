"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { NIGERIAN_STATES, BLOOD_TYPES, expiryStatus, whatsAppLink } from "../lib/utils";
import ExpiryRing from "../components/ExpiryRing";

export default function PublicBoard() {
  const [state, setState] = useState("Nasarawa");
  const [hospitals, setHospitals] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel;
    async function load() {
      setLoading(true);
      const { data: hosp } = await supabase.from("hospitals").select("*").eq("state", state);
      const hospIds = (hosp || []).map((h) => h.id);
      const { data: inv } = hospIds.length
        ? await supabase.from("blood_inventory").select("*").in("hospital_id", hospIds)
        : { data: [] };
      setHospitals(hosp || []);
      setInventory(inv || []);
      setLoading(false);
    }
    load();

    channel = supabase
      .channel("public-board")
      .on("postgres_changes", { event: "*", schema: "public", table: "blood_inventory" }, load)
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [state]);

  const byType = useMemo(() => {
    const map = Object.fromEntries(BLOOD_TYPES.map((t) => [t, { units: 0, batches: [] }]));
    for (const item of inventory) {
      if (!map[item.blood_type]) continue;
      map[item.blood_type].units += item.units_available;
      map[item.blood_type].batches.push(item);
    }
    return map;
  }, [inventory]);

  const hospitalById = useMemo(
    () => Object.fromEntries(hospitals.map((h) => [h.id, h])),
    [hospitals]
  );

  return (
    <main className="min-h-screen px-5 py-8 md:px-10 md:py-12 max-w-6xl mx-auto">
      {/* Hero */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b hairline pb-6 mb-8">
        <div>
          <p className="font-mono text-xs tracking-widest text-blood uppercase mb-2">
            Live &middot; No login required
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-ink">
            BLOODLINK <span className="text-blood">COLDCHAIN</span>
          </h1>
          <p className="text-muted mt-2 max-w-lg">
            Real-time blood availability across {state} hospitals. Built for the seconds that matter
            when a patient can't wait for a phone chain.
          </p>
        </div>
        <div className="flex flex-col gap-2 min-w-[220px]">
          <label className="text-xs uppercase tracking-wide text-muted font-mono">State</label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="bg-surface border hairline rounded px-3 py-2 text-ink font-body"
          >
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="flex gap-3 mt-2">
            <Link href="/dashboard" className="text-xs font-mono text-muted hover:text-ink underline underline-offset-4">
              Hospital staff login →
            </Link>
            <Link href="/donors" className="text-xs font-mono text-muted hover:text-ink underline underline-offset-4">
              Donor registry →
            </Link>
          </div>
        </div>
      </header>

      {loading && <p className="text-muted font-mono text-sm">Loading live inventory…</p>}

      {/* Blood type grid — O- leads because it's the universal donor / usually the scarcest */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[...BLOOD_TYPES].sort((a, b) => (a === "O-" ? -1 : b === "O-" ? 1 : 0)).map((type) => {
          const entry = byType[type];
          const critical = entry.units <= 2;
          return (
            <div
              key={type}
              className={`card p-5 flex flex-col gap-3 ${critical && entry.units > 0 ? "border-warn" : ""} ${entry.units === 0 ? "border-blood" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl text-ink">{type}</span>
                {entry.units === 0 && (
                  <span className="w-2 h-2 rounded-full bg-blood animate-pulse-ring" />
                )}
              </div>
              <div>
                <span className="font-mono text-3xl font-semibold text-ink">{entry.units}</span>
                <span className="text-muted text-sm ml-1">units</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {entry.batches.slice(0, 4).map((b) => (
                  <ExpiryRing key={b.id} expiryDate={b.batch_expiry_date} size={34} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Hospital breakdown */}
      <section>
        <h2 className="font-display text-xl text-ink mb-4 uppercase tracking-wide">
          Hospitals in {state}
        </h2>
        <div className="space-y-3">
          {hospitals.map((h) => {
            const hInventory = inventory.filter((i) => i.hospital_id === h.id);
            const total = hInventory.reduce((sum, i) => sum + i.units_available, 0);
            return (
              <div key={h.id} className="card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-ink font-medium">{h.name}</p>
                  <p className="text-muted text-sm">{h.address}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-muted">{total} units total</span>
                  <a
                    href={whatsAppLink(h.emergency_phone, `Emergency blood inquiry via BloodLink for ${h.name}.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono px-3 py-1.5 rounded border border-safe text-safe hover:bg-safe/10 transition"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`tel:${h.emergency_phone}`}
                    className="text-xs font-mono px-3 py-1.5 rounded border border-blood text-blood hover:bg-blood/10 transition"
                  >
                    Call
                  </a>
                </div>
              </div>
            );
          })}
          {!loading && hospitals.length === 0 && (
            <p className="text-muted text-sm">No registered hospitals in this state yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}
