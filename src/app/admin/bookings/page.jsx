"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FiArrowUpRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiLoader,
  FiRefreshCw,
  FiSearch,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";

const INITIAL_STATS = {
  totalBookings: 0,
  confirmedBookings: 0,
  pendingBookings: 0,
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

function formatCurrency(amount = 0) {
  return `৳${Number(amount || 0).toLocaleString("en-BD")}`;
}

function getBookingStatusLabel(status) {
  const labels = {
    confirmed: "Confirmed",
    pending: "Pending",
    cancelled: "Cancelled",
    completed: "Completed",
  };

  return labels[status] || status || "Unknown";
}

function getPaymentStatusLabel(status) {
  const labels = {
    paid: "Paid",
    unpaid: "Pending",
    failed: "Failed",
    cancelled: "Cancelled",
    refunded: "Refunded",
  };

  return labels[status] || status || "Unknown";
}

function StatusBadge({ type, status }) {
  let className =
    "border-black/10 bg-black/[0.04] text-black/50";

  let label = status;

  if (type === "booking") {
    label = getBookingStatusLabel(status);

    if (status === "confirmed") {
      className =
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-700";
    } else if (status === "pending") {
      className =
        "border-amber-500/20 bg-amber-500/10 text-amber-700";
    } else if (status === "cancelled") {
      className =
        "border-red-500/20 bg-red-500/10 text-red-700";
    }
  }

  if (type === "payment") {
    label = getPaymentStatusLabel(status);

    if (status === "paid") {
      className =
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-700";
    } else if (status === "unpaid") {
      className =
        "border-amber-500/20 bg-amber-500/10 text-amber-700";
    } else if (status === "failed") {
      className =
        "border-red-500/20 bg-red-500/10 text-red-700";
    } else if (status === "refunded") {
      className =
        "border-black/10 bg-black/[0.04] text-black/50";
    }
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium ${className}`}
    >
      {label}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}) {
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

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);

  const [stats, setStats] = useState(INITIAL_STATS);

  const [search, setSearch] = useState("");
  const [bookingStatus, setBookingStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [error, setError] = useState("");

  const [hasMore, setHasMore] = useState(false);

  const observerRef = useRef(null);

  const searchTimeoutRef = useRef(null);

  const fetchBookings = useCallback(
    async ({
      pageNumber = 1,
      append = false,
    } = {}) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const params = new URLSearchParams();

        params.set("page", String(pageNumber));
        params.set("limit", "20");

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (bookingStatus) {
          params.set("bookingStatus", bookingStatus);
        }

        if (paymentStatus) {
          params.set("paymentStatus", paymentStatus);
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

        if (append) {
          setBookings((previous) => [
            ...previous,
            ...(data.bookings || []),
          ]);
        } else {
          setBookings(data.bookings || []);
        }

        setStats(data.stats || INITIAL_STATS);

        setHasMore(
          Boolean(data.pagination?.hasMore)
        );

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
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [search, bookingStatus, paymentStatus]
  );

  /*
   * Initial load + filter changes.
   *
   * Search is debounced so we don't request the API
   * on every single keystroke.
   */
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchBookings({
        pageNumber: 1,
        append: false,
      });
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [
    search,
    bookingStatus,
    paymentStatus,
    fetchBookings,
  ]);

  /*
   * Infinite scrolling.
   *
   * When the bottom sentinel becomes visible,
   * another 20 bookings are loaded.
   */
  const loadMoreRef = useCallback(
    (node) => {
      if (loading || loadingMore || !hasMore) {
        return;
      }

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (
            entries[0]?.isIntersecting &&
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
        {
          rootMargin: "500px",
        }
      );

      if (node) {
        observerRef.current.observe(node);
      }
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
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const handleRefresh = () => {
    fetchBookings({
      pageNumber: 1,
      append: false,
    });
  };

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
              Manage apartment reservations, guest details,
              booking status and payment information.
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
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total bookings"
            value={stats.totalBookings.toLocaleString(
              "en-BD"
            )}
            icon={FiCalendar}
            loading={loading}
          />

          <StatCard
            label="Confirmed"
            value={stats.confirmedBookings.toLocaleString(
              "en-BD"
            )}
            icon={FiCheckCircle}
            loading={loading}
          />

          <StatCard
            label="Pending"
            value={stats.pendingBookings.toLocaleString(
              "en-BD"
            )}
            icon={FiClock}
            loading={loading}
          />

          <StatCard
            label="Paid revenue"
            value={formatCurrency(
              stats.paidRevenue
            )}
            icon={FiCreditCard}
            loading={loading}
          />
        </div>

        {/* Filters */}
        <div className="mt-8 rounded-[28px] border border-black/8 bg-white/55 p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
            {/* Search */}
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

            {/* Booking status */}
            <select
              value={bookingStatus}
              onChange={(event) =>
                setBookingStatus(event.target.value)
              }
              className="rounded-2xl border border-black/8 bg-white/70 px-4 py-3.5 text-sm outline-none transition focus:border-black/20"
            >
              <option value="">
                All bookings
              </option>
              <option value="confirmed">
                Confirmed
              </option>
              <option value="pending">
                Pending
              </option>
              <option value="cancelled">
                Cancelled
              </option>
              <option value="completed">
                Completed
              </option>
            </select>

            {/* Payment status */}
            <select
              value={paymentStatus}
              onChange={(event) =>
                setPaymentStatus(event.target.value)
              }
              className="rounded-2xl border border-black/8 bg-white/70 px-4 py-3.5 text-sm outline-none transition focus:border-black/20"
            >
              <option value="">
                All payments
              </option>
              <option value="paid">
                Paid
              </option>
              <option value="unpaid">
                Pending
              </option>
              <option value="failed">
                Failed
              </option>
              <option value="refunded">
                Refunded
              </option>
              <option value="cancelled">
                Cancelled
              </option>
            </select>
          </div>
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

        {/* Desktop table */}
        <div className="mt-6 hidden overflow-hidden rounded-[28px] border border-black/8 bg-white/55 lg:block">
          <div className="grid grid-cols-[1.5fr_1fr_1.15fr_0.8fr_0.9fr_0.9fr_40px] border-b border-black/8 px-6 py-4 text-[10px] font-medium uppercase tracking-[0.16em] text-black/30">
            <span>Guest</span>
            <span>Apartment</span>
            <span>Stay</span>
            <span>Amount</span>
            <span>Booking</span>
            <span>Payment</span>
            <span />
          </div>

          {loading ? (
            <div className="divide-y divide-black/6">
              {Array.from({ length: 6 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1.5fr_1fr_1.15fr_0.8fr_0.9fr_0.9fr_40px] items-center gap-4 px-6 py-5"
                  >
                    <div>
                      <div className="h-4 w-32 animate-pulse rounded bg-black/5" />
                      <div className="mt-2 h-3 w-40 animate-pulse rounded bg-black/5" />
                    </div>

                    <div className="h-4 w-24 animate-pulse rounded bg-black/5" />

                    <div>
                      <div className="h-3 w-28 animate-pulse rounded bg-black/5" />
                      <div className="mt-2 h-3 w-24 animate-pulse rounded bg-black/5" />
                    </div>

                    <div className="h-4 w-20 animate-pulse rounded bg-black/5" />

                    <div className="h-6 w-20 animate-pulse rounded-full bg-black/5" />

                    <div className="h-6 w-16 animate-pulse rounded-full bg-black/5" />

                    <div className="h-8 w-8 animate-pulse rounded-full bg-black/5" />
                  </div>
                )
              )}
            </div>
          ) : bookings.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <FiUsers
                size={28}
                className="mx-auto text-black/20"
              />

              <p className="mt-4 text-sm font-medium">
                No bookings found
              </p>

              <p className="mt-1 text-xs text-black/35">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-black/6">
              {bookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/admin/bookings/${booking.id}`}
                  className="group grid grid-cols-[1.5fr_1fr_1.15fr_0.8fr_0.9fr_0.9fr_40px] items-center gap-4 px-6 py-5 transition hover:bg-black/[0.025]"
                >
                  {/* Guest */}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {booking.guestName}
                    </p>

                    <p className="mt-1 truncate text-xs text-black/35">
                      {booking.email}
                    </p>
                  </div>

                  {/* Apartment */}
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
                    <p className="text-xs text-black/65">
                      {formatDate(booking.checkIn)}
                    </p>

                    <p className="mt-1 text-xs text-black/35">
                      → {formatDate(booking.checkOut)}
                    </p>

                    <p className="mt-1 text-[10px] text-black/25">
                      {booking.duration}{" "}
                      {booking.duration === 1
                        ? "day"
                        : "days"}
                    </p>
                  </div>

                  {/* Amount */}
                  <p className="text-sm font-medium">
                    {formatCurrency(
                      booking.amount
                    )}
                  </p>

                  {/* Booking status */}
                  <div>
                    <StatusBadge
                      type="booking"
                      status={booking.bookingStatus}
                    />
                  </div>

                  {/* Payment */}
                  <div>
                    <StatusBadge
                      type="payment"
                      status={booking.paymentStatus}
                    />
                  </div>

                  {/* Arrow */}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-black/8 bg-white transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                    <FiArrowUpRight
                      size={14}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Mobile cards */}
        <div className="mt-6 space-y-3 lg:hidden">
          {loading ? (
            Array.from({ length: 5 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="rounded-[24px] border border-black/8 bg-white/55 p-5"
                >
                  <div className="h-4 w-32 animate-pulse rounded bg-black/5" />
                  <div className="mt-3 h-3 w-44 animate-pulse rounded bg-black/5" />
                  <div className="mt-5 h-20 animate-pulse rounded-2xl bg-black/5" />
                </div>
              )
            )
          ) : bookings.length === 0 ? (
            <div className="rounded-[24px] border border-black/8 bg-white/55 px-5 py-16 text-center">
              <FiUsers
                size={28}
                className="mx-auto text-black/20"
              />

              <p className="mt-4 text-sm font-medium">
                No bookings found
              </p>

              <p className="mt-1 text-xs text-black/35">
                Try changing your search or filters.
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
                    <FiArrowUpRight
                      size={14}
                    />
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
                      {formatCurrency(
                        booking.amount
                      )}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-black/40">
                        Stay
                      </p>

                      <p className="mt-1 text-xs">
                        {formatDate(
                          booking.checkIn
                        )}{" "}
                        →{" "}
                        {formatDate(
                          booking.checkOut
                        )}
                      </p>
                    </div>

                    <p className="text-[10px] text-black/35">
                      {booking.duration}{" "}
                      {booking.duration === 1
                        ? "day"
                        : "days"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusBadge
                    type="booking"
                    status={
                      booking.bookingStatus
                    }
                  />

                  <StatusBadge
                    type="payment"
                    status={
                      booking.paymentStatus
                    }
                  />
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Lazy loading sentinel */}
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
                All bookings loaded
              </span>
            )}
          </div>
        )}
      </div>
    </main>
  );
}