
import {
  FiMapPin,
  FiMaximize2,
  FiUsers,
  FiHome,
  FiWifi,
  FiShield,
  FiCheck,
  FiCalendar,
  FiCreditCard,
} from "react-icons/fi";

export const PROPERTY_LOCATION =
  "Bashundhara R/A, Block C, Road 2, House 1/f, Dhaka";

// ============================================
// APARTMENT BED & CAPACITY CUSTOMIZATION
// ============================================
// Add/change apartment sizes here.
//
// Example:
// 330: { beds: 2, adults: 4 }
//
// Any apartment size NOT listed here automatically uses:
// 1 Bed / 2 Adults
//
// Only change the numbers inside this section.
// ============================================

const APARTMENT_CAPACITY = {
  375: { beds: 2, adults: 4 },
  500: { beds: 2, adults: 4 },
  600: { beds: 2, adults: 4 },
};

// Universal fallback
const DEFAULT_CAPACITY = {
  beds: 1,
  adults: 2,
};

function getApartmentCapacity(size) {
  return APARTMENT_CAPACITY[size] || DEFAULT_CAPACITY;
}

function InfoBox({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-black/[0.08] bg-[#fafafa] px-4 py-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black text-white">
        <Icon size={15} />
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-black/35">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-medium text-black">
          {value}
        </p>
      </div>
    </div>
  );
}

function CompactList({ items = [] }) {
  return (
    <div className="mt-4 grid gap-x-5 gap-y-2.5 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item}
          className="flex items-center gap-2.5 text-sm text-black/60"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black/[0.06]">
            <FiCheck size={11} className="text-black/60" />
          </span>

          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function PriceItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-black/[0.08] bg-[#fafafa] px-4 py-3.5">
      <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-black/35">
        {label}
      </p>

      <p className="mt-1 text-lg font-medium tracking-tight text-black">
        ৳{Number(value).toLocaleString()}
      </p>
    </div>
  );
}

function SectionIcon({ icon: Icon }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black text-white">
      <Icon size={15} />
    </div>
  );
}

export default function ApartmentInfo({ apartment }) {
  const { beds, adults } = getApartmentCapacity(apartment.size);

  return (
    <div className="space-y-5">
      {/* MAIN SUMMARY */}
      <section className="rounded-[30px] border border-black/[0.08] bg-white p-6 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-black/35">
                Apartment {apartment.number}
              </span>

              <span className="h-1 w-1 rounded-full bg-black/20" />

              <span className="text-[10px] uppercase tracking-[0.18em] text-black/35">
                {apartment.status}
              </span>
            </div>

            <h2 className="mt-2 text-2xl font-medium tracking-[-0.04em] text-black sm:text-3xl">
              {apartment.name}
            </h2>

            <div className="mt-3 flex items-start gap-2 text-sm text-black/45">
              <FiMapPin
                size={14}
                className="mt-0.5 shrink-0"
              />

              <span>{PROPERTY_LOCATION}</span>
            </div>
          </div>

          <div className="hidden shrink-0 rounded-full border border-black/[0.08] bg-[#fafafa] px-4 py-2 text-xs text-black/50 sm:block">
            Ready to book
          </div>
        </div>

        <div className="mt-6 grid gap-2.5 sm:grid-cols-3">
          <InfoBox
            icon={FiMaximize2}
            label="Space"
            value={`${apartment.size} sq.ft.`}
          />

          <InfoBox
            icon={FiHome}
            label="Sleeping"
            value={`${beds} ${beds === 1 ? "Bed" : "Beds"}`}
          />

          <InfoBox
            icon={FiUsers}
            label="Capacity"
            value={`${adults} ${adults === 1 ? "Adult" : "Adults"}`}
          />
        </div>
      </section>

      {/* OVERVIEW + PRICING */}
      <section className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
        {/* OVERVIEW */}
        <div className="rounded-[30px] border border-black/[0.08] bg-white p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <SectionIcon icon={FiHome} />

            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/35">
                Overview
              </p>

              <h3 className="mt-0.5 text-lg font-medium tracking-tight text-black">
                About this apartment
              </h3>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-black/55">
            {apartment.description}
          </p>
        </div>

        {/* PRICING */}
        <div className="rounded-[30px] border border-black/[0.08] bg-white p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <SectionIcon icon={FiCreditCard} />

            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/35">
                Stay rates
              </p>

              <h3 className="mt-0.5 text-lg font-medium tracking-tight text-black">
                Pricing
              </h3>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <PriceItem
              label="1 Day"
              value={apartment.pricing.daily}
            />

            <PriceItem
              label="7 Days"
              value={apartment.pricing.weekly}
            />

            <PriceItem
              label="15 Days"
              value={apartment.pricing.fifteenDays}
            />

            <PriceItem
              label="30 Days"
              value={apartment.pricing.monthly}
            />
          </div>

          <p className="mt-3 text-[10px] leading-5 text-black/35">
            Flexible stays are calculated automatically according to
            the selected duration.
          </p>
        </div>
      </section>

      {/* AMENITIES */}
      <section className="rounded-[30px] border border-black/[0.08] bg-white p-6 sm:p-7">
        <div className="flex items-center gap-3">
          <SectionIcon icon={FiWifi} />

          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/35">
              Included
            </p>

            <h3 className="mt-0.5 text-lg font-medium tracking-tight text-black">
              Services & Amenities
            </h3>
          </div>
        </div>

        <CompactList items={apartment.amenities} />
      </section>

      {/* ROOM FEATURES + BATHROOM */}
      <section className="grid gap-5 lg:grid-cols-2">
        {/* ROOM FEATURES */}
        <div className="rounded-[30px] border border-black/[0.08] bg-white p-6 sm:p-7">
          <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/35">
            Inside
          </p>

          <h3 className="mt-1 text-lg font-medium tracking-tight text-black">
            Room Features
          </h3>

          <CompactList items={apartment.roomFeatures} />
        </div>

        {/* BATHROOM */}
        <div className="rounded-[30px] border border-black/[0.08] bg-white p-6 sm:p-7">
          <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/35">
            Bathroom
          </p>

          <h3 className="mt-1 text-lg font-medium tracking-tight text-black">
            Bathroom Facilities
          </h3>

          <CompactList items={apartment.bathroomFacilities} />
        </div>
      </section>

      {/* POLICIES */}
      <section className="rounded-[30px] border border-black/[0.08] bg-[#fafafa] p-6 sm:p-7">
        <div className="flex items-start gap-3">
          <SectionIcon icon={FiShield} />

          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/35">
              Important
            </p>

            <h3 className="mt-0.5 text-lg font-medium tracking-tight text-black">
              Booking Policies
            </h3>
          </div>
        </div>

        <div className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {apartment.policies?.map((policy, index) => (
            <div
              key={policy}
              className="flex gap-3"
            >
              <span className="mt-0.5 text-[9px] font-medium text-black/25">
                {String(index + 1).padStart(2, "0")}
              </span>

              <p className="text-xs leading-5 text-black/55">
                {policy}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* QUICK BOOKING NOTE */}
      <div className="flex items-center gap-3 rounded-2xl border border-black/[0.08] bg-white px-5 py-4">
        <FiCalendar
          size={16}
          className="shrink-0 text-black/40"
        />

        <p className="text-xs leading-5 text-black/45">
          Select your check-in and check-out dates from the booking
          panel to see the exact stay duration and total price.
        </p>
      </div>
    </div>
  );
}
