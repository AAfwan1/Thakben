import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";

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

const updateApartmentSchema = z
  .object({
    size: z.number().int().min(1).optional(),

    title: z
      .string()
      .trim()
      .min(2)
      .max(150)
      .optional(),

    description: z
      .string()
      .trim()
      .min(1)
      .max(5000)
      .optional(),

    images: z
      .array(imageSchema)
      .max(30)
      .optional(),

    amenities: z
      .array(z.string().trim().min(1).max(100))
      .max(100)
      .optional(),

    roomFeatures: z
      .array(z.string().trim().min(1).max(100))
      .max(100)
      .optional(),

    bathroomFacilities: z
      .array(z.string().trim().min(1).max(100))
      .max(100)
      .optional(),

    policies: z
      .array(z.string().trim().min(1).max(500))
      .max(100)
      .optional(),

    pricing: z
      .array(pricingSchema)
      .min(1)
      .max(20)
      .optional(),

    isAvailable: z.boolean().optional(),

    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(request, { params }) {
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

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid apartment ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const apartment = await Apartment.findById(id).lean();

    if (!apartment) {
      return NextResponse.json(
        {
          success: false,
          message: "Apartment not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      apartment,
    });
  } catch (error) {
    console.error("Get apartment error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load apartment",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
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

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid apartment ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const result = updateApartmentSchema.safeParse(body);

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

    const apartment = await Apartment.findById(id);

    if (!apartment) {
      return NextResponse.json(
        {
          success: false,
          message: "Apartment not found",
        },
        { status: 404 }
      );
    }

    const data = result.data;

    if (
      data.size !== undefined &&
      data.size !== apartment.size
    ) {
      const existingApartment = await Apartment.findOne({
        size: data.size,
        _id: { $ne: id },
      });

      if (existingApartment) {
        return NextResponse.json(
          {
            success: false,
            message: `An apartment with size ${data.size} sq.ft already exists`,
          },
          { status: 409 }
        );
      }

      apartment.size = data.size;
    }

    if (data.title !== undefined) {
      apartment.title = data.title;
    }

    if (data.description !== undefined) {
      apartment.description = data.description;
    }

    if (data.images !== undefined) {
      apartment.images = data.images;
    }

    if (data.amenities !== undefined) {
      apartment.amenities = data.amenities;
    }

    if (data.roomFeatures !== undefined) {
      apartment.roomFeatures = data.roomFeatures;
    }

    if (data.bathroomFacilities !== undefined) {
      apartment.bathroomFacilities =
        data.bathroomFacilities;
    }

    if (data.policies !== undefined) {
      apartment.policies = data.policies;
    }

    if (data.pricing !== undefined) {
      apartment.pricing = data.pricing;
    }

    if (data.isAvailable !== undefined) {
      apartment.isAvailable = data.isAvailable;
    }

    if (data.isActive !== undefined) {
      apartment.isActive = data.isActive;
    }

    await apartment.save();

    return NextResponse.json({
      success: true,
      message: "Apartment updated successfully",
      apartment,
    });
  } catch (error) {
    console.error("Update apartment error:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An apartment with this size already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update apartment",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
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

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid apartment ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const apartment = await Apartment.findById(id);

    if (!apartment) {
      return NextResponse.json(
        {
          success: false,
          message: "Apartment not found",
        },
        { status: 404 }
      );
    }

    await Apartment.deleteOne({
      _id: id,
    });

    return NextResponse.json({
      success: true,
      message: "Apartment deleted successfully",
    });
  } catch (error) {
    console.error("Delete apartment error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete apartment",
      },
      { status: 500 }
    );
  }
}