import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/booking";
import { getCurrentAdmin } from "@/lib/auth";
import "@/models/apartment";

export const runtime = "nodejs";

/* ==========================================================
   GET SINGLE BOOKING
========================================================== */

export async function GET(request, { params }) {
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

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const booking = await Booking.findById(id)
      .populate("apartmentId")
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

    return NextResponse.json(
      {
        success: true,
        booking,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin booking details GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load booking",
      },
      { status: 500 }
    );
  }
}

/* ==========================================================
   UPDATE BOOKING
========================================================== */

export async function PATCH(request, { params }) {
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

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action } = body;

    await connectDB();

    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found",
        },
        { status: 404 }
      );
    }

    /* ======================================================
       CONFIRM
    ====================================================== */

    if (action === "confirm") {
      if (
        booking.status !== "pending" ||
        booking.paymentStatus !== "paid"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Only pending bookings with paid payment can be confirmed",
          },
          { status: 400 }
        );
      }

      booking.status = "confirmed";

      await booking.save();

      const updatedBooking = await Booking.findById(id)
        .populate("apartmentId")
        .lean();

      return NextResponse.json({
        success: true,
        message: "Booking confirmed",
        booking: updatedBooking,
      });
    }

    /* ======================================================
       CANCEL
    ====================================================== */

    if (action === "cancel") {
      if (
        booking.status === "cancelled" ||
        booking.status === "completed"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "This booking cannot be cancelled",
          },
          { status: 400 }
        );
      }

      booking.status = "cancelled";
      booking.cancelledAt = new Date();

      await booking.save();

      const updatedBooking = await Booking.findById(id)
        .populate("apartmentId")
        .lean();

      return NextResponse.json({
        success: true,
        message: "Booking cancelled",
        booking: updatedBooking,
      });
    }

    /* ======================================================
       REFUND
    ====================================================== */

    if (action === "refund") {
      if (
        booking.paymentStatus !== "paid" ||
        booking.status !== "cancelled"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Only paid cancelled bookings can be marked as refunded",
          },
          { status: 400 }
        );
      }

      booking.paymentStatus = "refunded";

      await booking.save();

      const updatedBooking = await Booking.findById(id)
        .populate("apartmentId")
        .lean();

      return NextResponse.json({
        success: true,
        message: "Payment marked as refunded",
        booking: updatedBooking,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid booking action",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Admin booking PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update booking",
      },
      { status: 500 }
    );
  }
}