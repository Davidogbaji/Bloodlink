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

  return (
    <div className="min-h-screen pb-16">
      
      {/* 1. TOP HEADER BANNER - NAV BAR FORMAT */}
      <nav className="bg-surface border-b hairline sticky top-0 z-50 shadow-sm backdrop-blur-md bg-opacity-95">
        <div className="max-w-6xl mx-auto px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold tracking-tight text-ink">
              BLOODLINK <span className="text-blood">COLDCHAIN</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-6 font-mono text-xs">
            <Link href="/" className="text-ink font-bold pb-1 border-b border-blood">
              Dashboard
            </Link>
            <Link href="/dashboard" className="text-muted hover:text-ink transition">
              Staff Portal
            </Link>
            <Link href="/donors" className="text-muted hover:text-ink transition">
              Donor Registry
            </Link>
          </div>
        </div>
      </nav>

      {/* MAIN LAYOUT WRAPPER */}
      <div className="max-w-6xl mx-auto px-5 mt-8 space-y-12">
        
        {/* 2. HERO SPLIT SECTION (MATCHING FORMAT FRAMEWORK) */}
        <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center card p-6 md:p-10 rounded-2xl">
          
          {/* LEFT CONTENT COLUMN */}
          <div className="lg:col-span-7 space-y-5">
            <p className="font-mono text-xs tracking-widest text-blood uppercase">
              Live &middot; No login required
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-ink leading-tight">
              DONATE BLOOD!!!
            </h2>
            <div className="space-y-3 text-muted max-w-xl">
              <p className="text-ink font-medium">
                Real-time blood availability across {state} hospitals.
              </p>
              <p className="text-sm leading-relaxed">
                We have so many great heroes who help us in contributing towards the betterment of our health delivery systems. Built for the seconds that matter when a patient can't wait for a phone chain.
              </p>
            </div>
            
            {/* Inline Action Row */}
            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <Link 
                href="/donors" 
                className="inline-flex items-center justify-center font-mono text-xs font-bold px-6 py-3 bg-blood hover:bg-blood/90 text-white rounded-full shadow-lg transition transform active:scale-95"
              >
                Donor Registration →
              </Link>
              
              {/* State drop selector card layout wrapper */}
              <div className="flex items-center gap-2 bg-surface border hairline px-3 py-1.5 rounded-full">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider pl-1">State:</span>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="bg-transparent text-ink font-body text-xs font-bold cursor-pointer outline-none"
                >
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s} className="bg-surface text-ink">{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* RIGHT GRAPHIC / ANALYTIC CARD */}
          <div className="lg:col-span-5 bg-surface/40 rounded-xl border border-dashed border-ink/10 p-6 flex flex-col items-center justify-center text-center min-h-[220px]">
            <span className="text-4xl mb-3 animate-pulse">❤️</span>
            <p className="text-ink font-mono text-sm font-semibold">Coldchain Tracking Monitor</p>
            <p className="text-xs text-muted font-mono mt-1">
              Active tracking metrics across {hospitals.length} localized network banks.
            </p>
          </div>
          
        </header>

        {loading && <p className="text-muted font-mono text-xs animate-pulse">Synchronizing live storage array...</p>}

        {/* 3. BLOOD TYPE METRIC STOCK TILES */}
        <section className="space-y-4">
          <h3 className="font-mono text-xs text-muted uppercase tracking-widest">
            Regional Stock Aggregation
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...BLOOD_TYPES].sort((a, b) => (a === "O-" ? -1 : b === "O-" ? 1 : 0)).map((type) => {
              const entry = byType[type];
              const critical = entry.units <= 2;
              const isEmpty = entry.units === 0;

              return (
                <div
                  key={type}
                  className={`card p-5 flex flex-col gap-3 transition-all ${
                    isEmpty ? "border-blood" : critical && entry.units > 0 ? "border-warn" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl text-ink">{type}</span>
                    {isEmpty ? (
                      <span className="text-[9px] font-mono bg-blood/10 text-blood px-1.5 py-0.5 rounded uppercase font-bold">Depleted</span>
                    ) : critical ? (
                      <span className="text-[9px] font-mono bg-warn/10 text-warn px-1.5 py-0.5 rounded uppercase font-bold">Critical</span>
                    ) : (
                      <span className="text-[9px] font-mono bg-safe/10 text-safe px-1.5 py-0.5 rounded uppercase font-bold">Stable</span>
                    )}
                  </div>
                  <div>
                    <span className="font-mono text-3xl font-semibold text-ink">{entry.units}</span>
                    <span className="text-muted text-xs ml-1 font-mono">units</span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {entry.batches.slice(0, 4).map((b) => (
                      <ExpiryRing key={b.id} expiryDate={b.batch_expiry_date} size={28} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. HOSPITAL DIRECTORY LIST */}
        <section className="space-y-4">
          <h3 className="font-display text-lg text-ink uppercase tracking-wide">
            Hospitals in {state}
          </h3>
          <div className="space-y-3">
            {hospitals.map((h) => {
              const hInventory = inventory.filter((i) => i.hospital_id === h.id);
              const total = hInventory.reduce((sum, i) => sum + i.units_available, 0);
              return (
                <div key={h.id} className="card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-ink font-medium">{h.name}</p>
                    <p className="text-muted text-sm">📍 {h.address}</p>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-2 md:pt-0 border-ink/5">
                    <span className="font-mono text-xs text-muted">{total} units total</span>
                    <div className="flex gap-2">
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
                </div>
              );
            })}
            {!loading && hospitals.length === 0 && (
              <p className="text-muted text-sm font-mono">No registered facilities in this state node yet.</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}