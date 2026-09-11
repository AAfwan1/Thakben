import { NextResponse } from "next/server";
import { z } from "zod";

import { connectDB } from "@/lib/mongodb";
import Apartment from "@/models/apartment";
import { getCurrentAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

const imageSchema = z.object({
  url: z.string().trim().min(1).max(2000),
  publicId: z.string().trim().min(1).max(500),
});

const pricingSchema = z.object({
  minDays: z.number().int().min(1),
  maxDays: z.number().int().min(1).nullable().optional(),
  pricePerDay: z.number().min(0),
});

const apartmentSchema = z.object({
  size: z.number().int().min(1),

  title: z
    .string()
    .trim()
    .min(2)
    .max(150),

  description: z
    .string()
    .trim()
    .min(1)
    .max(5000),

  images: z
    .array(imageSchema)
    .max(30)
    .default([]),

  amenities: z
    .array(z.string().trim().min(1).max(100))
    .max(100)
    .default([]),

  roomFeatures: z
    .array(z.string().trim().min(1).max(100))
    .max(100)
    .default([]),

  bathroomFacilities: z
    .array(z.string().trim().min(1).max(100))
    .max(100)
    .default([]),

  policies: z
    .array(z.string().trim().min(1).max(500))
    .max(100)
    .default([]),

  pricing: z
    .array(pricingSchema)
    .min(1)
    .max(20),

  isAvailable: z
    .boolean()
    .default(true),

  isActive: z
    .boolean()
    .default(true),
});

export async function GET() {
  try {
    const currentAdmin = await getCurrentAdmin();

    if (!currentAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const apartments = await Apartment.find({})
      .sort({ size: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      apartments,
    });
  } catch (error) {
    console.error("Get apartments error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load apartments",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const currentAdmin = await getCurrentAdmin();

    if (!currentAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const result = apartmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            result.error.issues[0]?.message ||
            "Invalid apartment data",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const existingApartment = await Apartment.findOne({
      size: result.data.size,
    });

    if (existingApartment) {
      return NextResponse.json(
        {
          success: false,
          message: `An apartment with size ${result.data.size} sq.ft already exists`,
        },
        { status: 409 }
      );
    }

    const apartment = await Apartment.create(result.data);

    return NextResponse.json(
      {
        success: true,
        message: "Apartment created successfully",
        apartment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create apartment error:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "An apartment with this size already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create apartment",
      },
      { status: 500 }
    );
  }
}