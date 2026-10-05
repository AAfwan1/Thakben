import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/booking";
import Apartment from "@/models/apartment";
import { getCurrentAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

const ALLOWED_BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
];

const ALLOWED_PAYMENT_STATUSES = [
  "unpaid",
  "paid",
  "failed",
  "cancelled",
  "refunded",
];

const UPCOMING_CHECK_IN_FILTER = "upcoming-checkins";
const UPCOMING_CHECK_OUT_FILTER = "upcoming-checkouts";

function formatBooking(booking) {
  const apartment = booking.apartmentId;

  const apartmentSize = apartment?.size
    ? `${apartment.size} sq.ft.`
    : "Apartment";

  const apartmentSlug = apartment?.size
    ? `${apartment.size}-sqft`
    : "";

  return {
    id: booking._id.toString(),
    guestName: booking.guestName,
    email: booking.email,
    phone: booking.guestPhone,
    apartment: apartment?.title || apartmentSize,
    apartmentSlug,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    duration: booking.days,
    amount: booking.totalPrice,
    bookingStatus: booking.status,
    paymentStatus: booking.paymentStatus,
    transactionId: booking.transactionId || null,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}

/*
 * Bangladesh timezone is UTC+06:00.
 *
 * Returns today's date in Bangladesh as YYYY-MM-DD.
 */
function getTodayInBangladesh() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/*
 * Strict YYYY-MM-DD validation.
 */
function isValidDateString(value) {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(
      new Date(`${value}T00:00:00+06:00`).getTime()
    )
  );
}

/*
 * Strict YYYY-MM validation.
 */
function isValidMonthString(value) {
  return (
    typeof value === "string" &&
    /^\d{4}-(0[1-9]|1[0-2])$/.test(value)
  );
}

/*
 * Creates a Bangladesh-time date boundary.
 */
function bangladeshStartOfDay(dateString) {
  return new Date(
    `${dateString}T00:00:00+06:00`
  );
}

/*
 * Returns the next Bangladesh calendar day.
 */
function bangladeshNextDay(dateString) {
  const date = bangladeshStartOfDay(dateString);

  date.setUTCDate(date.getUTCDate() + 1);

  return date;
}

/*
 * Returns the next month boundary.
 */
function bangladeshNextMonth(monthString) {
  const [year, month] = monthString
    .split("-")
    .map(Number);

  const nextMonth =
    month === 12
      ? `${year + 1}-01`
      : `${year}-${String(month + 1).padStart(
          2,
          "0"
        )}`;

  return new Date(
    `${nextMonth}-01T00:00:00+06:00`
  );
}

