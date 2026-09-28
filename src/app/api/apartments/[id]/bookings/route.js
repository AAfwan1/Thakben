import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import UnavailableDate from "@/models/unavailableDate";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (
      !id ||
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid apartment ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

 
    const unavailableDates =
      await UnavailableDate.find({
        apartmentId: id,
      })
        .select("_id date")
        .sort({ date: 1 })
        .lean();

  

    const blockedDates =
      unavailableDates.map((item) => {
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
      });



    return NextResponse.json({
      success: true,
      bookings: blockedDates,
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