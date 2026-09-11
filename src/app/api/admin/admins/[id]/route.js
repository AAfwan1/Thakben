import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/admin";
import { getCurrentAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

const updateAdminSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long")
      .optional(),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email address")
      .max(150, "Email is too long")
      .optional(),

    password: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .max(128, "Password is too long")
      .optional(),

    isActive: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.email !== undefined ||
      data.password !== undefined ||
      data.isActive !== undefined,
    {
      message: "At least one field is required",
    }
  );

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/admin/admins/:id
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
          message: "Invalid admin ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const admin = await Admin.findById(id)
      .select("_id name email isActive createdAt updatedAt")
      .lean();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error("Get admin error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load admin",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/admins/:id
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
          message: "Invalid admin ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const result = updateAdminSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error.issues[0]?.message || "Invalid input",
        },
        { status: 400 }
      );
    }

    const data = result.data;

    await connectDB();

    const admin = await Admin.findById(id);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin not found",
        },
        { status: 404 }
      );
    }

    // Email change
    if (data.email && data.email !== admin.email) {
      const emailExists = await Admin.findOne({
        email: data.email,
        _id: { $ne: id },
      });

      if (emailExists) {
        return NextResponse.json(
          {
            success: false,
            message: "Another admin already uses this email",
          },
          { status: 409 }
        );
      }

      admin.email = data.email;
    }

    if (data.name !== undefined) {
      admin.name = data.name;
    }

    if (data.password !== undefined) {
      admin.passwordHash = await bcrypt.hash(data.password, 12);
    }

    // Prevent accidentally locking the entire admin system.
    if (data.isActive === false && admin.isActive === true) {
      const activeAdminCount = await Admin.countDocuments({
        isActive: true,
      });

      if (activeAdminCount <= 1) {
        return NextResponse.json(
          {
            success: false,
            message: "You cannot deactivate the last active admin",
          },
          { status: 400 }
        );
      }

      admin.isActive = false;
    }

    if (data.isActive === true) {
      admin.isActive = true;
    }

    await admin.save();

    return NextResponse.json({
      success: true,
      message: "Admin updated successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update admin error:", error);

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
        message: "Failed to update admin",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/admins/:id
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
          message: "Invalid admin ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const admin = await Admin.findById(id);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin not found",
        },
        { status: 404 }
      );
    }

    // Prevent deleting the final active admin.
    if (admin.isActive) {
      const activeAdminCount = await Admin.countDocuments({
        isActive: true,
      });

      if (activeAdminCount <= 1) {
        return NextResponse.json(
          {
            success: false,
            message: "You cannot delete the last active admin",
          },
          { status: 400 }
        );
      }
    }

    await Admin.deleteOne({ _id: id });

    return NextResponse.json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete admin",
      },
      { status: 500 }
    );
  }
}