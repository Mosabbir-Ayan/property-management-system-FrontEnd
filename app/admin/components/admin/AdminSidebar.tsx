"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_MENU = [
  { href: "/admin", label: "Overview", icon: "→" },
  { href: "/admin/properties", label: "Properties", icon: "→" },
  { href: "/admin/blocks", label: "Blocks", icon: "→" },
  { href: "/admin/buildings", label: "Buildings", icon: "→" },
  { href: "/admin/landlords", label: "Landlords", icon: "→" },
  { href: "/admin/tenants", label: "Tenants", icon: "→" },
  { href: "/admin/staff", label: "Staff", icon: "→" },
  { href: "/admin/admins", label: "Admin", icon: "→"},
  { href: "/admin/complaints", label: "Complaints", icon: "→" },
  { href: "/admin/announcements", label: "Announcements", icon: "→" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col bg-admin-dark text-white">

      <div className="px-6 py-6">
        <p className="text-[11px] tracking-[0.2em] text-admin-muted">
          PROPERTY MANAGEMENT SYSTEM
        </p>
        <p className="mt-1 text-xl font-bold">
          Dwellix <span className="text-dwellix-500">Admin</span>
        </p>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 overflow-y-auto px-3">
        <ul className="flex w-full flex-col gap-1">
          {ADMIN_MENU.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={
                    active
                      ? "flex items-center gap-3 rounded-md bg-dwellix-500 px-3 py-2 text-sm font-semibold text-white"
                      : "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-admin-muted hover:bg-admin-dark-2 hover:text-white"
                  }
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-3 pb-6">
        <ul className="flex w-full flex-col">
          <li>
            <Link
              href="/"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-admin-muted hover:bg-admin-dark-2 hover:text-white"
            >
              <span>↪</span> Back to site
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}