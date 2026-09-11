
import Image from "next/image";
import Link from "next/link";
import {
  FiArrowUpRight,
  FiMapPin,
  FiPhone,
} from "react-icons/fi";

const PROPERTY = {
  name: "Thakben Apartments",
  location: "Bashundhara R/A, Block C, Road 2, House 1/f, Dhaka",
  area: "250–600 sq ft",
  facilities: [
    "Swimming Pool",
    "Gym",
    "Parking",
  ],
  phone: "+880 0000 000000",
};

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative min-h-screen overflow-hidden bg-[#11110f] text-[#f1f0eb]"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/hero-apartment.jpg"
          alt="Thakben Apartments in Dhaka, Bangladesh"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Left Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />

      {/* Bottom Gradient */}
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-end px-6 pb-8 pt-32 sm:px-8 lg:px-10 lg:pb-10">
        <div className="w-full">

          {/* Location */}
          <div className="mb-6 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/25 backdrop-blur-md">
              <FiMapPin size={14} />
            </span>

            <div>
              <p className="text-[9px] uppercase tracking-[0.25em] text-white/40">
                Location
              </p>

              <p className="mt-0.5 text-sm font-medium text-white/80">
                {PROPERTY.location}
              </p>
            </div>
          </div>

          {/* Main Heading */}
          <div className="max-w-4xl">

            <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-white/40">
              {PROPERTY.name}
            </p>

            <h1
              id="hero-heading"
              className="text-5xl font-medium leading-[0.95] tracking-[-0.045em] sm:text-6xl md:text-7xl lg:text-[86px]"
            >
              A comfortable place
              <br />
              <span className="text-white/55">
                to call home.
              </span>
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

              <p className="mt-1 text-xs text-white/40">
                available spaces
              </p>
            </div>

            {/* Facilities */}
            <div className="rounded-2xl border border-white/15 bg-black/30 p-5 backdrop-blur-xl">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
                Facilities
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {PROPERTY.facilities.map((facility) => (
                  <span
                    key={facility}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75"
                  >
                    {facility}
                  </span>
                ))}
              </div>
            </div>

            {/* Availability */}

<div className="rounded-2xl border border-white/15 bg-black/30 p-5 backdrop-blur-xl">
  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
    Contact & Location
  </p>

  <p className="mt-2 text-xl font-medium tracking-tight text-white sm:text-2xl">
    +880 0000 000000
  </p>

  <p className="mt-2 text-sm text-white/50">
    Bashundhara R/A, Block C, Road 2, House 1/f, Dhaka
  </p>
</div>



          </div>

          {/* Bottom Row */}
          <div className="mt-6 flex flex-col gap-5 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">

            {/* Phone */}
            <a
              href={`tel:${PROPERTY.phone.replace(/\s/g, "")}`}
              className="group flex w-fit items-center gap-3"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/25 backdrop-blur-md">
                <FiPhone size={14} />
              </span>

              <span>
                <span className="block text-[9px] uppercase tracking-[0.2em] text-white/35">
                  Contact
                </span>

                <span className="mt-0.5 block text-sm text-white/75 transition group-hover:text-white">
                  {PROPERTY.phone}
                </span>
              </span>
            </a>

            {/* CTA */}
            <Link
              href="/apartments"
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
