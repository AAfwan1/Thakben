"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FiArrowUpRight,
  FiCalendar,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiX,
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
      (tier.maxDays === null ||
        tier.maxDays === undefined ||
        days <= Number(tier.maxDays))
  );

  if (!pricingTier) return 0;

  return (
    days * Number(pricingTier.pricePerDay)
  );
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

  const [identityImages, setIdentityImages] =
    useState({
      nidFront: null,
      nidBack: null,
      selfie: null,
    });

  const [previews, setPreviews] = useState({
    nidFront: "",
    nidBack: "",
    selfie: "",
  });

  const previewsRef = useRef(previews);

  const [submitted, setSubmitted] =
    useState(false);

  const [bookings, setBookings] = useState([]);

  const [loadingBookings, setLoadingBookings] =
    useState(true);

  const [calendarDate, setCalendarDate] =
    useState(() => {
      const today = new Date();

      return new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
    });

  const [dateError, setDateError] =
    useState("");

  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);

  useEffect(() => {
    return () => {
      Object.values(previewsRef.current).forEach(
        (url) => {
          if (url) {
            URL.revokeObjectURL(url);
          }
        }
      );
    };
  }, []);

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
          throw new Error(
            "Invalid availability response."
          );
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

  const handleImageChange = (
    field,
    event
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setDateError(
        "Please upload a JPG, PNG, or WebP image."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setDateError(
        "Each identity image must be 10 MB or smaller."
      );

      event.target.value = "";
      return;
    }

    const previewUrl =
      URL.createObjectURL(file);

    setPreviews((previous) => {
      if (previous[field]) {
        URL.revokeObjectURL(
          previous[field]
        );
      }

      return {
        ...previous,
        [field]: previewUrl,
      };
    });

    setIdentityImages((previous) => ({
      ...previous,
      [field]: file,
    }));

    setDateError("");

    event.target.value = "";
  };

  const removeImage = (field) => {
    setPreviews((previous) => {
      if (previous[field]) {
        URL.revokeObjectURL(
          previous[field]
        );
      }

      return {
        ...previous,
        [field]: "",
      };
    });

    setIdentityImages((previous) => ({
      ...previous,
      [field]: null,
    }));
  };

  const isUnavailable = (date) => {
    return bookings.some((booking) => {
      const unavailableStart =
        parseDate(booking.checkIn);

      const unavailableEnd =
        parseDate(booking.checkOut);

      return isDateBetween(
        date,
        unavailableStart,
        unavailableEnd
      );
    });
  };

  const rangeIsAvailable = (
    checkIn,
    checkOut
  ) => {
    if (!checkIn || !checkOut) {
      return true;
    }

    const start = parseDate(checkIn);
    const end = parseDate(checkOut);

    return !bookings.some((booking) => {
      const unavailableStart =
        parseDate(booking.checkIn);

      const unavailableEnd =
        parseDate(booking.checkOut);

      return (
        start < unavailableEnd &&
        end > unavailableStart
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

  for (
    let i = 0;
    i < firstDay;
    i++
  ) {
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

    if (isUnavailable(date)) {
      return;
    }

    setDateError("");

    if (
      !form.checkIn &&
      !form.checkOut
    ) {
      updateField(
        "checkIn",
        dateString
      );

      updateField(
        "checkOut",
        ""
      );

      return;
    }

    if (
      form.checkIn &&
      !form.checkOut
    ) {
      if (
        dateString ===
        form.checkIn
      ) {
        updateField(
          "checkIn",
          ""
        );

        updateField(
          "checkOut",
          ""
        );

        return;
      }

      if (
        dateString <
        form.checkIn
      ) {
        updateField(
          "checkIn",
          dateString
        );

        return;
      }

      if (
        !rangeIsAvailable(
          form.checkIn,
          dateString
        )
      ) {
        setDateError(
          "Some dates in this stay are unavailable. Please choose another date."
        );

        return;
      }

      updateField(
        "checkOut",
        dateString
      );

      return;
    }

    if (
      form.checkIn &&
      form.checkOut
    ) {
      if (
        dateString ===
        form.checkIn
      ) {
        updateField(
          "checkIn",
          ""
        );

        updateField(
          "checkOut",
          ""
        );

        return;
      }

      if (
        dateString ===
        form.checkOut
      ) {
        updateField(
          "checkIn",
          ""
        );

        updateField(
          "checkOut",
          ""
        );

        return;
      }

      if (
        dateString <
        form.checkIn
      ) {
        if (
          !rangeIsAvailable(
            dateString,
            form.checkOut
          )
        ) {
          setDateError(
            "Some dates in this stay are unavailable. Please choose another date."
          );

          return;
        }

        updateField(
          "checkIn",
          dateString
        );

        return;
      }

      if (
        dateString >
        form.checkOut
      ) {
        if (
          !rangeIsAvailable(
            form.checkIn,
            dateString
          )
        ) {
          setDateError(
            "Some dates in this stay are unavailable. Please choose another date."
          );

          return;
        }

        updateField(
          "checkOut",
          dateString
        );

        return;
      }

      if (
        dateString >
          form.checkIn &&
        dateString <
          form.checkOut
      ) {
        if (
          !rangeIsAvailable(
            form.checkIn,
            dateString
          )
        ) {
          setDateError(
            "Some dates in this stay are unavailable. Please choose another date."
          );

          return;
        }

        updateField(
          "checkOut",
          dateString
        );
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
    const text =
      await response.text();

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

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setDateError("");

    if (
      !form.checkIn ||
      !form.checkOut
    ) {
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
        "These dates are unavailable. Please choose another stay."
      );

      return;
    }

    if (!apartment?._id) {
      setDateError(
        "Apartment information is missing."
      );

      return;
    }

    if (!identityImages.nidFront) {
      setDateError(
        "Please upload the front side of your NID."
      );

      return;
    }

    if (!identityImages.nidBack) {
      setDateError(
        "Please upload the back side of your NID."
      );

      return;
    }

    if (!identityImages.selfie) {
      setDateError(
        "Please upload your selfie."
      );

      return;
    }

    setSubmitted(true);

    try {
      const bookingFormData =
        new FormData();

      bookingFormData.append(
        "apartmentId",
        apartment._id
      );

      bookingFormData.append(
        "checkIn",
        form.checkIn
      );

      bookingFormData.append(
        "checkOut",
        form.checkOut
      );

      bookingFormData.append(
        "guestName",
        form.name
      );

      bookingFormData.append(
        "guestPhone",
        form.phone
      );

      bookingFormData.append(
        "email",
        form.email
      );

      bookingFormData.append(
        "nidFront",
        identityImages.nidFront
      );

      bookingFormData.append(
        "nidBack",
        identityImages.nidBack
      );

      bookingFormData.append(
        "selfie",
        identityImages.selfie
      );

      const bookingResponse =
        await fetch(
          "/api/bookings",
          {
            method: "POST",
            body: bookingFormData,
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

  const ImageUploadBox = ({
    field,
    label,
    description,
  }) => {
    const preview = previews[field];

    return (
      <div className="min-w-0 rounded-2xl border border-black/[0.08] bg-[#fafafa] p-4">
        <div className="flex flex-col">
          <div className="relative h-20 w-full overflow-hidden rounded-xl border border-black/[0.08] bg-white">
            {preview ? (
              <>
                <img
                  src={preview}
                  alt={`${label} preview`}
                  className="h-full w-full object-contain"
                />

                <button
                  type="button"
                  onClick={() =>
                    removeImage(field)
                  }
                  aria-label={`Remove ${label}`}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/75 text-white transition hover:bg-black"
                >
                  <FiX size={12} />
                </button>
              </>
            ) : (
              <label
                htmlFor={`identity-${field}`}
                className="flex h-full w-full cursor-pointer items-center justify-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.04]">
                  <FiCalendar
                    size={17}
                    className="text-black/25"
                  />
                </div>
              </label>
            )}
          </div>

          <div className="mt-3 min-w-0">
            <p className="text-xs font-medium text-black">
              {label}
            </p>

            <p className="mt-1 text-[9px] leading-4 text-black/35">
              {preview
                ? "Image selected"
                : description}
            </p>
          </div>

          <label
            htmlFor={`identity-${field}`}
            className="mt-3 inline-flex w-fit cursor-pointer rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-[9px] font-medium text-black transition hover:bg-black hover:text-white"
          >
            {preview
              ? "Change image"
              : "Choose image"}
          </label>

          <input
            id={`identity-${field}`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) =>
              handleImageChange(
                field,
                event
              )
            }
            className="hidden"
          />
        </div>
      </div>
    );
  };

  return (
    <div
      className="overflow-hidden rounded-[30px] border border-black/[0.08] bg-white shadow-[0_20px_70px_rgba(0,0,0,0.08)]"
      id="bookingfrom"
    >
      <div className="p-6 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-black/40">
            Reserve this apartment
          </p>

          <span className="rounded-full border border-black/[0.08] bg-[#fafafa] px-3 py-1.5 text-[10px] text-black/50">
            {apartment.status}
          </span>
        </div>

        <h2 className="mt-4 text-2xl font-medium tracking-tight text-black">
          Plan your stay
        </h2>

        <p className="mt-3 text-sm leading-6 text-black/45">
          Select your dates and provide your
          information to continue.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-7"
        >
          <div className="rounded-[24px] border border-black/[0.08] bg-[#fafafa] p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-black/40">
                  Select dates
                </p>

                <p className="mt-1 text-xs text-black/35">
                  {form.checkIn &&
                  !form.checkOut
                    ? "Now select your check-out date"
                    : "Choose an available stay"}
                </p>
              </div>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={
                    previousMonth
                  }
                  aria-label="Previous month"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.08] bg-white text-black/45 transition hover:bg-black hover:text-white"
                >
                  <FiChevronLeft
                    size={14}
                  />
                </button>

                <button
                  type="button"
                  onClick={
                    nextMonth
                  }
                  aria-label="Next month"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.08] bg-white text-black/45 transition hover:bg-black hover:text-white"
                >
                  <FiChevronRight
                    size={14}
                  />
                </button>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center">
              <p className="text-sm font-medium text-black">
                {monthName}{" "}
                {calendarYear}
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
              ].map(
                (day, index) => (
                  <div
                    key={`${day}-${index}`}
                    className="pb-2 text-center text-[9px] font-medium uppercase text-black/30"
                  >
                    {day}
                  </div>
                )
              )}
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

                  const unavailable =
                    isUnavailable(
                      date
                    );

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
                      ? parseDate(
                          form.checkIn
                        )
                      : null;

                  const rangeEnd =
                    hasSelectedRange
                      ? parseDate(
                          form.checkOut
                        )
                      : null;

                  const isInSelectedRange =
                    hasSelectedRange &&
                    date >=
                      rangeStart &&
                    date <= rangeEnd;

                  const selected =
                    isCheckIn ||
                    isCheckOut ||
                    isInSelectedRange;

                  const disabled =
                    unavailable || past;

                  return (
                    <div
                      key={dateString}
                      className="flex h-9 items-center justify-center"
                    >
                      <button
                        type="button"
                        disabled={
                          disabled
                        }
                        onClick={() =>
                          selectDate(
                            date
                          )
                        }
                        className={`relative flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-medium transition ${
                          selected
                            ? "bg-black text-white"
                            : unavailable
                            ? "cursor-not-allowed bg-red-50 text-red-500 line-through"
                            : past
                            ? "cursor-not-allowed text-black/15"
                            : "text-black/65 hover:bg-black/[0.06] hover:text-black"
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    </div>
                  );
                }
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-black/[0.08] pt-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />

                <span className="text-[9px] text-black/40">
                  Unavailable
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-black" />

                <span className="text-[9px] text-black/40">
                  Selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full border border-black/25" />

                <span className="text-[9px] text-black/40">
                  Available
                </span>
              </div>
            </div>

            {loadingBookings && (
              <p className="mt-4 text-center text-[9px] text-black/30">
                Loading availability...
              </p>
            )}

            {!loadingBookings &&
              bookings.length === 0 && (
                <p className="mt-4 text-center text-[9px] text-black/30">
                  No unavailable dates
                  currently listed.
                </p>
              )}
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/[0.08] bg-[#fafafa] px-4 py-3.5">
              <p className="text-[9px] uppercase tracking-[0.16em] text-black/35">
                Check-in
              </p>

              <p className="mt-1 text-sm text-black">
                {form.checkIn ||
                  "Select a date"}
              </p>
            </div>

            <div className="rounded-2xl border border-black/[0.08] bg-[#fafafa] px-4 py-3.5">
              <p className="text-[9px] uppercase tracking-[0.16em] text-black/35">
                Check-out
              </p>

              <p className="mt-1 text-sm text-black">
                {form.checkOut ||
                  "Select a date"}
              </p>
            </div>
          </div>

          {dateError && (
            <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-center text-[10px] leading-5 text-red-600">
                {dateError}
              </p>
            </div>
          )}

          <div className="mt-3 rounded-2xl border border-black/[0.08] bg-white px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-black/40">
                Stay duration
              </span>

              <span className="text-sm font-medium text-black">
                {days > 0
                  ? `${days} ${
                      days === 1
                        ? "day"
                        : "days"
                    }`
                  : "Select dates"}
              </span>
            </div>
          </div>

          <div className="mt-7">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/40">
              Guest information
            </p>

            <div className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value
                  )
                }
                required
                className="w-full rounded-2xl border border-black/[0.08] bg-[#fafafa] px-4 py-3.5 text-sm text-black placeholder:text-black/25 outline-none transition focus:border-black/30 focus:bg-white"
              />

              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value
                  )
                }
                required
                className="w-full rounded-2xl border border-black/[0.08] bg-[#fafafa] px-4 py-3.5 text-sm text-black placeholder:text-black/25 outline-none transition focus:border-black/30 focus:bg-white"
              />

              <input
                type="tel"
                placeholder="Phone number"
                value={form.phone}
                onChange={(event) =>
                  updateField(
                    "phone",
                    event.target.value
                  )
                }
                required
                className="w-full rounded-2xl border border-black/[0.08] bg-[#fafafa] px-4 py-3.5 text-sm text-black placeholder:text-black/25 outline-none transition focus:border-black/30 focus:bg-white"
              />

              <textarea
                placeholder="Special request (optional)"
                value={form.request}
                onChange={(event) =>
                  updateField(
                    "request",
                    event.target.value
                  )
                }
                rows={3}
                className="w-full resize-none rounded-2xl border border-black/[0.08] bg-[#fafafa] px-4 py-3.5 text-sm text-black placeholder:text-black/25 outline-none transition focus:border-black/30 focus:bg-white"
              />
            </div>
          </div>

          <div className="mt-7">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/40">
                Identity documents
              </p>

              <p className="mt-2 text-[10px] leading-5 text-black/30">
                Upload your NID front,
                NID back, and a clear
                selfie.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <ImageUploadBox
                field="nidFront"
                label="NID Front"
                description="Front side of your NID"
              />

              <ImageUploadBox
                field="nidBack"
                label="NID Back"
                description="Back side of your NID"
              />

              <ImageUploadBox
                field="selfie"
                label="Selfie"
                description="Clear face photo"
              />
            </div>

            <p className="mt-3 text-[9px] leading-4 text-black/25">
              JPG, PNG, or WebP.
              Maximum 10 MB per image.
              Images are securely
              processed before storage.
            </p>
          </div>

          <div className="mt-7 rounded-[24px] border border-black/[0.08] bg-[#fafafa] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-black/40">
                {days > 0
                  ? `${days} day stay`
                  : "Total stay"}
              </span>

              <span className="text-xl font-medium text-black">
                ৳
                {total.toLocaleString()}
              </span>
            </div>

            {days > 0 && (
              <p className="mt-2 text-[10px] leading-5 text-black/30">
                Final price is calculated
                from the apartment's stay
                pricing.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={
              !days ||
              submitted ||
              loadingBookings
            }
            className="group mt-5 flex w-full items-center justify-between rounded-full bg-black px-5 py-4 text-sm font-medium text-white transition-all duration-300 hover:bg-black/85 hover:shadow-[0_10px_30px_rgba(0,0,0,0.16)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span>
              {submitted
                ? "Booking Selected"
                : "Continue to Payment"}
            </span>

            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black">
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

        <p className="mt-4 text-center text-[10px] leading-5 text-black/30">
          You will be redirected to secure payment after booking confirmation.
        </p>
      </div>
    </div>
  );
}