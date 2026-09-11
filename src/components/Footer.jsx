
import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Home", href: "/" },
  { label: "Apartments", href: "/#apartments" },
  { label: "Facilities", href: "/#facilities" },
  { label: "Contact", href: "/#contact" },
];

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">

        {/* Main Footer */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="text-3xl font-semibold tracking-tight"
            >
              Thakben
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/50">
              Modern apartments designed for comfortable,
              convenient and better living.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold">
              Explore
            </h3>

            <div className="mt-5 flex flex-col gap-3">
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="w-fit text-sm text-white/50 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold">
              Contact
            </h3>

            <div className="mt-5 flex flex-col gap-3 text-sm text-white/50">
              <p>Bashundhara R/A, Block C, Road 2, House 1/f, Dhaka</p>

              <a
                href="tel:+8800000000000"
                className="transition-colors hover:text-white"
              >
                +880 0000 000000
              </a>

              <a
                href="mailto:hello@thakben.com"
                className="transition-colors hover:text-white"
              >
                hello@thakben.com
              </a>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">

          <p>
            © {new Date().getFullYear()} Thakben. All rights reserved.
          </p>

          <div className="flex gap-5">
            <Link
              href="/privacy"
              className="transition-colors hover:text-white"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="transition-colors hover:text-white"
            >
              Terms
            </Link>
          </div>

        </div>

      </div>
    </footer>
  );
}
