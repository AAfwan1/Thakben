import {
  FiCalendar,
} from "react-icons/fi";

export default function ApartmentPricing({ apartment }) {
  const pricing = apartment.pricing;

  return (
    <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-8">

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-black/35">
            Stay pricing
          </p>

          <h2 className="mt-2 text-2xl font-medium tracking-tight">
            Choose your stay
          </h2>
        </div>

        <FiCalendar
          size={21}
          className="text-black/30"
        />
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-4">
        <PriceBox
          label="1 Day"
          price={pricing.daily}
        />

        <PriceBox
          label="7 Days"
          price={pricing.weekly}
        />

        <PriceBox
          label="15 Days"
          price={pricing.fifteenDays}
        />

        <PriceBox
          label="30 Days"
          price={pricing.monthly}
        />
      </div>

      <div className="mt-6 rounded-2xl bg-black/[0.035] p-5">
        <p className="text-sm font-medium">
          Flexible stay durations
        </p>

        <p className="mt-2 text-sm leading-6 text-black/45">
          Choose any stay duration when booking. Your total price
          will be calculated according to the selected dates.
        </p>
      </div>
    </div>
  );
}

function PriceBox({ label, price }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-[#f7f6f2] p-4">
      <p className="text-[10px] uppercase tracking-[0.15em] text-black/35">
        {label}
      </p>

      <p className="mt-2 text-lg font-medium tracking-tight">
        ৳{price.toLocaleString()}
      </p>
    </div>
  );
}