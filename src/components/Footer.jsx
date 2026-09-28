
import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Home", href: "/" },
  { label: "Apartments", href: "/#apartments" },
  { label: "Facilities", href: "/#facilities" },
  { label: "Contact", href: "/#contact" },
];

const CONTACT = {
  address: "Bashundhara R/A, Block C, Road 2, House 1/f, Dhaka",
  phone: "+880 0000 000000",
  email: "hello@thakben.com",
};

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
            <h3 className="text-sm font-semibold">Explore</h3>

            <nav className="mt-5 flex flex-col gap-3">
              {FOOTER_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="w-fit text-sm text-white/50 transition-colors hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold">Contact</h3>

            <div className="mt-5 flex flex-col gap-3 text-sm text-white/50">
              <p>{CONTACT.address}</p>

              <a
                href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
                className="transition-colors hover:text-white"
              >
                {CONTACT.phone}
              </a>

              <a
                href={`mailto:${CONTACT.email}`}
                className="transition-colors hover:text-white"
              >
                {CONTACT.email}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Thakben. All rights reserved.</p>

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
