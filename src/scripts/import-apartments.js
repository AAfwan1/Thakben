import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env.local"),
});
import fs from "fs/promises";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

import Apartment  from "../models/apartment.js";

const ROOT_DIR = process.cwd();
const APARTMENTS_DIR = path.join(
  ROOT_DIR,
  "public",
  "apartments"
);

/*
 * =========================================================
 * CLOUDINARY
 * =========================================================
 */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/*
 * =========================================================
 * DEFAULT APARTMENT CONTENT
 * =========================================================
 */

const DEFAULT_AMENITIES = [
  "High-speed WiFi",
  "Rooftop swimming pool",
  "Non-smoking room",
  "Fitness center",
  "On-site parking",
  "Housekeeping service",
  "Restaurant",
];

const DEFAULT_ROOM_FEATURES = [
  "Balcony",
  "Air Conditioner",
  "Queen Bed",
  "Safe Box",
  "4K Smart TV",
  "Refrigerator",
  "All cooking utensils",
  "Kettle",
  "Microwave",
  "Electric Stove",
];

const DEFAULT_BATHROOM = [
  "Shower",
  "Toothbrush and paste",
  "Towels",
  "Hot Water",
  "Soap and shampoo",
];

const DEFAULT_POLICIES = [
  "NID or Passport copy of each guest is required.",
  "Mobile pictures of the required documents are accepted.",
  "The building has CCTV cameras covering hallways and common spaces.",
  "Our staff maintains cleanliness throughout the property.",
  "24/7 entrance security is available throughout the building.",
  "Outside guests are not allowed on the premises. Only registered guests can access the building.",
  "Guest verification and photos will be taken in person during check-in.",
];

/*
 * =========================================================
 * PRICES
 *
 * IMPORTANT:
 * These are TOTAL STAY PRICES supplied by you.
 *
 * Your database field is called `pricePerDay`,
 * so the script converts:
 *
 * 7-day total  / 7
 * 15-day total / 15
 * 30-day total / 30
 *
 * The 1-day price is already a per-day price.
 * =========================================================
 */

const PRICES = {
  250: {
    oneDay: 2800,
    sevenDays: 14000,
    fifteenDays: 21000,
    thirtyDays: 30000,
  },

  260: {
    oneDay: 3000,
    sevenDays: 16000,
    fifteenDays: 23000,
    thirtyDays: 32000,
  },

  300: {
    oneDay: 3200,
    sevenDays: 18000,
    fifteenDays: 28000,
    thirtyDays: 34000,
  },

  330: {
    oneDay: 3500,
    sevenDays: 24000,
    fifteenDays: 30000,
    thirtyDays: 38000,
  },

  350: {
    oneDay: 3500,
    sevenDays: 26000,
    fifteenDays: 30000,
    thirtyDays: 38000,
  },

  375: {
    oneDay: 3800,
    sevenDays: 28000,
    fifteenDays: 32000,
    thirtyDays: 42000,
  },

  500: {
    oneDay: 4500,
    sevenDays: 29000,
    fifteenDays: 36000,
    thirtyDays: 48000,
  },

  600: {
    oneDay: 4600,
    sevenDays: 29000,
    fifteenDays: 36000,
    thirtyDays: 48000,
  },
};

/*
 * =========================================================
 * SUPPORTED IMAGE TYPES
 * =========================================================
 */

const IMAGE_EXTENSIONS = new Set([
  ".webp",
  ".jpg",
  ".jpeg",
  ".png",
  ".avif",
  ".heic",
  ".heif",
]);

