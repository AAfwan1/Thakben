import { NextResponse } from "next/server";
import { z } from "zod";
import sharp from "sharp";

import { connectDB } from "@/lib/mongodb";
import  cloudinary  from "@/lib/cloudinary";
import Apartment from "@/models/apartment";
import Booking from "@/models/booking";
import UnavailableDate from "@/models/unavailableDate";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_IMAGE_WIDTH = 2200;
const MAX_IMAGE_HEIGHT = 2200;
const WEBP_QUALITY = 82;

const bookingSchema = z.object({
  apartmentId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid apartment ID"),

  checkIn: z
    .string()
    .min(1, "Check-in date is required"),

  checkOut: z
    .string()
    .min(1, "Check-out date is required"),

  guestName: z
    .string()
    .trim()
    .min(2, "Guest name is too short")
    .max(100, "Guest name is too long"),

  guestPhone: z
    .string()
    .trim()
    .min(7, "Invalid phone number")
    .max(30, "Phone number is too long"),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(254, "Email is too long")
    .transform((value) => value.toLowerCase()),
});

function parseDateOnly(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function calculateDays(checkIn, checkOut) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return Math.round(
    (checkOut.getTime() - checkIn.getTime()) /
      millisecondsPerDay
  );
}

async function uploadIdentityImage(file, folder, publicId) {
  if (!(file instanceof File) || file.size <= 0) {
    throw new Error("Invalid image file");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      "Each identity image must be 10 MB or smaller"
    );
  }

  const allowedTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

  if (!allowedTypes.has(file.type)) {
    throw new Error(
      "Only JPEG, PNG, and WebP images are allowed"
    );
  }

  const inputBuffer = Buffer.from(
    await file.arrayBuffer()
  );

  const image = sharp(inputBuffer, {
    failOn: "error",
    limitInputPixels: 25_000_000,
  });

  const metadata = await image.metadata();

  if (
    !metadata.width ||
    !metadata.height ||
    metadata.width < 100 ||
    metadata.height < 100
  ) {
    throw new Error("Invalid image dimensions");
  }

  const outputBuffer = await image
    .rotate()
    .resize({
      width: MAX_IMAGE_WIDTH,
      height: MAX_IMAGE_HEIGHT,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: WEBP_QUALITY,
      effort: 4,
    })
    .toBuffer();

  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "image",
        type: "authenticated",
        overwrite: false,
        invalidate: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result?.public_id || !result?.secure_url) {
          reject(
            new Error("Cloudinary upload failed")
          );
          return;
        }

        resolve({
          publicId: result.public_id,
          url: result.secure_url,
        });
      }
    );

    upload.end(outputBuffer);
  });
}

async function deleteIdentityImage(publicId) {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      type: "authenticated",
      invalidate: true,
    });
  } catch (error) {
    console.error(
      "Cloudinary cleanup error:",
      error
    );
  }
}

