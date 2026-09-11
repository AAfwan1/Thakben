
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiLoader,
  FiRefreshCw,
} from "react-icons/fi";

function FailPageContent() {
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
    let timer = null;

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

        // A successful payment must never be shown as failed.
        if (
          currentBooking.paymentStatus === "paid" &&
          currentBooking.status === "confirmed"
        ) {
          setState("confirmed");
          return;
        }

        // Failed payment.
        if (
          currentBooking.paymentStatus === "failed" &&
          currentBooking.status === "cancelled"
        ) {
          setState("failed");
          return;
        }

        // If callback has not finished updating MongoDB yet,
        // give it a few seconds and check again.
        if (attempts < 10) {
          timer = setTimeout(verifyBooking, 2000);
          return;
        }

        setError(
          "We could not confirm the final payment status. Please check your booking again."
        );
        setState("error");
      } catch (err) {
        if (cancelled) return;

        if (attempts < 10) {
          timer = setTimeout(verifyBooking, 2000);
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

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [bookingId]);

  if (state === "checking") {
    return (
      <main className="min-h-screen bg-[#f5f4f0] px-4 py-10 text-[#11110f]">
        <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-3xl bg-white p-8 text-center shadow-sm sm:p-12">
            <FiLoader className="mx-auto h-8 w-8 animate-spin" />

            <h1 className="mt-6 text-2xl font-semibold">
              Verifying payment
            </h1>

            <p className="mt-3 text-sm text-black/55">
              Please wait while we verify your booking status.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // If payment actually succeeded, never show a fake failure page.
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
              Unable to verify payment
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
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <FiAlertCircle className="h-8 w-8 text-red-500" />
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight">
            Payment failed
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/55">
            Your payment was not completed. Your booking has not been
            confirmed and the selected dates are available again.
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
              href="/#apartment"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#11110f] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <FiRefreshCw className="h-4 w-4" />
              Try again
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

export default function FailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f5f4f0] px-4 py-10 text-[#11110f]">
          <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
            <div className="w-full rounded-3xl bg-white p-8 text-center shadow-sm sm:p-12">
              <FiLoader className="mx-auto h-8 w-8 animate-spin" />

              <h1 className="mt-6 text-2xl font-semibold">
                Verifying payment
              </h1>

              <p className="mt-3 text-sm text-black/55">
                Please wait while we verify your booking status.
              </p>
            </div>
          </div>
        </main>
      }
    >
      <FailPageContent />
    </Suspense>
  );
}
