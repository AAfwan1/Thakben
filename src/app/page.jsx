
import ApartmentsSection from "@/components/ApartmentsSection";
import ContactSection from "@/components/ContactSection";
import FacilitiesSection from "@/components/FacilitiesSection";

import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main>
      <Hero />
      <ApartmentsSection/>
      <FacilitiesSection/>
      <ContactSection/>
    </main>
  );
}

