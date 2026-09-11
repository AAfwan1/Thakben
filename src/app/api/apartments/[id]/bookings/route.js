import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/booking";
import UnavailableDate from "@/models/unavailableDate";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid apartment ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Customer bookings
    const bookings = await Booking.find({
      apartmentId: id,
      status: {
        $in: ["pending", "confirmed"],
      },
    })
      .select("_id checkIn checkOut status")
      .sort({ checkIn: 1 })
      .lean();

    // Admin-blocked dates
    const unavailableDates = await UnavailableDate.find({
      apartmentId: id,
    })
      .select("date")
      .sort({ date: 1 })
      .lean();

    /*
      Convert admin unavailable dates into
      one-day booking-style ranges.

      Example:
      unavailable date = 2026-09-20

      becomes:
      checkIn  = 2026-09-20
      checkOut = 2026-09-21

      This allows the existing customer calendar
      to treat it exactly like a booked date.
    */
    const blockedDates = unavailableDates.map(
      (item) => {
        const checkIn = item.date;

        const [year, month, day] =
          checkIn.split("-").map(Number);

        const nextDay = new Date(
          Date.UTC(
            year,
            month - 1,
            day + 1
          )
        );

        const checkOut = nextDay
          .toISOString()
          .split("T")[0];

        return {
          id: `unavailable-${item._id.toString()}`,
          checkIn,
          checkOut,
          status: "unavailable",
        };
      }
    );

    /*
      Merge real customer bookings and
      admin unavailable dates.

      Customer side does NOT need to know
      which one is a real booking and which
      one was blocked by admin.
    */
    const allBlockedDates = [
      ...bookings.map((booking) => ({
        id: booking._id.toString(),
        checkIn: booking.checkIn
          .toISOString()
          .split("T")[0],
        checkOut: booking.checkOut
          .toISOString()
          .split("T")[0],
        status: booking.status,
      })),

      ...blockedDates,
    ];

    return NextResponse.json({
      success: true,
      bookings: allBlockedDates,
    });
  } catch (error) {
    console.error(
      "Get apartment availability error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to get apartment availability",
      },
      { status: 500 }
    );
  }
}