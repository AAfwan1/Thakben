
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/booking";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();

    const now = new Date();

    /*
    ============================================================
    TODAY
    ============================================================
    */

    const todayStart = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
      )
    );

    /*
    ============================================================
    ACTIVE BOOKINGS
    ============================================================
    */

    const activeBookings =
      await Booking.countDocuments({
        status: {
          $in: ["pending", "confirmed"],
        },
      });

    /*
    ============================================================
    MONTHLY REVENUE
    ============================================================
    */

    const monthStart = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        1
      )
    );

    const nextMonthStart = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth() + 1,
        1
      )
    );

    const revenueResult =
      await Booking.aggregate([
        {
          $match: {
            paymentStatus: "paid",

            paidAt: {
              $gte: monthStart,
              $lt: nextMonthStart,
            },
          },
        },

        {
          $group: {
            _id: null,

            total: {
              $sum: "$totalPrice",
            },
          },
        },
      ]);

    const monthlyRevenue =
      revenueResult[0]?.total || 0;

    /*
    ============================================================
    UPCOMING CHECK-INS
    ============================================================
    */

    const upcomingCheckIns =
      await Booking.find({
        status: {
          $in: ["pending", "confirmed"],
        },

        checkIn: {
          $gte: todayStart,
        },
      })
        .populate(
          "apartmentId",
          "size title"
        )
        .sort({
          checkIn: 1,
        })
        .limit(5)
        .lean();

    /*
    ============================================================
    UPCOMING CHECK-OUTS
    ============================================================
    */

    const upcomingCheckOuts =
      await Booking.find({
        status: {
          $in: ["pending", "confirmed"],
        },

        checkOut: {
          $gte: todayStart,
        },
      })
        .populate(
          "apartmentId",
          "size title"
        )
        .sort({
          checkOut: 1,
        })
        .limit(5)
        .lean();

    /*
    ============================================================
    FORMAT BOOKING
    ============================================================
    */

    const formatBooking = (booking) => ({
      id: booking._id.toString(),

      displayId: `BK-${booking._id
        .toString()
        .slice(-6)
        .toUpperCase()}`,

      apartment:
        booking.apartmentId?.title ||
        (booking.apartmentId?.size
          ? `${booking.apartmentId.size} sq.ft. Apartment`
          : "Apartment"),

      guest: booking.guestName,

      checkIn: booking.checkIn
        ? booking.checkIn
            .toISOString()
            .split("T")[0]
        : null,

      checkOut: booking.checkOut
        ? booking.checkOut
            .toISOString()
            .split("T")[0]
        : null,

      status:
        booking.status.charAt(0).toUpperCase() +
        booking.status.slice(1),
    });

    /*
    ============================================================
    RESPONSE
    ============================================================
    */

    return NextResponse.json({
      success: true,

      stats: {
        activeBookings,
        monthlyRevenue,
      },

      upcomingCheckIns:
        upcomingCheckIns.map(formatBooking),

      upcomingCheckOuts:
        upcomingCheckOuts.map(formatBooking),
    });
  } catch (error) {
    console.error(
      "Admin dashboard error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load dashboard data",
      },
      {
        status: 500,
      }
    );
  }
}
