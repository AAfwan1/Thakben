"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FiCalendar,
  FiClock,
  FiHome,
  FiMenu,
  FiLogOut,
  FiX,
  FiArrowUpRight,
} from "react-icons/fi";

const ADMIN_LINKS = [
  { label: "Dashboard", href: "/admin", icon: FiHome },
  { label: "Apartments", href: "/admin/apartments", icon: FiHome },
  { label: "Bookings", href: "/admin/bookings", icon: FiCalendar },
  { label: "Availability", href: "/admin/availability", icon: FiClock },
  { label: "Logout", href: "/admin/logout", icon: FiLogOut },
];

const NAV_LINK =
  "group flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium text-white/55 transition-all duration-300 hover:bg-white/[0.07] hover:text-white";

const MOBILE_LINK =
  "group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium text-white/55 transition-all duration-300 hover:bg-white/[0.07] hover:text-white";

export default function AdminNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <nav className="mx-auto max-w-7xl">
        <div className="flex h-[68px] items-center justify-between rounded-full border border-black/[0.08] bg-black/60 px-3 shadow-[0_18px_60px_rgba(0,0,0,0.20)] backdrop-blur-2xl">
         {/* Logo */}
<Link
  href="/"
  className="group flex items-center pl-2"
>
  <img
    src="/logo/logo.png"
    alt="Thakben"
    className="h-10 w-20 object-contain transition-opacity group-hover:opacity-85"
  />
</Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 md:flex">
            {ADMIN_LINKS.map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href} className={NAV_LINK}>
                <Icon
                  size={14}
                  className="text-white/35 transition-colors duration-300 group-hover:text-white/70"
                />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="group hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-xs font-medium text-white/55 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.09] hover:text-white sm:flex"
            >
              View Website
              <FiArrowUpRight
                size={13}
                className="text-white/30 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close admin menu" : "Open admin menu"}
              aria-expanded={menuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/75 transition-all duration-300 hover:bg-white/[0.1] hover:text-white active:scale-95 md:hidden"
            >
              {menuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`grid transition-all duration-300 md:hidden ${
            menuOpen
              ? "mt-2 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="rounded-[26px] border border-white/[0.08] bg-[#171714]/97 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
              <div className="space-y-1">
                {ADMIN_LINKS.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={MOBILE_LINK}
                  >
                    <Icon
                      size={15}
                      className="text-white/35 transition-colors duration-300 group-hover:text-white/70"
                    />
                    {label}
                  </Link>
                ))}
              </div>

              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="group mt-2 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-sm font-medium text-white/60 transition-all duration-300 hover:bg-white/[0.09] hover:text-white"
              >
                View Website
                <FiArrowUpRight
                  size={14}
                  className="text-white/30 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}