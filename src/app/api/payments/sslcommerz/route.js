
import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";

import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/booking";

export const runtime = "nodejs";

// =====================================================
// SSLCOMMERZ BASE URL
// =====================================================

const isLive =
  process.env.SSLCOMMERZ_IS_LIVE === "true";

const SSL_BASE_URL = isLive
  ? "https://securepay.sslcommerz.com"
  : "https://sandbox.sslcommerz.com";

// =====================================================
// VALIDATION
// =====================================================

const paymentSchema = z.object({
  bookingId: z
    .string()
    .regex(
      /^[0-9a-fA-F]{24}$/,
      "Invalid booking ID"
    ),
});

// =====================================================
// APP URL
// =====================================================

function getAppUrl() {
  const appUrl = process.env.APP_URL;

  if (!appUrl) {
    throw new Error(
      "APP_URL is not configured"
    );
  }

  return appUrl.replace(/\/+$/, "");
}

// =====================================================
// POST /api/payments/sslcommerz
// =====================================================

export async function POST(request) {
  let claimedBookingId = null;
  let claimedTransactionId = null;

  try {
    await connectDB();

    // ---------------------------------------------------
    // CHECK SSLCOMMERZ CREDENTIALS
    // ---------------------------------------------------

    const storeId =
      process.env.SSLCOMMERZ_STORE_ID;

    const storePassword =
      process.env.SSLCOMMERZ_STORE_PASSWORD;

    if (!storeId || !storePassword) {
      console.error(
        "SSLCOMMERZ credentials are missing"
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment service is not configured",
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------------
    // READ REQUEST
    // ---------------------------------------------------

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------
    // VALIDATE REQUEST
    // ---------------------------------------------------

    const result =
      paymentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking ID",
        },
        { status: 400 }
      );
    }

    const { bookingId } = result.data;

    // ---------------------------------------------------
    // FIND BOOKING
    // ---------------------------------------------------

    const booking = await Booking.findOne({
      _id: bookingId,
      status: "pending",
      paymentStatus: "unpaid",
    });

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Booking does not exist or is no longer payable",
        },
        { status: 404 }
      );
    }

    // ---------------------------------------------------
    // PREVENT DUPLICATE PAYMENT
    // ---------------------------------------------------

    if (booking.transactionId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A payment transaction already exists for this booking",
        },
        { status: 409 }
      );
    }

    // ---------------------------------------------------
    // GENERATE UNIQUE TRANSACTION ID
    // ---------------------------------------------------

    const transactionId =
      `BK${booking._id
        .toString()
        .slice(-10)}${crypto
        .randomBytes(5)
        .toString("hex")}`;

    // ---------------------------------------------------
    // ATOMICALLY CLAIM BOOKING
    // ---------------------------------------------------

    const claimedBooking =
      await Booking.findOneAndUpdate(
        {
          _id: booking._id,
          status: "pending",
          paymentStatus: "unpaid",
          transactionId: null,
        },
        {
          $set: {
            transactionId,
          },
        },
        {
          new: true,
        }
      );

    if (!claimedBooking) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment is already being initialized",
        },
        { status: 409 }
      );
    }

    claimedBookingId =
      claimedBooking._id.toString();

    claimedTransactionId = transactionId;

    // ---------------------------------------------------
    // APP URL
    // ---------------------------------------------------

    const appUrl = getAppUrl();

    console.log(
      "SSLCOMMERZ MODE:",
      isLive ? "LIVE" : "SANDBOX"
    );

    console.log(
      "SSLCOMMERZ APP URL:",
      appUrl
    );

    // ---------------------------------------------------
    // CREATE PAYMENT DATA
    // ---------------------------------------------------

    const paymentData =
      new URLSearchParams();

    paymentData.set(
      "store_id",
      storeId
    );

    paymentData.set(
      "store_passwd",
      storePassword
    );

    // IMPORTANT:
    // Amount comes ONLY from the database.

    paymentData.set(
      "total_amount",
      Number(
        claimedBooking.totalPrice
      ).toFixed(2)
    );

    paymentData.set(
      "currency",
      "BDT"
    );

    paymentData.set(
      "tran_id",
      transactionId
    );

    // ---------------------------------------------------
    // CALLBACK URLS
    // ---------------------------------------------------

    paymentData.set(
      "success_url",
      `${appUrl}/api/payments/sslcommerz/success`
    );

    paymentData.set(
      "fail_url",
      `${appUrl}/api/payments/sslcommerz/fail`
    );

    paymentData.set(
      "cancel_url",
      `${appUrl}/api/payments/sslcommerz/cancel`
    );

    paymentData.set(
      "ipn_url",
      `${appUrl}/api/payments/sslcommerz/ipn`
    );

    // ---------------------------------------------------
    // CUSTOMER INFORMATION
    // ---------------------------------------------------

    paymentData.set(
      "cus_name",
      claimedBooking.guestName
    );

    paymentData.set(
      "cus_email",
      claimedBooking.email
    );

    paymentData.set(
      "cus_phone",
      claimedBooking.guestPhone
    );

    paymentData.set(
      "cus_add1",
      "Bangladesh"
    );

    paymentData.set(
      "cus_city",
      "Dhaka"
    );

    paymentData.set(
      "cus_country",
      "Bangladesh"
    );

    // ---------------------------------------------------
    // PRODUCT INFORMATION
    // ---------------------------------------------------

    paymentData.set(
      "product_name",
      `Apartment Booking - ${claimedBooking.apartmentId}`
    );

    paymentData.set(
      "product_category",
      "Apartment"
    );

    paymentData.set(
      "product_profile",
      "general"
    );

    paymentData.set(
      "shipping_method",
      "NO"
    );

    // ---------------------------------------------------
    // SEND REQUEST TO SSLCOMMERZ
    // ---------------------------------------------------

    const sslResponse = await fetch(
      `${SSL_BASE_URL}/gwprocess/v4/api.php`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },

        body: paymentData.toString(),

        cache: "no-store",
      }
    );

    // ---------------------------------------------------
    // READ SSLCOMMERZ RESPONSE SAFELY
    // ---------------------------------------------------

    const responseText =
      await sslResponse.text();

    console.log(
      "SSLCOMMERZ HTTP STATUS:",
      sslResponse.status
    );

    console.log(
      "SSLCOMMERZ RESPONSE:",
      responseText
    );

    if (!sslResponse.ok) {
      throw new Error(
        `SSLCOMMERZ returned HTTP ${sslResponse.status}`
      );
    }

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      console.error(
        "SSLCOMMERZ returned non-JSON response:",
        responseText
      );

      throw new Error(
        "SSLCOMMERZ returned an invalid response"
      );
    }

    // ---------------------------------------------------
    // CHECK SSLCOMMERZ RESPONSE
    // ---------------------------------------------------

    if (
      data.status !== "SUCCESS" ||
      !data.GatewayPageURL
    ) {
      console.error(
        "SSLCOMMERZ session creation failed:",
        data
      );

      // Release transaction ID
      await Booking.updateOne(
        {
          _id: claimedBooking._id,
          transactionId,
          status: "pending",
          paymentStatus: "unpaid",
        },
        {
          $set: {
            transactionId: null,
          },
        }
      );

      claimedTransactionId = null;

      return NextResponse.json(
        {
          success: false,
          message:
            data.failedreason ||
            data.error ||
            "Unable to initialize payment",
        },
        { status: 502 }
      );
    }

    // ---------------------------------------------------
    // SAVE SSLCOMMERZ SESSION KEY
    // ---------------------------------------------------

    await Booking.updateOne(
      {
        _id: claimedBooking._id,
        transactionId,
      },
      {
        $set: {
          sessionKey:
            data.sessionkey || null,
        },
      }
    );

    // ---------------------------------------------------
    // SUCCESS RESPONSE
    // ---------------------------------------------------

    return NextResponse.json(
      {
        success: true,

        message:
          "Payment initialized successfully",

        paymentUrl:
          data.GatewayPageURL,

        bookingId:
          claimedBooking._id.toString(),

        transactionId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "SSLCOMMERZ payment initialization error:",
      error
    );

    // ---------------------------------------------------
    // RELEASE TRANSACTION IF INITIALIZATION FAILED
    // ---------------------------------------------------

    if (
      claimedBookingId &&
      claimedTransactionId
    ) {
      try {
        await Booking.updateOne(
          {
            _id: claimedBookingId,
            transactionId:
              claimedTransactionId,
            status: "pending",
            paymentStatus: "unpaid",
          },
          {
            $set: {
              transactionId: null,
            },
          }
        );
      } catch (cleanupError) {
        console.error(
          "Failed to release payment transaction:",
          cleanupError
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to initialize payment",
      },
      { status: 500 }
    );
  }
}

