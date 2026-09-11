"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiEdit3,
  FiEye,
  FiHome,
  FiLoader,
  FiPlus,
  FiSearch,
  FiRefreshCw,
} from "react-icons/fi";

function StatusBadge({ status }) {
  const isAvailable = status === "Available";

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        px-2.5
        py-1
        text-[9px]
        font-semibold
        ${
          isAvailable
            ? "bg-emerald-100 text-emerald-700"
            : "bg-red-100 text-red-600"
        }
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full
          ${isAvailable ? "bg-emerald-600" : "bg-red-600"}
        `}
      />

      {status}
    </span>
  );
}

function Price({ value }) {
  return (
    <span className="font-semibold text-[#11110f]">
      ৳{Number(value || 0).toLocaleString()}
    </span>
  );
}

function getPricing(apartment, minDays) {
  const tier = apartment.pricing?.find(
    (item) => Number(item.minDays) === minDays
  );

  return tier?.pricePerDay || 0;
}

export default function AdminApartmentsPage() {
  const [apartments, setApartments] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadApartments() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/apartments", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load apartments"
        );
      }

      setApartments(data.apartments || []);
    } catch (err) {
      console.error("Load apartments error:", err);

      setError(
        err.message || "Failed to load apartments"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApartments();
  }, []);

  const filteredApartments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return apartments;
    }

    return apartments.filter((apartment) => {
      return (
        apartment.title?.toLowerCase().includes(query) ||
        String(apartment.size).includes(query) ||
        apartment.description
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [search, apartments]);

  return (
    <main className="min-h-screen bg-[#f5f4f0] text-[#11110f]">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="px-4 pb-8 pt-28 sm:px-6 lg:px-10 lg:pt-32">
        <div className="mx-auto max-w-7xl">
          <div
            className="
              flex
              flex-col
              gap-6
              border-b
              border-black/10
              pb-8
              md:flex-row
              md:items-end
              md:justify-between
            "
          >
            <div>
              <Link
                href="/admin"
                className="
                  group
                  mb-6
                  inline-flex
                  items-center
                  gap-2
                  text-xs
                  font-semibold
                  text-black/50
                  transition
                  hover:text-black
                "
              >
                <FiArrowLeft
                  size={14}
                  className="
                    transition-transform
                    duration-300
                    group-hover:-translate-x-0.5
                  "
                />

                Dashboard
              </Link>

              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.25em]
                  text-black/50
                "
              >
                Property Management
              </p>

              <h1
                className="
                  mt-3
                  text-4xl
                  font-semibold
                  tracking-[-0.05em]
                  text-[#11110f]
                  sm:text-5xl
                "
              >
                Apartments
              </h1>

              <p
                className="
                  mt-3
                  max-w-xl
                  text-sm
                  font-medium
                  leading-6
                  text-black/55
                "
              >
                Manage apartment information, pricing,
                availability and details.
              </p>
            </div>

            <Link
              href="/admin/apartments/new"
              className="
                group
                inline-flex
                w-fit
                items-center
                gap-3
                rounded-full
                bg-[#11110f]
                px-5
                py-3.5
                text-sm
                font-semibold
                !text-[#f5f4f0]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-black
                hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)]
              "
            >
              <FiPlus size={15} />

              Add Apartment

              <span
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-full
                  bg-white/10
                "
              >
                <FiArrowUpRight
                  size={13}
                  className="
                    !text-[#f5f4f0]
                    transition-transform
                    duration-300
                    group-hover:translate-x-0.5
                    group-hover:-translate-y-0.5
                  "
                />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <section className="px-4 pb-28 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          {/* =================================================
              ERROR
          ================================================== */}

          {error && (
            <div
              className="
                mb-5
                flex
                flex-col
                gap-3
                rounded-2xl
                border
                border-red-200
                bg-red-50
                px-5
                py-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <p className="text-sm font-medium text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={loadApartments}
                className="
                  inline-flex
                  w-fit
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-red-200
                  bg-white
                  px-4
                  py-2
                  text-xs
                  font-semibold
                  text-red-700
                  transition
                  hover:bg-red-100
                "
              >
                <FiRefreshCw size={13} />

                Retry
              </button>
            </div>
          )}

          {/* =================================================
              TOOLBAR
          ================================================== */}

          <div
            className="
              mb-5
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            {/* SEARCH */}

            <div className="relative w-full sm:max-w-sm">
              <FiSearch
                size={15}
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-black/45
                "
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search apartments..."
                className="
                  w-full
                  rounded-full
                  border
                  border-black/10
                  bg-white
                  px-4
                  py-3
                  pl-11
                  text-sm
                  font-medium
                  text-[#11110f]
                  outline-none
                  transition
                  placeholder:text-black/40
                  focus:border-black/20
                  focus:ring-2
                  focus:ring-black/5
                "
              />
            </div>

            {/* COUNT */}

            <div
              className="
                flex
                items-center
                gap-2
                text-xs
                font-medium
                text-black/55
              "
            >
              <span
                className="
                  flex
                  h-7
                  min-w-7
                  items-center
                  justify-center
                  rounded-full
                  bg-black/8
                  px-2
                  font-semibold
                  text-black/70
                "
              >
                {loading
                  ? "—"
                  : filteredApartments.length}
              </span>

              Apartments
            </div>
          </div>

          {/* =================================================
              LOADING
          ================================================== */}

          {loading ? (
            <div
              className="
                flex
                min-h-[350px]
                items-center
                justify-center
                rounded-[24px]
                border
                border-black/10
                bg-white
              "
            >
              <div className="flex flex-col items-center gap-3">
                <FiLoader
                  size={24}
                  className="animate-spin text-black/40"
                />

                <p className="text-sm font-medium text-black/45">
                  Loading apartments...
                </p>
              </div>
            </div>
          ) : (
            /* =================================================
               APARTMENT LIST
            ================================================== */

            <div
              className="
                overflow-hidden
                rounded-[24px]
                border
                border-black/10
                bg-white
              "
            >
              {filteredApartments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] border-collapse">
                    {/* =================================================
                        TABLE HEADER
                    ================================================== */}

                    <thead>
                      <tr className="border-b border-black/8 bg-[#faf9f6]">
                        <th className="px-5 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.15em] text-black/45">
                          Apartment
                        </th>

                        <th className="px-4 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.15em] text-black/45">
                          Status
                        </th>

                        <th className="px-4 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.15em] text-black/45">
                          Size
                        </th>

                        <th className="px-4 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.15em] text-black/45">
                          1 Day
                        </th>

                        <th className="px-4 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.15em] text-black/45">
                          7 Days
                        </th>

                        <th className="px-4 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.15em] text-black/45">
                          15 Days
                        </th>

                        <th className="px-4 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.15em] text-black/45">
                          30 Days
                        </th>

                        <th className="px-5 py-4 text-right text-[9px] font-semibold uppercase tracking-[0.15em] text-black/45">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    {/* =================================================
                        TABLE BODY
                    ================================================== */}

                    <tbody>
                      {filteredApartments.map(
                        (apartment) => {
                          const status =
                            apartment.isAvailable &&
                            apartment.isActive
                              ? "Available"
                              : "Unavailable";

                          return (
                            <tr
                              key={apartment._id}
                              className="
                                border-b
                                border-black/6
                                last:border-b-0
                                transition-colors
                                hover:bg-[#faf9f6]
                              "
                            >
                              {/* APARTMENT */}

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="
                                      flex
                                      h-11
                                      w-11
                                      shrink-0
                                      items-center
                                      justify-center
                                      overflow-hidden
                                      rounded-xl
                                      bg-[#e8e5dd]
                                    "
                                  >
                                    {apartment.images?.[0]?.url ? (
                                      <img
                                        src={
                                          apartment.images[0].url
                                        }
                                        alt={
                                          apartment.title
                                        }
                                        className="
                                          h-full
                                          w-full
                                          object-cover
                                        "
                                      />
                                    ) : (
                                      <FiHome
                                        size={17}
                                        className="text-black/35"
                                      />
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <p
                                      className="
                                        text-sm
                                        font-semibold
                                        text-[#11110f]
                                      "
                                    >
                                      {apartment.title}
                                    </p>

                                    <p className="mt-0.5 text-[10px] font-medium text-black/40">
                                      {apartment.size} sq.ft
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* STATUS */}

                              <td className="px-4 py-4">
                                <StatusBadge
                                  status={status}
                                />
                              </td>

                              {/* SIZE */}

                              <td className="px-4 py-4">
                                <span className="text-xs font-semibold text-[#11110f]">
                                  {apartment.size}{" "}
                                  sq.ft
                                </span>
                              </td>

                              {/* 1 DAY */}

                              <td className="px-4 py-4 text-xs">
                                <Price
                                  value={getPricing(
                                    apartment,
                                    1
                                  )}
                                />
                              </td>

                              {/* 7 DAYS */}

                              <td className="px-4 py-4 text-xs">
                                <Price
                                  value={getPricing(
                                    apartment,
                                    7
                                  )}
                                />
                              </td>

                              {/* 15 DAYS */}

                              <td className="px-4 py-4 text-xs">
                                <Price
                                  value={getPricing(
                                    apartment,
                                    15
                                  )}
                                />
                              </td>

                              {/* 30 DAYS */}

                              <td className="px-4 py-4 text-xs">
                                <Price
                                  value={getPricing(
                                    apartment,
                                    30
                                  )}
                                />
                              </td>

                              {/* ACTIONS */}

                              <td className="px-5 py-4">
                                <div className="flex justify-end gap-2">
                                  {/* VIEW */}

                                  <Link
                                    href={`/apartments/${apartment.size}-sqft`}
                                    title="View apartment"
                                    className="
                                      flex
                                      h-9
                                      w-9
                                      items-center
                                      justify-center
                                      rounded-full
                                      border
                                      border-black/10
                                      bg-white
                                      text-black/55
                                      transition-all
                                      duration-200
                                      hover:bg-[#f5f4f0]
                                      hover:text-black
                                    "
                                  >
                                    <FiEye size={14} />
                                  </Link>

                                  {/* EDIT */}

                                  <Link
                                    href={`/admin/apartments/${apartment._id}/edit`}
                                    title="Edit apartment"
                                    className="
                                      flex
                                      h-9
                                      w-9
                                      items-center
                                      justify-center
                                      rounded-full
                                      border
                                      border-black/10
                                      bg-[#f5f4f0]
                                      text-black/60
                                      transition-all
                                      duration-200
                                      hover:border-black/15
                                      hover:bg-black/5
                                      hover:text-black
                                    "
                                  >
                                    <FiEdit3 size={14} />
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* =================================================
                   NO RESULTS
                ================================================== */

                <div className="px-6 py-16 text-center">
                  <div
                    className="
                      mx-auto
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-2xl
                      bg-black/5
                      text-black/40
                    "
                  >
                    <FiSearch size={19} />
                  </div>

                  <h2
                    className="
                      mt-4
                      text-base
                      font-semibold
                      text-[#11110f]
                    "
                  >
                    {apartments.length === 0
                      ? "No apartments yet"
                      : "No apartments found"}
                  </h2>

                  <p
                    className="
                      mt-2
                      text-sm
                      font-medium
                      text-black/50
                    "
                  >
                    {apartments.length === 0
                      ? "Add your first apartment to start managing your property."
                      : "Try searching by apartment name or size."}
                  </p>

                  {apartments.length === 0 ? (
                    <Link
                      href="/admin/apartments/new"
                      className="
                        mt-6
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        bg-[#11110f]
                        px-5
                        py-3
                        text-xs
                        font-semibold
                        !text-white
                        transition
                        hover:bg-black
                      "
                    >
                      <FiPlus size={14} />

                      Add Apartment
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="
                        mt-5
                        rounded-full
                        border
                        border-black/10
                        bg-[#f5f4f0]
                        px-4
                        py-2.5
                        text-xs
                        font-semibold
                        text-black/65
                        transition
                        hover:bg-black/5
                        hover:text-black
                      "
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}