export async function GET(request) {
  try {
    /*
     * Authentication
     */
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(
      request.url
    );

    /*
     * Pagination
     */
    const pageParam = Number(
      searchParams.get("page") || 1
    );

    const limitParam = Number(
      searchParams.get("limit") || DEFAULT_LIMIT
    );

    const page =
      Number.isFinite(pageParam) && pageParam > 0
        ? Math.floor(pageParam)
        : 1;

    const limit =
      Number.isFinite(limitParam) && limitParam > 0
        ? Math.min(
            Math.floor(limitParam),
            MAX_LIMIT
          )
        : DEFAULT_LIMIT;

    /*
     * Filters
     */
    const search =
      searchParams.get("search")?.trim() || "";

    const bookingStatus =
      searchParams
        .get("bookingStatus")
        ?.trim() || "";

    const paymentStatus =
      searchParams
        .get("paymentStatus")
        ?.trim() || "";

    const month =
      searchParams.get("month")?.trim() || "";

    const fromDate =
      searchParams.get("fromDate")?.trim() || "";

    const toDate =
      searchParams.get("toDate")?.trim() || "";

    const filter = {};

    /*
     * =====================================================
     * BOOKING STATUS
     * =====================================================
     */

    if (
      bookingStatus &&
      ALLOWED_BOOKING_STATUSES.includes(
        bookingStatus
      )
    ) {
      filter.status = bookingStatus;
    }

    /*
     * Upcoming check-ins
     *
     * Pending + confirmed bookings whose check-in
     * date is today or later in Bangladesh time.
     */
    if (
      bookingStatus ===
      UPCOMING_CHECK_IN_FILTER
    ) {
      const today = getTodayInBangladesh();

      filter.status = {
        $in: ["pending", "confirmed"],
      };

      filter.checkIn = {
        $gte: bangladeshStartOfDay(today),
      };
    }

    /*
     * Upcoming check-outs
     *
     * Pending + confirmed bookings whose check-out
     * date is today or later in Bangladesh time.
     */
    if (
      bookingStatus ===
      UPCOMING_CHECK_OUT_FILTER
    ) {
      const today = getTodayInBangladesh();

      filter.status = {
        $in: ["pending", "confirmed"],
      };

      filter.checkOut = {
        $gte: bangladeshStartOfDay(today),
      };
    }

    /*
     * =====================================================
     * PAYMENT STATUS
     * =====================================================
     *
     * Upcoming filters intentionally do NOT force
     * paymentStatus=paid because the dashboard's
     * upcoming reservations include pending bookings.
     */
    if (
      paymentStatus &&
      ALLOWED_PAYMENT_STATUSES.includes(
        paymentStatus
      )
    ) {
      filter.paymentStatus = paymentStatus;
    }

    /*
     * =====================================================
     * SEARCH
     * =====================================================
     */

    if (search) {
      const searchRegex = new RegExp(
        search.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        ),
        "i"
      );

      const numericSearch = Number(search);

      const apartmentSearch = [
        { title: searchRegex },
      ];

      if (Number.isFinite(numericSearch)) {
        apartmentSearch.push({
          size: numericSearch,
        });
      }

      const matchingApartments =
        await Apartment.find({
          $or: apartmentSearch,
        })
          .select("_id")
          .lean();

      filter.$or = [
        { guestName: searchRegex },
        { email: searchRegex },
        { guestPhone: searchRegex },
        { transactionId: searchRegex },
      ];

      if (matchingApartments.length > 0) {
        filter.$or.push({
          apartmentId: {
            $in: matchingApartments.map(
              (apartment) => apartment._id
            ),
          },
        });
      }
    }

    /*
     * =====================================================
     * DATE FILTERING
     * =====================================================
     *
     * Normal date filtering uses Booking.createdAt.
     *
     * Upcoming filters additionally use checkIn/checkOut
     * as defined above.
     */

    const today = getTodayInBangladesh();

    /*
     * Month filter
     */

    if (month) {
      if (!isValidMonthString(month)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid month.",
          },
          { status: 400 }
        );
      }

      const currentMonth = today.slice(0, 7);

      if (month > currentMonth) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Future months cannot be viewed.",
          },
          { status: 400 }
        );
      }

      const monthStart = new Date(
        `${month}-01T00:00:00+06:00`
      );

      const monthEnd =
        bangladeshNextMonth(month);

      filter.createdAt = {
        $gte: monthStart,
        $lt: monthEnd,
      };
    }

    /*
     * Custom date range
     */

    if (fromDate || toDate) {
      if (
        (fromDate &&
          !isValidDateString(fromDate)) ||
        (toDate &&
          !isValidDateString(toDate))
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid date.",
          },
          { status: 400 }
        );
      }

      /*
       * Nobody can request a future date.
       */
      if (
        (fromDate && fromDate > today) ||
        (toDate && toDate > today)
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Future dates cannot be viewed.",
          },
          { status: 400 }
        );
      }

      /*
       * From cannot be after To.
       */
      if (
        fromDate &&
        toDate &&
        fromDate > toDate
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "From date cannot be after the to date.",
          },
          { status: 400 }
        );
      }

      const createdAt = {};

      if (fromDate) {
        createdAt.$gte =
          bangladeshStartOfDay(fromDate);
      }

      if (toDate) {
        createdAt.$lt =
          bangladeshNextDay(toDate);
      }

      filter.createdAt = createdAt;
    }

    /*
     * =====================================================
     * SORTING
     * =====================================================
     */

    const sort =
      bookingStatus ===
      UPCOMING_CHECK_OUT_FILTER
        ? { checkOut: 1 }
        : { checkIn: 1 };

    /*
     * =====================================================
     * PAGINATED BOOKINGS
     * =====================================================
     */

    const skip = (page - 1) * limit;

    const [bookings, total] =
      await Promise.all([
        Booking.find(filter)
          .select(
            "_id guestName email guestPhone apartmentId checkIn checkOut days totalPrice status paymentStatus transactionId createdAt updatedAt"
          )
          .populate(
            "apartmentId",
            "size title"
          )
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),

        Booking.countDocuments(filter),
      ]);

    /*
     * =====================================================
     * STATS
     * =====================================================
     */

    const statsFilter = {
      ...filter,
    };

    /*
     * Confirmed bookings use the same active filters.
     */
    const confirmedBookings =
      await Booking.countDocuments({
        ...statsFilter,
        status: "confirmed",
      });

    /*
     * Revenue must always be based on paid bookings.
     */
    const revenueFilter = {
      ...statsFilter,
      paymentStatus: "paid",
    };

    const paidRevenueResult =
      await Booking.aggregate([
        {
          $match: revenueFilter,
        },
        {
          $group: {
            _id: null,
            revenue: {
              $sum: "$totalPrice",
            },
          },
        },
      ]);

    const paidRevenue =
      paidRevenueResult[0]?.revenue || 0;

    /*
     * =====================================================
     * RESPONSE
     * =====================================================
     */

    const formattedBookings =
      bookings.map(formatBooking);

    return NextResponse.json({
      success: true,

      bookings: formattedBookings,

      pagination: {
        page,
        limit,
        total,
        hasMore:
          skip + bookings.length < total,
      },

      stats: {
        confirmedBookings,
        paidRevenue,
      },
    });
  } catch (error) {
    console.error(
      "Admin bookings GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load bookings",
      },
      { status: 500 }
    );
  }
}