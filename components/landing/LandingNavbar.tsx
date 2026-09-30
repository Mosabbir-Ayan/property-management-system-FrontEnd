"use client";

import Link from "next/link";

const NAV_LINKS = [
  { href: "#platform", label: "Platform" },
  { href: "#features", label: "Features" },
  { href: "#roles", label: "Roles" },
  { href: "#how", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

const btnOutline = "inline-flex items-center justify-center rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10";
const btnPrimary = "inline-flex items-center justify-center rounded-lg bg-dwellix-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-dwellix-600";

export default function LandingNavbar() {

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#252524] text-white">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">

        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-dwellix-500 font-bold">
            D
          </span>
          <span className="text-xl font-bold tracking-tight">Dwellix</span>
        </div>

        <div className="hidden items-center gap-7 text-[13px] text-gray-300 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-white">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className={btnOutline}>
            Member Login
          </Link>
          <Link href="/login" className={btnPrimary}>
            Get Started
          </Link>
        </div>

      </nav>

    </header>
  );
}
