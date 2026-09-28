const fs = require("fs");
const path = require("path");

const PUBLIC_DIR = path.join(process.cwd(), "public");

const originalExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".tiff",
  ".gif",
  ".avif",
]);

function getAllFiles(dir) {
  const files = [];

  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      files.push(...getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function main() {
  console.log("==============================================");
  console.log(" WebP Cleanup");
  console.log("==============================================");
  console.log("Scanning entire public folder...\n");

  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error("❌ public folder not found.");
    process.exit(1);
  }

  const files = getAllFiles(PUBLIC_DIR);

  let deletedOriginals = 0;
  let keptOriginals = 0;
  let deletedMetadata = 0;

  for (const filePath of files) {
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const relativePath = path.relative(PUBLIC_DIR, filePath);

    // Delete macOS metadata files
    if (fileName.startsWith("._")) {
      try {
        fs.unlinkSync(filePath);
        console.log(`🗑 Deleted metadata: ${relativePath}`);
        deletedMetadata++;
      } catch (error) {
        console.log(`⚠ Could not delete: ${relativePath}`);
        console.log(error.message);
      }

      continue;
    }

    // Only inspect original image formats
    if (!originalExtensions.has(ext)) {
      continue;
    }

    // Matching WebP path
    const webpPath =
      filePath.slice(0, -ext.length) + ".webp";

    const webpExists =
      fs.existsSync(webpPath) &&
      fs.statSync(webpPath).size > 0;

    if (webpExists) {
      try {
        fs.unlinkSync(filePath);

        console.log(
          `🗑 Deleted original: ${relativePath}`
        );

        deletedOriginals++;
      } catch (error) {
        console.log(
          `⚠ Could not delete: ${relativePath}`
        );
        console.log(error.message);
      }
    } else {
      console.log(
        `KEEP: No WebP found → ${relativePath}`
      );

      keptOriginals++;
    }
  }

  console.log("\n==============================================");
  console.log(" CLEANUP COMPLETE");
  console.log("==============================================");
  console.log(`Originals deleted: ${deletedOriginals}`);
  console.log(`Originals kept:    ${keptOriginals}`);
  console.log(`Metadata deleted:  ${deletedMetadata}`);
  console.log("==============================================");
}

main();