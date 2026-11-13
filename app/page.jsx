"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { NIGERIAN_STATES, BLOOD_TYPES, whatsAppLink } from "../lib/utils";
import { StockBadge, EmptyState, SectionTitle, stockLevel } from "../components/ui";
import { Select } from "../components/fields";
import { BloodGrid, BloodGridSkeleton } from "../components/BloodGrid";
import {
  ArrowRightIcon,
  ChatIcon,
  DropIcon,
  EyeIcon,
  HospitalIcon,
  PhoneIcon,
  PinIcon,
  ThermometerIcon,
  WifiOffIcon,
} from "../components/Icons";

// O-negative first: it is the universal red-cell donor group and the one
// staff look for first in an emergency.
const ORDERED_TYPES = [...BLOOD_TYPES].sort((a, b) => (a === "O-" ? -1 : b === "O-" ? 1 : 0));

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

  const totalUnits = inventory.reduce((sum, i) => sum + i.units_available, 0);
  const shortGroups = BLOOD_TYPES.filter((t) => stockLevel(byType[t].units) !== "in").length;
  const hasStock = inventory.length > 0;
  // "Nasarawa State", but "the FCT" rather than "FCT State".
  const place = state === "FCT" ? "the FCT" : `${state} State`;
  const placeShort = state === "FCT" ? "the FCT" : state;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-night text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full border border-white/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-[26rem] w-[26rem] rounded-full border border-blood/40"
        />
        <div className="page relative grid gap-12 py-16 md:py-24 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <p className="eyebrow inline-flex items-center gap-2 text-amber">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber" />
              </span>
              Live Blood Stock · {place}
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.08] text-white sm:text-5xl lg:text-6xl">
              See Every Hospital&apos;s Blood Stock in {placeShort}, Live
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-rose">
              BloodLink ColdChain shows which hospitals hold which blood groups, warns staff when a power cut puts
              stored blood at risk, and lets hospitals reach matching donors on WhatsApp in one tap.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#board" className="btn-primary px-6 py-3.5 text-base">
                View the Live Board
                <ArrowRightIcon className="h-4 w-4" />
              </a>
              <Link href="/donors#register" className="btn-on-dark px-6 py-3.5 text-base">
                Register as a Donor
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-white/10 bg-plum p-6 sm:p-8">
              <p className="eyebrow text-amber">Right Now in {placeShort}</p>
              <dl className="mt-6 grid grid-cols-3 gap-4">
                {[
                  ["Hospitals Listed", hospitals.length],
                  ["Units in Stock", totalUnits],
                  ["Groups Short", hasStock ? shortGroups : "—"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs leading-snug text-rose">{label}</dt>
                    <dd className="mt-2 font-display text-4xl font-semibold tabular-nums text-white">
                      {loading ? <span className="skeleton inline-block h-9 w-12 bg-white/15" /> : value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 border-t border-white/10 pt-5 text-sm leading-relaxed text-rose">
                Figures update the moment hospital staff log a change. No sign-in is needed to view them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live board ───────────────────────────────────────────────────── */}
      <section id="board" className="scroll-mt-20 py-16 md:py-20">
        <div className="page">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionTitle eyebrow="Live Board" title={`Blood Stock in ${place}`}>
              Total units by blood group across every listed hospital. Rings show the shelf life left on each batch.
            </SectionTitle>
            <div className="w-full md:w-64">
              <label htmlFor="state" className="label">
                State
              </label>
              <Select id="state" value={state} onChange={setState} options={NIGERIAN_STATES} />
            </div>
          </div>

          <div className="mt-10" aria-live="polite" aria-busy={loading}>
            {loading ? (
              <BloodGridSkeleton count={ORDERED_TYPES.length} />
            ) : hasStock ? (
              <BloodGrid types={ORDERED_TYPES} byType={byType} />
            ) : (
              <EmptyState
                icon={DropIcon}
                title={`No Stock Reported Yet for ${placeShort}`}
                action={
                  <Link href="/dashboard" className="btn-outline">
                    Open the Staff Dashboard
                  </Link>
                }
              >
                Hospitals appear here once their staff log a first batch. If you need blood now, call the hospitals
                listed below.
              </EmptyState>
            )}
          </div>

          {/* Hospitals */}
          <div className="mt-16">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-2xl font-semibold">Hospitals in {placeShort}</h3>
              {!loading && hospitals.length > 0 && (
                <p className="text-sm text-muted">
                  {hospitals.length} {hospitals.length === 1 ? "hospital" : "hospitals"}
                </p>
              )}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {loading &&
                [0, 1].map((i) => (
                  <div key={i} className="card p-5">
                    <div className="skeleton h-5 w-2/3" />
                    <div className="skeleton mt-3 h-4 w-1/2" />
                    <div className="skeleton mt-6 h-9 w-40" />
                  </div>
                ))}

              {!loading &&
                hospitals.map((h) => {
                  const total = inventory
                    .filter((i) => i.hospital_id === h.id)
                    .reduce((sum, i) => sum + i.units_available, 0);
                  return (
                    <article key={h.id} className="card flex flex-col justify-between gap-5 p-5 sm:p-6">
                      <div className="flex items-start gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mist text-burgundy">
                          <HospitalIcon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-display text-lg font-semibold leading-snug">{h.name}</h4>
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                            <PinIcon className="h-4 w-4 shrink-0" />
                            {h.address}
                          </p>
                          <div className="mt-3 sm:hidden">
                            <StockBadge units={total} />
                          </div>
                        </div>
                        <div className="hidden shrink-0 sm:block">
                          <StockBadge units={total} />
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                        <p className="text-sm text-muted">
                          <span className="font-semibold tabular-nums text-ink">{total}</span>{" "}
                          {total === 1 ? "unit" : "units"} in stock
                        </p>
                        <div className="flex gap-2">
                          <a
                            href={whatsAppLink(h.emergency_phone, `Emergency blood inquiry via BloodLink for ${h.name}.`)}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-outline btn-sm"
                          >
                            <ChatIcon className="h-4 w-4 text-safe" />
                            WhatsApp
                          </a>
                          <a href={`tel:${h.emergency_phone}`} className="btn-primary btn-sm">
                            <PhoneIcon className="h-4 w-4" />
                            Call
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
            </div>

            {!loading && hospitals.length === 0 && (
              <EmptyState icon={HospitalIcon} title={`No Hospitals Listed in ${placeShort} Yet`}>
                BloodLink is piloting in Nasarawa State first. Other states will appear as their hospitals join.
              </EmptyState>
            )}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="bg-mist py-16 md:py-20">
        <div className="page">
          <SectionTitle eyebrow="How It Works" title="See. Save. Call.">
            Three simple tools that fit how hospitals in Nasarawa actually work: frequent power cuts, patchy signal
            and WhatsApp on almost every phone.
          </SectionTitle>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                Icon: EyeIcon,
                title: "See",
                body: "Every hospital's stock on one public page, updated live. No sign-in and no phone chain.",
              },
              {
                Icon: ThermometerIcon,
                title: "Save",
                body: "Each batch has an expiry countdown. After four hours without power or a generator, staff are warned to move the blood.",
              },
              {
                Icon: ChatIcon,
                title: "Call",
                body: "When stock runs low, one tap opens a WhatsApp message to registered donors of the matching blood group.",
              },
            ].map(({ Icon, title, body }) => (
              <article key={title} className="card p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blood text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-2xl font-semibold">{title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{body}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 flex items-center gap-2 text-sm text-muted">
            <WifiOffIcon className="h-4 w-4 shrink-0" />
            No signal? Updates are saved on the device and sent automatically when the connection returns.
          </p>
        </div>
      </section>

      {/* ── Donor call to action ─────────────────────────────────────────── */}
      <section className="bg-burgundy">
        <div className="page grid gap-8 py-16 md:grid-cols-12 md:items-center md:py-20">
          <div className="md:col-span-8">
            <SectionTitle tone="dark" eyebrow="For Donors" title="Your Blood Group Could Be the One a Hospital Needs Tonight">
              Register once with your blood group and WhatsApp number. When a hospital in your state runs short of your
              group, its staff can message you directly. It is free, and there is no middleman.
            </SectionTitle>
          </div>
          <div className="flex flex-col gap-3 md:col-span-4 md:items-end">
            <Link href="/donors#register" className="btn bg-white px-6 py-3.5 text-base text-burgundy hover:bg-rose">
              Register as a Donor
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <p className="text-xs text-rose">Takes about a minute. You can ask us to remove your details at any time.</p>
          </div>
        </div>
      </section>
    </>
  );
}
