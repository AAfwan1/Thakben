"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiLoader,
} from "react-icons/fi";

export default function CancelPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [state, setState] = useState("checking");
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) {
      setError("Booking ID is missing.");
      setState("error");
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const verifyBooking = async () => {
      try {
        attempts += 1;

        const response = await fetch(
          `/api/bookings/${encodeURIComponent(bookingId)}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (cancelled) return;

        if (!response.ok || !data?.success || !data?.booking) {
          setError(
            data?.message || "Unable to verify this booking."
          );
          setState("error");
          return;
        }

        const currentBooking = data.booking;
        setBooking(currentBooking);

        // Never show cancellation if payment actually succeeded.
        if (
          currentBooking.paymentStatus === "paid" &&
          currentBooking.status === "confirmed"
        ) {
          setState("confirmed");
          return;
        }

        // Customer cancellation is valid only when
        // the booking was actually cancelled.
        if (
          currentBooking.paymentStatus === "cancelled" &&
          currentBooking.status === "cancelled"
        ) {
          setState("cancelled");
          return;
        }

        if (attempts < 10) {
          setTimeout(verifyBooking, 2000);
          return;
        }

        setError(
          "We could not confirm the final payment status. Please check your booking again."
        );
        setState("error");
      } catch (err) {
        if (cancelled) return;

        if (attempts < 10) {
          setTimeout(verifyBooking, 2000);
          return;
        }

        setError(
          err?.message ||
            "Unable to verify your payment status."
        );
        setState("error");
      }
    };

    verifyBooking();

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  if (state === "checking") {
    return (
      <main className="min-h-screen bg-[#f5f4f0] px-4 py-10 text-[#11110f]">
        <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-3xl bg-white p-8 text-center shadow-sm sm:p-12">
            <FiLoader className="mx-auto h-8 w-8 animate-spin" />

            <h1 className="mt-6 text-2xl font-semibold">
              Verifying booking
            </h1>

            <p className="mt-3 text-sm text-black/55">
              Please wait while we verify your payment status.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (state === "confirmed") {
    return (
      <main className="min-h-screen bg-[#f5f4f0] px-4 py-10 text-[#11110f]">
        <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-3xl bg-white p-8 text-center shadow-sm sm:p-12">
            <h1 className="text-2xl font-semibold">
              Payment was successful
            </h1>

            <p className="mt-4 text-sm text-black/55">
              Your payment was verified and your booking is confirmed.
            </p>

            <Link
              href={`/success?bookingId=${bookingId}`}
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-[#11110f] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              View booking
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (state === "error") {
    return (
      <main className="min-h-screen bg-[#f5f4f0] px-4 py-10 text-[#11110f]">
        <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-3xl bg-white p-8 text-center shadow-sm sm:p-12">
            <FiAlertCircle className="mx-auto h-9 w-9 text-red-500" />

            <h1 className="mt-6 text-2xl font-semibold">
              Unable to verify booking
            </h1>

            <p className="mt-4 text-sm leading-6 text-black/55">
              {error}
            </p>

            <Link
              href="/"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 px-5 py-3 text-sm font-semibold transition hover:bg-black/[0.03]"
            >
              <FiArrowLeft className="h-4 w-4" />
              Go home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f4f0] px-4 py-10 text-[#11110f]">
      <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
        <div className="w-full rounded-3xl bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black/[0.05]">
            <FiAlertCircle className="h-8 w-8 text-black/60" />
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight">
            Payment cancelled
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/55">
            You cancelled the payment. Your booking was not confirmed
            and the selected dates have been released.
          </p>

          {booking && (
            <div className="mt-6 rounded-2xl bg-[#f5f4f0] p-4 text-left text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-black/50">
                  Booking ID
                </span>

                <span className="font-medium">
                  {booking._id || booking.id || bookingId}
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-4">
                <span className="text-black/50">
                  Payment
                </span>

                <span className="font-medium capitalize">
                  {booking.paymentStatus}
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-4">
                <span className="text-black/50">
                  Booking
                </span>

                <span className="font-medium capitalize">
                  {booking.status}
                </span>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
<Link
  href="/#apartments"
  className="
    inline-flex
    items-center
    justify-center
    rounded-xl
    border
    border-black/10
    bg-[#f2f0e9]
    px-5
    py-3
    text-sm
    font-semibold
    text-[#11110f]
    transition
    hover:bg-white
  "
>
  Browse apartments
</Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 px-5 py-3 text-sm font-semibold transition hover:bg-black/[0.03]"
            >
              <FiArrowLeft className="h-4 w-4" />
              Go home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}