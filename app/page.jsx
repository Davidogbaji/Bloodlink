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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      
      {/* 1. VIBRANT BRANDING TOP HEADER BANNER */}
      <nav className="bg-[#D61C38] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter">🩸 BLOODLINK</span>
            <span className="bg-white/20 text-xs px-2 py-0.5 rounded font-mono uppercase tracking-wider">Coldchain</span>
          </div>
          <div className="flex items-center gap-6 font-medium text-sm">
            <Link href="/" className="hover:text-white/80 transition pb-1 border-b-2 border-white">
              Dashboard
            </Link>
            <Link href="/dashboard" className="hover:text-white/80 transition pb-1">
              Staff Portal
            </Link>
            <Link href="/donors" className="hover:text-white/80 transition pb-1">
              Benefits of Donation
            </Link>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
              U
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-12">
        
        {/* 2. HERO SPLIT SECTION (MATCHING YOUR IMAGE STRUCTURE) */}
        <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-slate-200/60">
          <div className="lg:col-span-7 space-y-6">
            <p className="text-xs uppercase tracking-widest text-[#D61C38] font-mono font-bold">
              • LIVE INFRASTRUCTURE SYSTEM
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#D61C38] tracking-tight leading-none">
              DONATE BLOOD!!!
            </h1>
            <div className="space-y-4 text-slate-600 text-base md:text-lg leading-relaxed">
              <p className="font-semibold text-slate-800">
                Real-time blood availability across <span className="underline decoration-[#D61C38] decoration-2">{state} State</span> hospitals.
              </p>
              <p>
                We have so many great heroes who help us in contributing towards the betterment of health delivery systems. Built for the crucial seconds that matter when a patient cannot wait for a phone chain.
              </p>
            </div>
            
            {/* Standout Big Capsule Action Button */}
            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <Link 
                href="/donors" 
                className="inline-flex items-center justify-center font-bold px-8 py-3.5 bg-[#D61C38] hover:bg-[#b8142c] text-white text-base rounded-full shadow-lg shadow-red-500/20 active:scale-98 transition-all duration-150"
              >
                Donor Registration →
              </Link>
              
              {/* Modern State Selection Widget inline */}
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-full border border-slate-200">
                <span className="text-xs font-mono font-bold uppercase text-slate-500 pl-3">REGION:</span>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="bg-white border border-slate-200 hover:border-slate-300 font-bold text-sm rounded-full px-4 py-1.5 text-slate-800 shadow-sm cursor-pointer outline-none transition"
                >
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Graphical Split Card on the Right */}
          <div className="lg:col-span-5 bg-slate-100/80 rounded-2xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center min-h-[300px] relative overflow-hidden group">
            <div className="w-20 h-20 bg-[#D61C38]/10 rounded-full flex items-center justify-center text-3xl mb-4 animate-bounce">
              ❤️
            </div>
            <div className="space-y-2">
              <p className="text-slate-800 font-bold text-lg">Coldchain Monitoring Node</p>
              <p className="text-xs text-slate-500 max-w-xs font-mono">
                Active connections out to {hospitals.length} localized collection banks in real-time.
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#D61C38]/5 to-transparent pointer-events-none" />
          </div>
        </header>

        {loading && (
          <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-3 w-fit text-sm font-mono text-slate-600 shadow-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            Fetching regional network database modules...
          </div>
        )}

        {/* 3. BLOOD STOCK METRICS TILES */}
        <section className="space-y-4">
          <h2 className="text-sm font-mono font-bold tracking-widest uppercase text-slate-500">
            Live Central Stock Aggregation
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...BLOOD_TYPES].sort((a, b) => (a === "O-" ? -1 : b === "O-" ? 1 : 0)).map((type) => {
              const entry = byType[type];
              const critical = entry.units <= 2;
              const isEmpty = entry.units === 0;

              return (
                <div
                  key={type}
                  className={`bg-white p-5 rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md ${
                    isEmpty 
                      ? "border-l-4 border-l-[#D61C38] border-slate-200" 
                      : critical 
                      ? "border-l-4 border-l-amber-500 border-slate-200" 
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-slate-800">{type}</span>
                    {isEmpty ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-100 text-[#D61C38]">
                        DEPLETED
                      </span>
                    ) : critical ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                        LOW
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        STABLE
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 font-mono tracking-tight">{entry.units}</span>
                    <span className="text-slate-400 text-xs font-bold font-mono">UNITS</span>
                  </div>

                  <div className="flex gap-1.5 flex-wrap mt-3 pt-3 border-t border-slate-100">
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
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
            <span>🏥</span> Facility Nodes Tracker ({hospitals.length})
          </h2>
          <div className="grid gap-3">
            {hospitals.map((h) => {
              const hInventory = inventory.filter((i) => i.hospital_id === h.id);
              const total = hInventory.reduce((sum, i) => sum + i.units_available, 0);

              return (
                <div key={h.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:border-slate-300 transition">
                  <div>
                    <h3 className="text-slate-900 font-bold text-base md:text-lg">{h.name}</h3>
                    <p className="text-slate-500 text-sm mt-0.5">📍 {h.address}</p>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <div className="text-left md:text-right font-mono">
                      <span className="text-xl font-black text-slate-900">{total}</span>
                      <span className="text-slate-400 text-xs font-bold ml-1">UNITS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={whatsAppLink(h.emergency_phone, `Emergency blood inquiry via BloodLink for ${h.name}.`)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono font-bold px-4 py-2 rounded-lg border border-emerald-500 text-emerald-600 hover:bg-emerald-50 transition"
                      >
                        WhatsApp
                      </a>
                      <a
                        href={`tel:${h.emergency_phone}`}
                        className="text-xs font-mono font-bold px-4 py-2 rounded-lg bg-[#D61C38] text-white hover:bg-[#b8142c] shadow transition"
                      >
                        Call Node
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {!loading && hospitals.length === 0 && (
              <div className="text-center py-12 bg-white border border-slate-200 rounded-xl font-mono text-slate-500 text-sm">
                No facilities registered inside this network grid yet.
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}