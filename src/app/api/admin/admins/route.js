import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/admin";
import { getCurrentAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

const createAdminSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address")
    .max(150, "Email is too long"),

  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(128, "Password is too long"),
});

// GET /api/admin/admins
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

    const admins = await Admin.find({})
      .select("_id name email isActive createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      admins,
    });
  } catch (error) {
    console.error("Get admins error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load admins",
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/admins
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

    const result = createAdminSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error.issues[0]?.message || "Invalid input",
        },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    await connectDB();

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "An admin with this email already exists",
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await Admin.create({
      name,
      email,
      passwordHash,
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Admin created successfully",
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          isActive: admin.isActive,
          createdAt: admin.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create admin error:", error);

    // Mongo duplicate-key protection
    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "An admin with this email already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create admin",
      },
      { status: 500 }
    );
  }
}