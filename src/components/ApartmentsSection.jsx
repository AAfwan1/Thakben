
import { connectDB } from "@/lib/mongodb";
import Apartment from "@/models/apartment";
import ApartmentCard from "./ApartmentCard";

export const dynamic = "force-dynamic";

export default async function ApartmentsSection() {
  await connectDB();

  const apartments = await Apartment.find({ isActive: true })
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
            <h2 className="text-2xl uppercase tracking-[0.15em] text-black">
              Apartments Sizes
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
              key={String(apartment._id)}
              apartment={apartment}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
