
"use client";

import {
  FiArrowUpRight,
  FiMapPin,
  FiNavigation,
  FiPhone,
} from "react-icons/fi";

const PROPERTY = {
  name: "Thakben Apartments",
  address: "Bashundhara R/A, Block C, Road 2, House 1/f, Dhaka",
  phone: "+880 1678-090900",
  mapUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d228.12166036522856!2d90.4272222414014!3d23.82049906981321!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c648bee93953%3A0xb2b0e9ada4df27bd!2sMaati%20Properties%20Ltd.!5e0!3m2!1sen!2sbd!4v1790784248412!5m2!1sen!2sbd",
  directionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=Maati+Properties+Ltd.%2C+Bashundhara+R%2FA%2C+Dhaka%2C+Bangladesh",
};

export default function MapSection() {
  return (
    <section className="bg-[#f5f4f0] px-6 py-20 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-black/40">
              Location
            </p>

            <h2 className="mt-3 text-4xl font-medium tracking-[-0.04em] text-black sm:text-5xl">
              Find us easily.
            </h2>
          </div>

          <p className="max-w-md text-sm leading-6 text-black/50">
            Visit Thakben Apartments and discover a comfortable place
            designed for everyday living.
          </p>
        </div>

        {/* Map */}
        <div className="relative overflow-hidden rounded-[32px] border border-black/10 bg-black">
          <div className="h-[420px] sm:h-[500px] lg:h-[560px]">
            <iframe
              title="Thakben Apartments location"
              src={PROPERTY.mapUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full border-0"
            />
          </div>

          {/* Location Card */}
          <div
            className="
              absolute bottom-4 left-4 right-4
              rounded-[24px] border border-white/15
              bg-black/70 p-5 text-white
              shadow-[0_15px_50px_rgba(0,0,0,0.3)]
              backdrop-blur-2xl
              sm:bottom-6 sm:left-6 sm:right-auto sm:w-[390px]
            "
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10">
                <FiMapPin size={18} />
              </div>

              <div>
                <p className="text-lg font-medium">{PROPERTY.name}</p>
                <p className="mt-1 text-sm text-white/50">
                  {PROPERTY.address}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-5">
              <FiPhone size={15} className="shrink-0 text-white/40" />
              <span className="text-sm text-white/65">{PROPERTY.phone}</span>
            </div>

            <a
              href={PROPERTY.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                group mt-5 flex items-center justify-between
                rounded-full border border-white/10
                bg-white/10 px-4 py-3
                text-sm font-medium text-white
                transition hover:bg-white/15
              "
            >
              <span className="flex items-center gap-2">
                <FiNavigation size={15} />
                Get Directions
              </span>

              <FiArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
