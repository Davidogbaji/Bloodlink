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
      
      {/* 1. VIBRANT HIGH-CONTRAST HEADER BANNER */}
      <nav className="bg-[#D61C38] text-white sticky top-0 z-50 shadow-md border-b-4 border-black/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-tighter text-white drop-shadow-sm">🩸 BLOODLINK</span>
            <span className="bg-white text-[#D61C38] text-xs font-black px-2.5 py-0.5 rounded font-mono tracking-widest uppercase">
              Coldchain
            </span>
          </div>
          
          {/* Action Blocks shifted to the edge with distinct sharp container shapes */}
          <div className="flex items-center gap-3 font-mono text-xs w-full sm:w-auto justify-end">
            <Link 
              href="/" 
              className="px-4 py-2.5 bg-white/10 text-white font-black uppercase tracking-wider border border-white/20 hover:bg-white/20 transition decoration-none text-center rounded-sm"
            >
              Dashboard
            </Link>
            <Link 
              href="/dashboard" 
              className="px-4 py-2.5 bg-black text-white font-black uppercase tracking-wider border border-black hover:bg-black/80 transition decoration-none text-center rounded-sm shadow-sm"
            >
              Staff Portal 🔐
            </Link>
            <Link 
              href="/donors" 
              className="px-4 py-2.5 bg-white text-[#D61C38] font-black uppercase tracking-wider border border-white hover:bg-white/90 transition decoration-none text-center rounded-sm shadow-md"
            >
              Donor Registry ♥
            </Link>
          </div>
        </div>
      </nav>

      {/* MAIN SYSTEM WRAPPER */}
      <div className="max-w-7xl mx-auto px-6 mt-10 space-y-12">
        
        {/* 2. HERO SPLIT SECTION FRAMEWORK */}
        <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-8 md:p-12 rounded-2xl shadow-md border border-slate-200">
          
          {/* Left Text Block - Maximum Visibility */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-red-50 text-[#D61C38] px-3 py-1 rounded-md font-mono text-xs font-bold tracking-wider border border-red-100">
              <span className="w-2 h-2 rounded-full bg-[#D61C38] animate-pulse" />
              LIVE NETWORK OVERVIEW &middot; NO LOGIN REQUIRED
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#D61C38] tracking-tight leading-none uppercase drop-shadow-sm">
              DONATE BLOOD!!!
            </h1>
            
            <div className="space-y-4 text-slate-700 text-lg leading-relaxed">
              <p className="font-bold text-slate-900 text-xl">
                Real-time systemic blood asset availability across <span className="underline decoration-[#D61C38] decoration-4 font-black text-black">{state} State</span> health providers.
              </p>
              <p className="font-medium text-slate-600">
                We have so many great heroes who help us in contributing towards the betterment of our health delivery systems. Built specifically for the critical seconds that matter when a patient cannot afford to wait.
              </p>
            </div>
            
            {/* Call to Actions & Premium Large Dropdown Widget */}
            <div className="pt-4 flex flex-wrap gap-4 items-center">
              <Link 
                href="/donors" 
                className="inline-flex items-center justify-center font-black tracking-wide px-8 py-4 bg-[#D61C38] hover:bg-[#b8142c] text-white text-base rounded-lg shadow-lg shadow-red-500/10 hover:shadow-xl transition-all active:scale-98"
              >
                Donor Registration &rarr;
              </Link>
              
              {/* Premium Expanded State Selector Card Component */}
              <div className="flex items-center gap-3 bg-slate-900 text-white p-2 rounded-lg shadow-inner border border-slate-800">
                <span className="text-xs font-mono font-black tracking-widest text-slate-400 pl-2 uppercase">JURISDICTION:</span>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="bg-slate-800 text-white border border-slate-700 hover:border-slate-600 font-black text-base rounded-md px-5 py-2 cursor-pointer outline-none transition focus:ring-2 focus:ring-[#D61C38]"
                >
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s} className="bg-slate-900 text-white font-sans">{s} State</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right Graphics Metric Box */}
          <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl border-2 border-slate-800 p-8 flex flex-col items-center justify-center text-center min-h-[320px] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl" />
            <div className="w-24 h-24 bg-white/5 rounded-full border border-white/10 flex items-center justify-center text-5xl mb-4 shadow-inner transform hover:rotate-12 transition duration-300">
              ❤️
            </div>
            <div className="space-y-2 z-10">
              <p className="font-mono text-sm tracking-widest text-red-400 font-bold uppercase">Coldchain Monitor Active</p>
              <p className="text-white font-black text-2xl tracking-tight">{hospitals.length} Linked Nodes</p>
              <p className="text-xs text-slate-400 max-w-xs font-mono mt-1">
                Real-time socket connection pipeline out to localized depository infrastructure banks.
              </p>
            </div>
          </div>
        </header>

        {loading && (
          <div className="bg-slate-900 text-white border border-slate-800 p-4 rounded-xl flex items-center gap-3 w-fit text-sm font-mono shadow-md animate-pulse">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            SYNCHRONIZING REGIONAL DATABASE MODULATORS...
          </div>
        )}

        {/* 3. AGGREGATED STOCK TILES METRICS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2">
            <h2 className="text-xs font-mono font-black tracking-widest uppercase text-slate-500">
              Live Aggregate Storage Stocks
            </h2>
            <span className="text-xs font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">Universal Priority Standard</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[...BLOOD_TYPES].sort((a, b) => (a === "O-" ? -1 : b === "O-" ? 1 : 0)).map((type) => {
              const entry = byType[type];
              const critical = entry.units <= 2;
              const isEmpty = entry.units === 0;

              return (
                <div
                  key={type}
                  className={`bg-white p-6 rounded-2xl border-2 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${
                    isEmpty 
                      ? "border-[#D61C38] bg-red-50/10" 
                      : critical 
                      ? "border-amber-400 bg-amber-50/5" 
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">{type}</span>
                    {isEmpty ? (
                      <span className="text-[10px] font-mono font-black px-2 py-1 rounded bg-red-100 text-[#D61C38] border border-red-200">
                        EMPTY
                      </span>
                    ) : critical ? (
                      <span className="text-[10px] font-mono font-black px-2 py-1 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        CRITICAL
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-black px-2 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        STABLE
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="text-5xl font-black text-slate-900 font-mono tracking-tighter">{entry.units}</span>
                    <span className="text-slate-400 text-xs font-black font-mono tracking-wider">UNITS</span>
                  </div>

                  <div className="flex gap-1.5 flex-wrap mt-4 pt-4 border-t border-slate-100">
                    {entry.batches.slice(0, 4).map((b) => (
                      <div key={b.id} className="hover:scale-110 transition duration-150">
                        <ExpiryRing expiryDate={b.batch_expiry_date} size={30} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. HOSPITAL TRACKER DIRECTORY */}
        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 border-b-2 border-slate-200 pb-2">
            <span>🏥</span> Verified Regional Storage Nodes ({hospitals.length})
          </h2>
          
          <div className="grid gap-4">
            {hospitals.map((h) => {
              const hInventory = inventory.filter((i) => i.hospital_id === h.id);
              const total = hInventory.reduce((sum, i) => sum + i.units_available, 0);

              return (
                <div key={h.id} className="bg-white p-6 rounded-xl border-2 border-slate-200 hover:border-slate-300 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition">
                  <div className="space-y-1">
                    <h3 className="text-slate-900 font-black text-xl tracking-tight">{h.name}</h3>
                    <p className="text-slate-500 font-medium text-sm flex items-center gap-1">
                      <span>📍</span> {h.address}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                    <div className="text-left md:text-right font-mono">
                      <span className="text-2xl font-black text-slate-900">{total}</span>
                      <span className="text-slate-400 text-xs font-black ml-1">TOTAL UNITS</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <a
                        href={whatsAppLink(h.emergency_phone, `Emergency blood inquiry via BloodLink for ${h.name}.`)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono font-black px-4 py-2.5 rounded border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 transition uppercase tracking-wide"
                      >
                        WhatsApp
                      </a>
                      <a
                        href={`tel:${h.emergency_phone}`}
                        className="text-xs font-mono font-black px-4 py-2.5 rounded bg-[#D61C38] text-white hover:bg-[#b8142c] shadow-md transition uppercase tracking-wide border border-transparent"
                      >
                        Call Dispatch
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {!loading && hospitals.length === 0 && (
              <div className="text-center py-16 bg-white border-2 border-dashed border-slate-200 rounded-xl font-mono text-slate-500 text-base">
                ⚠️ No verified diagnostic node points configured in this region block yet.
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}