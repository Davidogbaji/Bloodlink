"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DropFilled, MenuIcon, CloseIcon } from "./Icons";

const NAV = [
  { href: "/#board", label: "Live Board" },
  { href: "/donors", label: "Donor Registry" },
  { href: "/dashboard", label: "Staff Dashboard" },
  { href: "/about", label: "About" },
];

export function Logo({ dark = false }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="BloodLink ColdChain home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blood text-white">
        <DropFilled className="h-5 w-5" />
      </span>
      <span className="leading-tight">
        <span className={`block font-display text-lg font-semibold ${dark ? "text-white" : "text-ink"}`}>BloodLink</span>
        <span className={`block text-[11px] font-semibold uppercase tracking-[0.18em] ${dark ? "text-rose" : "text-muted"}`}>
          ColdChain
        </span>
      </span>
    </Link>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href) => {
    const path = href.split("#")[0] || "/";
    return path === "/" ? false : pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="page flex h-16 items-center justify-between gap-6">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(item.href) ? "bg-mist text-ink" : "text-muted hover:bg-mist hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/donors#register" className="btn-primary btn-sm ml-2">
            Register as a Donor
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-mist md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-line bg-white md:hidden">
          <div className="page flex flex-col gap-1 py-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-ink hover:bg-mist"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/donors#register" onClick={() => setOpen(false)} className="btn-primary mt-2">
              Register as a Donor
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
