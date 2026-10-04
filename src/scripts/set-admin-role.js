import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";

const ADMIN_ROLES = [
  {
    email: "sheersho7@gmail.com",
    role: "main",
  },
  {
    email: "talukdertanim73@gmail.com",
    role: "moderator",
  },
  {
    email: "aafwanairbnb1@gmail.com",
    role: "moderator",
  },
];

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing from .env");
}

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);

    const db = mongoose.connection.db;
    const admins = db.collection("admins");

    for (const admin of ADMIN_ROLES) {
      const result = await admins.updateOne(
        { email: admin.email.toLowerCase() },
        { $set: { role: admin.role } }
      );

      if (result.matchedCount === 0) {
        console.log(`❌ Not found: ${admin.email}`);
      } else {
        console.log(`✅ ${admin.email} → ${admin.role}`);
      }
    }

    console.log("\nDone.");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();