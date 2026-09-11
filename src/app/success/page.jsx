"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiArrowRight,
  FiCheck,
  FiHome,
  FiLoader,
} from "react-icons/fi";

export default function PaymentSuccessPage() {
  const [bookingId, setBookingId] = useState("");
  const [status, setStatus] = useState("checking");
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("bookingId");

    if (!id) {
      setStatus("invalid");
      return;
    }

    setBookingId(id);

    let attempts = 0;
    let timer = null;
    let stopped = false;

    const checkBooking = async () => {
      if (stopped) return;

      attempts += 1;

      try {
        const response = await fetch(
          `/api/bookings/${encodeURIComponent(id)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success || !data.booking) {
          throw new Error(
            data.message || "Unable to check booking."
          );
        }

        if (stopped) return;

        setBooking(data.booking);

        if (
          data.booking.paymentStatus === "paid" &&
          data.booking.status === "confirmed"
        ) {
          setStatus("confirmed");
          stopped = true;
          return;
        }

        if (
          data.booking.paymentStatus === "failed" ||
          data.booking.status === "cancelled"
        ) {
          setStatus("failed");
          stopped = true;
          return;
        }

        if (attempts < 15) {
          timer = setTimeout(checkBooking, 2000);
        } else {
          setStatus("pending");
          stopped = true;
        }
      } catch (error) {
        console.error("Booking status check error:", error);

        if (attempts < 15) {
          timer = setTimeout(checkBooking, 2000);
        } else {
          setStatus("error");
          stopped = true;
        }
      }
    };

    checkBooking();

    return () => {
      stopped = true;

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  if (status === "checking") {
    return (
      <main className="min-h-screen bg-[#f5f4f0] px-4 py-24 text-[#11110f] sm:px-6 lg:px-10">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-[32px] border border-black/10 bg-white p-7 text-center shadow-[0_20px_70px_rgba(0,0,0,0.08)] sm:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#11110f] text-[#f5f4f0]">
              <FiLoader
                size={32}
                className="animate-spin"
              />
            </div>

            <p className="mt-7 text-[10px] font-medium uppercase tracking-[0.22em] text-black/40">
              Verifying payment
            </p>

            <h1 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
              Confirming your booking
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-black/50">
              Your payment was received by the payment gateway.
              We are waiting for the secure payment verification to
              complete.
            </p>

            {bookingId && (
              <div className="mx-auto mt-7 max-w-md rounded-2xl border border-black/10 bg-[#f5f4f0] px-5 py-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-black/35">
                  Booking ID
                </p>

                <p className="mt-2 break-all font-mono text-sm text-black/70">
                  {bookingId}
                </p>
              </div>
            )}

            <p className="mt-7 text-[10px] leading-5 text-black/30">
              Please do not close this page while we verify your
              payment.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (status === "confirmed") {
    return (
      <main className="min-h-screen bg-[#f5f4f0] px-4 py-24 text-[#11110f] sm:px-6 lg:px-10">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-[32px] border border-black/10 bg-white p-7 text-center shadow-[0_20px_70px_rgba(0,0,0,0.08)] sm:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#11110f] text-[#f5f4f0]">
              <FiCheck
                size={34}
                strokeWidth={1.8}
              />
            </div>

            <p className="mt-7 text-[10px] font-medium uppercase tracking-[0.22em] text-black/40">
              Payment verified
            </p>

            <h1 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
              Booking confirmed
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-black/50">
              Your payment has been verified successfully and your
              apartment booking is now confirmed.
            </p>

            {bookingId && (
              <div className="mx-auto mt-7 max-w-md rounded-2xl border border-black/10 bg-[#f5f4f0] px-5 py-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-black/35">
                  Booking ID
                </p>

                <p className="mt-2 break-all font-mono text-sm text-black/70">
                  {bookingId}
                </p>
              </div>
            )}

            {booking && (
              <div className="mx-auto mt-3 max-w-md rounded-2xl border border-black/10 bg-[#f5f4f0] px-5 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-black/40">
                    Stay duration
                  </span>

                  <span className="text-sm font-medium">
                    {booking.days}{" "}
                    {booking.days === 1 ? "day" : "days"}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-black/40">
                    Total paid
                  </span>

                  <span className="text-sm font-medium">
                    ৳{Number(booking.totalPrice).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/apartments"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-[#f2f0e9] px-6 py-3.5 text-sm font-medium text-[#11110f] transition-all duration-300 hover:bg-white hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
              >
                Browse apartments

                <FiArrowRight
                  size={15}
                  className="text-[#11110f] transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3.5 text-sm font-medium text-[#11110f] transition-all duration-300 hover:bg-[#f5f4f0]"
              >
                <FiHome size={15} />
                Go home
              </Link>
            </div>

            <p className="mt-7 text-[10px] leading-5 text-black/30">
              Please keep your booking ID for future communication
              regarding your reservation.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (status === "pending") {
    return (
      <main className="min-h-screen bg-[#f5f4f0] px-4 py-24 text-[#11110f] sm:px-6 lg:px-10">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-[32px] border border-black/10 bg-white p-7 text-center shadow-[0_20px_70px_rgba(0,0,0,0.08)] sm:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-black/10 text-[#11110f]">
              <FiLoader
                size={32}
                className="animate-spin"
              />
            </div>

            <p className="mt-7 text-[10px] font-medium uppercase tracking-[0.22em] text-black/40">
              Payment processing
            </p>

            <h1 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
              Verification is taking longer
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-black/50">
              Your payment callback was received, but the final
              verification has not completed yet. Please keep your
              booking ID.
            </p>

            {bookingId && (
              <div className="mx-auto mt-7 max-w-md rounded-2xl border border-black/10 bg-[#f5f4f0] px-5 py-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-black/35">
                  Booking ID
                </p>

                <p className="mt-2 break-all font-mono text-sm text-black/70">
                  {bookingId}
                </p>
              </div>
            )}

            <Link
              href="/"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-[#f2f0e9] px-6 py-3.5 text-sm font-medium text-[#11110f] transition-all duration-300 hover:bg-white"
            >
              <FiHome size={15} />
              Go home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (status === "failed") {
    return (
      <main className="min-h-screen bg-[#f5f4f0] px-4 py-24 text-[#11110f] sm:px-6 lg:px-10">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-[32px] border border-black/10 bg-white p-7 text-center shadow-[0_20px_70px_rgba(0,0,0,0.08)] sm:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-black/10 text-[#11110f]">
              <span className="text-3xl font-light">
                ×
              </span>
            </div>

            <p className="mt-7 text-[10px] font-medium uppercase tracking-[0.22em] text-black/40">
              Payment not confirmed
            </p>

            <h1 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
              Payment was not completed
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-black/50">
              We could not confirm this payment. Your booking has
              not been marked as confirmed.
            </p>

            {bookingId && (
              <div className="mx-auto mt-7 max-w-md rounded-2xl border border-black/10 bg-[#f5f4f0] px-5 py-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-black/35">
                  Booking ID
                </p>

                <p className="mt-2 break-all font-mono text-sm text-black/70">
                  {bookingId}
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/#apartments"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-[#f2f0e9] px-6 py-3.5 text-sm font-medium text-[#11110f] transition-all duration-300 hover:bg-white"
              >
                Browse apartments

                <FiArrowRight
                  size={15}
                  className="text-[#11110f] transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3.5 text-sm font-medium text-[#11110f]"
              >
                <FiHome size={15} />
                Go home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f4f0] px-4 py-24 text-[#11110f] sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
        <div className="w-full rounded-[32px] border border-black/10 bg-white p-7 text-center shadow-[0_20px_70px_rgba(0,0,0,0.08)] sm:p-10">
          <h1 className="text-3xl font-medium tracking-tight">
            Unable to verify booking
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-black/50">
            We could not verify the booking status right now.
            Please keep your booking reference and contact support
            if necessary.
          </p>

          {bookingId && (
            <p className="mt-6 break-all font-mono text-xs text-black/40">
              {bookingId}
            </p>
          )}

          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-[#f2f0e9] px-6 py-3.5 text-sm font-medium text-[#11110f] transition-all duration-300 hover:bg-white"
          >
            <FiHome size={15} />
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}