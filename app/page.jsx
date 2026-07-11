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
    <main className="min-h-screen px-4 py-8 md:px-8 md:py-12 max-w-6xl mx-auto space-y-10 selection:bg-blood/20">
      
      {/* Top Professional Header Bar */}
      <div className="flex justify-between items-center border-b hairline pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-safe animate-pulse" />
          <p className="font-mono text-xs tracking-widest text-muted uppercase">
            Live Network Status &middot; Operational
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard" 
            className="text-xs font-mono font-medium px-4 py-2 rounded-md bg-surface border border-ink/10 hover:border-ink/30 text-ink shadow-sm hover:shadow transition-all duration-200"
          >
            Hospital Staff Portal →
          </Link>
          <Link 
            href="/donors" 
            className="text-xs font-mono font-medium px-4 py-2 rounded-md bg-blood/10 hover:bg-blood/20 text-blood border border-blood/20 transition-all duration-200"
          >
            Become a Donor ♥
          </Link>
        </div>
      </div>

      {/* Hero Branding Section */}
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pt-2">
        <div className="space-y-3">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-ink">
            BLOODLINK <span className="text-blood bg-blood/5 px-2.5 py-0.5 rounded-lg border border-blood/10">COLDCHAIN</span>
          </h1>
          <p className="text-muted text-base max-w-xl leading-relaxed">
            Real-time blood availability across <span className="text-ink font-semibold">{state} State</span> health providers. Built for the critical seconds that matter when a patient cannot wait.
          </p>
        </div>
        
        {/* State Filter Card */}
        <div className="bg-surface/60 backdrop-blur-md border hairline p-4 rounded-xl flex flex-col gap-2 min-w-[260px] shadow-sm">
          <label className="text-xs uppercase tracking-wider text-muted font-mono font-bold">Monitor Jurisdiction</label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="bg-surface border border-ink/10 hover:border-ink/20 focus:border-blood rounded-lg px-3 py-2.5 text-ink font-body font-medium transition cursor-pointer outline-none shadow-inner"
          >
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>{s} State</option>
            ))}
          </select>
        </div>
      </header>

      {loading && (
        <div className="flex items-center gap-2 text-muted font-mono text-xs bg-surface border hairline px-3 py-2 rounded-md w-fit animate-pulse">
          <span>🔄</span> Synchronizing real-time databases...
        </div>
      )}

      {/* Blood Type Analytic Metrics Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-xs text-muted uppercase tracking-widest font-bold">Aggregated Inventory Allocation</h2>
          <span className="text-xs text-muted font-mono bg-surface border hairline px-2 py-0.5 rounded">Sorted by Universal Utility</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...BLOOD_TYPES].sort((a, b) => (a === "O-" ? -1 : b === "O-" ? 1 : 0)).map((type) => {
            const entry = byType[type];
            const critical = entry.units <= 2;
            const isEmpty = entry.units === 0;
            
            return (
              <div
                key={type}
                className={`card p-5 rounded-2xl flex flex-col justify-between min-h-[140px] transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                  isEmpty ? "bg-blood/[0.02] border border-blood/40 shadow-sm" : critical ? "bg-warn/[0.01] border border-warn/40" : "hover:border-ink/20"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-display text-3xl font-bold text-ink tracking-tight">{type}</span>
                  {isEmpty ? (
                    <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-blood/10 text-blood animate-pulse">
                      DEPLETED
                    </span>
                  ) : critical ? (
                    <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-warn/10 text-warn">
                      CRITICAL
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-safe/10 text-safe">
                      STABLE
                    </span>
                  )}
                </div>
                
                <div className="flex items-end justify-between mt-4">
                  <div>
                    <span className="font-mono text-4xl font-black text-ink tracking-tighter">{entry.units}</span>
                    <span className="text-muted font-mono text-xs ml-1 font-bold">UNITS</span>
                  </div>
                  
                  <div className="flex gap-1 flex-wrap justify-end max-w-[80px]">
                    {entry.batches.slice(0, 4).map((b) => (
                      <div key={b.id} className="transition transform hover:scale-110">
                        <ExpiryRing expiryDate={b.batch_expiry_date} size={28} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Hospital Breakdown Component Section */}
      <section className="space-y-4 pt-4">
        <h2 className="font-display text-lg font-bold text-ink uppercase tracking-wide flex items-center gap-2">
          🏥 Verified Facilities In {state}
        </h2>
        
        <div className="grid gap-3">
          {hospitals.map((h) => {
            const hInventory = inventory.filter((i) => i.hospital_id === h.id);
            const total = hInventory.reduce((sum, i) => sum + i.units_available, 0);
            
            return (
              <div 
                key={h.id} 
                className="card p-5 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all duration-200 hover:border-ink/20"
              >
                <div className="space-y-1">
                  <p className="text-ink font-semibold text-lg tracking-tight">{h.name}</p>
                  <p className="text-muted text-sm flex items-center gap-1">
                    <span>📍</span> {h.address}
                  </p>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-ink/5">
                  <div className="font-mono text-right">
                    <span className="text-lg font-bold text-ink">{total} </span>
                    <span className="text-xs text-muted font-bold">TOTAL UNITS</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <a
                      href={whatsAppLink(h.emergency_phone, `Emergency blood inquiry via BloodLink for ${h.name}.`)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono font-bold px-4 py-2 rounded-lg border border-safe text-safe hover:bg-safe/5 active:scale-95 transition-all"
                    >
                      WhatsApp
                    </a>
                    <a
                      href={`tel:${h.emergency_phone}`}
                      className="text-xs font-mono font-bold px-4 py-2 rounded-lg bg-blood/10 border border-blood/20 text-blood hover:bg-blood hover:text-white active:scale-95 transition-all"
                    >
                      Call Dispatch
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
          
          {!loading && hospitals.length === 0 && (
            <div className="text-center py-12 bg-surface/40 border hairline rounded-2xl">
              <span className="text-2xl">⚡</span>
              <p className="text-muted font-mono text-sm mt-2">No emergency nodes currently tracked in this state.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}