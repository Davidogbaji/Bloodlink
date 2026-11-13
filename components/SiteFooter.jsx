import Link from "next/link";
import { Logo } from "./SiteHeader";

const REPO = "https://github.com/Davidogbaji/Bloodlink";

export default function SiteFooter() {
  return (
    <footer className="bg-night text-rose">
      <div className="page grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo dark />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            A live blood-stock board for hospitals in Nasarawa State, with cold-chain warnings and WhatsApp donor
            alerts. Built in Nasarawa, ready for every state.
          </p>
        </div>

        <nav aria-label="Product" className="md:col-span-2">
          <p className="eyebrow text-amber">Product</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="hover:text-white" href="/#board">Live Board</Link></li>
            <li><Link className="hover:text-white" href="/donors">Donor Registry</Link></li>
            <li><Link className="hover:text-white" href="/dashboard">Staff Dashboard</Link></li>
          </ul>
        </nav>

        <nav aria-label="Company" className="md:col-span-2">
          <p className="eyebrow text-amber">Project</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="hover:text-white" href="/about">About</Link></li>
            <li><Link className="hover:text-white" href="/privacy">Privacy Notice</Link></li>
            <li><Link className="hover:text-white" href="/about#contact">Contact</Link></li>
          </ul>
        </nav>

        <div className="md:col-span-3">
          <p className="eyebrow text-amber">Medical Disclaimer</p>
          <p className="mt-4 text-sm leading-relaxed">
            Stock levels are reported by hospital staff and may change at any moment. Always call the hospital to
            confirm before travelling. In an emergency, go to the nearest hospital.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="page flex flex-col gap-2 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} BloodLink ColdChain. Pilot project, Nasarawa State, Nigeria.</p>
          <a className="hover:text-white" href={REPO} target="_blank" rel="noreferrer">
            Source on GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