/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function naturalSort(a, b) {
  return a.localeCompare(b, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function extractSize(folderName) {
  /*
   * Examples:
   *
   * 1 (330sqft)
   * 2 (260sq.ft)
   * 5 (500 sq.ft)
   * 10 (375sq.ft)
   */

  const match = folderName.match(
    /(\d+)\s*sq\s*\.?\s*ft/i
  );

  if (!match) {
    return null;
  }

  return Number(match[1]);
}

function buildPricing(price) {
  return [
    {
      minDays: 1,
      maxDays: 6,
      pricePerDay: price.oneDay,
    },

    {
      minDays: 7,
      maxDays: 14,
      pricePerDay: price.sevenDays / 7,
    },

    {
      minDays: 15,
      maxDays: 29,
      pricePerDay: price.fifteenDays / 15,
    },

    {
      minDays: 30,
      maxDays: null,
      pricePerDay: price.thirtyDays / 30,
    },
  ];
}

function createTitle(size) {
  return `${size} sq.ft. Apartment`;
}

function createDescription(size) {
  return `A comfortable ${size} sq.ft. apartment with modern facilities, essential room features, a well-equipped bathroom, and convenient amenities for a comfortable stay.`;
}

/*
 * =========================================================
 * UPLOAD ONE IMAGE
 * =========================================================
 */

async function uploadImage(filePath, size) {
  const result = await cloudinary.uploader.upload(
    filePath,
    {
      folder: `thakben/apartments/${size}sqft`,
      resource_type: "image",
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    }
  );

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

/*
 * =========================================================
 * MAIN
 * =========================================================
 */

async function main() {
  console.log("");
  console.log("========================================");
  console.log(" THAKBEN APARTMENT BULK IMPORT");
  console.log("========================================");
  console.log("");

  /*
   * ---------------------------------------------------------
   * ENV VALIDATION
   * ---------------------------------------------------------
   */

  const requiredEnv = [
    "MONGODB_URI",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  const missingEnv = requiredEnv.filter(
    (key) => !process.env[key]
  );

  if (missingEnv.length > 0) {
    throw new Error(
      `Missing environment variables: ${missingEnv.join(", ")}`
    );
  }

  /*
   * ---------------------------------------------------------
   * CHECK APARTMENT DIRECTORY
   * ---------------------------------------------------------
   */

  const folderEntries = await fs.readdir(
    APARTMENTS_DIR,
    {
      withFileTypes: true,
    }
  );

  const folders = folderEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort(naturalSort);

  if (!folders.length) {
    throw new Error(
      `No apartment folders found in:\n${APARTMENTS_DIR}`
    );
  }

  /*
   * ---------------------------------------------------------
   * GROUP FOLDERS BY SIZE
   *
   * This is important because:
   *
   * 6 (300sq.ft)
   * 7 (300sq.ft)
   *
   * become ONE 300 sq.ft listing.
   *
   * Same for the two 330 sq.ft folders.
   * ---------------------------------------------------------
   */

  const apartmentsBySize = new Map();

  for (const folderName of folders) {
    const size = extractSize(folderName);

    if (!size) {
      console.warn(
        `⚠️  Skipping folder with unknown size: ${folderName}`
      );

      continue;
    }

    if (!PRICES[size]) {
      console.warn(
        `⚠️  No price configured for ${size} sq.ft. — skipping ${folderName}`
      );

      continue;
    }

    if (!apartmentsBySize.has(size)) {
      apartmentsBySize.set(size, []);
    }

    apartmentsBySize
      .get(size)
      .push(folderName);
  }

  const sizes = [...apartmentsBySize.keys()].sort(
    (a, b) => a - b
  );

  console.log("Detected apartment sizes:");

  for (const size of sizes) {
    const sizeFolders =
      apartmentsBySize.get(size);

    console.log(
      `  ${size} sq.ft. ← ${sizeFolders.join(", ")}`
    );
  }

  console.log("");

  /*
   * ---------------------------------------------------------
   * CONNECT MONGODB
   * ---------------------------------------------------------
   */

  console.log("Connecting to MongoDB...");

  await mongoose.connect(
    process.env.MONGODB_URI
  );

  console.log("✓ MongoDB connected");
  console.log("");

  /*
   * ---------------------------------------------------------
   * IMPORT EACH SIZE
   * ---------------------------------------------------------
   */

  let createdCount = 0;
  let skippedCount = 0;
  let imageCount = 0;

  for (const size of sizes) {
    console.log("");
    console.log("----------------------------------------");
    console.log(`${size} sq.ft.`);
    console.log("----------------------------------------");

    /*
     * -------------------------------------------------------
     * DO NOT CREATE DUPLICATES
     * -------------------------------------------------------
     */

    const existing = await Apartment.findOne({
      size,
    }).lean();

    if (existing) {
      console.log(
        `⚠️  ${size} sq.ft. already exists in MongoDB.`
      );

      console.log(
        "   Skipping this apartment."
      );

      skippedCount++;

      continue;
    }

    /*
     * -------------------------------------------------------
     * GET ALL FOLDERS FOR THIS SIZE
     * -------------------------------------------------------
     */

    const sizeFolders =
      apartmentsBySize.get(size);

    const imageFiles = [];

    for (const folderName of sizeFolders) {
      const folderPath = path.join(
        APARTMENTS_DIR,
        folderName
      );

      const files = await fs.readdir(
        folderPath,
        {
          withFileTypes: true,
        }
      );

      const images = files
        .filter(
          (file) =>
            file.isFile() &&
            IMAGE_EXTENSIONS.has(
              path.extname(file.name).toLowerCase()
            )
        )
        .map((file) => ({
          folderName,
          fileName: file.name,
          filePath: path.join(
            folderPath,
            file.name
          ),
        }))
        .sort((a, b) =>
          naturalSort(
            `${a.folderName}/${a.fileName}`,
            `${b.folderName}/${b.fileName}`
          )
        );

      imageFiles.push(...images);
    }

    if (!imageFiles.length) {
      console.warn(
        `⚠️  No images found for ${size} sq.ft.`
      );

      continue;
    }

    /*
     * -------------------------------------------------------
     * MAXIMUM 30 IMAGES
     *
     * Same limit as the Add Apartment page.
     * -------------------------------------------------------
     */

    if (imageFiles.length > 30) {
      throw new Error(
        `${size} sq.ft. has ${imageFiles.length} images. Maximum allowed is 30.`
      );
    }

    console.log(
      `Found ${imageFiles.length} image(s).`
    );

    /*
     * -------------------------------------------------------
     * UPLOAD IMAGES
     * -------------------------------------------------------
     */

    const uploadedImages = [];

    for (
      let index = 0;
      index < imageFiles.length;
      index++
    ) {
      const image = imageFiles[index];

      console.log(
        `  Uploading ${index + 1}/${imageFiles.length}: ${image.folderName}/${image.fileName}`
      );

      try {
        const uploaded =
          await uploadImage(
            image.filePath,
            size
          );

        uploadedImages.push(uploaded);

        imageCount++;
      } catch (error) {
        throw new Error(
          `Failed to upload ${image.fileName} for ${size} sq.ft.: ${
            error?.message || error
          }`
        );
      }
    }

    /*
     * -------------------------------------------------------
     * CREATE APARTMENT
     * -------------------------------------------------------
     */

    const price = PRICES[size];

    const apartmentData = {
      size,

      title: createTitle(size),

      description:
        createDescription(size),

      images: uploadedImages,

      amenities: [
        ...DEFAULT_AMENITIES,
      ],

      roomFeatures: [
        ...DEFAULT_ROOM_FEATURES,
      ],

      bathroomFacilities: [
        ...DEFAULT_BATHROOM,
      ],

      policies: [
        ...DEFAULT_POLICIES,
      ],

      pricing: buildPricing(price),

      isAvailable: true,

      isActive: true,
    };

    await Apartment.create(
      apartmentData
    );

    createdCount++;

    console.log(
      `✓ ${size} sq.ft. apartment created.`
    );
  }

  /*
   * ---------------------------------------------------------
   * COMPLETE
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("========================================");
  console.log(" IMPORT COMPLETE");
  console.log("========================================");
  console.log(`Created: ${createdCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Images uploaded: ${imageCount}`);
  console.log("========================================");
  console.log("");
}

main()
  .catch((error) => {
    console.error("");
    console.error("❌ IMPORT FAILED");
    console.error("");
    console.error(
      error?.stack || error
    );
    console.error("");

    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState) {
      await mongoose.disconnect();
    }
  });