"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  FiArrowUpRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiHome,
  FiUsers,
  FiTrendingUp,
  FiChevronRight,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";

function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <div
      className="
        rounded-[24px]
        border
        border-black/8
        bg-white/70
        p-5
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:bg-white
        hover:shadow-[0_15px_45px_rgba(0,0,0,0.06)]
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-[#11110f]
            text-[#f5f4f0]
          "
        >
          <Icon size={16} />
        </div>

        <span className="text-[10px] text-black/25">
          Live
        </span>
      </div>

      <p
        className="
          mt-6
          text-[10px]
          font-medium
          uppercase
          tracking-[0.18em]
          text-black/35
        "
      >
        {stat.label}
      </p>

      <p
        className="
          mt-2
          text-2xl
          font-medium
          tracking-[-0.04em]
          text-[#11110f]
        "
      >
        {stat.value}
      </p>

      <p className="mt-1 text-xs text-black/35">
        {stat.description}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const confirmed = status === "Confirmed";

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-2.5
        py-1
        text-[9px]
        font-medium
        ${
          confirmed
            ? "bg-black/6 text-black/55"
            : "bg-amber-50 text-amber-600"
        }
      `}
    >
      {status}
    </span>
  );
}

function formatDate(date) {
  if (!date) return "—";

  const value = new Date(`${date}T00:00:00`);

  return value.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/dashboard",
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to load dashboard"
        );
      }

      setData(result);
    } catch (error) {
      console.error(
        "Dashboard fetch error:",
        error
      );

      setError(
        error.message ||
          "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = [
    {
      label: "Total Apartments",
      value:
        data?.stats?.totalApartments ?? "—",
      description: "Apartments listed",
      icon: FiHome,
    },
    {
      label: "Available Today",
      value:
        data?.stats?.availableToday ?? "—",
      description: "Currently available",
      icon: FiCheckCircle,
    },
    {
      label: "Active Bookings",
      value:
        data?.stats?.activeBookings ?? "—",
      description: "Current reservations",
      icon: FiCalendar,
    },
    {
      label: "Monthly Revenue",
      value:
        data?.stats?.monthlyRevenue !== undefined
          ? `৳${data.stats.monthlyRevenue.toLocaleString()}`
          : "—",
      description: "This month",
      icon: FiTrendingUp,
    },
  ];

  const upcomingBookings =
    data?.upcomingBookings || [];

  return (
    <main className="min-h-screen bg-[#f5f4f0] text-[#11110f]">
      {/* HEADER */}

      <section className="px-4 pb-8 pt-28 sm:px-6 lg:px-10 lg:pt-32">
        <div className="mx-auto max-w-7xl">
          <div
            className="
              flex
              flex-col
              gap-5
              border-b
              border-black/10
              pb-8
              md:flex-row
              md:items-end
              md:justify-between
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.25em]
                  text-black/35
                "
              >
                Thakben Admin
              </p>

              <h1
                className="
                  mt-3
                  text-4xl
                  font-medium
                  tracking-[-0.05em]
                  sm:text-5xl
                "
              >
                Dashboard
              </h1>

              <p
                className="
                  mt-3
                  max-w-xl
                  text-sm
                  leading-6
                  text-black/45
                "
              >
                Manage your apartments, bookings and
                availability from one place.
              </p>
            </div>

            <Link
              href="/admin/apartments"
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
                font-medium
                !text-[#f5f4f0]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-black
              "
            >
              Manage Apartments

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
                  size={14}
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

      {/* CONTENT */}

      <section className="px-4 pb-28 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">

          {/* ERROR */}

          {error && (
            <div
              className="
                mb-6
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-red-200
                bg-red-50
                p-4
                text-sm
                text-red-600
              "
            >
              <FiAlertCircle size={17} />

              <span>{error}</span>

              <button
                onClick={loadDashboard}
                className="ml-auto font-medium underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* STATISTICS */}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                stat={stat}
              />
            ))}
          </div>

          {/* MAIN GRID */}

          <div
            className="
              mt-6
              grid
              gap-6
              lg:grid-cols-[minmax(0,1fr)_360px]
            "
          >
            {/* UPCOMING BOOKINGS */}

            <section
              className="
                overflow-hidden
                rounded-[28px]
                border
                border-black/8
                bg-white/70
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  border-b
                  border-black/8
                  p-6
                "
              >
                <div>
                  <p
                    className="
                      text-[9px]
                      font-medium
                      uppercase
                      tracking-[0.2em]
                      text-black/35
                    "
                  >
                    Reservations
                  </p>

                  <h2
                    className="
                      mt-1
                      text-lg
                      font-medium
                      tracking-tight
                    "
                  >
                    Upcoming bookings
                  </h2>
                </div>

                <Link
                  href="/admin/bookings"
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    text-xs
                    font-medium
                    text-black/45
                    transition
                    hover:text-black
                  "
                >
                  View all
                  <FiChevronRight size={13} />
                </Link>
              </div>

              <div className="divide-y divide-black/6">
                {loading ? (
                  <div className="flex items-center justify-center py-14">
                    <FiLoader
                      size={20}
                      className="animate-spin text-black/30"
                    />
                  </div>
                ) : upcomingBookings.length === 0 ? (
                  <div className="px-6 py-14 text-center">
                    <p className="text-sm font-medium">
                      No upcoming bookings
                    </p>

                    <p className="mt-1 text-xs text-black/35">
                      New reservations will appear here.
                    </p>
                  </div>
                ) : (
                  upcomingBookings.map((booking) => (
                    <Link
                      key={booking.id}
                      href={`/admin/bookings/${booking.id}`}
                      className="
                        group
                        block
                        px-6
                        py-5
                        transition
                        hover:bg-black/[0.025]
                      "
                    >
                      <div
                        className="
                          flex
                          flex-col
                          gap-4
                          sm:flex-row
                          sm:items-center
                          sm:justify-between
                        "
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              className="
                                text-sm
                                font-medium
                                text-[#11110f]
                              "
                            >
                              {booking.guest}
                            </p>

                            <StatusBadge
                              status={booking.status}
                            />
                          </div>

                          <p
                            className="
                              mt-1
                              text-xs
                              text-black/40
                            "
                          >
                            {booking.apartment}
                          </p>
                        </div>

                        <div
                          className="
                            shrink-0
                            text-left
                            sm:text-right
                          "
                        >
                          <p
                            className="
                              text-xs
                              font-medium
                              text-black/55
                            "
                          >
                            {formatDate(
                              booking.checkIn
                            )}
                          </p>

                          <p
                            className="
                              mt-1
                              text-[10px]
                              text-black/30
                            "
                          >
                            Check-out{" "}
                            {formatDate(
                              booking.checkOut
                            )}
                          </p>
                        </div>
                      </div>

                      <div
                        className="
                          mt-3
                          flex
                          items-center
                          justify-between
                          text-[10px]
                          text-black/25
                        "
                      >
                        <span>
                          {booking.displayId}
                        </span>

                        <FiArrowUpRight
                          size={13}
                          className="
                            transition-transform
                            duration-300
                            group-hover:translate-x-0.5
                            group-hover:-translate-y-0.5
                          "
                        />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>

            {/* QUICK ACTIONS */}

            <section>
              <div className="mb-4">
                <p
                  className="
                    text-[9px]
                    font-medium
                    uppercase
                    tracking-[0.2em]
                    text-black/35
                  "
                >
                  Quick access
                </p>

                <h2
                  className="
                    mt-1
                    text-lg
                    font-medium
                    tracking-tight
                  "
                >
                  Manage
                </h2>
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: "Manage Apartments",
                    description:
                      "Update apartments, pricing and facilities.",
                    href: "/admin/apartments",
                    icon: FiHome,
                  },
                  {
                    title: "View Bookings",
                    description:
                      "Check and manage customer reservations.",
                    href: "/admin/bookings",
                    icon: FiCalendar,
                  },
                  {
                    title: "Check Availability",
                    description:
                      "View booked dates across apartments.",
                    href: "/admin/availability",
                    icon: FiClock,
                  },
                ].map((action) => {
                  const Icon = action.icon;

                  return (
                    <Link
                      key={action.title}
                      href={action.href}
                      className="
                        group
                        flex
                        items-center
                        gap-4
                        rounded-[22px]
                        border
                        border-black/8
                        bg-white/70
                        p-4
                        transition-all
                        duration-300
                        hover:-translate-y-0.5
                        hover:bg-white
                        hover:shadow-[0_12px_35px_rgba(0,0,0,0.05)]
                      "
                    >
                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-[#11110f]
                          text-[#f5f4f0]
                        "
                      >
                        <Icon size={15} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className="
                            text-sm
                            font-medium
                            text-[#11110f]
                          "
                        >
                          {action.title}
                        </p>

                        <p
                          className="
                            mt-1
                            text-[10px]
                            leading-4
                            text-black/35
                          "
                        >
                          {action.description}
                        </p>
                      </div>

                      <FiChevronRight
                        size={15}
                        className="
                          shrink-0
                          text-black/20
                          transition-transform
                          duration-300
                          group-hover:translate-x-0.5
                          group-hover:text-black/50
                        "
                      />
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>

          {/* AVAILABILITY */}

          <section
            className="
              mt-6
              rounded-[28px]
              border
              border-black/8
              bg-[#11110f]
              p-6
              text-white
              sm:p-7
            "
          >
            <div
              className="
                flex
                flex-col
                gap-5
                md:flex-row
                md:items-center
                md:justify-between
              "
            >
              <div className="flex items-start gap-4">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-white/10
                  "
                >
                  <FiUsers size={16} />
                </div>

                <div>
                  <p
                    className="
                      text-[9px]
                      font-medium
                      uppercase
                      tracking-[0.2em]
                      text-white/35
                    "
                  >
                    Availability
                  </p>

                  <h2
                    className="
                      mt-1
                      text-lg
                      font-medium
                      tracking-tight
                    "
                  >
                    {loading
                      ? "Loading availability..."
                      : `${data?.stats?.availableToday ?? 0} of ${
                          data?.stats?.totalApartments ?? 0
                        } apartments available`}
                  </h2>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-white/35
                    "
                  >
                    Review the full calendar to see
                    upcoming reservations.
                  </p>
                </div>
              </div>

              <Link
                href="/admin/availability"
                className="
                  group
                  inline-flex
                  w-fit
                  shrink-0
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/10
                  bg-white/10
                  px-4
                  py-2.5
                  text-xs
                  font-medium
                  text-white
                  transition
                  hover:bg-white/15
                "
              >
                Open Calendar

                <FiArrowUpRight
                  size={13}
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-0.5
                    group-hover:-translate-y-0.5
                  "
                />
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}