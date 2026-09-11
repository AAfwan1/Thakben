"use client";

import { useState } from "react";
import {
  FiCalendar,
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
  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  return new Date(year, month - 1, day);
}

function isDateBetween(date, start, end) {
  return date >= start && date < end;
}

export default function ApartmentAvailability({ apartment }) {
  /*
    =========================================================
    TEMPORARY FRONTEND BOOKINGS

    Later these will come from your database.

    checkIn  = first booked day
    checkOut = checkout day

    Example:
    12 Sep - 16 Sep
    means Sep 12, 13, 14 and 15 are booked.
    Sep 16 becomes available again.
    =========================================================
  */

  const bookings = apartment.bookings || [
    {
      id: "demo-1",
      checkIn: "2026-09-12",
      checkOut: "2026-09-16",
    },
    {
      id: "demo-2",
      checkIn: "2026-09-22",
      checkOut: "2026-09-25",
    },
  ];

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const [calendarDate, setCalendarDate] = useState(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    )
  );

  const monthName = calendarDate.toLocaleString(
    "en-US",
    {
      month: "long",
    }
  );

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  /*
    =========================================================
    CALENDAR DAYS
    =========================================================
  */

  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
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
      new Date(year, month, day)
    );
  }

  /*
    =========================================================
    CHECK IF DATE IS BOOKED
    =========================================================
  */

  const isBooked = (date) => {
    if (!date) return false;

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

  /*
    =========================================================
    MONTH NAVIGATION
    =========================================================
  */

  const previousMonth = () => {
    setCalendarDate(
      new Date(
        year,
        month - 1,
        1
      )
    );
  };

  const nextMonth = () => {
    setCalendarDate(
      new Date(
        year,
        month + 1,
        1
      )
    );
  };

  return (
    <section
      className="
        overflow-hidden
        rounded-[30px]
        border
        border-black/8
        bg-white/65
      "
    >

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="border-b border-black/8 p-6 sm:p-7">

        <div className="flex items-start gap-3">

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
            <FiCalendar size={16} />
          </div>

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
              Availability
            </p>

            <h3
              className="
                mt-1
                text-lg
                font-medium
                tracking-tight
              "
            >
              Apartment availability
            </h3>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-black/40
              "
            >
              View booked dates before making a reservation.
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          CALENDAR
      ====================================================== */}

      <div className="p-6 sm:p-7">

        {/* =================================================
            MONTH NAVIGATION
        ================================================== */}

        <div className="flex items-center justify-between">

          <h4
            className="
              text-sm
              font-medium
              text-[#11110f]
            "
          >
            {monthName} {year}
          </h4>

          <div className="flex gap-2">

            <button
              type="button"
              onClick={previousMonth}
              aria-label="Previous month"
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
                text-black/50
                transition
                hover:bg-[#f5f4f0]
                hover:text-black
              "
            >
              <FiChevronLeft size={15} />
            </button>

            <button
              type="button"
              onClick={nextMonth}
              aria-label="Next month"
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
                text-black/50
                transition
                hover:bg-[#f5f4f0]
                hover:text-black
              "
            >
              <FiChevronRight size={15} />
            </button>

          </div>

        </div>

        {/* =================================================
            WEEKDAYS
        ================================================== */}

        <div
          className="
            mt-5
            grid
            grid-cols-7
          "
        >

          {[
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
          ].map((day) => (
            <div
              key={day}
              className="
                pb-3
                text-center
                text-[9px]
                font-medium
                uppercase
                tracking-[0.1em]
                text-black/30
              "
            >
              {day}
            </div>
          ))}

        </div>

        {/* =================================================
            CALENDAR DAYS
        ================================================== */}

        <div
          className="
            grid
            grid-cols-7
            gap-y-2
          "
        >

          {calendarDays.map(
            (date, index) => {

              if (!date) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="h-10"
                  />
                );
              }

              const dateString =
                formatDate(date);

              const booked =
                isBooked(date);

              const isPast =
                date < today;

              return (
                <div
                  key={dateString}
                  className="
                    relative
                    flex
                    h-10
                    items-center
                    justify-center
                  "
                >

                  {/* =================================================
                      BOOKED DATE
                  ================================================== */}

                  {booked ? (
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        cursor-default
                        items-center
                        justify-center
                        rounded-full
                        bg-red-100
                        text-xs
                        font-medium
                        text-red-500
                        line-through
                      "
                    >
                      {date.getDate()}
                    </div>
                  ) : (

                    /* =================================================
                       AVAILABLE / PAST DATE
                    ================================================== */

                    <div
                      className={`
                        flex
                        h-9
                        w-9
                        cursor-default
                        items-center
                        justify-center
                        rounded-full
                        text-xs
                        font-medium

                        ${
                          isPast
                            ? "text-black/20"
                            : "text-black/65"
                        }
                      `}
                    >
                      {date.getDate()}
                    </div>

                  )}

                </div>
              );
            }
          )}

        </div>

        {/* =================================================
            LEGEND
        ================================================== */}

        <div
          className="
            mt-6
            flex
            flex-wrap
            gap-x-5
            gap-y-2
            border-t
            border-black/8
            pt-5
          "
        >

          {/* Booked */}

          <div className="flex items-center gap-2">

            <span
              className="
                h-2.5
                w-2.5
                rounded-full
                bg-red-500
              "
            />

            <span
              className="
                text-[10px]
                text-black/45
              "
            >
              Booked
            </span>

          </div>

          {/* Available */}

          <div className="flex items-center gap-2">

            <span
              className="
                h-2.5
                w-2.5
                rounded-full
                border
                border-black/20
                bg-white
              "
            />

            <span
              className="
                text-[10px]
                text-black/45
              "
            >
              Available
            </span>

          </div>

        </div>

        {/* =================================================
            INFORMATION
        ================================================== */}

        <div
          className="
            mt-5
            rounded-2xl
            border
            border-black/8
            bg-[#f5f4f0]
            px-4
            py-3
          "
        >

          <p
            className="
              text-center
              text-[10px]
              leading-5
              text-black/40
            "
          >
            Red dates are already booked.
            Use the booking form to reserve an available stay.
          </p>

        </div>

      </div>

    </section>
  );
}