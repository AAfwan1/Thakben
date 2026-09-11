import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Apartment from "@/models/apartment";
import Booking from "@/models/booking";
import UnavailableDate from "@/models/unavailableDate";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();

    const now = new Date();

    // Today: YYYY-MM-DD
    const today = now.toISOString().split("T")[0];

    // Start/end of current month
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

    /*
    ============================================================
    TOTAL APARTMENTS
    ============================================================
    */

    const totalApartments =
      await Apartment.countDocuments({
        isActive: true,
      });

    /*
    ============================================================
    TODAY'S BOOKED APARTMENTS
    ============================================================
    */

    const todayStart = new Date(
      `${today}T00:00:00.000Z`
    );

    const todayEnd = new Date(
      `${today}T23:59:59.999Z`
    );

    const todayBookings = await Booking.find({
      status: {
        $in: ["pending", "confirmed"],
      },

      checkIn: {
        $lt: todayEnd,
      },

      checkOut: {
        $gt: todayStart,
      },
    })
      .select("apartmentId")
      .lean();

    const bookedApartmentIds =
      todayBookings.map((booking) =>
        booking.apartmentId.toString()
      );

    /*
    ============================================================
    TODAY'S MANUALLY UNAVAILABLE APARTMENTS
    ============================================================
    */

    const todayUnavailable =
      await UnavailableDate.find({
        date: today,
      })
        .select("apartmentId")
        .lean();

    const unavailableApartmentIds =
      todayUnavailable.map((item) =>
        item.apartmentId.toString()
      );

    /*
    ============================================================
    UNIQUE OCCUPIED / UNAVAILABLE APARTMENTS
    ============================================================
    */

    const occupiedApartmentIds =
      new Set([
        ...bookedApartmentIds,
        ...unavailableApartmentIds,
      ]);

    const availableToday = Math.max(
      totalApartments -
        occupiedApartmentIds.size,
      0
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
    UPCOMING BOOKINGS
    ============================================================
    */

    const upcomingBookings =
      await Booking.find({
        status: {
          $in: ["pending", "confirmed"],
        },

        checkOut: {
          $gte: now,
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

    const bookings =
      upcomingBookings.map((booking) => ({
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
          booking.status
            .charAt(0)
            .toUpperCase() +
          booking.status.slice(1),
      }));

    /*
    ============================================================
    RESPONSE
    ============================================================
    */

    return NextResponse.json({
      success: true,

      stats: {
        totalApartments,
        availableToday,
        activeBookings,
        monthlyRevenue,
      },

      upcomingBookings: bookings,
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