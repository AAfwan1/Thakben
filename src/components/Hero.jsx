import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";

const PROPERTY = {
  name: "Thakben Apartments",
  location: "Bashundhara R/A, Block C, Road 2, House 1/f, Dhaka",
  area: "250 to 600 sq ft",
  facilities: ["The Checkpoint"],
  phone: "+880 1678-090900",
};

const PHONE_LINK = `tel:${PROPERTY.phone.replace(/\s/g, "")}`;

const HERO_VIDEO_URL =
  "https://res.cloudinary.com/qds5td8c/video/upload/f_auto,q_auto/v1/thakben/maati-properties-real-estate-tour?_a=BAMAROWO0";

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative min-h-screen overflow-hidden bg-[#11110f] text-[#f1f0eb]"
    >
      {/* Background Video */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
          disableRemotePlayback
        >
          <source src={HERO_VIDEO_URL} type="video/mp4" />
        </video>
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />

      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-end px-6 pb-8 pt-32 sm:px-8 lg:px-10 lg:pb-10">
        <div className="w-full">
          {/* Heading */}
          <div className="max-w-4xl">
            <h1
              id="hero-heading"
              className="text-5xl font-medium leading-[0.95] tracking-[-0.045em] sm:text-6xl md:text-7xl lg:text-[86px]"
            >
              Thakben
              <br />
              <span className="text-white/55">Studio Apartments.</span>
            </h1>

            <p className="mt-7 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
              Discover modern apartments designed around comfort,
              convenience, and everyday living in Dhaka.
            </p>
          </div>

          {/* Information Cards */}
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {/* Area */}
            <div className="rounded-2xl border border-white/15 bg-black/30 p-5 backdrop-blur-xl">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
                Apartment Size
              </p>

              <p className="mt-2 text-2xl font-medium tracking-tight text-white sm:text-3xl">
                {PROPERTY.area}
              </p>
            </div>

            {/* Facilities */}
            <div className="rounded-2xl border border-white/15 bg-black/30 p-5 backdrop-blur-xl">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
                Facilities
              </p>

              <div className="mt-3">
                <a
                  href="/#facilities"
                  className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xl text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  {PROPERTY.facilities[0]}
                </a>
              </div>
            </div>

            {/* Contact & Location */}
            <div className="rounded-2xl border border-white/15 bg-black/30 p-5 backdrop-blur-xl">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
                Contact & Location
              </p>

              <a
                href={PHONE_LINK}
                className="mt-2 block text-xl font-medium tracking-tight text-white transition hover:text-white/80 sm:text-2xl"
              >
                {PROPERTY.phone}
              </a>

              <p className="mt-2 text-sm text-white/50">
                {PROPERTY.location}
              </p>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-6 flex flex-col gap-5 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/#apartments"
              className="group flex w-fit items-center gap-3 rounded-full border border-white/20 bg-black/35 px-5 py-3 text-sm font-medium text-white/85 backdrop-blur-xl transition hover:bg-black/50 hover:text-white"
            >
              Explore Apartments

              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                <FiArrowUpRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}