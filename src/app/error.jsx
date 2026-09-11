"use client";

import Link from "next/link";
import {
  FiArrowLeft,
  FiHome,
  FiRefreshCw,
} from "react-icons/fi";

export default function Error({
  reset,
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f4f0] px-5 py-24 text-[#11110f]">
      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#11110f] text-[#f5f4f0]">
          <span className="text-xl font-medium">
            T
          </span>
        </div>

        <p className="mt-8 text-[10px] font-medium uppercase tracking-[0.28em] text-black/35">
          Something went wrong
        </p>

        <h1 className="mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-6xl">
          We couldn't load
          <br />
          <span className="text-black/30">
            this page.
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-black/45">
          Something unexpected happened while loading
          this page. Please try again or return to
          Thakben.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-full
              bg-[#11110f]
              px-6
              py-3.5
              text-sm
              font-medium
              text-[#f5f4f0]
              transition
              hover:bg-black
            "
          >
            <FiRefreshCw size={15} />
            Try again
          </button>

          <Link
            href="/"
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-full
              border
              border-black/10
              bg-white
              px-6
              py-3.5
              text-sm
              font-medium
              text-[#11110f]
              transition
              hover:bg-[#e8e5dd]
            "
          >
            <FiHome size={15} />
            Back to home
          </Link>

          <Link
            href="/apartments"
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-full
              border
              border-black/10
              px-6
              py-3.5
              text-sm
              font-medium
              text-black/60
              transition
              hover:bg-white
              hover:text-black
            "
          >
            <FiArrowLeft size={15} />
            Apartments
          </Link>
        </div>
      </div>
    </main>
  );
}