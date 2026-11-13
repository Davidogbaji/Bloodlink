"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { BLOOD_TYPES, NIGERIAN_STATES, whatsAppLink } from "../../lib/utils";
import { Select, BloodGroupPicker } from "../../components/fields";
import { writeOrQueue } from "../../lib/offlineQueue";
import { PageHeader, EmptyState } from "../../components/ui";
import { ChatIcon, CheckCircleIcon, PinIcon, UsersIcon } from "../../components/Icons";

export default function Donors() {
  const [donors, setDonors] = useState([]);
  const [state, setState] = useState("Nasarawa");
  const [typeFilter, setTypeFilter] = useState("O-");
  const [form, setForm] = useState({ full_name: "", phone: "", blood_type: "O+", state: "Nasarawa", lga: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    supabase.from("donors").select("*").eq("state", state).then(({ data }) => setDonors(data || []));
  }, [state]);

  async function register(e) {
    e.preventDefault();
    if (!form.full_name || !form.phone) return;
    await writeOrQueue({ table: "donors", type: "insert", payload: form });
    setSubmitted(true);
    setForm({ full_name: "", phone: "", blood_type: "O+", state, lga: "" });
  }

  const filtered = donors.filter((d) => d.blood_type === typeFilter && d.whatsapp_opt_in);

  return (
    <>
      <PageHeader eyebrow="Community Network" title="Donor Registry">
        Register once. When a hospital in your state runs short of your blood group, its staff can message you
        directly on WhatsApp. It is free, and there is no middleman.
      </PageHeader>

      <div className="page grid gap-8 py-10 md:py-14 lg:grid-cols-12">
        {/* Registration */}
        <section id="register" className="scroll-mt-24 lg:col-span-6" aria-labelledby="register-title">
          <div className="card p-6 sm:p-8">
            <h2 id="register-title" className="text-2xl font-semibold">
              Register as a Donor
            </h2>
            <p className="mt-2 text-sm text-muted">Takes about a minute. Fields marked * are required.</p>

            {submitted && (
              <div role="status" className="mt-5 flex items-start gap-3 rounded-xl bg-safe-bg p-4 text-sm text-safe-text">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
                <p>
                  <span className="font-semibold">Thank you, you are registered.</span> A hospital may contact you on
                  WhatsApp when your blood group is needed. You can register another person below.
                </p>
              </div>
            )}

            <form onSubmit={register} className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="full_name" className="label">
                  Full Name *
                </label>
                <input
                  id="full_name"
                  autoComplete="name"
                  placeholder="e.g. Amina Yusuf"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="phone" className="label">
                  WhatsApp Number *
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+234 801 234 5678"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input"
                  aria-describedby="phone-hint"
                  required
                />
                <p id="phone-hint" className="hint">
                  Include the country code, starting with +234.
                </p>
              </div>
              <div className="sm:col-span-2">
                <p id="blood_type_label" className="label">
                  Blood Group *
                </p>
                <BloodGroupPicker
                  id="blood_type"
                  value={form.blood_type}
                  onChange={(v) => setForm({ ...form, blood_type: v })}
                  labelledBy="blood_type_label"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="donor_state" className="label">
                  State *
                </label>
                <Select
                  id="donor_state"
                  value={form.state}
                  onChange={(v) => setForm({ ...form, state: v })}
                  options={NIGERIAN_STATES}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="lga" className="label">
                  Local Government Area <span className="font-normal text-muted">(optional)</span>
                </label>
                <input
                  id="lga"
                  placeholder="e.g. Lafia"
                  value={form.lga}
                  onChange={(e) => setForm({ ...form, lga: e.target.value })}
                  className="input"
                />
              </div>
              <p className="text-xs leading-relaxed text-muted sm:col-span-2">
                By registering, you agree that hospitals using BloodLink may contact you on WhatsApp about blood
                donation. Read our{" "}
                <Link href="/privacy" className="font-medium text-blood underline underline-offset-2">
                  Privacy Notice
                </Link>
                .
              </p>
              <button type="submit" className="btn-primary sm:col-span-2">
                Register as a Donor
              </button>
            </form>
          </div>
        </section>

        {/* Find donors */}
        <section className="lg:col-span-6" aria-labelledby="find-title">
          <div className="panel p-6 sm:p-8">
            <h2 id="find-title" className="text-2xl font-semibold">
              Find Donors
            </h2>
            <p className="mt-2 text-sm text-muted">
              For hospital staff: choose a state and blood group, then message a donor on WhatsApp.
            </p>
            <div className="mt-6 grid gap-4">
              <div>
                <label htmlFor="find_state" className="label">
                  State
                </label>
                <Select id="find_state" value={state} onChange={setState} options={NIGERIAN_STATES} />
              </div>
              <div>
                <p id="find_type_label" className="label">
                  Blood Group
                </p>
                <BloodGroupPicker id="find_type" value={typeFilter} onChange={setTypeFilter} labelledBy="find_type_label" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {filtered.map((d) => (
                <article key={d.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-medium text-ink">
                      {d.full_name}{" "}
                      <span className="ml-1 rounded-md bg-blood-bg px-1.5 py-0.5 text-xs font-semibold text-blood">
                        {d.blood_type}
                      </span>
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                      <PinIcon className="h-3.5 w-3.5" />
                      {d.lga ? `${d.lga}, ` : ""}
                      {d.state}
                    </p>
                  </div>
                  <a
                    href={whatsAppLink(
                      d.phone,
                      `Hello ${d.full_name}, this is a hospital in ${d.state} using BloodLink. We are short of ${d.blood_type} blood. Would you be able to donate today?`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-outline btn-sm"
                  >
                    <ChatIcon className="h-4 w-4 text-safe" />
                    Message on WhatsApp
                  </a>
                </article>
              ))}
              {filtered.length === 0 && (
                <EmptyState icon={UsersIcon} title={`No ${typeFilter} Donors in ${state === "FCT" ? "the FCT" : state} Yet`}>
                  As donors register, they will appear here. Share the registration link with donor groups in your
                  area.
                </EmptyState>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
