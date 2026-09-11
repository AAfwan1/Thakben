
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";

import { connectDB } from "@/lib/mongodb";
import Apartment from "@/models/apartment";

import ApartmentGallery from "@/components/apartment/ApartmentGallery";
import ApartmentInfo from "@/components/apartment/ApartmentInfo";
import BookingForm from "@/components/apartment/BookingForm";

const PROPERTY_LOCATION = "Bashundhara R/A, Dhaka";

function createSlug(size) {
  return `${size}-sqft`;
}

async function getApartment(slug) {
  await connectDB();

  const apartments = await Apartment.find({
    isActive: true,
  }).lean();

  const apartment = apartments.find(
    (item) => createSlug(item.size) === slug
  );

  if (!apartment) return null;

  const pricingTiers = (apartment.pricing || []).map((tier) => ({
    minDays: Number(tier.minDays),
    maxDays:
      tier.maxDays === null || tier.maxDays === undefined
        ? null
        : Number(tier.maxDays),
    pricePerDay: Number(tier.pricePerDay),
  }));

  return {
    ...apartment,

    _id: apartment._id.toString(),

    slug: createSlug(apartment.size),

    name: apartment.title,

    images: (apartment.images || []).map(
      (image) => image.url
    ),

    status: apartment.isAvailable
      ? "Available"
      : "Unavailable",

    pricing: {
      daily:
        apartment.pricing?.find(
          (item) => Number(item.minDays) === 1
        )?.pricePerDay || 0,

      weekly:
        (apartment.pricing?.find(
          (item) => Number(item.minDays) === 7
        )?.pricePerDay || 0) * 7,

      fifteenDays:
        (apartment.pricing?.find(
          (item) => Number(item.minDays) === 15
        )?.pricePerDay || 0) * 15,

      monthly:
        (apartment.pricing?.find(
          (item) => Number(item.minDays) === 30
        )?.pricePerDay || 0) * 30,
    },

    pricingTiers,
  };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const apartment = await getApartment(slug);

  if (!apartment) {
    return {
      title: "Apartment Not Found | Thakben",
    };
  }

  return {
    title: `${apartment.name} | Thakben Apartments`,
    description: `${apartment.name} at Thakben Apartments, ${PROPERTY_LOCATION}. View apartment details, pricing and booking information.`,
  };
}

export default async function ApartmentPage({
  params,
}) {
  const { slug } = await params;

  const apartment = await getApartment(slug);

  if (!apartment) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f5f4f0] text-[#11110f]">
      <section className="px-4 pb-10 pt-28 sm:px-6 lg:px-10 lg:pt-32">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/apartments"
            className="inline-flex items-center gap-2 text-sm text-black/50 transition hover:text-black"
          >
            <FiArrowLeft size={15} />
            Back to apartments
          </Link>

          <ApartmentGallery apartment={apartment} />
        </div>
      </section>

      <section className="px-4 pb-28 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="min-w-0">
            <ApartmentInfo apartment={apartment} />
          </div>

          <aside className="scroll-mt-28 lg:sticky lg:top-28 lg:self-start">
            <BookingForm apartment={apartment} />
          </aside>
        </div>
      </section>
    </main>
  );
}
