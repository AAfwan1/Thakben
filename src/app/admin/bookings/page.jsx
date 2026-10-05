
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import {
  FiArrowUpRight,
  FiCheckCircle,
  FiCreditCard,
  FiLoader,
  FiRefreshCw,
  FiSearch,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";

const INITIAL_STATS = {
  confirmedBookings: 0,
  paidRevenue: 0,
};

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCurrency(amount = 0) {
  return `৳${Number(amount || 0).toLocaleString("en-BD")}`;
}

function getBookingStatusLabel(status) {
  return (
    {
      confirmed: "Confirmed",
      pending: "Pending",
      cancelled: "Cancelled",
      completed: "Completed",
    }[status] ||
    status ||
    "Unknown"
  );
}

function getPaymentStatusLabel(status) {
  return (
    {
      paid: "Paid",
      unpaid: "Pending",
      failed: "Failed",
      cancelled: "Cancelled",
      refunded: "Refunded",
    }[status] ||
    status ||
    "Unknown"
  );
}

function StatusBadge({ type, status }) {
  let className = "border-black/10 bg-black/[0.04] text-black/50";

  const label =
    type === "booking"
      ? getBookingStatusLabel(status)
      : getPaymentStatusLabel(status);

  if (status === "confirmed" || status === "paid") {
    className =
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700";
  } else if (status === "pending" || status === "unpaid") {
    className =
      "border-amber-500/20 bg-amber-500/10 text-amber-700";
  } else if (
    status === "cancelled" ||
    status === "failed"
  ) {
    className =
      "border-red-500/20 bg-red-500/10 text-red-700";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium ${className}`}
    >
      {label}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, loading }) {
  return (
    <div className="rounded-[24px] border border-black/8 bg-white/60 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-black/35">
            {label}
          </p>

          {loading ? (
            <div className="mt-3 h-8 w-24 animate-pulse rounded-lg bg-black/5" />
          ) : (
            <p className="mt-2 text-2xl font-medium tracking-tight">
              {value}
            </p>
          )}
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.04]">
          <Icon size={16} className="text-black/50" />
        </div>
      </div>
    </div>
  );
}

function SkeletonRows({ mobile = false }) {
  return Array.from({
    length: mobile ? 5 : 6,
  }).map((_, index) =>
    mobile ? (
      <div
        key={index}
        className="rounded-[24px] border border-black/8 bg-white/55 p-5"
      >
        <div className="h-4 w-32 animate-pulse rounded bg-black/5" />
        <div className="mt-3 h-3 w-44 animate-pulse rounded bg-black/5" />
        <div className="mt-5 h-20 animate-pulse rounded-2xl bg-black/5" />
      </div>
    ) : (
      <div
        key={index}
        className="grid grid-cols-[1.35fr_0.9fr_1.1fr_0.75fr_0.85fr_0.85fr_1.2fr_40px] items-center gap-4 px-6 py-5"
      >
        <div>
          <div className="h-4 w-32 animate-pulse rounded bg-black/5" />
          <div className="mt-2 h-3 w-40 animate-pulse rounded bg-black/5" />
        </div>

        <div className="h-4 w-24 animate-pulse rounded bg-black/5" />

        <div>
          <div className="h-3 w-28 animate-pulse rounded bg-black/5" />
          <div className="mt-2 h-3 w-24 animate-pulse rounded bg-black/5" />
          <div className="mt-2 h-3 w-20 animate-pulse rounded bg-black/5" />
        </div>

        <div className="h-4 w-20 animate-pulse rounded bg-black/5" />
        <div className="h-6 w-20 animate-pulse rounded-full bg-black/5" />
        <div className="h-6 w-16 animate-pulse rounded-full bg-black/5" />

        <div>
          <div className="h-3 w-28 animate-pulse rounded bg-black/5" />
          <div className="mt-2 h-3 w-24 animate-pulse rounded bg-black/5" />
        </div>

        <div className="h-8 w-8 animate-pulse rounded-full bg-black/5" />
      </div>
    )
  );
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(INITIAL_STATS);

  const [search, setSearch] = useState("");
  const [bookingStatus, setBookingStatus] = useState("");

  const [dateMode, setDateMode] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");

  const observerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const today = new Date();

  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const currentMonth = todayString.slice(0, 7);

  const fetchBookings = useCallback(
    async ({ pageNumber = 1, append = false } = {}) => {
      append ? setLoadingMore(true) : setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(pageNumber),
          limit: "20",
          paymentStatus: "paid",
        });

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (bookingStatus) {
          params.set("bookingStatus", bookingStatus);
        }

        if (dateMode === "month" && selectedMonth) {
          params.set("month", selectedMonth);
        }

        if (dateMode === "range") {
          if (fromDate) params.set("fromDate", fromDate);
          if (toDate) params.set("toDate", toDate);
        }

        const response = await fetch(
          `/api/admin/bookings?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load bookings."
          );
        }

        setBookings((previous) =>
          append
            ? [...previous, ...(data.bookings || [])]
            : data.bookings || []
        );

        setStats(data.stats || INITIAL_STATS);
        setHasMore(Boolean(data.pagination?.hasMore));
        setPage(pageNumber);
      } catch (fetchError) {
        console.error(
          "Admin bookings fetch error:",
          fetchError
        );

        setError(
          fetchError?.message ||
            "Failed to load bookings."
        );

        if (!append) {
          setBookings([]);
          setStats(INITIAL_STATS);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [
      search,
      bookingStatus,
      dateMode,
      selectedMonth,
      fromDate,
      toDate,
    ]
  );

  useEffect(() => {
    clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      fetchBookings();
    }, 300);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [fetchBookings]);

  const loadMoreRef = useCallback(
    (node) => {
      if (!node || loading || loadingMore || !hasMore) return;

      observerRef.current?.disconnect();

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (
            entry.isIntersecting &&
            !loading &&
            !loadingMore &&
            hasMore
          ) {
            fetchBookings({
              pageNumber: page + 1,
              append: true,
            });
          }
        },
        { rootMargin: "500px" }
      );

      observerRef.current.observe(node);
    },
    [
      loading,
      loadingMore,
      hasMore,
      page,
      fetchBookings,
    ]
  );

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const handleRefresh = () => {
    fetchBookings();
  };

  const handleDateModeChange = (event) => {
    const value = event.target.value;

    setDateMode(value);

    if (value !== "month") {
      setSelectedMonth("");
    }

    if (value !== "range") {
      setFromDate("");
      setToDate("");
    }
  };

  const handleFromDateChange = (event) => {
    const value = event.target.value;

    if (value > todayString) {
      setFromDate(todayString);
      return;
    }

    setFromDate(value);

    if (toDate && value > toDate) {
      setToDate(value);
    }
  };

  const handleToDateChange = (event) => {
    const value = event.target.value;

    if (value > todayString) {
      setToDate(todayString);
      return;
    }

    if (fromDate && value < fromDate) {
      setToDate(fromDate);
      return;
    }

    setToDate(value);
  };

  const emptyState = (
    <div className="px-6 py-20 text-center">
      <FiUsers
        size={28}
        className="mx-auto text-black/20"
      />

      <p className="mt-4 text-sm font-medium">
        No paid bookings found
      </p>

      <p className="mt-1 text-xs text-black/35">
        Try changing your search, status or date filter.
      </p>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f5f4f0] px-4 pb-20 pt-24 text-[#11110f] sm:px-6 lg:px-10 lg:pt-28">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-black/35">
              Admin / Bookings
            </p>

            <h1 className="mt-3 text-4xl font-medium tracking-[-0.04em] sm:text-5xl">
              Bookings
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-black/45">
              Manage paid apartment reservations, guest
              details, booking status and payment information.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading || loadingMore}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white/60 px-4 py-2.5 text-xs font-medium transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiRefreshCw
              size={13}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Confirmed bookings"
            value={stats.confirmedBookings.toLocaleString(
              "en-BD"
            )}
            icon={FiCheckCircle}
            loading={loading}
          />

          <StatCard
            label="Paid revenue"
            value={formatCurrency(stats.paidRevenue)}
            icon={FiCreditCard}
            loading={loading}
          />
        </div>

        {/* Filters */}
        <div className="mt-8 rounded-[28px] border border-black/8 bg-white/55 p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
            <div className="relative">
              <FiSearch
                size={15}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/30"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search guest, email, phone, apartment..."
                className="w-full rounded-2xl border border-black/8 bg-white/70 px-4 py-3.5 pl-11 text-sm outline-none transition placeholder:text-black/25 focus:border-black/20 focus:bg-white"
              />
            </div>

            <select
              value={bookingStatus}
              onChange={(event) =>
                setBookingStatus(event.target.value)
              }
              className="rounded-2xl border border-black/8 bg-white/70 px-4 py-3.5 text-sm outline-none transition focus:border-black/20"
            >
              <option value="">All booking statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={dateMode}
              onChange={handleDateModeChange}
              className="rounded-2xl border border-black/8 bg-white/70 px-4 py-3.5 text-sm outline-none transition focus:border-black/20"
            >
              <option value="all">All dates</option>
              <option value="month">Month & Year</option>
              <option value="range">Custom date range</option>
            </select>
          </div>

          {dateMode === "month" && (
            <div className="mt-3">
              <input
                type="month"
                value={selectedMonth}
                max={currentMonth}
                onChange={(event) => {
                  const value = event.target.value;

                  setSelectedMonth(
                    value > currentMonth
                      ? currentMonth
                      : value
                  );
                }}
                className="w-full rounded-2xl border border-black/8 bg-white/70 px-4 py-3.5 text-sm outline-none transition focus:border-black/20 focus:bg-white"
              />
            </div>
          )}

          {dateMode === "range" && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-black/35">
                  From
                </label>

                <input
                  type="date"
                  value={fromDate}
                  max={toDate || todayString}
                  onChange={handleFromDateChange}
                  className="w-full rounded-2xl border border-black/8 bg-white/70 px-4 py-3.5 text-sm outline-none transition focus:border-black/20 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-black/35">
                  To
                </label>

                <input
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  max={todayString}
                  onChange={handleToDateChange}
                  className="w-full rounded-2xl border border-black/8 bg-white/70 px-4 py-3.5 text-sm outline-none transition focus:border-black/20 focus:bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-red-500/15 bg-red-500/5 px-5 py-4">
            <div className="flex items-center gap-3">
              <FiXCircle
                size={16}
                className="text-red-600"
              />

              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              className="text-xs font-medium text-red-700 underline underline-offset-4"
            >
              Retry
            </button>
          </div>
        )}

        {/* Desktop */}
        <div className="mt-6 hidden overflow-hidden rounded-[28px] border border-black/8 bg-white/55 lg:block">
          <div className="grid grid-cols-[1.35fr_0.9fr_1.1fr_0.75fr_0.85fr_0.85fr_1.2fr_40px] border-b border-black/8 px-6 py-4 text-[10px] font-medium uppercase tracking-[0.16em] text-black/30">
            <span>Guest</span>
            <span>Apartment</span>
            <span>Stay</span>
            <span>Amount</span>
            <span>Booking</span>
            <span>Payment</span>
            <span>Timestamps</span>
            <span />
          </div>

          {loading ? (
            <div className="divide-y divide-black/6">
              <SkeletonRows />
            </div>
          ) : bookings.length === 0 ? (
            emptyState
          ) : (
            <div className="divide-y divide-black/6">
              {bookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/admin/bookings/${booking.id}`}
                  className="group grid grid-cols-[1.35fr_0.9fr_1.1fr_0.75fr_0.85fr_0.85fr_1.2fr_40px] items-center gap-4 px-6 py-5 transition hover:bg-black/[0.025]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {booking.guestName}
                    </p>

                    <p className="mt-1 truncate text-xs text-black/35">
                      {booking.email}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm">
                      {booking.apartment}
                    </p>

                    <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-black/30">
                      Apartment
                    </p>
                  </div>

                  {/* Stay */}
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-black/30">
                      Check in
                    </p>

                    <p className="mt-1 text-xs text-black/65">
                      {formatDate(booking.checkIn)}
                    </p>

                    <p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-black/30">
                      Checkout
                    </p>

                    <p className="mt-1 text-xs text-black/65">
                      {formatDate(booking.checkOut)}
                    </p>

                    <p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-black/30">
                      Stay
                    </p>

                    <p className="mt-1 text-xs text-black/50">
                      {booking.duration}{" "}
                      {booking.duration === 1
                        ? "day"
                        : "days"}
                    </p>
                  </div>

                  <p className="text-sm font-medium">
                    {formatCurrency(booking.amount)}
                  </p>

                  <StatusBadge
                    type="booking"
                    status={booking.bookingStatus}
                  />

                  <StatusBadge
                    type="payment"
                    status={booking.paymentStatus}
                  />

                  <div className="min-w-0">
                    <p className="text-[11px] text-black/60">
                      Created
                    </p>

                    <p className="truncate text-[11px] text-black/40">
                      {formatDateTime(booking.createdAt)}
                    </p>
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-black/8 bg-white transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                    <FiArrowUpRight size={14} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Mobile */}
        <div className="mt-6 space-y-3 lg:hidden">
          {loading ? (
            <SkeletonRows mobile />
          ) : bookings.length === 0 ? (
            <div className="rounded-[24px] border border-black/8 bg-white/55 px-5 py-16 text-center">
              <FiUsers
                size={28}
                className="mx-auto text-black/20"
              />

              <p className="mt-4 text-sm font-medium">
                No paid bookings found
              </p>

              <p className="mt-1 text-xs text-black/35">
                Try changing your search, status or date
                filter.
              </p>
            </div>
          ) : (
            bookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/admin/bookings/${booking.id}`}
                className="group block rounded-[24px] border border-black/8 bg-white/55 p-5 transition hover:bg-white"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {booking.guestName}
                    </p>

                    <p className="mt-1 truncate text-xs text-black/35">
                      {booking.email}
                    </p>
                  </div>

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/8 bg-white">
                    <FiArrowUpRight size={14} />
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-black/[0.025] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-black/40">
                        Apartment
                      </p>

                      <p className="mt-1 text-sm">
                        {booking.apartment}
                      </p>
                    </div>

                    <p className="text-sm font-medium">
                      {formatCurrency(booking.amount)}
                    </p>
                  </div>

                  {/* Stay */}
                  <div className="mt-4">
                    <p className="text-xs text-black/40">
                      Stay
                    </p>

                    <div className="mt-2 space-y-1.5 text-xs">
                      <p>
                        <span className="text-black/40">
                          Check in -
                        </span>{" "}
                        {formatDate(booking.checkIn)}
                      </p>

                      <p>
                        <span className="text-black/40">
                          Checkout -
                        </span>{" "}
                        {formatDate(booking.checkOut)}
                      </p>

                      <p>
                        <span className="text-black/40">
                          Stay -
                        </span>{" "}
                        {booking.duration}{" "}
                        {booking.duration === 1
                          ? "day"
                          : "days"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusBadge
                    type="booking"
                    status={booking.bookingStatus}
                  />

                  <StatusBadge
                    type="payment"
                    status={booking.paymentStatus}
                  />
                </div>

                <div className="mt-4 border-t border-black/6 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-black/30">
                        Created
                      </p>

                      <p className="mt-1 text-[11px] text-black/50">
                        {formatDateTime(
                          booking.createdAt
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Infinite-scroll sentinel */}
        {!loading && bookings.length > 0 && (
          <div
            ref={loadMoreRef}
            className="flex min-h-20 items-center justify-center"
          >
            {loadingMore ? (
              <div className="flex items-center gap-2 text-xs text-black/35">
                <FiLoader
                  size={14}
                  className="animate-spin"
                />
                Loading more bookings...
              </div>
            ) : hasMore ? (
              <span className="text-[10px] text-black/20">
                Scroll to load more
              </span>
            ) : (
              <span className="text-[10px] text-black/20">
                All paid bookings loaded
              </span>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
