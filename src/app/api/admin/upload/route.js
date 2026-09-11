import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

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
    // READ FORM DATA
    // =====================================================

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Image file is required",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // FILE TYPE VALIDATION
    // =====================================================

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only JPG, PNG, WebP and AVIF images are allowed",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // FILE SIZE VALIDATION
    // =====================================================

    if (file.size <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Image file is empty",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Image must be smaller than 10 MB",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // CONVERT FILE TO BUFFER
    // =====================================================

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // =====================================================
    // UPLOAD TO CLOUDINARY
    // =====================================================

    const result = await new Promise(
      (resolve, reject) => {
        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder: "thakben/apartments",
              resource_type: "image",
            },
            (error, uploadResult) => {
              if (error) {
                reject(error);
              } else {
                resolve(uploadResult);
              }
            }
          );

        uploadStream.end(buffer);
      }
    );

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json({
      success: true,
      image: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      },
    });
  } catch (error) {
    console.error(
      "Cloudinary upload error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload image",
      },
      { status: 500 }
    );
  }
}