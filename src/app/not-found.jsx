import Link from "next/link";
import Image from "next/image";
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiHome,
} from "react-icons/fi";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-[#080908] px-5 py-28 text-white sm:px-8 lg:px-10">

      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/hero-apartment.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-35"
        />

        <div className="absolute inset-0 bg-black/65" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/85" />
      </div>

      {/* Soft glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.04] blur-[120px]" />

      <div className="relative z-10 mx-auto w-full max-w-6xl">

        {/* Top label */}
        <div className="flex items-center justify-between">

          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-semibold backdrop-blur-xl">
              T
            </span>

            <span className="text-sm font-medium tracking-tight text-white/80">
              Thakben
            </span>
          </Link>

          <span className="hidden text-[10px] uppercase tracking-[0.3em] text-white/30 sm:block">
            Apartments
          </span>

        </div>

        {/* Main */}
        <div className="grid min-h-[65vh] items-center gap-12 lg:grid-cols-[1fr_380px]">

          {/* Left */}
          <div>

            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-white/30" />

              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/45">
                Error 404
              </p>
            </div>

            <h1 className="mt-6 text-[clamp(7rem,22vw,15rem)] font-medium leading-[0.72] tracking-[-0.09em] text-white/95">
              404
            </h1>

            <div className="mt-10 max-w-xl">
              <h2 className="text-3xl font-medium tracking-[-0.04em] sm:text-5xl">
                This place doesn't
                <br />
                <span className="text-white/35">
                  exist here.
                </span>
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/45 sm:text-base">
                The page you're looking for may have been moved,
                removed, or the address may be incorrect.
              </p>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">

              <Link
                href="/"
                className="group flex items-center justify-center gap-3 rounded-full bg-[#11110f] px-6 py-3.5 text-sm font-medium text-[#f5f4f0] ring-1 ring-white/10 transition-all duration-300 hover:bg-[#1b1b18] hover:ring-white/20 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
              >
                <FiHome size={15} />

                Back to Home

                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white">
                  <FiArrowUpRight
                    size={13}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
              </Link>

              <Link
                href="/apartments"
                className="group flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-6 py-3.5 text-sm font-medium text-white backdrop-blur-xl transition-all duration-300 hover:bg-white/10"
              >
                <FiArrowLeft
                  size={15}
                  className="transition-transform duration-300 group-hover:-translate-x-0.5"
                />

                Explore Apartments
              </Link>

            </div>

          </div>

          {/* Right glass card */}
          <div className="rounded-[30px] border border-white/10 bg-black/35 p-2 shadow-2xl backdrop-blur-2xl">

            <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.05] p-6 sm:p-7">

              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                  Thakben
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <FiArrowUpRight
                    size={15}
                    className="text-white/50"
                  />
                </span>
              </div>

              <div className="mt-10">
                <p className="text-xs uppercase tracking-[0.2em] text-white/30">
                  Looking for a place?
                </p>

                <h3 className="mt-3 text-2xl font-medium tracking-tight">
                  Find your next stay.
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/40">
                  Browse our apartments and discover a comfortable
                  place to stay in Dhaka.
                </p>
              </div>

              <Link
                href="/apartments"
                className="mt-7 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 transition hover:bg-white/10"
              >
                <span className="text-sm font-medium">
                  View apartments
                </span>

                <FiArrowUpRight
                  size={16}
                  className="text-white/50"
                />
              </Link>

              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="text-[10px] leading-5 text-white/25">
                  Thakben Apartments
                  <br />
                  Dhaka, Bangladesh
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-3 border-t border-white/10 pt-5 text-[10px] text-white/25 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Thakben. All rights reserved.
          </p>

          <p className="uppercase tracking-[0.2em]">
            Better living, thoughtfully designed.
          </p>
        </div>

      </div>
    </main>
  );
}