import Link from "next/link";
import { PageHeader, SectionTitle } from "../../components/ui";
import { BoltIcon, ChatIcon, EyeIcon, WifiOffIcon, ArrowRightIcon } from "../../components/Icons";

export const metadata = {
  title: "About",
  description: "Why BloodLink ColdChain exists, how it works, and who is building it.",
};

const REPO = "https://github.com/Davidogbaji/Bloodlink";

const FEATURES = [
  {
    Icon: EyeIcon,
    title: "A Public, Live Stock Board",
    body: "Anyone can see which hospitals hold which blood groups, without signing in. Figures change the moment staff log an update.",
  },
  {
    Icon: BoltIcon,
    title: "Cold-Chain Warnings",
    body: "Blood must be kept between 2 °C and 6 °C. Staff log power cuts, and after four hours with no generator the dashboard warns them to move the blood.",
  },
  {
    Icon: WifiOffIcon,
    title: "Works With Patchy Signal",
    body: "Updates made without a connection are saved on the device and sent automatically when the signal returns.",
  },
  {
    Icon: ChatIcon,
    title: "One-Tap Donor Alerts",
    body: "When stock runs low, staff open a pre-written WhatsApp message to registered donors of the matching group. No SMS gateway and no cost.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About BloodLink" title="No Family Should Have to Phone Around for Blood">
        BloodLink ColdChain gives hospitals in Nasarawa State one shared, live view of their blood stock, so patients
        and families stop searching hospital by hospital.
      </PageHeader>

      <section className="py-16 md:py-20">
        <div className="page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionTitle eyebrow="The Problem" title="Blood Is Scarce, It Can Spoil, and Nobody Can See Where It Is" />
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-muted lg:col-span-7">
            <p>
              Nigeria collects only about one in four of the blood units it needs each year, and most donations still
              come from family members or paid donors rather than volunteers.
            </p>
            <p>
              In Nasarawa State, we found no tool that shows which hospital holds which blood group. When a patient
              needs blood urgently, families call or travel from one hospital to the next. Meanwhile, frequent power
              cuts put refrigerated blood at risk of spoiling.
            </p>
            <p>BloodLink brings those pieces together in one simple, free tool built for local conditions.</p>
          </div>
        </div>
      </section>

      <section className="bg-mist py-16 md:py-20">
        <div className="page">
          <SectionTitle eyebrow="What It Does" title="Built for How Hospitals Here Really Work" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {FEATURES.map(({ Icon, title, body }) => (
              <article key={title} className="card flex gap-5 p-6 sm:p-7">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blood text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="page grid gap-10 lg:grid-cols-2">
          <div className="card p-7 sm:p-9">
            <p className="eyebrow text-blood">Project Status</p>
            <h2 className="mt-3 text-2xl font-semibold">A Pilot in Nasarawa State</h2>
            <p className="mt-3 leading-relaxed text-muted">
              BloodLink is preparing a 12-month pilot with three Nasarawa facilities. The software already supports
              every Nigerian state, so what works here can grow state by state. Figures on this site are entered by
              hospital staff and should always be confirmed by phone.
            </p>
          </div>
          <div id="contact" className="scroll-mt-24 rounded-2xl bg-night p-7 text-rose sm:p-9">
            <p className="eyebrow text-amber">Contact</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Built by Icha David Ogbaji</h2>
            <p className="mt-3 leading-relaxed">
              Hospitals, donor groups and partners who would like to join the pilot, or anyone with a question or a
              data request, can reach the project team through the project&apos;s GitHub page.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href={REPO} target="_blank" rel="noreferrer" className="btn bg-white text-night hover:bg-rose">
                Contact the Team
                <ArrowRightIcon className="h-4 w-4" />
              </a>
              <Link href="/privacy" className="btn-on-dark">
                Privacy Notice
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
