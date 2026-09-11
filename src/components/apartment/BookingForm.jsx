
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FiArrowUpRight,
  FiCalendar,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function calculateDays(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;

  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);

  const difference = end.getTime() - start.getTime();

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );
}

function calculatePrice(days, pricingTiers) {
  if (!days || days < 1) return 0;
  if (!Array.isArray(pricingTiers)) return 0;

  const pricingTier = pricingTiers.find(
    (tier) =>
      days >= Number(tier.minDays) &&
      (
        tier.maxDays === null ||
        tier.maxDays === undefined ||
        days <= Number(tier.maxDays)
      )
  );

  if (!pricingTier) return 0;

  return days * Number(pricingTier.pricePerDay);
}

function isDateBetween(date, start, end) {
  return date >= start && date < end;
}

export default function BookingForm({ apartment }) {
  const [form, setForm] = useState({
    checkIn: "",
    checkOut: "",
    name: "",
    email: "",
    phone: "",
    request: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [calendarDate, setCalendarDate] = useState(() => {
    const today = new Date();

    return new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );
  });

  const [dateError, setDateError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchBookings() {
      try {
        setLoadingBookings(true);

        const response = await fetch(
          `/api/apartments/${apartment._id}/bookings`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const text = await response.text();

        let data;

        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Invalid availability response.");
        }

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Unable to load apartment availability."
          );
        }

        if (!cancelled) {
          setBookings(data.bookings || []);
        }
      } catch (error) {
        console.error(
          "AVAILABILITY ERROR:",
          error
        );

        if (!cancelled) {
          setBookings([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingBookings(false);
        }
      }
    }

    if (apartment?._id) {
      fetchBookings();
    } else {
      setLoadingBookings(false);
    }

    return () => {
      cancelled = true;
    };
  }, [apartment?._id]);

  const today = useMemo(() => {
    const date = new Date();

    date.setHours(0, 0, 0, 0);

    return date;
  }, []);

  const days = useMemo(
    () =>
      calculateDays(
        form.checkIn,
        form.checkOut
      ),
    [form.checkIn, form.checkOut]
  );

  const total = useMemo(
    () =>
      calculatePrice(
        days,
        apartment.pricingTiers
      ),
    [days, apartment.pricingTiers]
  );

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const isBooked = (date) => {
    return bookings.some((booking) => {
      const bookingStart = parseDate(
        booking.checkIn
      );

      const bookingEnd = parseDate(
        booking.checkOut
      );

      return isDateBetween(
        date,
        bookingStart,
        bookingEnd
      );
    });
  };

  const rangeIsAvailable = (
    checkIn,
    checkOut
  ) => {
    if (!checkIn || !checkOut) return true;

    const start = parseDate(checkIn);
    const end = parseDate(checkOut);

    return !bookings.some((booking) => {
      const bookingStart = parseDate(
        booking.checkIn
      );

      const bookingEnd = parseDate(
        booking.checkOut
      );

      return (
        start < bookingEnd &&
        end > bookingStart
      );
    });
  };

  const calendarYear =
    calendarDate.getFullYear();

  const calendarMonth =
    calendarDate.getMonth();

  const monthName =
    calendarDate.toLocaleString(
      "en-US",
      {
        month: "long",
      }
    );

  const firstDay = new Date(
    calendarYear,
    calendarMonth,
    1
  ).getDay();

  const daysInMonth = new Date(
    calendarYear,
    calendarMonth + 1,
    0
  ).getDate();

  const calendarDays = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    calendarDays.push(
      new Date(
        calendarYear,
        calendarMonth,
        day
      )
    );
  }

  const selectDate = (date) => {
    if (!date) return;

    const dateString = formatDate(date);

    if (date < today) return;
    if (isBooked(date)) return;

    setDateError("");

    /*
      NOTHING SELECTED

      First click = check-in.
    */
    if (!form.checkIn && !form.checkOut) {
      updateField("checkIn", dateString);
      updateField("checkOut", "");
      return;
    }

    /*
      ONLY CHECK-IN EXISTS

      Same date = deselect check-in.

      Example:
      11 → click 11 → nothing selected.
    */
    if (form.checkIn && !form.checkOut) {
      if (dateString === form.checkIn) {
        updateField("checkIn", "");
        updateField("checkOut", "");
        return;
      }

      /*
        Earlier date becomes the new check-in.
      */
      if (dateString < form.checkIn) {
        updateField("checkIn", dateString);
        return;
      }

      /*
        Later date becomes check-out.
      */
      if (
        !rangeIsAvailable(
          form.checkIn,
          dateString
        )
      ) {
        setDateError(
          "Some dates in this stay are already booked. Please choose another date."
        );
        return;
      }

      updateField(
        "checkOut",
        dateString
      );

      return;
    }

    /*
      BOTH CHECK-IN AND CHECK-OUT EXIST.

      The user can now edit either endpoint.

      Example:

      10 → 17

      Click 8:
      8 → 17

      Click 15:
      10 → 15

      Click 20:
      10 → 20
    */

    if (form.checkIn && form.checkOut) {
      /*
        Clicking current check-in:

        10 → 17
        click 10

        Reset the entire selection.
      */
      if (dateString === form.checkIn) {
        updateField("checkIn", "");
        updateField("checkOut", "");
        return;
      }

      /*
        Clicking current check-out:

        10 → 17
        click 17

        Reset the entire selection.
      */
      if (dateString === form.checkOut) {
        updateField("checkIn", "");
        updateField("checkOut", "");
        return;
      }

      /*
        Before check-in:

        10 → 17
        click 8

        Becomes:

        8 → 17
      */
      if (dateString < form.checkIn) {
        if (
          !rangeIsAvailable(
            dateString,
            form.checkOut
          )
        ) {
          setDateError(
            "Some dates in this stay are already booked. Please choose another date."
          );
          return;
        }

        updateField(
          "checkIn",
          dateString
        );

        return;
      }

      /*
        After check-out:

        10 → 17
        click 20

        Becomes:

        10 → 20
      */
      if (dateString > form.checkOut) {
        if (
          !rangeIsAvailable(
            form.checkIn,
            dateString
          )
        ) {
          setDateError(
            "Some dates in this stay are already booked. Please choose another date."
          );
          return;
        }

        updateField(
          "checkOut",
          dateString
        );

        return;
      }

      /*
        Inside the current range:

        10 → 17
        click 15

        Becomes:

        10 → 15
      */
      if (
        dateString > form.checkIn &&
        dateString < form.checkOut
      ) {
        if (
          !rangeIsAvailable(
            form.checkIn,
            dateString
          )
        ) {
          setDateError(
            "Some dates in this stay are already booked. Please choose another date."
          );
          return;
        }

        updateField(
          "checkOut",
          dateString
        );

        return;
      }
    }
  };

  const previousMonth = () => {
    const previous = new Date(
      calendarYear,
      calendarMonth - 1,
      1
    );

    const currentMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    if (previous < currentMonth) {
      return;
    }

    setCalendarDate(previous);
  };

  const nextMonth = () => {
    setCalendarDate(
      new Date(
        calendarYear,
        calendarMonth + 1,
        1
      )
    );
  };

  const parseApiResponse = async (
    response,
    apiName
  ) => {
    const text = await response.text();

    console.log(
      `${apiName} status:`,
      response.status
    );

    console.log(
      `${apiName} response:`,
      text
    );

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(
        `${apiName} returned an invalid response. Please try again.`
      );
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setDateError("");

    if (!form.checkIn || !form.checkOut) {
      setDateError(
        "Please select your check-in and check-out dates."
      );
      return;
    }

    if (days < 1) {
      setDateError(
        "Check-out date must be after check-in date."
      );
      return;
    }

    if (
      !rangeIsAvailable(
        form.checkIn,
        form.checkOut
      )
    ) {
      setDateError(
        "These dates are no longer available. Please choose another stay."
      );
      return;
    }

    if (!apartment?._id) {
      setDateError(
        "Apartment information is missing."
      );
      return;
    }

    setSubmitted(true);

    try {
      const bookingResponse = await fetch(
        "/api/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            apartmentId: apartment._id,
            checkIn: form.checkIn,
            checkOut: form.checkOut,
            guestName: form.name,
            guestPhone: form.phone,
            email: form.email,
          }),
        }
      );

      const bookingData =
        await parseApiResponse(
          bookingResponse,
          "Booking API"
        );

      if (
        !bookingResponse.ok ||
        !bookingData.success ||
        !bookingData.booking?.id
      ) {
        throw new Error(
          bookingData.message ||
            bookingData.error ||
            "Failed to create booking."
        );
      }

      const bookingId =
        bookingData.booking.id;

      const paymentResponse =
        await fetch(
          "/api/payments/sslcommerz",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              bookingId,
            }),
          }
        );

      const paymentData =
        await parseApiResponse(
          paymentResponse,
          "Payment API"
        );

      if (
        !paymentResponse.ok ||
        !paymentData.success ||
        !paymentData.paymentUrl
      ) {
        throw new Error(
          paymentData.message ||
            paymentData.error ||
            "Failed to start payment."
        );
      }

      window.location.href =
        paymentData.paymentUrl;
    } catch (error) {
      console.error(
        "Booking/payment error:",
        error
      );

      setSubmitted(false);

      setDateError(
        error?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div
      className="overflow-hidden rounded-[30px] border border-black/10 bg-black text-white shadow-[0_20px_70px_rgba(0,0,0,0.12)]"
      id="bookingfrom"
    >
      <div className="p-6 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/40">
            Reserve this apartment
          </p>

          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] text-white/60">
            {apartment.status}
          </span>
        </div>

        <h2 className="mt-4 text-2xl font-medium tracking-tight">
          Plan your stay
        </h2>

        <p className="mt-3 text-sm leading-6 text-white/40">
          Select your dates and provide your information
          to continue.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-7"
        >
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
                  Select dates
                </p>

                <p className="mt-1 text-xs text-white/30">
                  {form.checkIn && !form.checkOut
                    ? "Now select your check-out date"
                    : "Choose an available stay"}
                </p>
              </div>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={previousMonth}
                  aria-label="Previous month"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/45 transition hover:bg-white/10 hover:text-white"
                >
                  <FiChevronLeft size={14} />
                </button>

                <button
                  type="button"
                  onClick={nextMonth}
                  aria-label="Next month"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/45 transition hover:bg-white/10 hover:text-white"
                >
                  <FiChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center">
              <p className="text-sm font-medium text-white">
                {monthName} {calendarYear}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-7">
              {[
                "S",
                "M",
                "T",
                "W",
                "T",
                "F",
                "S",
              ].map((day, index) => (
                <div
                  key={`${day}-${index}`}
                  className="pb-2 text-center text-[9px] font-medium uppercase text-white/25"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1">
              {calendarDays.map(
                (date, index) => {
                  if (!date) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="h-9"
                      />
                    );
                  }

                  const dateString =
                    formatDate(date);

                  const booked =
                    isBooked(date);

                  const past =
                    date < today;

                  const isCheckIn =
                    form.checkIn ===
                    dateString;

                  const isCheckOut =
                    form.checkOut ===
                    dateString;

                  const hasSelectedRange =
                    form.checkIn &&
                    form.checkOut;

                  const rangeStart =
                    hasSelectedRange
                      ? parseDate(form.checkIn)
                      : null;

                  const rangeEnd =
                    hasSelectedRange
                      ? parseDate(form.checkOut)
                      : null;

                  const isInSelectedRange =
                    hasSelectedRange &&
                    date >= rangeStart &&
                    date <= rangeEnd;

                  const selected =
                    isCheckIn ||
                    isCheckOut ||
                    isInSelectedRange;

                  const disabled =
                    booked || past;

                  return (
                    <div
                      key={dateString}
                      className="flex h-9 items-center justify-center"
                    >
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                          selectDate(date)
                        }
                        className={`relative flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-medium transition ${
                          selected
                            ? "bg-[#f5f4f0] text-[#11110f]"
                            : booked
                            ? "cursor-not-allowed bg-red-500/15 text-red-400 line-through"
                            : past
                            ? "cursor-not-allowed text-white/15"
                            : "text-white/65 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    </div>
                  );
                }
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/10 pt-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-[9px] text-white/35">
                  Booked
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white/70" />
                <span className="text-[9px] text-white/35">
                  Selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full border border-white/25" />
                <span className="text-[9px] text-white/35">
                  Available
                </span>
              </div>
            </div>

            {loadingBookings && (
              <p className="mt-4 text-center text-[9px] text-white/25">
                Loading availability...
              </p>
            )}

            {!loadingBookings &&
              bookings.length === 0 && (
                <p className="mt-4 text-center text-[9px] text-white/25">
                  No booked dates currently listed.
                </p>
              )}
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5">
              <p className="text-[9px] uppercase tracking-[0.16em] text-white/30">
                Check-in
              </p>

              <p className="mt-1 text-sm text-white">
                {form.checkIn || "Select a date"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5">
              <p className="text-[9px] uppercase tracking-[0.16em] text-white/30">
                Check-out
              </p>

              <p className="mt-1 text-sm text-white">
                {form.checkOut || "Select a date"}
              </p>
            </div>
          </div>

          {dateError && (
            <div className="mt-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3">
              <p className="text-center text-[10px] leading-5 text-red-300">
                {dateError}
              </p>
            </div>
          )}

          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40">
                Stay duration
              </span>

              <span className="text-sm font-medium text-white">
                {days > 0
                  ? `${days} ${days === 1 ? "day" : "days"}`
                  : "Select dates"}
              </span>
            </div>
          </div>

          <div className="mt-7">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
              Guest information
            </p>

            <div className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                required
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-white/30 focus:bg-white/[0.08]"
              />

              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(event) =>
                  updateField("email", event.target.value)
                }
                required
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-white/30 focus:bg-white/[0.08]"
              />

              <input
                type="tel"
                placeholder="Phone number"
                value={form.phone}
                onChange={(event) =>
                  updateField("phone", event.target.value)
                }
                required
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-white/30 focus:bg-white/[0.08]"
              />

              <textarea
                placeholder="Special request (optional)"
                value={form.request}
                onChange={(event) =>
                  updateField("request", event.target.value)
                }
                rows={3}
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-white/30 focus:bg-white/[0.08]"
              />
            </div>
          </div>

          <div className="mt-7 rounded-[24px] border border-white/10 bg-white/[0.05] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40">
                {days > 0 ? `${days} day stay` : "Total stay"}
              </span>

              <span className="text-xl font-medium">
                ৳{total.toLocaleString()}
              </span>
            </div>

            {days > 0 && (
              <p className="mt-2 text-[10px] leading-5 text-white/25">
                Final price is calculated from the apartment's stay pricing.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!days || submitted || loadingBookings}
            className="group mt-5 flex w-full items-center justify-between rounded-full bg-[#f5f4f0] px-5 py-4 text-sm font-medium text-[#11110f] transition-all duration-300 hover:bg-[#e8e7e2] hover:shadow-[0_10px_30px_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span>
              {submitted
                ? "Booking Selected"
                : "Continue to Payment"}
            </span>

            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#11110f] text-[#f5f4f0]">
              {submitted ? (
                <FiCheck size={15} />
              ) : (
                <FiArrowUpRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              )}
            </span>
          </button>
        </form>

        <p className="mt-4 text-center text-[10px] leading-5 text-white/25">
          You will be redirected to secure payment after booking confirmation.
        </p>
      </div>
    </div>
  );
}
