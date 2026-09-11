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


function InfoBox({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-black/8 bg-[#f8f7f3] px-4 py-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#11110f] text-[#f5f4f0]">
        <Icon size={15} />
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-black/35">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-medium text-[#11110f]">
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
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black/8">
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5">
      <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-white/35">
        {label}
      </p>

      <p className="mt-1 text-lg font-medium tracking-tight text-white">
        ৳{Number(value).toLocaleString()}
      </p>
    </div>
  );
}

export default function ApartmentInfo({ apartment }) {
  return (
    <div className="space-y-5">

      {/* =====================================================
          MAIN SUMMARY
      ====================================================== */}
      <section className="rounded-[30px] border border-black/8 bg-white/65 p-6 sm:p-7">

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

            <h2 className="mt-2 text-2xl font-medium tracking-[-0.04em] text-[#11110f] sm:text-3xl">
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

          <div className="hidden shrink-0 rounded-full border border-black/8 bg-[#f8f7f3] px-4 py-2 text-xs text-black/50 sm:block">
            Ready to book
          </div>

        </div>

        {/* Quick details */}
        <div className="mt-6 grid gap-2.5 sm:grid-cols-3">

          <InfoBox
            icon={FiMaximize2}
            label="Space"
            value={`${apartment.size} sq.ft.`}
          />

          <InfoBox
            icon={FiHome}
            label="Sleeping"
            value={`${apartment.beds || 1} ${
              apartment.beds === 1 ? "Bed" : "Beds"
            }`}
          />

          <InfoBox
            icon={FiUsers}
            label="Capacity"
            value={`${apartment.maxGuests || 2} Adults`}
          />

        </div>

      </section>


      {/* =====================================================
          OVERVIEW + PRICING
      ====================================================== */}
      <section className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">

        {/* Overview */}
        <div className="rounded-[30px] border border-black/8 bg-white/65 p-6 sm:p-7">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#11110f] text-[#f5f4f0]">
              <FiHome size={15} />
            </div>

            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/35">
                Overview
              </p>

              <h3 className="mt-0.5 text-lg font-medium tracking-tight text-[#11110f]">
                About this apartment
              </h3>
            </div>

          </div>

          <p className="mt-5 text-sm leading-6 text-black/55">
            {apartment.description}
          </p>

        </div>


        {/* Pricing */}
        <div className="rounded-[30px] bg-[#11110f] p-6 text-white sm:p-7">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <FiCreditCard size={15} />
            </div>

            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/35">
                Stay rates
              </p>

              <h3 className="mt-0.5 text-lg font-medium tracking-tight">
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

          <p className="mt-3 text-[10px] leading-5 text-white/30">
            Flexible stays are calculated automatically according to the
            selected duration.
          </p>

        </div>

      </section>


      {/* =====================================================
          AMENITIES
      ====================================================== */}
      <section className="rounded-[30px] border border-black/8 bg-white/65 p-6 sm:p-7">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#11110f] text-[#f5f4f0]">
            <FiWifi size={15} />
          </div>

          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/35">
              Included
            </p>

            <h3 className="mt-0.5 text-lg font-medium tracking-tight text-[#11110f]">
              Services & Amenities
            </h3>
          </div>

        </div>

        <CompactList items={apartment.amenities} />

      </section>


      {/* =====================================================
          ROOM FEATURES + BATHROOM
      ====================================================== */}
      <section className="grid gap-5 lg:grid-cols-2">

        {/* Room Features */}
        <div className="rounded-[30px] border border-black/8 bg-white/65 p-6 sm:p-7">

          <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/35">
            Inside
          </p>

          <h3 className="mt-1 text-lg font-medium tracking-tight text-[#11110f]">
            Room Features
          </h3>

          <CompactList items={apartment.roomFeatures} />

        </div>


        {/* Bathroom */}
        <div className="rounded-[30px] border border-black/8 bg-white/65 p-6 sm:p-7">

          <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/35">
            Bathroom
          </p>

          <h3 className="mt-1 text-lg font-medium tracking-tight text-[#11110f]">
            Bathroom Facilities
          </h3>

          <CompactList items={apartment.bathroom} />

        </div>

      </section>


      {/* =====================================================
          POLICIES
      ====================================================== */}
      <section className="rounded-[30px] bg-[#11110f] p-6 text-white sm:p-7">

        <div className="flex items-start gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <FiShield size={15} />
          </div>

          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/35">
              Important
            </p>

            <h3 className="mt-0.5 text-lg font-medium tracking-tight">
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
              <span className="mt-0.5 text-[9px] text-white/25">
                {String(index + 1).padStart(2, "0")}
              </span>

              <p className="text-xs leading-5 text-white/50">
                {policy}
              </p>
            </div>
          ))}

        </div>

      </section>


      {/* =====================================================
          QUICK BOOKING NOTE
      ====================================================== */}
      <div className="flex items-center gap-3 rounded-2xl border border-black/8 bg-white/50 px-5 py-4">

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