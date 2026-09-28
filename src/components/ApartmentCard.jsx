
import Image from "next/image";
import Link from "next/link";
import {
  FiArrowUpRight,
  FiMapPin,
  FiMaximize2,
} from "react-icons/fi";

const PROPERTY_LOCATION = "Bashundhara R/A, Dhaka";

export default function ApartmentCard({ apartment }) {
  const { size, title, images, pricing, description, isAvailable } = apartment;

  const image = images?.[0]?.url;
  const slug = `${size}-sqft`;

  // Read pricing once instead of running .find() four times.
  const prices = pricing?.reduce(
    (result, item) => {
      if (item.minDays === 1) result.daily = item.pricePerDay;
      else if (item.minDays === 7) result.weekly = item.pricePerDay * 7;
      else if (item.minDays === 15) result.fifteen = item.pricePerDay * 15;
      else if (item.minDays === 30) result.monthly = item.pricePerDay * 30;

      return result;
    },
    { daily: 0, weekly: 0, fifteen: 0, monthly: 0 }
  ) ?? { daily: 0, weekly: 0, fifteen: 0, monthly: 0 };

  const { daily, weekly, fifteen, monthly } = prices;

  const href = `/apartments/${slug}`;

  return (
    <article className="group overflow-hidden rounded-[28px] border border-black/10 bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
      {/* Image */}
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={`${title} - Thakben Apartments`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-black/5" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

        <div className="absolute left-4 top-4 flex h-9 min-w-9 items-center justify-center rounded-full border border-white/20 bg-black/30 px-3 text-xs font-medium text-white backdrop-blur-xl">
          {size} sq.ft.
        </div>

        <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-xl transition-all duration-300 group-hover:bg-black/60">
          <FiArrowUpRight
            size={17}
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">
              Apartment
            </p>

            <h3 className="mt-1 text-xl font-medium tracking-tight text-white">
              {title}
            </h3>
          </div>

          <div
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-medium backdrop-blur-xl ${
              isAvailable
                ? "border-white/15 bg-black/35 text-white"
                : "border-white/10 bg-black/40 text-white/60"
            }`}
          >
            {isAvailable ? "Available" : "Unavailable"}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-black/45">
          <div className="flex items-center gap-1.5">
            <FiMapPin size={13} />
            <span>{PROPERTY_LOCATION}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <FiMaximize2 size={13} />
            <span>{size} sq.ft.</span>
          </div>
        </div>

        {description && (
          <p className="mt-4 line-clamp-2 text-sm leading-6 text-black/50">
            {description}
          </p>
        )}

        {/* Pricing */}
        <div className="mt-6 border-t border-black/10 pt-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-black/35">
                Starting from
              </p>

              <div className="mt-1">
                <span className="text-2xl font-medium tracking-tight text-black">
                  ৳{daily.toLocaleString()}
                </span>
              </div>
            </div>

            <Link
              href={href}
              className="group/button flex h-10 items-center gap-2 rounded-full bg-black px-4 text-xs font-medium text-white transition-all duration-300 hover:bg-black/80"
            >
              View Apartment

              <FiArrowUpRight
                size={14}
                className="transition-transform duration-300 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5"
              />
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <Price label="7 Days" value={weekly} />
            <Price label="15 Days" value={fifteen} />
            <Price label="30 Days" value={monthly} />
          </div>
        </div>
      </div>
    </article>
  );
}

function Price({ label, value }) {
  return (
    <div className="rounded-xl bg-black/[0.035] px-3 py-3">
      <p className="text-[9px] uppercase tracking-[0.12em] text-black/35">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-black">
        ৳{value.toLocaleString()}
      </p>
    </div>
  );
}
