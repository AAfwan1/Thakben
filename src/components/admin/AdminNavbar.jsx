import { getCurrentAdmin } from "@/lib/auth";
import AdminNavbarClient from "./AdminNavbarClient";

export default async function AdminNavbar() {
  const admin = await getCurrentAdmin();

  const isMainAdmin = admin?.role === "main";

  return <AdminNavbarClient isMainAdmin={isMainAdmin} />;
}