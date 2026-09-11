import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/booking";

export const runtime = "nodejs";

// =====================================================
// SSLCOMMERZ URL
// =====================================================

const isLive =
  process.env.SSLCOMMERZ_IS_LIVE === "true";

const SSL_BASE_URL = isLive
  ? "https://securepay.sslcommerz.com"
  : "https://sandbox.sslcommerz.com";

// =====================================================
// VALIDATE TRANSACTION WITH SSLCOMMERZ
// =====================================================

async function validateTransaction({ valId }) {
  const storeId =
    process.env.SSLCOMMERZ_STORE_ID;

  const storePassword =
    process.env.SSLCOMMERZ_STORE_PASSWORD;

  if (!storeId || !storePassword) {
    throw new Error(
      "SSLCOMMERZ credentials are not configured"
    );
  }

  if (!valId) {
    throw new Error(
      "SSLCOMMERZ validation ID is missing"
    );
  }

  const params = new URLSearchParams();

  params.set("val_id", valId);
  params.set("store_id", storeId);
  params.set("store_passwd", storePassword);
  params.set("format", "json");

  const response = await fetch(
    `${SSL_BASE_URL}/validator/api/validationserverAPI.php?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `SSLCOMMERZ validation HTTP ${response.status}`
    );
  }

  return response.json();
}

// =====================================================
// POST /api/payments/sslcommerz/ipn
// =====================================================

export async function POST(request) {
  try {
    await connectDB();

    // ---------------------------------------------------
    // READ IPN DATA
    // ---------------------------------------------------

    const formData = await request.formData();

    const tranId =
      formData.get("tran_id")?.toString();

    const valId =
      formData.get("val_id")?.toString();

    const status =
      formData.get("status")?.toString();

    const amount =
      formData.get("amount")?.toString();

    const currency =
      formData.get("currency")?.toString();

    // ---------------------------------------------------
    // REQUIRED IPN VALUES
    // ---------------------------------------------------

    if (!tranId) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction ID is missing",
        },
        { status: 400 }
      );
    }

    if (!valId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Validation ID is missing",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------
    // FIND BOOKING
    // ---------------------------------------------------

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

    // ---------------------------------------------------
    // ALREADY PAID
    // ---------------------------------------------------

    if (
      booking.paymentStatus === "paid" &&
      booking.status === "confirmed"
    ) {
      return NextResponse.json({
        success: true,
        message: "Payment already processed",
      });
    }

    // ---------------------------------------------------
    // BASIC IPN STATUS CHECK
    // ---------------------------------------------------

    if (status !== "VALID") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment is not valid",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------
    // CHECK IPN AMOUNT
    // ---------------------------------------------------

    const receivedAmount =
      Number(amount);

    const expectedAmount =
      Number(booking.totalPrice);

    if (
      !Number.isFinite(receivedAmount) ||
      receivedAmount !== expectedAmount
    ) {
      console.error(
        "SSLCOMMERZ amount mismatch",
        {
          bookingId:
            booking._id.toString(),

          expectedAmount,

          receivedAmount,
        }
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment amount mismatch",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------
    // CHECK IPN CURRENCY
    // ---------------------------------------------------

    if (
      currency &&
      currency !== "BDT"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid payment currency",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------
    // SERVER-SIDE SSLCOMMERZ VALIDATION
    // ---------------------------------------------------
    //
    // IMPORTANT:
    // We now validate using the actual val_id
    // received from SSLCOMMERZ.
    //
    // ---------------------------------------------------

    const validation =
      await validateTransaction({
        valId,
      });

    console.log(
      "SSLCOMMERZ validation response:",
      validation
    );

    // ---------------------------------------------------
    // VERIFY VALIDATION STATUS
    // ---------------------------------------------------

    if (
      validation.status !== "VALID" &&
      validation.status !== "VALIDATED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "SSLCOMMERZ transaction validation failed",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------
    // VERIFY TRANSACTION ID
    // ---------------------------------------------------

    if (
      !validation.tran_id ||
      validation.tran_id !== tranId
    ) {
      console.error(
        "SSLCOMMERZ transaction ID mismatch",
        {
          expected: tranId,
          received: validation.tran_id,
        }
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Transaction ID verification failed",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------
    // VERIFY AMOUNT
    // ---------------------------------------------------

    const validatedAmount =
      Number(validation.amount);

    if (
      !Number.isFinite(validatedAmount) ||
      validatedAmount !== expectedAmount
    ) {
      console.error(
        "SSLCOMMERZ validated amount mismatch",
        {
          expected: expectedAmount,
          received: validation.amount,
        }
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Validated payment amount does not match booking amount",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------
    // VERIFY CURRENCY
    // ---------------------------------------------------

    if (
      validation.currency &&
      validation.currency !== "BDT"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Validated payment currency is invalid",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------
    // SAVE VALIDATION ID
    // ---------------------------------------------------

    booking.validationId = valId;

    // ---------------------------------------------------
    // SAVE SESSION KEY
    // ---------------------------------------------------

    if (
      validation.sessionkey &&
      !booking.sessionKey
    ) {
      booking.sessionKey =
        validation.sessionkey;
    }

    // ---------------------------------------------------
    // SAVE PAYMENT METHOD
    // ---------------------------------------------------

    if (validation.card_type) {
      booking.paymentMethod =
        validation.card_type;
    }

    // ---------------------------------------------------
    // CONFIRM PAYMENT
    // ---------------------------------------------------

    booking.paymentStatus = "paid";
    booking.status = "confirmed";

    booking.paidAt = new Date();

    booking.paymentFailureReason = null;

    await booking.save();

    // ---------------------------------------------------
    // SUCCESS
    // ---------------------------------------------------

    return NextResponse.json({
      success: true,
      message:
        "Payment verified and booking confirmed",
    });
  } catch (error) {
    console.error(
      "SSLCOMMERZ IPN error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Payment verification failed",
      },
      { status: 500 }
    );
  }
}