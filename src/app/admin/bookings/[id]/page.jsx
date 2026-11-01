"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiArrowUpRight,
  FiArrowLeft,
  FiCalendar,
  FiCheck,
  FiClock,
  FiCreditCard,
  FiEdit2,
  FiHome,
  FiMail,
  FiMapPin,
  FiPhone,
  FiRefreshCw,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";

/* ==========================================================
   HELPERS
========================================================== */

function formatDate(dateString) {
  if (!dateString) return "—";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateTime(dateString) {
  if (!dateString) return "—";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatCurrency(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-BD")}`;
}

function formatStatus(status) {
  if (!status) return "Unknown";

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function toDateInputValue(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function calculateStayDays(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;

  const start = new Date(`${checkIn}T00:00:00.000Z`);
  const end = new Date(`${checkOut}T00:00:00.000Z`);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return 0;
  }

  return (end.getTime() - start.getTime()) / 86400000;
}

/* ==========================================================
   STATUS BADGE
========================================================== */

function StatusBadge({ status }) {
  const styles = {
    Confirmed:
      "border-emerald-100 bg-emerald-50 text-emerald-700",
    Pending:
      "border-amber-100 bg-amber-50 text-amber-700",
    Cancelled:
      "border-red-100 bg-red-50 text-red-600",
    Completed:
      "border-blue-100 bg-blue-50 text-blue-700",
    Paid:
      "border-emerald-100 bg-emerald-50 text-emerald-700",
    Unpaid:
      "border-amber-100 bg-amber-50 text-amber-700",
    Refunded:
      "border-black/8 bg-black/5 text-black/55",
    Failed:
      "border-red-100 bg-red-50 text-red-600",
  };

  const label = formatStatus(status);

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        border
        px-3
        py-1.5
        text-[10px]
        font-medium
        ${styles[label] || "border-black/8 bg-black/5 text-black/50"}
      `}
    >
      {label}
    </span>
  );
}

/* ==========================================================
   CONFIRMATION MODAL
========================================================== */

function ConfirmModal({
  type,
  booking,
  loading,
  error,
  onClose,
  onConfirm,
}) {
  const isCancel = type === "cancel";
  const isDelete = type === "delete";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#171714] p-6 text-white shadow-[0_30px_100px_rgba(0,0,0,0.4)]">
        <div
          className={`
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            ${
              isCancel || isDelete
                ? "bg-red-500/10 text-red-400"
                : "bg-emerald-500/10 text-emerald-400"
            }
          `}
        >
          {isDelete ? (
            <FiTrash2 size={20} />
          ) : isCancel ? (
            <FiAlertCircle size={20} />
          ) : (
            <FiRefreshCw size={20} />
          )}
        </div>

        <h2 className="mt-5 text-xl font-semibold tracking-tight">
          {isDelete
            ? "Delete this booking permanently?"
            : isCancel
              ? "Cancel this booking?"
              : "Mark payment as refunded?"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-white/50">
          {isDelete
            ? `This will permanently delete ${booking.guestName}'s booking record. This action cannot be undone. Related payment records will not be deleted.`
            : isCancel
              ? `This will cancel ${booking.guestName}'s booking. No automatic refund will be made.`
              : `Confirm that you have manually refunded ${formatCurrency(
                  booking.totalPrice
                )} to ${booking.guestName}.`}
        </p>

        {error && (
          <p className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs leading-5 text-red-300">
            {error}
          </p>
        )}

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">
              Booking
            </span>

            <span className="max-w-[220px] truncate text-xs font-medium text-white/80">
              {booking._id}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-white/40">
              Amount
            </span>

            <span className="text-sm font-semibold text-white">
              {formatCurrency(booking.totalPrice)}
            </span>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="
              flex
              flex-1
              items-center
              justify-center
              rounded-full
              border
              border-white/10
              bg-white/5
              px-4
              py-3
              text-xs
              font-medium
              !text-white/60
              transition
              hover:bg-white/10
              hover:!text-white
              disabled:opacity-50
            "
          >
            Keep
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`
              flex
              flex-1
              items-center
              justify-center
              gap-2
              rounded-full
              px-4
              py-3
              text-xs
              font-semibold
              transition
              disabled:cursor-not-allowed
              disabled:opacity-50
              ${
                isCancel || isDelete
                  ? "bg-red-500 !text-white hover:bg-red-600"
                  : "bg-[#f5f4f0] !text-[#11110f] hover:bg-white"
              }
            `}
          >
            {loading ? (
              <>
                <FiRefreshCw
                  size={14}
                  className="animate-spin"
                />
                Processing...
              </>
            ) : isDelete ? (
              <>
                <FiTrash2 size={14} />
                Delete Permanently
              </>
            ) : isCancel ? (
              <>
                <FiX size={14} />
                Cancel Booking
              </>
            ) : (
              <>
                <FiCheck size={14} />
                Mark Refunded
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================
   IDENTITY DOCUMENTS
========================================================== */

function IdentityDocuments({ booking }) {
  const identityDocuments =
    booking?.identityDocuments || {};

  const documents = [
    {
      key: "nidFront",
      label: "NID Front",
    },
    {
      key: "nidBack",
      label: "NID Back",
    },
    {
      key: "selfie",
      label: "Selfie",
    },
  ];

  return (
    <section className="rounded-[28px] border border-black/8 bg-white/70 p-6 sm:p-7">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-black/45">
          <FiUser size={17} />
        </div>

        <div>
          <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-black/35">
            Identity
          </p>

          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            Identity Documents
          </h2>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documents.map((document) => {
          const image =
            identityDocuments[document.key];

          return (
            <div
              key={document.key}
              className="overflow-hidden rounded-2xl border border-black/8 bg-[#f8f7f3]"
            >
              <div className="flex h-56 items-center justify-center bg-black/[0.025] p-3">
                {image?.url ? (
                  <a
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full w-full"
                  >
                    <img
                      src={image.url}
                      alt={document.label}
                      className="h-full w-full rounded-xl object-contain"
                    />
                  </a>
                ) : (
                  <div className="text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-black/5">
                      <FiUser
                        size={16}
                        className="text-black/30"
                      />
                    </div>

                    <p className="mt-3 text-xs font-medium text-black/50">
                      No image available
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-black/8 px-4 py-3">
                <p className="text-xs font-semibold text-black">
                  {document.label}
                </p>

                {image?.url && (
                  <a
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-black/40 transition hover:text-black"
                  >
                    Open image
                    <FiArrowUpRight size={11} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ==========================================================
   PAGE
========================================================== */

export default function BookingDetailsPage({ params }) {
  const router = useRouter();
  const { id } = use(params);

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] =
    useState("");
  const [modal, setModal] = useState(null);
  const [actionError, setActionError] = useState("");

  // Rescheduling state
  const [showReschedule, setShowReschedule] =
    useState(false);
  const [newCheckIn, setNewCheckIn] = useState("");
  const [newCheckOut, setNewCheckOut] = useState("");
  const [rescheduleLoading, setRescheduleLoading] =
    useState(false);
  const [rescheduleError, setRescheduleError] =
    useState("");

  /* ========================================================
     LOAD BOOKING
  ======================================================== */

  useEffect(() => {
    let cancelled = false;

    async function loadBooking() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/bookings/${id}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const text = await response.text();

        let data;

        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(
            "Invalid response from booking API."
          );
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Booking could not be found."
          );
        }

        if (!cancelled) {
          setBooking(data.booking);
        }
      } catch (err) {
        console.error("Load booking error:", err);

        if (!cancelled) {
          setError(
            err.message ||
              "Failed to load booking."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadBooking();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  /* ========================================================
     SUCCESS MESSAGE
  ======================================================== */

  function showMessage(message) {
    setSavedMessage(message);

    setTimeout(() => {
      setSavedMessage("");
    }, 3000);
  }

  /* ========================================================
     UPDATE BOOKING
  ======================================================== */

  async function updateBooking(action) {
    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/bookings/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            action,
          }),
        }
      );

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Invalid response from booking API."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update booking."
        );
      }

      setBooking(data.booking);
      setModal(null);

      if (action === "confirm") {
        showMessage("Booking confirmed");
      }

      if (action === "cancel") {
        showMessage(
          "Booking cancelled. No refund was made."
        );
      }

      if (action === "refund") {
        showMessage(
          "Payment marked as refunded"
        );
      }
    } catch (err) {
      console.error(
        "Update booking error:",
        err
      );

      setError(
        err.message ||
          "Failed to update booking."
      );
    } finally {
      setActionLoading(false);
    }
  }

  /* ========================================================
     RESCHEDULE BOOKING
  ======================================================== */

  function openReschedule() {
    setNewCheckIn(
      toDateInputValue(booking.checkIn)
    );

    setNewCheckOut(
      toDateInputValue(booking.checkOut)
    );

    setRescheduleError("");
    setShowReschedule(true);
  }

  async function rescheduleBooking() {
    if (
      !newCheckIn ||
      !newCheckOut ||
      newDays < 1 ||
      newPricePerDay === null
    ) {
      setRescheduleError(
        "Please select valid dates with an available pricing tier."
      );
      return;
    }

    try {
      setRescheduleLoading(true);
      setRescheduleError("");

      const response = await fetch(
        `/api/admin/bookings/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            action: "reschedule",
            checkIn: newCheckIn,
            checkOut: newCheckOut,
          }),
        }
      );

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Invalid response from booking API."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to reschedule booking."
        );
      }

      setBooking(data.booking);
      setShowReschedule(false);

      showMessage(
        "Booking rescheduled successfully"
      );
    } catch (err) {
      console.error(
        "Reschedule booking error:",
        err
      );

      setRescheduleError(
        err.message ||
          "Failed to reschedule booking."
      );
    } finally {
      setRescheduleLoading(false);
    }
  }

  /* ========================================================
     PERMANENTLY DELETE BOOKING
  ======================================================== */

  async function deleteBooking() {
    try {
      setActionLoading(true);
      setActionError("");

      const response = await fetch(
        `/api/admin/bookings/${id}`,
        {
          method: "DELETE",
          credentials: "include",
          cache: "no-store",
        }
      );

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Invalid response from booking API."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to delete booking."
        );
      }

      setModal(null);
      router.replace("/admin/bookings");
    } catch (err) {
      console.error("Delete booking error:", err);

      setActionError(
        err.message || "Failed to delete booking."
      );
    } finally {
      setActionLoading(false);
    }
  }

  /* ========================================================
     LOADING
  ======================================================== */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f4f0] text-[#11110f]">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-black/5">
            <FiRefreshCw
              size={20}
              className="animate-spin text-black/40"
            />
          </div>

          <p className="mt-4 text-sm text-black/45">
            Loading booking...
          </p>
        </div>
      </main>
    );
  }

  /* ========================================================
     ERROR
  ======================================================== */

  if (error || !booking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f4f0] px-6 text-[#11110f]">
        <div className="w-full max-w-md rounded-[28px] border border-black/10 bg-white p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-black/5 text-black/40">
            <FiCalendar size={20} />
          </div>

          <h1 className="mt-5 text-xl font-semibold">
            Booking not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-black/50">
            {error ||
              "The booking you are trying to view does not exist."}
          </p>

          <Link
            href="/admin/bookings"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#11110f] px-5 py-3 text-xs font-semibold !text-white transition hover:bg-[#252522]"
          >
            <FiArrowLeft size={14} />
            Back to Bookings
          </Link>
        </div>
      </main>
    );
  }

  /* ========================================================
     APARTMENT
  ======================================================== */

  const apartment =
    booking.apartmentId &&
    typeof booking.apartmentId === "object"
      ? booking.apartmentId
      : null;

  const apartmentName =
    apartment?.title ||
    (apartment?.size
      ? `${apartment.size} sq.ft. Apartment`
      : "Apartment");

  const apartmentSlug =
    apartment?.slug ||
    (apartment?.size
      ? `${apartment.size}-sqft`
      : "");

  /* ========================================================
     RESCHEDULE PRICE PREVIEW
  ======================================================== */

  const newDays = calculateStayDays(
    newCheckIn,
    newCheckOut
  );

  const selectedPricing =
    apartment?.pricing?.find(
      (tier) =>
        newDays >= tier.minDays &&
        (tier.maxDays == null ||
          newDays <= tier.maxDays)
    );

  const newPricePerDay =
    selectedPricing?.pricePerDay ?? null;

  const newTotalPrice =
    newPricePerDay !== null && newDays > 0
      ? newPricePerDay * newDays
      : null;

  const priceDifference =
    newTotalPrice !== null
      ? newTotalPrice - Number(booking.totalPrice || 0)
      : null;

  /* ========================================================
     ACTION CONDITIONS
  ======================================================== */

  const canConfirm =
    booking.status === "pending" &&
    booking.paymentStatus === "paid";

  const canCancel =
    booking.status !== "cancelled" &&
    booking.status !== "completed";

  const canRefund =
    booking.paymentStatus === "paid" &&
    booking.status === "cancelled";

  const canReschedule =
    booking.status !== "cancelled" &&
    booking.status !== "completed";

  /* ========================================================
     RENDER
  ======================================================== */

  return (
    <>
      <main className="min-h-screen bg-[#f5f4f0] text-[#11110f]">

        {/* ==================================================
            HEADER
        ================================================== */}

        <section className="px-4 pb-8 pt-28 sm:px-6 lg:px-10 lg:pt-32">
          <div className="mx-auto max-w-6xl">

            <Link
              href="/admin/bookings"
              className="
                group
                mb-6
                inline-flex
                items-center
                gap-2
                text-xs
                font-medium
                text-black/45
                transition
                hover:text-black
              "
            >
              <FiArrowLeft
                size={14}
                className="transition-transform duration-300 group-hover:-translate-x-0.5"
              />

              Bookings
            </Link>

            <div
              className="
                flex
                flex-col
                gap-6
                border-b
                border-black/10
                pb-8
                lg:flex-row
                lg:items-end
                lg:justify-between
              "
            >
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-black/40">
                  Booking Details
                </p>

                <h1 className="mt-3 break-all text-3xl font-medium tracking-[-0.05em] sm:text-5xl">
                  {booking._id}
                </h1>

                <p className="mt-3 text-sm text-black/50">
                  Reservation for{" "}
                  {booking.guestName}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusBadge
                  status={booking.status}
                />

                <StatusBadge
                  status={booking.paymentStatus}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <section className="px-4 pb-28 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">

            {/* =================================================
                LEFT
            ================================================== */}

            <div className="space-y-5">

              {/* GUEST */}

              <section className="rounded-[28px] border border-black/8 bg-white/70 p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-black/45">
                    <FiUser size={17} />
                  </div>

                  <div>
                    <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-black/35">
                      Guest
                    </p>

                    <h2 className="mt-1 text-lg font-semibold tracking-tight">
                      {booking.guestName}
                    </h2>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">

                  <a
                    href={`mailto:${booking.email}`}
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-2xl
                      border
                      border-black/8
                      bg-[#f8f7f3]
                      p-4
                      transition
                      hover:border-black/15
                      hover:bg-white
                    "
                  >
                    <FiMail
                      size={15}
                      className="text-black/35"
                    />

                    <div className="min-w-0">
                      <p className="text-[9px] uppercase tracking-[0.12em] text-black/30">
                        Email
                      </p>

                      <p className="mt-1 truncate text-sm font-medium">
                        {booking.email}
                      </p>
                    </div>
                  </a>

                  <a
                    href={`tel:${booking.guestPhone}`}
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-2xl
                      border
                      border-black/8
                      bg-[#f8f7f3]
                      p-4
                      transition
                      hover:border-black/15
                      hover:bg-white
                    "
                  >
                    <FiPhone
                      size={15}
                      className="text-black/35"
                    />

                    <div>
                      <p className="text-[9px] uppercase tracking-[0.12em] text-black/30">
                        Phone
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {booking.guestPhone}
                      </p>
                    </div>
                  </a>

                </div>
              </section>

              {/* IDENTITY DOCUMENTS */}

              <IdentityDocuments
                booking={booking}
              />

              {/* STAY */}

              <section className="rounded-[28px] border border-black/8 bg-white/70 p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-black/45">
                    <FiCalendar size={17} />
                  </div>

                  <div>
                    <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-black/35">
                      Stay
                    </p>

                    <h2 className="mt-1 text-lg font-semibold tracking-tight">
                      Reservation Dates
                    </h2>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">

                  <div className="rounded-2xl border border-black/8 bg-[#f8f7f3] p-4">
                    <p className="text-[9px] uppercase tracking-[0.12em] text-black/30">
                      Check-in
                    </p>

                    <p className="mt-2 text-sm font-semibold">
                      {formatDate(
                        booking.checkIn
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-black/8 bg-[#f8f7f3] p-4">
                    <p className="text-[9px] uppercase tracking-[0.12em] text-black/30">
                      Check-out
                    </p>

                    <p className="mt-2 text-sm font-semibold">
                      {formatDate(
                        booking.checkOut
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-black/8 bg-[#f8f7f3] p-4">
                    <p className="text-[9px] uppercase tracking-[0.12em] text-black/30">
                      Duration
                    </p>

                    <p className="mt-2 text-sm font-semibold">
                      {booking.days}{" "}
                      {booking.days === 1
                        ? "day"
                        : "days"}
                    </p>
                  </div>

                </div>
              </section>

              {/* RESCHEDULE FORM */}

              {showReschedule && (
                <section className="rounded-[28px] border border-black/8 bg-white/70 p-6 sm:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-black/45">
                        <FiEdit2 size={17} />
                      </div>

                      <div>
                        <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-black/35">
                          Admin
                        </p>

                        <h2 className="mt-1 text-lg font-semibold tracking-tight">
                          Reschedule Booking
                        </h2>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowReschedule(false);
                        setRescheduleError("");
                      }}
                      disabled={rescheduleLoading}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-black/8 text-black/40 transition hover:bg-black/5 hover:text-black disabled:opacity-50"
                      aria-label="Close reschedule form"
                    >
                      <FiX size={16} />
                    </button>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="newCheckIn"
                        className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-black/40"
                      >
                        New Check-in
                      </label>

                      <input
                        id="newCheckIn"
                        type="date"
                        value={newCheckIn}
                        onChange={(e) =>
                          setNewCheckIn(e.target.value)
                        }
                        disabled={rescheduleLoading}
                        className="w-full rounded-xl border border-black/10 bg-[#f8f7f3] px-4 py-3 text-sm font-medium outline-none transition focus:border-black/30 disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="newCheckOut"
                        className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-black/40"
                      >
                        New Check-out
                      </label>

                      <input
                        id="newCheckOut"
                        type="date"
                        min={newCheckIn || undefined}
                        value={newCheckOut}
                        onChange={(e) =>
                          setNewCheckOut(e.target.value)
                        }
                        disabled={rescheduleLoading}
                        className="w-full rounded-xl border border-black/10 bg-[#f8f7f3] px-4 py-3 text-sm font-medium outline-none transition focus:border-black/30 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-black/8 bg-[#f8f7f3] p-5">
                    <p className="text-[9px] font-medium uppercase tracking-[0.15em] text-black/35">
                      Updated Price Preview
                    </p>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-black/45">
                          Duration
                        </span>

                        <span className="text-sm font-semibold">
                          {newDays > 0
                            ? `${newDays} ${
                                newDays === 1
                                  ? "day"
                                  : "days"
                              }`
                            : "—"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-black/45">
                          Price per day
                        </span>

                        <span className="text-sm font-semibold">
                          {newPricePerDay !== null
                            ? formatCurrency(newPricePerDay)
                            : "No matching price"}
                        </span>
                      </div>

                      <div className="h-px bg-black/8" />

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-black/45">
                          Current total
                        </span>

                        <span className="text-sm font-semibold">
                          {formatCurrency(booking.totalPrice)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-black/45">
                          New total
                        </span>

                        <span className="text-lg font-semibold">
                          {newTotalPrice !== null
                            ? formatCurrency(newTotalPrice)
                            : "—"}
                        </span>
                      </div>

                      {priceDifference !== null && (
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs text-black/45">
                            Price difference
                          </span>

                          <span
                            className={`text-sm font-semibold ${
                              priceDifference > 0
                                ? "text-red-600"
                                : priceDifference < 0
                                  ? "text-emerald-700"
                                  : "text-black/60"
                            }`}
                          >
                            {priceDifference > 0
                              ? "+"
                              : priceDifference < 0
                                ? "−"
                                : ""}
                            {formatCurrency(
                              Math.abs(priceDifference)
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="mt-4 text-[11px] leading-5 text-black/40">
                    The booking total will be updated using
                    the apartment's pricing tiers. Any
                    additional payment or refund difference
                    must be handled separately.
                  </p>

                  {rescheduleError && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-600">
                      {rescheduleError}
                    </div>
                  )}

                  <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        setShowReschedule(false);
                        setRescheduleError("");
                      }}
                      disabled={rescheduleLoading}
                      className="flex flex-1 items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-3.5 text-xs font-semibold text-black/55 transition hover:bg-black/5 disabled:opacity-50"
                    >
                      Keep Current Dates
                    </button>

                    <button
                      type="button"
                      onClick={rescheduleBooking}
                      disabled={
                        rescheduleLoading ||
                        !newCheckIn ||
                        !newCheckOut ||
                        newDays < 1 ||
                        newPricePerDay === null
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#11110f] px-4 py-3.5 text-xs font-semibold !text-white transition hover:bg-[#252522] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {rescheduleLoading ? (
                        <>
                          <FiRefreshCw
                            size={14}
                            className="animate-spin"
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiCheck size={14} />
                          Save New Dates
                        </>
                      )}
                    </button>
                  </div>
                </section>
              )}

              {/* APARTMENT */}

              <section className="rounded-[28px] border border-black/8 bg-white/70 p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-black/45">
                    <FiHome size={17} />
                  </div>

                  <div>
                    <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-black/35">
                      Apartment
                    </p>

                    <h2 className="mt-1 text-lg font-semibold tracking-tight">
                      {apartmentName}
                    </h2>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                  <div className="flex flex-1 items-center gap-3 rounded-2xl border border-black/8 bg-[#f8f7f3] p-4">
                    <FiHome
                      size={15}
                      className="text-black/35"
                    />

                    <div>
                      <p className="text-[9px] uppercase tracking-[0.12em] text-black/30">
                        Apartment
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {apartmentName}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-1 items-center gap-3 rounded-2xl border border-black/8 bg-[#f8f7f3] p-4">
                    <FiMapPin
                      size={15}
                      className="text-black/35"
                    />

                    <div>
                      <p className="text-[9px] uppercase tracking-[0.12em] text-black/30">
                        Location
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        Bashundhara R/A, Dhaka
                      </p>
                    </div>
                  </div>

                </div>

                {apartmentSlug && (
                  <Link
                    href={`/apartments/${apartmentSlug}`}
                    target="_blank"
                    className="
                      mt-4
                      inline-flex
                      items-center
                      gap-2
                      text-xs
                      font-medium
                      text-black/50
                      transition
                      hover:text-black
                    "
                  >
                    View apartment
                    <FiArrowUpRight size={13} />
                  </Link>
                )}
              </section>

              {/* PAYMENT VERIFICATION */}

              <section className="rounded-[28px] border border-black/8 bg-white/70 p-6 sm:p-7">

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-black/45">
                    <FiCreditCard size={17} />
                  </div>

                  <div>
                    <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-black/35">
                      Payment Verification
                    </p>

                    <h2 className="mt-1 text-lg font-semibold tracking-tight">
                      Transaction Details
                    </h2>
                  </div>
                </div>

                <div className="mt-6 space-y-3">

                  <div className="rounded-2xl border border-black/8 bg-[#11110f] p-5 text-white">
                    <div className="flex items-center justify-between gap-4">

                      <div>
                        <p className="text-[9px] uppercase tracking-[0.15em] text-white/35">
                          Transaction ID
                        </p>

                        <p className="mt-2 break-all text-sm font-semibold">
                          {booking.transactionId ||
                            "Not available"}
                        </p>
                      </div>

                      <StatusBadge
                        status={
                          booking.paymentStatus
                        }
                      />

                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">

                    <div className="rounded-2xl border border-black/8 bg-[#f8f7f3] p-4">
                      <p className="text-[9px] uppercase tracking-[0.12em] text-black/30">
                        Payment Method
                      </p>

                      <p className="mt-2 text-sm font-semibold">
                        {booking.paymentMethod ||
                          "Not available"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-black/8 bg-[#f8f7f3] p-4">
                      <p className="text-[9px] uppercase tracking-[0.12em] text-black/30">
                        Payment Gateway
                      </p>

                      <p className="mt-2 text-sm font-semibold">
                        {booking.paymentGateway
                          ? booking.paymentGateway.toUpperCase()
                          : "Not available"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-black/8 bg-[#f8f7f3] p-4">
                      <p className="text-[9px] uppercase tracking-[0.12em] text-black/30">
                        Paid At
                      </p>

                      <p className="mt-2 text-sm font-semibold">
                        {formatDateTime(
                          booking.paidAt
                        )}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-black/8 bg-[#f8f7f3] p-4">
                      <p className="text-[9px] uppercase tracking-[0.12em] text-black/30">
                        Amount Paid
                      </p>

                      <p className="mt-2 text-sm font-semibold">
                        {formatCurrency(
                          booking.totalPrice
                        )}
                      </p>
                    </div>

                  </div>

                  {booking.paymentFailureReason && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                      <p className="text-[9px] uppercase tracking-[0.12em] text-red-500/60">
                        Payment Failure Reason
                      </p>

                      <p className="mt-2 text-sm font-medium text-red-700">
                        {booking.paymentFailureReason}
                      </p>
                    </div>
                  )}

                </div>
              </section>

            </div>

            {/* =================================================
                RIGHT SIDEBAR
            ================================================== */}

            <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">

              {/* PAYMENT SUMMARY */}

              <section className="rounded-[28px] border border-black/8 bg-white/80 p-6 shadow-[0_15px_50px_rgba(0,0,0,0.04)]">

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-black/45">
                    <FiCreditCard size={17} />
                  </div>

                  <div>
                    <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-black/35">
                      Payment
                    </p>

                    <h2 className="mt-1 text-lg font-semibold tracking-tight">
                      Payment Summary
                    </h2>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-[#11110f] p-5 text-white">

                  <p className="text-[9px] uppercase tracking-[0.15em] text-white/35">
                    Total Amount
                  </p>

                  <p className="mt-2 text-3xl font-semibold tracking-tight">
                    {formatCurrency(
                      booking.totalPrice
                    )}
                  </p>

                  <div className="mt-4 border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/40">
                        Payment
                      </span>

                      <StatusBadge
                        status={
                          booking.paymentStatus
                        }
                      />
                    </div>
                  </div>

                </div>

                {canRefund && (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">

                    <p className="text-xs font-semibold text-amber-800">
                      Refund required
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-amber-700/80">
                      The booking is cancelled but
                      payment is still marked as paid.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setModal("refund")
                      }
                      className="
                        mt-4
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-[#11110f]
                        px-4
                        py-3
                        text-xs
                        font-semibold
                        !text-white
                        transition
                        hover:bg-[#252522]
                      "
                    >
                      <FiRefreshCw size={14} />
                      Mark as Refunded
                    </button>

                  </div>
                )}

              </section>

              {/* BOOKING VERIFICATION */}

              <section className="rounded-[28px] border border-black/8 bg-white/70 p-6">

                <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-black/35">
                  Booking Verification
                </p>

                <div className="mt-5 space-y-4">

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.12em] text-black/30">
                      Booking ID
                    </p>

                    <p className="mt-2 break-all text-xs font-semibold">
                      {booking._id}
                    </p>
                  </div>

                  <div className="h-px bg-black/6" />

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-black/45">
                      Booking Status
                    </span>

                    <StatusBadge
                      status={booking.status}
                    />
                  </div>

                  <div className="h-px bg-black/6" />

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.12em] text-black/30">
                      Created
                    </p>

                    <p className="mt-2 text-xs font-semibold">
                      {formatDateTime(
                        booking.createdAt
                      )}
                    </p>
                  </div>

                  {booking.updatedAt && (
                    <>
                      <div className="h-px bg-black/6" />

                      <div>
                        <p className="text-[9px] uppercase tracking-[0.12em] text-black/30">
                          Last Updated
                        </p>

                        <p className="mt-2 text-xs font-semibold">
                          {formatDateTime(
                            booking.updatedAt
                          )}
                        </p>
                      </div>
                    </>
                  )}

                </div>
              </section>

              {/* ACTIONS */}

              <section className="rounded-[28px] border border-black/8 bg-white/70 p-6">

                <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-black/35">
                  Booking Actions
                </p>

                <div className="mt-4 space-y-2">

                  {canReschedule && (
                    <button
                      type="button"
                      onClick={openReschedule}
                      disabled={
                        actionLoading ||
                        rescheduleLoading
                      }
                      className="
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-black/10
                        bg-white
                        px-4
                        py-3.5
                        text-xs
                        font-semibold
                        text-black/70
                        transition
                        hover:bg-black/5
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      <FiEdit2 size={14} />
                      Reschedule Booking
                    </button>
                  )}

                  {canConfirm && (
                    <button
                      type="button"
                      onClick={() =>
                        updateBooking("confirm")
                      }
                      disabled={actionLoading}
                      className="
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-[#11110f]
                        px-4
                        py-3.5
                        text-xs
                        font-semibold
                        !text-white
                        transition
                        hover:bg-[#252522]
                        disabled:opacity-50
                      "
                    >
                      {actionLoading ? (
                        <FiRefreshCw
                          size={14}
                          className="animate-spin"
                        />
                      ) : (
                        <FiCheck size={14} />
                      )}

                      Confirm Booking
                    </button>
                  )}

                  {canCancel && (
                    <button
                      type="button"
                      onClick={() =>
                        setModal("cancel")
                      }
                      disabled={actionLoading}
                      className="
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-red-100
                        bg-red-50
                        px-4
                        py-3.5
                        text-xs
                        font-semibold
                        !text-red-600
                        transition
                        hover:border-red-200
                        hover:bg-red-100
                        disabled:opacity-50
                      "
                    >
                      <FiX size={14} />
                      Cancel Booking
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setActionError("");
                      setModal("delete");
                    }}
                    disabled={actionLoading}
                    className="
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-red-200
                      bg-white
                      px-4
                      py-3.5
                      text-xs
                      font-semibold
                      !text-red-600
                      transition
                      hover:bg-red-50
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    <FiTrash2 size={14} />
                    Delete Booking Permanently
                  </button>

                </div>
              </section>

              {/* CURRENT STATUS */}

              <section className="rounded-[28px] border border-black/8 bg-white/70 p-6">

                <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-black/35">
                  Current Status
                </p>

                <div className="mt-5 space-y-4">

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-black/45">
                      Booking
                    </span>

                    <StatusBadge
                      status={booking.status}
                    />
                  </div>

                  <div className="h-px bg-black/6" />

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-black/45">
                      Payment
                    </span>

                    <StatusBadge
                      status={
                        booking.paymentStatus
                      }
                    />
                  </div>

                  <div className="h-px bg-black/6" />

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-black/45">
                      Price / day
                    </span>

                    <span className="text-xs font-semibold">
                      {formatCurrency(
                        booking.pricePerDay
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-black/45">
                      Days
                    </span>

                    <span className="text-xs font-semibold">
                      {booking.days}
                    </span>
                  </div>

                </div>
              </section>

              {/* NOTE */}

              <div className="rounded-[24px] border border-black/8 bg-black/[0.025] p-5">
                <div className="flex gap-3">
                  <FiClock
                    size={15}
                    className="mt-0.5 shrink-0 text-black/30"
                  />

                  <p className="text-[11px] leading-5 text-black/45">
                    Verify the guest details, booking
                    dates, amount, payment status and
                    transaction ID before confirming a
                    reservation.
                  </p>
                </div>
              </div>

            </aside>
          </div>
        </section>
      </main>

      {/* ======================================================
          CONFIRMATION MODAL
      ======================================================= */}

      {modal && (
        <ConfirmModal
          type={modal}
          booking={booking}
          loading={actionLoading}
          error={actionError}
          onClose={() => {
            if (!actionLoading) {
              setModal(null);
              setActionError("");
            }
          }}
          onConfirm={() =>
            modal === "delete"
              ? deleteBooking()
              : updateBooking(modal)
          }
        />
      )}

      {/* ======================================================
          SUCCESS MESSAGE
      ======================================================= */}

      {savedMessage && (
        <div
          className="
            fixed
            bottom-6
            left-1/2
            z-[110]
            flex
            -translate-x-1/2
            items-center
            gap-3
            rounded-full
            border
            border-black/10
            bg-[#11110f]
            px-5
            py-3
            text-sm
            !text-white
            shadow-[0_15px_50px_rgba(0,0,0,0.25)]
          "
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
            <FiCheck size={13} />
          </span>

          {savedMessage}
        </div>
      )}
    </>
  );
}