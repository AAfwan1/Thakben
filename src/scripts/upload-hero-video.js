require("dotenv").config({ path: ".env.local" });

const path = require("path");
const cloudinary = require("cloudinary").v2;

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

if (
  !CLOUDINARY_CLOUD_NAME ||
  !CLOUDINARY_API_KEY ||
  !CLOUDINARY_API_SECRET
) {
  console.error("\nMissing Cloudinary environment variables.");
  console.error("Check your .env.local file.\n");
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const videoPath = path.join(
  process.cwd(),
  "public",
  "maati properties real estate tour.mp4"
);

async function uploadVideo() {
  try {
    console.log("Uploading video to Cloudinary...");
    console.log(`File: ${videoPath}`);

    const result = await cloudinary.uploader.upload(videoPath, {
      resource_type: "video",
      public_id: "thakben/maati-properties-real-estate-tour",
      overwrite: true,
    });

    const optimizedUrl = cloudinary.url(result.public_id, {
      resource_type: "video",
      secure: true,
      transformation: [
        {
          fetch_format: "auto",
          quality: "auto",
        },
      ],
    });

    console.log("\n========================================");
    console.log("UPLOAD SUCCESSFUL");
    console.log("========================================");

    console.log("\nOptimized Video URL:");
    console.log(optimizedUrl);

    console.log("\n========================================");
    console.log("COPY THIS URL");
    console.log("========================================\n");
  } catch (error) {
    console.error("\nUpload failed:");
    console.error(error);
    process.exit(1);
  }
}

uploadVideo();