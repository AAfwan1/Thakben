
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiCheckCircle,
  FiLoader,
  FiArrowRight,
  FiAlertCircle,
} from "react-icons/fi";

export default function AdminLogoutPage() {
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function logout() {
      try {
        const response = await fetch("/api/admin/logout", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Logout failed");
        }

        if (!cancelled) {
          setStatus("success");
        }
      } catch (err) {
        console.error("Logout error:", err);

        if (!cancelled) {
          setError(err.message || "Unable to logout");
          setStatus("error");
        }
      }
    }

    logout();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_20px_70px_rgba(15,23,42,0.08)]">

            {/* Loading */}
            {status === "loading" && (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                  <FiLoader className="animate-spin text-2xl text-slate-700" />
                </div>

                <h1 className="mt-6 text-2xl font-semibold tracking-tight">
                  Signing you out
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Securely ending your administrator session...
                </p>
              </>
            )}

            {/* Success */}
            {status === "success" && (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                  <FiCheckCircle className="text-3xl text-emerald-500" />
                </div>

                <h1 className="mt-6 text-2xl font-semibold tracking-tight">
                  Logout successful
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Your administrator session has been securely ended.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
<Link
  href="/admin/login"
  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#11110f] px-5 py-3 text-sm font-semibold !text-white transition hover:bg-[#252522]"
>
  Login again
  <FiArrowRight className="text-sm !text-white" />
</Link>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Back to Home
                  </Link>
                </div>
              </>
            )}

            {/* Error */}
            {status === "error" && (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
                  <FiAlertCircle className="text-3xl text-red-500" />
                </div>

                <h1 className="mt-6 text-2xl font-semibold tracking-tight">
                  Logout failed
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {error}
                </p>

                <button
                  onClick={() => window.location.reload()}
                  className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Try again
                  <FiArrowRight className="text-sm" />
                </button>
              </>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Thakben Administration
          </p>
        </div>
      </div>
    </main>
  );
}
