import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/booking";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking ID",
        },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(id)
      .select(
        "_id apartmentId checkIn checkOut days totalPrice status paymentStatus transactionId"
      )
      .lean();

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking._id.toString(),
        apartmentId: booking.apartmentId?.toString(),
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        days: booking.days,
        totalPrice: booking.totalPrice,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        transactionId: booking.transactionId || null,
      },
    });
  } catch (error) {
    console.error("Get booking status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get booking status",
      },
      { status: 500 }
    );
  }
}