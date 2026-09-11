import { NextResponse } from "next/server";
import { z } from "zod";

import cloudinary from "@/lib/cloudinary";
import { getCurrentAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

const deleteSchema = z.object({
  publicId: z
    .string()
    .trim()
    .min(1)
    .max(500),
});

export async function POST(request) {
  try {
    // =====================================================
    // ADMIN AUTHENTICATION
    // =====================================================

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

    // =====================================================
    // READ REQUEST BODY
    // =====================================================

    const body = await request.json();

    const result = deleteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Cloudinary public ID",
        },
        { status: 400 }
      );
    }

    const { publicId } = result.data;

    // =====================================================
    // SECURITY CHECK
    // =====================================================
    // Admins can only delete images belonging to
    // the Thakben apartment folder.

    if (
      !publicId.startsWith(
        "thakben/apartments/"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid image location",
        },
        { status: 403 }
      );
    }

    // =====================================================
    // DELETE FROM CLOUDINARY
    // =====================================================

    const cloudinaryResult =
      await cloudinary.uploader.destroy(
        publicId,
        {
          resource_type: "image",
          invalidate: true,
        }
      );

    // =====================================================
    // HANDLE CLOUDINARY RESPONSE
    // =====================================================

    if (
      cloudinaryResult.result !== "ok" &&
      cloudinaryResult.result !== "not found"
    ) {
      console.error(
        "Cloudinary delete failed:",
        cloudinaryResult
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Failed to delete image from Cloudinary",
        },
        { status: 500 }
      );
    }

    // =====================================================
    // SUCCESS
    // =====================================================

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
      result: cloudinaryResult.result,
    });
  } catch (error) {
    console.error(
      "Cloudinary delete error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete image",
      },
      { status: 500 }
    );
  }
}