import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/booking";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();

    const tranId = formData.get("tran_id");

    if (!tranId) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction ID is missing",
        },
        { status: 400 }
      );
    }

    const booking = await Booking.findOne({
      transactionId: tranId,
    });

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found",
        },
        { status: 404 }
      );
    }

    /*
     * Payment failed.
     *
     * We do NOT change the booking to confirmed.
     */

    if (
      booking.paymentStatus !== "paid" &&
      booking.status !== "confirmed"
    ) {
      booking.status = "cancelled";
      booking.paymentStatus = "failed";
      booking.cancelledAt = new Date();
      booking.paymentFailureReason =
        "SSLCOMMERZ payment failed";

      await booking.save();
    }

    const appUrl =
      process.env.APP_URL?.replace(/\/$/, "");

    if (!appUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "APP_URL is not configured",
        },
        { status: 500 }
      );
    }

    return NextResponse.redirect(
      `${appUrl}/fail?bookingId=${booking._id}`
    );
  } catch (error) {
    console.error(
      "SSLCOMMERZ fail callback error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Payment failure callback failed",
      },
      { status: 500 }
    );
  }
}