import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/admin";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function createAuthToken(admin) {
  return await new SignJWT({
    adminId: admin._id.toString(),
    email: admin.email,
    name: admin.name,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAuthToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret);

    return payload;
  } catch {
    return null;
  }
}

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
      "_id name email isActive createdAt updatedAt"
    );

    if (!admin || !admin.isActive) {
      return null;
    }

    return admin;
  } catch {
    return null;
  }
}