export async function POST(request) {
  let uploadedImages = [];

  try {
    await connectDB();

    // ---------------------------------------------------
    // READ MULTIPART FORM DATA
    // ---------------------------------------------------

    const formData = await request.formData();

    const body = {
      apartmentId: formData.get("apartmentId"),
      checkIn: formData.get("checkIn"),
      checkOut: formData.get("checkOut"),
      guestName: formData.get("guestName"),
      guestPhone: formData.get("guestPhone"),
      email: formData.get("email"),
    };

    const nidFront = formData.get("nidFront");
    const nidBack = formData.get("nidBack");
    const selfie = formData.get("selfie");

    // ---------------------------------------------------
    // VALIDATE CLIENT INPUT
    // ---------------------------------------------------

    const result = bookingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking information",
          errors:
            result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    if (
      !(nidFront instanceof File) ||
      !(nidBack instanceof File) ||
      !(selfie instanceof File)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "NID front, NID back, and selfie are required",
        },
        { status: 400 }
      );
    }

    const {
      apartmentId,
      checkIn: checkInString,
      checkOut: checkOutString,
      guestName,
      guestPhone,
      email,
    } = result.data;

    // ---------------------------------------------------
    // PARSE DATES
    // ---------------------------------------------------

    const checkIn = parseDateOnly(checkInString);
    const checkOut = parseDateOnly(checkOutString);

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid check-in or check-out date",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------
    // DATE VALIDATION
    // ---------------------------------------------------

    const today = new Date();

    const todayUTC = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate()
      )
    );

    if (checkIn < todayUTC) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Check-in date cannot be in the past",
        },
        { status: 400 }
      );
    }

    if (checkOut <= checkIn) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Check-out date must be after check-in date",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------
    // CALCULATE DAYS ON SERVER
    // ---------------------------------------------------

    const days = calculateDays(
      checkIn,
      checkOut
    );

    if (!Number.isInteger(days) || days < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking duration",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------
    // MAXIMUM BOOKING DURATION
    // ---------------------------------------------------

    if (days > 365) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Booking cannot be longer than 365 days",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------
    // FIND APARTMENT
    // ---------------------------------------------------

    const apartment = await Apartment.findOne({
      _id: apartmentId,
      isActive: true,
      isAvailable: true,
    }).lean();

    if (!apartment) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Apartment is unavailable or does not exist",
        },
        { status: 404 }
      );
    }

    // ---------------------------------------------------
    // FIND PRICING TIER ON SERVER
    // ---------------------------------------------------

    const pricingTier = apartment.pricing?.find(
      (tier) =>
        days >= Number(tier.minDays) &&
        (
          tier.maxDays === null ||
          tier.maxDays === undefined ||
          days <= Number(tier.maxDays)
        )
    );

    if (!pricingTier) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No pricing is configured for this booking duration",
        },
        { status: 400 }
      );
    }

    const pricePerDay = Number(
      pricingTier.pricePerDay
    );

    if (
      !Number.isFinite(pricePerDay) ||
      pricePerDay < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid apartment pricing",
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------------
    // CALCULATE TOTAL ON SERVER
    // ---------------------------------------------------

    const totalPrice =
      days * pricePerDay;

    if (
      !Number.isSafeInteger(totalPrice) ||
      totalPrice < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking total",
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------------
    // ADMIN-BLOCKED DATES
    // ---------------------------------------------------

    const unavailableDate =
      await UnavailableDate.exists({
        apartmentId: apartment._id,

        date: {
          $gte: checkInString,
          $lt: checkOutString,
        },
      });

    if (unavailableDate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "One or more selected dates are unavailable",
        },
        { status: 409 }
      );
    }

    // ---------------------------------------------------
    // UPLOAD IDENTITY IMAGES
    // ---------------------------------------------------

    const baseFolder = `thakben/identity/${apartment._id}`;

    const timestamp = Date.now();

    const nidFrontUpload =
      await uploadIdentityImage(
        nidFront,
        baseFolder,
        `nid-front-${timestamp}`
      );

    uploadedImages.push(
      nidFrontUpload.publicId
    );

    const nidBackUpload =
      await uploadIdentityImage(
        nidBack,
        baseFolder,
        `nid-back-${timestamp}`
      );

    uploadedImages.push(
      nidBackUpload.publicId
    );

    const selfieUpload =
      await uploadIdentityImage(
        selfie,
        baseFolder,
        `selfie-${timestamp}`
      );

    uploadedImages.push(
      selfieUpload.publicId
    );

    // ---------------------------------------------------
    // CREATE BOOKING
    // ---------------------------------------------------

    const booking = await Booking.create({
      apartmentId: apartment._id,

      checkIn,
      checkOut,

      guestName,
      guestPhone,
      email,

      identityDocuments: {
        nidFront: nidFrontUpload,
        nidBack: nidBackUpload,
        selfie: selfieUpload,
      },

      days,
      pricePerDay,
      totalPrice,

      status: "pending",
      paymentStatus: "unpaid",

      paymentGateway: "sslcommerz",
    });

    // ---------------------------------------------------
    // RESPONSE
    // ---------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        message: "Booking created successfully",

        booking: {
          id: booking._id.toString(),

          apartmentId:
            booking.apartmentId.toString(),

          checkIn: booking.checkIn,
          checkOut: booking.checkOut,

          days: booking.days,
          pricePerDay: booking.pricePerDay,
          totalPrice: booking.totalPrice,

          status: booking.status,
          paymentStatus:
            booking.paymentStatus,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create booking error:",
      error
    );

    // ---------------------------------------------------
    // CLEAN UP CLOUDINARY FILES IF BOOKING FAILS
    // ---------------------------------------------------

    if (uploadedImages.length) {
      await Promise.allSettled(
        uploadedImages.map(
          (publicId) =>
            deleteIdentityImage(publicId)
        )
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to create booking",
      },
      { status: 500 }
    );
  }
}