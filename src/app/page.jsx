import ApartmentsSection from "@/components/ApartmentsSection";
import ContactSection from "@/components/ContactSection";
import FacilitiesSection from "@/components/FacilitiesSection";
import Hero from "@/components/Hero";

export const metadata = {
  metadataBase: new URL("https://www.thakben.com"),

  title: "Thakben",
  description: "Thakben Apartment",

  openGraph: {
    title: "Thakben",
    description: "Thakben Apartment",
    type: "website",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Thakben",
      },
    ],
  },

  twitter: {
    card: "summary",
    title: "Thakben",
    description: "Thakben Apartment",
    images: ["/icon.png"],
  },
};

export default function Home() {
  return (
    <main>
      <Hero />
      <ApartmentsSection />
      <FacilitiesSection />
      <ContactSection />
    </main>
  );
}