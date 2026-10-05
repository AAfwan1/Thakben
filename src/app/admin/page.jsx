
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  FiArrowUpRight,
  FiCalendar,
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

function ReservationSection({
  title,
  bookings,
  dateField,
  emptyTitle,
  emptyDescription,
}) {
  return (
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
            {title}
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
        {bookings.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium">
              {emptyTitle}
            </p>

            <p className="mt-1 text-xs text-black/35">
              {emptyDescription}
            </p>
          </div>
        ) : (
          bookings.map((booking) => (
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

                  <p className="mt-1 text-xs text-black/40">
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
                      booking[dateField]
                    )}
                  </p>

                  <p
                    className="
                      mt-1
                      text-[10px]
                      text-black/30
                    "
                  >
                    {dateField === "checkIn"
                      ? `Check-out ${formatDate(
                          booking.checkOut
                        )}`
                      : `Check-in ${formatDate(
                          booking.checkIn
                        )}`}
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
                <span>{booking.displayId}</span>

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
  );
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
      label: "Active Bookings",
      value:
        data?.stats?.activeBookings ?? "—",
      description: "Current reservations",
      icon: FiCalendar,
    },
    {
      label: "Monthly Revenue",
      value:
        data?.stats?.monthlyRevenue !==
        undefined
          ? `৳${data.stats.monthlyRevenue.toLocaleString()}`
          : "—",
      description: "This month",
      icon: FiTrendingUp,
    },
  ];

  // API already filters and sorts these.
  const upcomingCheckIns =
    data?.upcomingCheckIns || [];

  const upcomingCheckOuts =
    data?.upcomingCheckOuts || [];

  return (
    <main className="min-h-screen bg-[#f5f4f0] text-[#11110f]">
      {/* HEADER */}
      <section className="px-4 pb-8 pt-28 sm:px-6 lg:px-10 lg:pt-32">
        <div className="mx-auto max-w-7xl">
          <div className="border-b border-black/10 pb-8">
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
                Manage your bookings and monitor
                upcoming reservations from one
                place.
              </p>
            </div>
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
                type="button"
                onClick={loadDashboard}
                className="ml-auto font-medium underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* STATISTICS */}
          <div className="grid gap-4 sm:grid-cols-2">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                stat={stat}
              />
            ))}
          </div>

          {/* UPCOMING CHECK-INS */}
          <div className="mt-6">
            {loading ? (
              <section
                className="
                  overflow-hidden
                  rounded-[28px]
                  border
                  border-black/8
                  bg-white/70
                "
              >
                <div className="flex items-center justify-center py-14">
                  <FiLoader
                    size={20}
                    className="animate-spin text-black/30"
                  />
                </div>
              </section>
            ) : (
              <ReservationSection
                title="Upcoming check-ins"
                bookings={upcomingCheckIns}
                dateField="checkIn"
                emptyTitle="No upcoming check-ins"
                emptyDescription="Upcoming check-ins will appear here."
              />
            )}
          </div>

          {/* UPCOMING CHECK-OUTS */}
          <div className="mt-6">
            {loading ? (
              <section
                className="
                  overflow-hidden
                  rounded-[28px]
                  border
                  border-black/8
                  bg-white/70
                "
              >
                <div className="flex items-center justify-center py-14">
                  <FiLoader
                    size={20}
                    className="animate-spin text-black/30"
                  />
                </div>
              </section>
            ) : (
              <ReservationSection
                title="Upcoming check-outs"
                bookings={upcomingCheckOuts}
                dateField="checkOut"
                emptyTitle="No upcoming check-outs"
                emptyDescription="Upcoming check-outs will appear here."
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
