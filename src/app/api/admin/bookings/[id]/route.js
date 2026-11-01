
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/booking";
import Apartment from "@/models/apartment";
import { getCurrentAdmin } from "@/lib/auth";

export const runtime = "nodejs";

/* ==========================================================
   HELPERS
========================================================== */

function parseDate(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    return null;
  }

  return date;
}

function getDays(checkIn, checkOut) {
  return (
    (checkOut.getTime() - checkIn.getTime()) /
    (24 * 60 * 60 * 1000)
  );
}

/* ==========================================================
   GET SINGLE BOOKING
========================================================== */

export async function GET(request, { params }) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid booking ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const booking = await Booking.findById(id)
      .populate("apartmentId")
      .lean();

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, booking },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin booking details GET error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load booking" },
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
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid booking ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action } = body;

    await connectDB();

    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    /* ======================================================
       RESCHEDULE
    ====================================================== */

    if (action === "reschedule") {
      if (
        booking.status === "cancelled" ||
        booking.status === "completed"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "This booking cannot be rescheduled",
          },
          { status: 400 }
        );
      }

      const checkIn = parseDate(body.checkIn);
      const checkOut = parseDate(body.checkOut);

      if (!checkIn || !checkOut) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid check-in or check-out date",
          },
          { status: 400 }
        );
      }

      const days = getDays(checkIn, checkOut);

      if (!Number.isInteger(days) || days < 1) {
        return NextResponse.json(
          {
            success: false,
            message: "Check-out must be after check-in",
          },
          { status: 400 }
        );
      }

      // Get apartment pricing.
      const apartment = await Apartment.findById(
        booking.apartmentId
      )
        .select("pricing")
        .lean();

      if (!apartment) {
        return NextResponse.json(
          {
            success: false,
            message: "Apartment not found",
          },
          { status: 404 }
        );
      }

      // Find the pricing tier for the new duration.
      const pricingTier = apartment.pricing.find(
        (tier) =>
          days >= tier.minDays &&
          (tier.maxDays === null ||
            tier.maxDays === undefined ||
            days <= tier.maxDays)
      );

      if (!pricingTier) {
        return NextResponse.json(
          {
            success: false,
            message: "No pricing tier available for this duration",
          },
          { status: 400 }
        );
      }

      // Check for overlapping active bookings.
      // The current booking is excluded.
      const conflictingBooking = await Booking.exists({
        _id: { $ne: booking._id },
        apartmentId: booking.apartmentId,
        status: { $in: ["pending", "confirmed"] },
        checkIn: { $lt: checkOut },
        checkOut: { $gt: checkIn },
      });

      if (conflictingBooking) {
        return NextResponse.json(
          {
            success: false,
            message: "Apartment is not available for these dates",
          },
          { status: 409 }
        );
      }

      // Recalculate the booking amount.
      const pricePerDay = pricingTier.pricePerDay;
      const totalPrice = pricePerDay * days;

      // Update existing booking.
      booking.checkIn = checkIn;
      booking.checkOut = checkOut;
      booking.days = days;
      booking.pricePerDay = pricePerDay;
      booking.totalPrice = totalPrice;

      await booking.save();

      const updatedBooking = await Booking.findById(id)
        .populate("apartmentId")
        .lean();

      return NextResponse.json({
        success: true,
        message: "Booking rescheduled successfully",
        booking: updatedBooking,
      });
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
      { success: false, message: "Failed to update booking" },
      { status: 500 }
    );
  }
}

/* ==========================================================
   DELETE BOOKING PERMANENTLY
========================================================== */

export async function DELETE(request, { params }) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid booking ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking permanently deleted",
    });
  } catch (error) {
    console.error("Admin booking DELETE error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
