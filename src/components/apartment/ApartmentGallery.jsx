"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiMaximize2,
  FiCalendar,
} from "react-icons/fi";

export default function ApartmentGallery({ apartment }) {
  const images = apartment.images || [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const totalImages = images.length;

  const nextImage = () => {
    setActiveIndex((current) =>
      current === totalImages - 1 ? 0 : current + 1
    );
  };

  const previousImage = () => {
    setActiveIndex((current) =>
      current === 0 ? totalImages - 1 : current - 1
    );
  };

  const scrollToBooking = () => {
    document.getElementById("bookingfrom")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }

      if (event.key === "ArrowRight") {
        nextImage();
      }

      if (event.key === "ArrowLeft") {
        previousImage();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, totalImages]);

  if (!images.length) {
    return (
      <div className="flex aspect-[16/8] items-center justify-center rounded-[30px] bg-[#e8e5dd]">
        <p className="text-sm text-black/40">
          No apartment images available.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* =====================================================
          MAIN GALLERY
      ====================================================== */}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.65fr)_minmax(260px,0.8fr)]">

        {/* Main image */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="
            group
            relative
            aspect-[16/10]
            overflow-hidden
            rounded-[28px]
            bg-[#e8e5dd]
            text-left
          "
        >
          <Image
            src={images[activeIndex]}
            alt={`${apartment.name} photo ${activeIndex + 1}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 65vw"
            className="
              object-cover
              transition-transform
              duration-700
              ease-out
              group-hover:scale-[1.025]
            "
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

          {/* Image counter */}
          <div className="absolute bottom-5 left-5 rounded-full border border-white/15 bg-black/35 px-3.5 py-2 text-[10px] font-medium text-white backdrop-blur-xl">
            {activeIndex + 1} / {totalImages}
          </div>

          {/* Expand */}
          <div className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur-xl transition group-hover:bg-black/45">
            <FiMaximize2 size={15} />
          </div>
        </button>

        {/* =================================================
            RIGHT SIDE
        ================================================== */}
        <div className="flex flex-col gap-3">

          {/* Image 1 */}
          {images[0] && (
            <button
              type="button"
              onClick={() => {
                setActiveIndex(0);
                setLightboxOpen(true);
              }}
              className="
                group
                relative
                aspect-[16/9]
                overflow-hidden
                rounded-[24px]
                bg-[#e8e5dd]
                text-left
              "
            >
              <Image
                src={images[0]}
                alt={`${apartment.name} preview 1`}
                fill
                sizes="(max-width: 1024px) 100vw, 30vw"
                className="
                  object-cover
                  transition-transform
                  duration-700
                  group-hover:scale-[1.04]
                "
              />

              <div className="absolute inset-0 bg-black/10 transition group-hover:bg-black/20" />
            </button>
          )}

          {/* Image 2 */}
          {images[1] && (
            <button
              type="button"
              onClick={() => {
                setActiveIndex(1);
                setLightboxOpen(true);
              }}
              className="
                group
                relative
                aspect-[16/9]
                overflow-hidden
                rounded-[24px]
                bg-[#e8e5dd]
                text-left
              "
            >
              <Image
                src={images[1]}
                alt={`${apartment.name} preview 2`}
                fill
                sizes="(max-width: 1024px) 100vw, 30vw"
                className="
                  object-cover
                  transition-transform
                  duration-700
                  group-hover:scale-[1.04]
                "
              />

              <div className="absolute inset-0 bg-black/10 transition group-hover:bg-black/20" />
            </button>
          )}

          {/* Compact View All */}
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="
              group
              flex
              w-full
              items-center
              justify-between
              rounded-2xl
              border
              border-black/[0.08]
              bg-white
              px-4
              py-3
              text-left
              transition
              hover:border-black/20
              hover:bg-[#fafafa]
            "
          >
            <div className="flex items-center gap-2.5">
              <span
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#11110f]
                  text-white
                "
              >
                <FiMaximize2 size={13} />
              </span>

              <div>
                <p className="text-xs font-medium text-[#11110f]">
                  View all photos
                </p>

                <p className="mt-0.5 text-[10px] text-black/40">
                  {totalImages} photos
                </p>
              </div>
            </div>

            <span
              className="
                text-sm
                text-black/40
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            >
              →
            </span>
          </button>
        </div>
      </div>

      {/* =====================================================
          BOOKING CTA
      ====================================================== */}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={scrollToBooking}
          className="
            group
            inline-flex
            items-center
            gap-3
            rounded-full
            bg-[#11110f]
            px-5
            py-3.5
            text-sm
            font-medium
            text-[#f5f4f0]
            shadow-[0_10px_30px_rgba(0,0,0,0.12)]
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:bg-black
            hover:shadow-[0_14px_35px_rgba(0,0,0,0.18)]
          "
        >
          <FiCalendar size={15} />

          <span>Book this apartment</span>

          <span
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-full
              bg-white/10
              text-sm
              transition-transform
              duration-300
              group-hover:translate-x-0.5
            "
          >
            →
          </span>
        </button>
      </div>

      {/* =====================================================
          LIGHTBOX
      ====================================================== */}
      {lightboxOpen && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-[#11110f]/95
            p-4
            backdrop-blur-xl
            sm:p-8
          "
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close */}
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="
              absolute
              right-5
              top-5
              z-20
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              border
              border-white/10
              bg-white/10
              text-white
              backdrop-blur-xl
              transition
              hover:bg-white/15
            "
          >
            <FiX size={19} />
          </button>

          {/* Counter */}
          <div className="absolute left-5 top-6 text-xs text-white/45">
            {activeIndex + 1} / {totalImages}
          </div>

          {/* Previous */}
          {totalImages > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                previousImage();
              }}
              aria-label="Previous image"
              className="
                absolute
                left-4
                top-1/2
                z-20
                flex
                h-11
                w-11
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-white/10
                bg-white/10
                text-white
                backdrop-blur-xl
                transition
                hover:bg-white/15
                sm:left-8
              "
            >
              <FiChevronLeft size={20} />
            </button>
          )}

          {/* Image */}
          <div
            className="relative h-[80vh] w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={images[activeIndex]}
              alt={`${apartment.name} photo ${activeIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {/* Next */}
          {totalImages > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                nextImage();
              }}
              aria-label="Next image"
              className="
                absolute
                right-4
                top-1/2
                z-20
                flex
                h-11
                w-11
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-white/10
                bg-white/10
                text-white
                backdrop-blur-xl
                transition
                hover:bg-white/15
                sm:right-8
              "
            >
              <FiChevronRight size={20} />
            </button>
          )}

          {/* Bottom thumbnails */}
          {totalImages > 1 && (
            <div
              className="
                absolute
                bottom-5
                left-1/2
                flex
                max-w-[90vw]
                -translate-x-1/2
                gap-2
                overflow-x-auto
                rounded-full
                border
                border-white/10
                bg-black/30
                p-2
                backdrop-blur-xl
              "
              onClick={(event) => event.stopPropagation()}
            >
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`View image ${index + 1}`}
                  className={`
                    relative
                    h-12
                    w-16
                    shrink-0
                    overflow-hidden
                    rounded-xl
                    transition
                    ${
                      activeIndex === index
                        ? "ring-2 ring-[#f5f4f0]"
                        : "opacity-50 hover:opacity-100"
                    }
                  `}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}