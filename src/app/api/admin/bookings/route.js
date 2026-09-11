import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/booking";
import { getCurrentAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

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
  };
}

export async function GET(request) {
  try {
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

    const { searchParams } = new URL(request.url);

    const pageParam = Number(searchParams.get("page") || 1);
    const limitParam = Number(
      searchParams.get("limit") || DEFAULT_LIMIT
    );

    const page =
      Number.isFinite(pageParam) && pageParam > 0
        ? Math.floor(pageParam)
        : 1;

    const limit =
      Number.isFinite(limitParam) && limitParam > 0
        ? Math.min(Math.floor(limitParam), MAX_LIMIT)
        : DEFAULT_LIMIT;

    const search = searchParams.get("search")?.trim() || "";
    const bookingStatus =
      searchParams.get("bookingStatus")?.trim() || "";
    const paymentStatus =
      searchParams.get("paymentStatus")?.trim() || "";

    const filter = {};

    if (
      bookingStatus &&
      ["pending", "confirmed", "cancelled", "completed"].includes(
        bookingStatus
      )
    ) {
      filter.status = bookingStatus;
    }

    if (
      paymentStatus &&
      ["unpaid", "paid", "failed", "cancelled", "refunded"].includes(
        paymentStatus
      )
    ) {
      filter.paymentStatus = paymentStatus;
    }

    if (search) {
      const searchRegex = new RegExp(
        search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      const matchingApartments = await (
        await import("@/models/apartment")
      ).default.find({
        $or: [
          { title: searchRegex },
          {
            size: Number.isFinite(Number(search))
              ? Number(search)
              : -1,
          },
        ],
      }).select("_id");

      filter.$or = [
        { guestName: searchRegex },
        { email: searchRegex },
        { guestPhone: searchRegex },
        { transactionId: searchRegex },
        ...(matchingApartments.length
          ? [
              {
                apartmentId: {
                  $in: matchingApartments.map(
                    (apartment) => apartment._id
                  ),
                },
              },
            ]
          : []),
      ];

      if (!filter.$or.length) {
        filter._id = null;
      }
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("apartmentId", "size title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Booking.countDocuments(filter),
    ]);

    /*
     * Stats are intentionally calculated separately from pagination.
     * This keeps your dashboard numbers based on ALL bookings,
     * not only the 20 currently loaded.
     */
    const [
      totalBookings,
      confirmedBookings,
      pendingBookings,
      paidRevenueResult,
    ] = await Promise.all([
      Booking.countDocuments(),

      Booking.countDocuments({
        status: "confirmed",
      }),

      Booking.countDocuments({
        status: "pending",
      }),

      Booking.aggregate([
        {
          $match: {
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: null,
            revenue: {
              $sum: "$totalPrice",
            },
          },
        },
      ]),
    ]);

    const paidRevenue =
      paidRevenueResult[0]?.revenue || 0;

    const formattedBookings = bookings.map(formatBooking);

    return NextResponse.json({
      success: true,

      bookings: formattedBookings,

      pagination: {
        page,
        limit,
        total,
        hasMore: skip + bookings.length < total,
      },

      stats: {
        totalBookings,
        confirmedBookings,
        pendingBookings,
        paidRevenue,
      },
    });
  } catch (error) {
    console.error("Admin bookings GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load bookings",
      },
      { status: 500 }
    );
  }
}