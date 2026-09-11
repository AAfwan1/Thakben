"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const FACILITIES = [
  {
    number: "01",
    title: "Swimming Pool",
    description: "Relax and unwind.",
    image: "/facilities/pool.jpg",
  },
  {
    number: "02",
    title: "Gym",
    description: "Stay active every day.",
    image: "/facilities/gym.jpg",
  },
  {
    number: "03",
    title: "Parking",
    description: "Convenient and accessible.",
    image: "/facilities/parking.jpg",
  },
  {
    number: "04",
    title: "Living Spaces",
    description: "Designed for comfort.",
    image: "/facilities/living.jpg",
  },
];

export default function FacilitiesSection() {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const closePopup = () => {
    setSelectedIndex(null);
  };

  const showPrevious = () => {
    setSelectedIndex((current) =>
      current === 0 ? FACILITIES.length - 1 : current - 1
    );
  };

  const showNext = () => {
    setSelectedIndex((current) =>
      current === FACILITIES.length - 1 ? 0 : current + 1
    );
  };

  // Keyboard controls
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closePopup();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedIndex]);

  const selectedFacility =
    selectedIndex !== null ? FACILITIES[selectedIndex] : null;

  return (
    <>
      <section className="bg-[#11110f] px-5 py-16 text-white sm:px-8 sm:py-20 lg:px-10" id="facilities">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-white/30" />

                <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/45">
                  Facilities
                </p>
              </div>

              <h2 className="mt-4 max-w-xl text-3xl font-medium tracking-[-0.045em] sm:text-4xl lg:text-5xl">
                Everything you need,
                <br />
                <span className="text-white/40">
                  within reach.
                </span>
              </h2>
            </div>

            <p className="max-w-xs text-xs leading-6 text-white/40 sm:text-sm">
              Thoughtfully selected facilities for a more comfortable
              everyday experience.
            </p>
          </div>

          {/* Facility Cards */}
          <div className="mt-9 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {FACILITIES.map((facility, index) => (
              <button
                key={facility.number}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`group relative overflow-hidden rounded-[22px] border border-white/10 text-left outline-none transition-transform duration-500 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-white/40 ${
                  index === 1 || index === 3
                    ? "lg:translate-y-5"
                    : ""
                }`}
              >
                <div className="relative aspect-[0.82] overflow-hidden">
                  <Image
                    src={facility.image}
                    alt={`${facility.title} at Thakben Apartments`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />

                  {/* Dark gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/5" />

                  {/* Number */}
                  <div className="absolute left-4 top-4">
                    <span className="text-[10px] font-medium tracking-[0.15em] text-white/60">
                      {facility.number}
                    </span>
                  </div>

                  {/* Click hint */}
                  <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white/70 opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100">
                    <span className="text-sm">+</span>
                  </div>

                  {/* Text */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                    <h3 className="text-base font-medium tracking-tight text-white sm:text-lg">
                      {facility.title}
                    </h3>

                    <p className="mt-1 text-[10px] text-white/45 sm:text-xs">
                      {facility.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Bottom line */}
          <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
              Thakben Apartments
            </p>

            <p className="text-[10px] text-white/25">
              04 Facilities
            </p>
          </div>
        </div>
      </section>

      {/* =========================
          IMAGE POPUP / LIGHTBOX
      ========================= */}
      {selectedFacility && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl sm:p-8"
          onClick={closePopup}
        >
          {/* Close */}
          <button
            type="button"
            onClick={closePopup}
            aria-label="Close image"
            className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-xl transition hover:bg-white/20"
          >
            <FiX size={21} />
          </button>

          {/* Previous */}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showPrevious();
            }}
            aria-label="Previous image"
            className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-xl transition hover:bg-white/20 sm:left-8"
          >
            <FiChevronLeft size={22} />
          </button>

          {/* Next */}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            aria-label="Next image"
            className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-xl transition hover:bg-white/20 sm:right-8"
          >
            <FiChevronRight size={22} />
          </button>

          {/* Image */}
          <div
            className="relative flex max-h-[90vh] max-w-[92vw] flex-col items-center"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative h-[65vh] w-[88vw] overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-2xl sm:h-[75vh] sm:w-[80vw] lg:w-[75vw]">
              <Image
                src={selectedFacility.image}
                alt={selectedFacility.title}
                fill
                sizes="90vw"
                className="object-contain"
                priority
              />
            </div>

            {/* Caption */}
            <div className="mt-4 text-center">
              <p className="text-lg font-medium text-white">
                {selectedFacility.title}
              </p>

              <p className="mt-1 text-xs text-white/40">
                {selectedIndex + 1} / {FACILITIES.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}