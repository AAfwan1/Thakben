import { connectDB } from "@/lib/mongodb";
import Apartment from "@/models/apartment";
import ApartmentCard from "./ApartmentCard";

export const dynamic = "force-dynamic";

export default async function ApartmentsSection() {
  await connectDB();

  const apartments = await Apartment.find({
    isActive: true,
  })
    .sort({ size: 1 })
    .lean();

  return (
    <section
      id="apartments"
      className="bg-[#f5f4f0] px-6 py-24 sm:px-8 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-col gap-6 border-b border-black/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-black/40">
              Apartments
            </p>

            <h2 className="mt-3 max-w-2xl text-4xl font-medium tracking-[-0.04em] text-black sm:text-5xl">
              Find a place that
              <br />
              feels like home.
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-6 text-black/50">
            Explore our available apartments and view the details of each
            individual space.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {apartments.map((apartment) => (
            <ApartmentCard
              key={apartment._id.toString()}
              apartment={apartment}
            />
          ))}
        </div>

      </div>
    </section>
  );
}