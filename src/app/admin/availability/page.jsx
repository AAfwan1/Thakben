"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiLoader,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";

const WEEKDAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

// =====================================================
// DATE HELPERS
// =====================================================

function toDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(
    2,
    "0"
  )}-${String(day).padStart(2, "0")}`;
}

function getMonthDays(year, month) {
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

  const cells = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    cells.push(day);
  }

  return cells;
}

function formatMonth(year, month) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  ).format(
    new Date(year, month, 1)
  );
}

// =====================================================
// PAGE
// =====================================================

export default function AvailabilityPage() {
  const today = new Date();

  const [currentMonth, setCurrentMonth] =
    useState(today.getMonth());

  const [currentYear, setCurrentYear] =
    useState(today.getFullYear());

  const [apartments, setApartments] =
    useState([]);

  const [selectedApartmentId, setSelectedApartmentId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [actionError, setActionError] =
    useState("");

  const [processingDate, setProcessingDate] =
    useState("");

  // ---------------------------------------------------
  // LOAD AVAILABILITY
  // ---------------------------------------------------

  const loadAvailability = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");
        setActionError("");

        const response = await fetch(
          `/api/admin/availability?year=${currentYear}&month=${
            currentMonth + 1
          }`,
          {
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Failed to load availability"
          );
        }

        setApartments(
          data.apartments || []
        );

        setSelectedApartmentId(
          (previous) => {
            const stillExists =
              data.apartments?.some(
                (item) =>
                  item._id === previous
              );

            if (stillExists) {
              return previous;
            }

            return (
              data.apartments?.[0]?._id ||
              ""
            );
          }
        );
      } catch (error) {
        console.error(error);

        setError(
          error.message ||
            "Failed to load availability"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentYear, currentMonth]
  );

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  // ---------------------------------------------------
  // SELECTED APARTMENT
  // ---------------------------------------------------

  const apartment = useMemo(
    () =>
      apartments.find(
        (item) =>
          item._id ===
          selectedApartmentId
      ),
    [
      apartments,
      selectedApartmentId,
    ]
  );

  const bookedDates =
    apartment?.bookedDates || [];

  const unavailableDates =
    apartment?.unavailableDates || [];

  // ---------------------------------------------------
  // MONTH DAYS
  // ---------------------------------------------------

  const days = useMemo(
    () =>
      getMonthDays(
        currentYear,
        currentMonth
      ),
    [currentYear, currentMonth]
  );

  // ---------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(
        (year) => year - 1
      );
    } else {
      setCurrentMonth(
        (month) => month - 1
      );
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(
        (year) => year + 1
      );
    } else {
      setCurrentMonth(
        (month) => month + 1
      );
    }
  };

  // ---------------------------------------------------
  // DATE STATUS
  // ---------------------------------------------------

  const isToday = (day) => {
    if (!day) return false;

    return (
      day === today.getDate() &&
      currentMonth ===
        today.getMonth() &&
      currentYear ===
        today.getFullYear()
    );
  };

  const isBooked = (day) => {
    if (!day) return false;

    const dateKey = toDateKey(
      currentYear,
      currentMonth,
      day
    );

    return bookedDates.includes(
      dateKey
    );
  };

  const isUnavailable = (day) => {
    if (!day) return false;

    const dateKey = toDateKey(
      currentYear,
      currentMonth,
      day
    );

    return unavailableDates.includes(
      dateKey
    );
  };

  // ---------------------------------------------------
  // TOGGLE MANUAL AVAILABILITY
  // ---------------------------------------------------

  const toggleDate = async (day) => {
    if (!day || !apartment) {
      return;
    }

    const dateKey = toDateKey(
      currentYear,
      currentMonth,
      day
    );

    const booked =
      bookedDates.includes(dateKey);

    const unavailable =
      unavailableDates.includes(
        dateKey
      );

    // Customer-booked dates cannot
    // be changed by this page.
    if (booked) {
      return;
    }

    try {
      setProcessingDate(dateKey);
      setActionError("");

      const response = await fetch(
        "/api/admin/availability",
        {
          method: unavailable
            ? "DELETE"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            apartmentId:
              apartment._id,

            date: dateKey,
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to update date"
        );
      }

      // Update UI immediately.
      setApartments(
        (previous) =>
          previous.map((item) => {
            if (
              item._id !==
              apartment._id
            ) {
              return item;
            }

            if (unavailable) {
              return {
                ...item,

                unavailableDates:
                  item.unavailableDates.filter(
                    (date) =>
                      date !== dateKey
                  ),
              };
            }

            return {
              ...item,

              unavailableDates: [
                ...item.unavailableDates,
                dateKey,
              ],
            };
          })
      );
    } catch (error) {
      console.error(error);

      setActionError(
        error.message ||
          "Failed to update date"
      );
    } finally {
      setProcessingDate("");
    }
  };

  // ---------------------------------------------------
  // COUNTS
  // ---------------------------------------------------

  const availableCount = days.filter(
    (day) => {
      if (!day) return false;

      return (
        !isBooked(day) &&
        !isUnavailable(day)
      );
    }
  ).length;

  const bookedCount = days.filter(
    (day) => {
      if (!day) return false;

      return isBooked(day);
    }
  ).length;

  const unavailableCount =
    days.filter((day) => {
      if (!day) return false;

      return isUnavailable(day);
    }).length;

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <main className="min-h-screen bg-[#f5f4f0] px-4 pb-16 pt-28 text-[#11110f] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-6 border-b border-black/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">
              Availability
            </p>

            <h1 className="mt-3 text-4xl font-medium tracking-[-0.04em] sm:text-5xl">
              Apartment availability
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-black/55">
              Manage availability for every
              apartment. Customer bookings are
              protected, while manually blocked
              dates can be changed here.
            </p>
          </div>

          {/* Legend */}

          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-black/10 bg-white px-4 py-3">

            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <FiCheck size={13} />
              </span>

              <span className="text-xs font-medium text-black/65">
                Available
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-500">
                <FiX size={13} />
              </span>

              <span className="text-xs font-medium text-black/65">
                Booked
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                <FiX size={13} />
              </span>

              <span className="text-xs font-medium text-orange-600">
                Unavailable
              </span>
            </div>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            <FiAlertCircle
              className="mt-0.5 shrink-0"
              size={17}
            />

            <div className="flex-1">
              {error}
            </div>

            <button
              type="button"
              onClick={() =>
                loadAvailability(true)
              }
              className="shrink-0 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold transition hover:bg-red-100"
            >
              Retry
            </button>
          </div>
        )}

        {/* =================================================
            APARTMENT SELECTOR
        ================================================= */}

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">
                Select apartment
              </h2>

              <p className="mt-1 text-xs text-black/45">
                Choose an apartment to manage
                its dates.
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-medium text-black/55 sm:flex">
              <FiHome size={13} />

              {apartments.length} apartments
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[120px] items-center justify-center rounded-2xl border border-black/10 bg-white">
              <FiLoader
                className="animate-spin text-black/40"
                size={20}
              />
            </div>
          ) : apartments.length === 0 ? (
            <div className="rounded-2xl border border-black/10 bg-white px-6 py-12 text-center">
              <FiHome
                className="mx-auto text-black/25"
                size={28}
              />

              <p className="mt-3 text-sm font-semibold">
                No apartments found
              </p>

              <p className="mt-1 text-xs text-black/45">
                Create an active apartment
                first.
              </p>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {apartments.map((item) => {
                const itemBooked =
                  item.bookedDates
                    ?.length || 0;

                const itemUnavailable =
                  item.unavailableDates
                    ?.length || 0;

                const selected =
                  selectedApartmentId ===
                  item._id;

                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() =>
                      setSelectedApartmentId(
                        item._id
                      )
                    }
                    className={`
                      rounded-2xl border px-4 py-4 text-left
                      transition-all duration-200
                      ${
                        selected
                          ? "border-black bg-black text-white shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
                          : "border-black/10 bg-white text-black hover:border-black/20 hover:bg-[#faf9f6]"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`text-sm font-semibold ${
                          selected
                            ? "text-white"
                            : "text-black"
                        }`}
                      >
                        {item.title ||
                          `${item.size} sqft`}
                      </span>

                      <FiHome
                        size={14}
                        className={
                          selected
                            ? "text-white/60"
                            : "text-black/25"
                        }
                      />
                    </div>

                    <div
                      className={`mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs ${
                        selected
                          ? "text-white/50"
                          : "text-black/40"
                      }`}
                    >
                      <span>
                        {itemBooked} booked
                      </span>

                      <span>
                        {itemUnavailable} blocked
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* =================================================
            CALENDAR
        ================================================= */}

        {apartment && (
          <section className="mt-8 overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.04)]">

            {/* Calendar Header */}

            <div className="flex flex-col gap-5 border-b border-black/10 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-black/35">
                  Managing
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {apartment.title ||
                    `${apartment.size} sqft`}
                </h2>
              </div>

              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={
                    goToPreviousMonth
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-[#f5f4f0] text-black/60 transition hover:border-black/20 hover:bg-black/5 hover:text-black"
                  aria-label="Previous month"
                >
                  <FiChevronLeft
                    size={17}
                  />
                </button>

                <h3 className="min-w-[150px] text-center text-base font-semibold">
                  {formatMonth(
                    currentYear,
                    currentMonth
                  )}
                </h3>

                <button
                  type="button"
                  onClick={
                    goToNextMonth
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-[#f5f4f0] text-black/60 transition hover:border-black/20 hover:bg-black/5 hover:text-black"
                  aria-label="Next month"
                >
                  <FiChevronRight
                    size={17}
                  />
                </button>
              </div>
            </div>

            {/* Stats */}

            <div className="grid grid-cols-3 border-b border-black/10">
              <div className="border-r border-black/10 px-4 py-4 sm:px-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">
                  Available
                </p>

                <p className="mt-1 text-2xl font-semibold text-emerald-600">
                  {availableCount}
                </p>
              </div>

              <div className="border-r border-black/10 px-4 py-4 sm:px-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">
                  Booked
                </p>

                <p className="mt-1 text-2xl font-semibold text-red-500">
                  {bookedCount}
                </p>
              </div>

              <div className="px-4 py-4 sm:px-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">
                  Unavailable
                </p>

                <p className="mt-1 text-2xl font-semibold text-orange-500">
                  {unavailableCount}
                </p>
              </div>
            </div>

            {/* Action Error */}

            {actionError && (
              <div className="border-b border-red-100 bg-red-50 px-5 py-3 sm:px-6">
                <div className="flex items-center gap-2 text-xs font-medium text-red-600">
                  <FiAlertCircle
                    size={14}
                  />

                  {actionError}
                </div>
              </div>
            )}

            {/* Calendar */}

            <div className="p-3 sm:p-5 lg:p-6">
              <div className="grid grid-cols-7 border-b border-black/10 pb-3">
                {WEEKDAYS.map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-black/35 sm:text-xs"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              <div className="mt-3 grid grid-cols-7 gap-1 sm:gap-2">
                {days.map(
                  (day, index) => {
                    if (!day) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="min-h-[64px] rounded-xl sm:min-h-[90px]"
                        />
                      );
                    }

                    const dateKey =
                      toDateKey(
                        currentYear,
                        currentMonth,
                        day
                      );

                    const booked =
                      isBooked(day);

                    const unavailable =
                      isUnavailable(
                        day
                      );

                    const todayDate =
                      isToday(day);

                    const processing =
                      processingDate ===
                      dateKey;

                    // -----------------------------------------
                    // BOOKED
                    // -----------------------------------------

                    if (booked) {
                      return (
                        <button
                          key={day}
                          type="button"
                          disabled
                          className="group relative flex min-h-[64px] cursor-not-allowed flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 opacity-90 sm:min-h-[90px]"
                          title="Booked by a customer"
                        >
                          {todayDate && (
                            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-black" />
                          )}

                          <span className="text-sm font-semibold text-red-600 sm:text-base">
                            {day}
                          </span>

                          <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-500">
                            <FiX size={12} />
                          </span>

                          <span className="mt-1 hidden text-[9px] font-medium text-red-500/70 sm:block">
                            Booked
                          </span>
                        </button>
                      );
                    }

                    // -----------------------------------------
                    // UNAVAILABLE
                    // -----------------------------------------

                    if (unavailable) {
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() =>
                            toggleDate(day)
                          }
                          disabled={
                            processing
                          }
                          className="group relative flex min-h-[64px] flex-col items-center justify-center rounded-xl border border-orange-100 bg-orange-50 transition-all duration-200 hover:border-orange-200 hover:bg-orange-100 disabled:cursor-wait disabled:opacity-70 sm:min-h-[90px]"
                          title="Click to make available"
                        >
                          {todayDate && (
                            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-black" />
                          )}

                          {processing ? (
                            <FiLoader
                              className="animate-spin text-orange-500"
                              size={17}
                            />
                          ) : (
                            <>
                              <span className="text-sm font-semibold text-orange-600 sm:text-base">
                                {day}
                              </span>

                              <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                                <FiX
                                  size={12}
                                />
                              </span>

                              <span className="mt-1 hidden text-[9px] font-medium text-orange-500/70 sm:block">
                                Unavailable
                              </span>
                            </>
                          )}
                        </button>
                      );
                    }

                    // -----------------------------------------
                    // AVAILABLE
                    // -----------------------------------------

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() =>
                          toggleDate(day)
                        }
                        disabled={
                          processing
                        }
                        className="group relative flex min-h-[64px] flex-col items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-100 disabled:cursor-wait disabled:opacity-70 sm:min-h-[90px]"
                        title="Click to mark unavailable"
                      >
                        {todayDate && (
                          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-black" />
                        )}

                        {processing ? (
                          <FiLoader
                            className="animate-spin text-emerald-600"
                            size={17}
                          />
                        ) : (
                          <>
                            <span className="text-sm font-semibold text-emerald-700 sm:text-base">
                              {day}
                            </span>

                            <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                              <FiCheck
                                size={12}
                              />
                            </span>

                            <span className="mt-1 hidden text-[9px] font-medium text-emerald-600/70 sm:block">
                              Available
                            </span>
                          </>
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Bottom Note */}

            <div className="border-t border-black/10 bg-[#faf9f6] px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs leading-5 text-black/45">
                    Click an available date to
                    manually block it. Click an
                    unavailable date to make it
                    available again.
                  </p>

                  <p className="mt-1 text-xs leading-5 text-black/35">
                    Customer-booked dates are
                    protected and cannot be changed
                    here.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    loadAvailability(true)
                  }
                  disabled={refreshing}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-xs font-semibold transition hover:border-black/20 hover:bg-black/5 disabled:cursor-wait disabled:opacity-60"
                >
                  <FiRefreshCw
                    className={
                      refreshing
                        ? "animate-spin"
                        : ""
                    }
                    size={13}
                  />

                  Refresh
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}