import { cookies } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/admin";
import { verifyAuthToken } from "@/lib/auth";

export async function getCurrentAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return null;
    }

    const payload = await verifyAuthToken(token);

    if (!payload?.adminId) {
      return null;
    }

    await connectDB();

    const admin = await Admin.findById(payload.adminId).select(
      "_id name email role isActive createdAt updatedAt"
    );

    if (!admin || !admin.isActive) {
      return null;
    }

    return admin;
  } catch {
    return null;
  }
}