
const fs = require("fs");
const path = require("path");
const { loadEnvFile } = require("node:process");
const { v2: cloudinary } = require("cloudinary");

loadEnvFile(
  path.join(process.cwd(), ".env.local")
);
// ==========================================
// PATHS
// ==========================================

const FACILITIES_DIR = path.join(
  process.cwd(),
  "public",
  "facilities"
);

const OUTPUT_DIR = path.join(
  process.cwd(),
  "src",
  "data"
);

const OUTPUT_FILE = path.join(
  OUTPUT_DIR,
  "facilityImages.js"
);

// ==========================================
// CLOUDINARY CONFIG
// ==========================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ==========================================
// SUPPORTED IMAGE TYPES
// ==========================================

const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
];

// ==========================================
// FIND ALL IMAGES RECURSIVELY
// ==========================================

function getAllImages(dir) {
  const results = [];

  const entries = fs.readdirSync(dir, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...getAllImages(fullPath));
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();

    if (IMAGE_EXTENSIONS.includes(extension)) {
      results.push(fullPath);
    }
  }

  return results;
}

// ==========================================
// CREATE CLOUDINARY PUBLIC ID
// ==========================================

function makeSafePublicId(relativePath) {
  const withoutExtension = relativePath.replace(
    path.extname(relativePath),
    ""
  );

  return withoutExtension
    .replace(/\\/g, "/")
    .replace(/\s+/g, "-");
}

// ==========================================
// UPLOAD ONE IMAGE
// ==========================================

async function uploadImage(filePath) {
  const relativePath = path.relative(
    FACILITIES_DIR,
    filePath
  );

  const publicId = makeSafePublicId(relativePath);

  console.log(`Uploading: ${relativePath}`);

  const result = await cloudinary.uploader.upload(
    filePath,
    {
      folder: "thakben/facilities",

      public_id: publicId,

      resource_type: "image",

      // If the script is run again,
      // update the existing Cloudinary image.
      overwrite: true,

      // Keep the filename structure we created.
      use_filename: false,
      unique_filename: false,

      // Automatically optimize delivery.
      quality: "auto",
      fetch_format: "auto",
    }
  );

  // Optimized delivery URL.
  const optimizedUrl =
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}` +
    `/image/upload/f_auto,q_auto/${result.public_id}`;

  return {
    localPath:
      "/" +
      path
        .relative(
          path.join(process.cwd(), "public"),
          filePath
        )
        .replace(/\\/g, "/"),

    folder: path
      .dirname(relativePath)
      .replace(/\\/g, "/"),

    filename: path.basename(filePath),

    publicId: result.public_id,

    cloudinaryUrl: result.secure_url,

    optimizedUrl,
  };
}

// ==========================================
// GROUP IMAGES BY FACILITY
// ==========================================

function buildFacilityObject(images) {
  const facilities = {};

  for (const image of images) {
    const folder = image.folder;

    if (!facilities[folder]) {
      facilities[folder] = [];
    }

    facilities[folder].push(image);
  }

  return facilities;
}

// ==========================================
// MAIN
// ==========================================

async function main() {
  console.log("");
  console.log("======================================");
  console.log(" THAKBEN FACILITIES → CLOUDINARY");
  console.log("======================================");
  console.log("");

  // ========================================
  // CHECK ENV
  // ========================================

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error(
      "Missing CLOUDINARY_CLOUD_NAME in .env.local"
    );
  }

  if (!process.env.CLOUDINARY_API_KEY) {
    throw new Error(
      "Missing CLOUDINARY_API_KEY in .env.local"
    );
  }

  if (!process.env.CLOUDINARY_API_SECRET) {
    throw new Error(
      "Missing CLOUDINARY_API_SECRET in .env.local"
    );
  }

  // ========================================
  // CHECK FACILITIES FOLDER
  // ========================================

  if (!fs.existsSync(FACILITIES_DIR)) {
    throw new Error(
      `Facilities folder not found:\n${FACILITIES_DIR}`
    );
  }

  // ========================================
  // FIND IMAGES
  // ========================================

  const files = getAllImages(FACILITIES_DIR);

  console.log(`Found ${files.length} images.`);
  console.log("");

  if (files.length === 0) {
    throw new Error(
      "No images found inside public/facilities."
    );
  }

  // ========================================
  // UPLOAD
  // ========================================

  const uploaded = [];

  for (const file of files) {
    try {
      const result = await uploadImage(file);

      uploaded.push(result);

      console.log("✓ Uploaded");
      console.log(`  ${result.optimizedUrl}`);
      console.log("");
    } catch (error) {
      console.error(
        `✗ Failed: ${path.basename(file)}`
      );

      console.error(
        error?.error?.message || error.message
      );

      console.log("");
    }
  }

  // ========================================
  // GROUP BY FACILITY
  // ========================================

  const grouped = buildFacilityObject(uploaded);

  // ========================================
  // GENERATE JS FILE
  // ========================================

  const output = `// AUTO-GENERATED FILE
// Generated by scripts/upload-facilities.js
//
// Do not manually edit this file.
// Re-run the upload script if facility images change.

export const FACILITY_IMAGES = ${JSON.stringify(
    grouped,
    null,
    2
  )};
`;

  fs.mkdirSync(OUTPUT_DIR, {
    recursive: true,
  });

  fs.writeFileSync(
    OUTPUT_FILE,
    output,
    "utf8"
  );

  // ========================================
  // SUMMARY
  // ========================================

  console.log("");
  console.log("======================================");
  console.log(" DONE");
  console.log("======================================");
  console.log("");

  console.log(
    `Uploaded successfully: ${uploaded.length}/${files.length}`
  );

  console.log("");

  console.log(
    `Generated: ${path.relative(
      process.cwd(),
      OUTPUT_FILE
    )}`
  );

  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error("======================================");
  console.error(" UPLOAD FAILED");
  console.error("======================================");
  console.error("");
  console.error(error.message);
  console.error("");

  process.exit(1);
});

