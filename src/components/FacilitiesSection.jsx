
"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import {
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiArrowUpRight,
} from "react-icons/fi";

import { gallerySections } from "@/data/facilityImages";

const GALLERY = gallerySections?.[0]?.routes || [];

const FACILITIES = [
  {
    name: "Swimming Pool",
    folder: "swimming-pool",
    description:
      "A clean and relaxing swimming pool designed for guests to enjoy.",
  },
  {
    name: "Gym & Steam Bath",
    folder: "gym&steamBath",
    description:
      "A modern fitness space with facilities for your everyday workout and relaxation.",
  },
  {
    name: "Movie Theater",
    folder: "Movie-Theater",
    description:
      "Enjoy movies and entertainment in a comfortable private theater.",
  },
  {
    name: "Playground",
    folder: "playground",
    description:
      "A dedicated recreational space for fun and entertainment.",
  },
  {
    name: "Restaurant Area",
    folder: "restaurant-area",
    description:
      "A comfortable dining space where you can relax and enjoy your food.",
  },
  {
    name: "Billiards & Table Tennis",
    folder: "Billards-and-table-tennis",
    description:
      "Enjoy billiards and table tennis in a dedicated indoor recreation area.",
  },
  {
    name: "Gaming Lounge",
    folder: "Gaming-lounge",
    description:
      "A premium gaming space with a wide range of entertainment options.",
  },
  {
    name: "Prayer Room",
    folder: "Praying-room",
    description:
      "A peaceful and dedicated space for prayer and reflection.",
  },
].map((facility) => {
  const route = GALLERY.find(
    (item) => item.folder === facility.folder
  );

  return {
    ...facility,
    images:
      route?.images?.map((image) => {
        const match = image.match(
          /(?:\(|)(https?:\/\/[^)]+)(?:\)|)/
        );

        return match ? match[1] : image;
      }) || [],
  };
});

export default function FacilitiesSection() {
  const [gallery, setGallery] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);

  const openGallery = (facility, index = 0) => {
    if (!facility.images.length) return;

    setGallery(facility);
    setImageIndex(index);
  };

  const closeGallery = () => setGallery(null);

  const changeImage = (direction) => {
    if (!gallery?.images?.length) return;

    setImageIndex((current) => {
      const total = gallery.images.length;
      return (current + direction + total) % total;
    });
  };

  useEffect(() => {
    if (!gallery) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeGallery();
      if (e.key === "ArrowRight") changeImage(1);
      if (e.key === "ArrowLeft") changeImage(-1);
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [gallery]);

  return (
    <>
      <section
        id="facilities"
        className="bg-[#111214] px-5 py-16 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">

          {/* HEADER */}
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xl font-medium uppercase tracking-[0.25em] text-blue-400">
                Facilities
              </p>

              <Image
                src="/checkpointR.webp"
                alt="The Checkpoint"
                width={400}
                height={120}
                className="h-auto w-[300px] object-contain mix-blend-screen"
              />
            </div>

            <div className="flex max-w-md flex-col items-start gap-4">
              <p className="text-sm leading-6 text-white/45">
                Visit the Checkpoint on 11th floor to experience
                our various paid amenities
              </p>
            </div>
          </div>

          {/* FACILITIES GRID */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FACILITIES.map((facility) => (
              <FacilityCard
                key={facility.folder}
                facility={facility}
                onClick={() => openGallery(facility)}
              />
            ))}
          </div>

          {/* CHECKPOINT BUTTON */}
          <div className="mt-10 flex justify-center">
            <a
              href="https://www.checkpoint.place"
              target="_blank"
              rel="noopener noreferrer"
              className="
                group
                inline-flex
                items-center
                gap-3
                rounded-full
                border
                border-white/10
                bg-white/[0.06]
                px-5
                py-3
                text-sm
                font-medium
                text-white
                transition-all
                duration-300
                hover:bg-white/10
                hover:border-white/20
              "
            >
              Visit The Checkpoint

              <span
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-black
                  transition-transform
                  duration-300
                  group-hover:translate-x-0.5
                  group-hover:-translate-y-0.5
                "
              >
                <FiArrowUpRight size={14} />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* LIGHTBOX */}
      {gallery && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4"
          onClick={closeGallery}
        >
          {/* CLOSE */}
          <button
            type="button"
            aria-label="Close gallery"
            onClick={closeGallery}
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white"
          >
            <FiX size={21} />
          </button>

          {/* PREVIOUS */}
          {gallery.images.length > 1 && (
            <GalleryButton
              direction="left"
              onClick={() => changeImage(-1)}
            />
          )}

          {/* MAIN IMAGE */}
          <div
            className="relative h-[72vh] w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={gallery.images[imageIndex]}
              alt={`${gallery.name} ${imageIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>

          {/* NEXT */}
          {gallery.images.length > 1 && (
            <GalleryButton
              direction="right"
              onClick={() => changeImage(1)}
            />
          )}

          {/* INFO + THUMBNAILS */}
          <div
            className="absolute bottom-4 left-1/2 z-20 w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-white sm:text-base">
                {gallery.name}
              </h3>

              <p className="text-xs text-white/45">
                {imageIndex + 1} / {gallery.images.length}
              </p>
            </div>

            {gallery.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {gallery.images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setImageIndex(index)}
                    className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 sm:h-16 sm:w-24 ${
                      index === imageIndex
                        ? "border-white"
                        : "border-transparent opacity-50"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${gallery.name} thumbnail ${index + 1}`}
                      fill
                      sizes="96px"
                      loading="lazy"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* FACILITY CARD */

function FacilityCard({ facility, onClick }) {
  const image = facility.images[0];

  if (!image) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/10 bg-[#18191b] text-left"
    >
      <Image
        src={image}
        alt={facility.name}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        loading="lazy"
        decoding="async"
        className="object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-white sm:text-lg">
              {facility.name}
            </h3>

            <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/55">
              {facility.description}
            </p>
          </div>

          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-md">
            <FiArrowUpRight size={17} />
          </span>
        </div>
      </div>
    </button>
  );
}

/* GALLERY NAVIGATION BUTTON */

function GalleryButton({ direction, onClick }) {
  const left = direction === "left";

  return (
    <button
      type="button"
      aria-label={left ? "Previous image" : "Next image"}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`absolute ${
        left ? "left-4 sm:left-6" : "right-4 sm:right-6"
      } top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white`}
    >
      {left ? (
        <FiChevronLeft size={23} />
      ) : (
        <FiChevronRight size={23} />
      )}
    </button>
  );
}
