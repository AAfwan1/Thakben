"use client";

import Link from "next/link";
import { memo, useCallback, useState } from "react";
import { FiMenu, FiX, FiArrowUpRight } from "react-icons/fi";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Apartments", href: "/#apartments" },
  { label: "Facilities", href: "/#facilities" },
  { label: "Contact", href: "/#contact" },
];

const NAV_LINK_CLASS =
  "rounded-full px-4 py-2 text-[13px] font-medium text-white/60 transition-all duration-300 hover:bg-white/10 hover:text-white";

const MOBILE_LINK_CLASS =
  "flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-medium text-white/65 transition hover:bg-white/10 hover:text-white";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-5 sm:px-6">
      <nav className="mx-auto max-w-6xl">
        {/* Navbar */}
        <div
          className="
            flex h-[68px] items-center justify-between
            rounded-full border border-white/10
            bg-black/48 px-3
            shadow-[0_8px_40px_rgba(0,0,0,0.25)]
            backdrop-blur-2xl backdrop-saturate-150
          "
        >
{/* Logo */}
<Link
  href="/"
  onClick={closeMenu}
  className="group flex items-center pl-2"
>
  <img
    src="/logo.png"
    alt="Thakben"
    className="h-10 w-20 object-contain transition-opacity group-hover:opacity-85"
  />
</Link>
          {/* Desktop Navigation */}
          <div className="hidden items-center md:flex">
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={label} href={href} className={NAV_LINK_CLASS}>
                {label}
              </Link>
            ))}
          </div>

          {/* Book Button */}
          <Link
            href="/#apartments"
            className="
              group hidden items-center gap-2
              rounded-full border border-white/10
              bg-white/10 px-5 py-3
              text-[13px] font-medium text-white
              backdrop-blur-md transition-all duration-300
              hover:bg-white/20 md:flex
            "
          >
            Book Now
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
              <FiArrowUpRight
                size={13}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
          </Link>

          {/* Mobile Button */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="
              flex h-11 w-11 items-center justify-center
              rounded-full border border-white/10
              bg-white/10 text-white
              backdrop-blur-md transition
              active:scale-95 md:hidden
            "
          >
            {menuOpen ? <FiX size={19} /> : <FiMenu size={19} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`grid transition-all duration-300 md:hidden ${
            menuOpen
              ? "mt-2 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div
              className="
                rounded-[28px] border border-white/10
                bg-black/45 p-3
                shadow-[0_12px_40px_rgba(0,0,0,0.3)]
                backdrop-blur-2xl
              "
            >
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={closeMenu}
                  className={MOBILE_LINK_CLASS}
                >
                  {label}
                  <FiArrowUpRight size={15} className="text-white/30" />
                </Link>
              ))}

              <Link
                href="/#apartments"
                onClick={closeMenu}
                className="
                  mt-2 flex items-center justify-center gap-2
                  rounded-2xl border border-white/10
                  bg-white/10 px-5 py-3.5
                  text-sm font-medium text-white
                  transition hover:bg-white/20
                "
              >
                Book an Apartment
                <FiArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default memo(Navbar);