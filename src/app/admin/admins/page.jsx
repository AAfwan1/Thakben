"use client";

import { useEffect, useState } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUserCheck,
  FiUserX,
  FiX,
  FiLoader,
  FiShield,
} from "react-icons/fi";

export default function AdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modal, setModal] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  async function loadAdmins() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/admins", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load admins");
      }

      setAdmins(data.admins || []);
    } catch (err) {
      console.error("Load admins error:", err);
      setError(err.message || "Failed to load admins");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  function openAdd() {
    setSelectedAdmin(null);

    setForm({
      name: "",
      email: "",
      password: "",
    });

    setError("");
    setSuccess("");
    setModal("add");
  }

  function openEdit(admin) {
    setSelectedAdmin(admin);

    setForm({
      name: admin.name || "",
      email: admin.email || "",
      password: "",
    });

    setError("");
    setSuccess("");
    setModal("edit");
  }

  function closeModal() {
    if (saving) return;

    setModal(null);
    setSelectedAdmin(null);

    setForm({
      name: "",
      email: "",
      password: "",
    });

    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const isEdit = modal === "edit";

      const body = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
      };

      if (form.password.trim()) {
        body.password = form.password;
      }

      const response = await fetch(
        isEdit
          ? `/api/admin/admins/${selectedAdmin._id}`
          : "/api/admin/admins",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Operation failed");
      }

      setSuccess(
        isEdit
          ? "Admin updated successfully."
          : "Admin created successfully."
      );

      await loadAdmins();

      setTimeout(() => {
        setModal(null);
        setSelectedAdmin(null);

        setForm({
          name: "",
          email: "",
          password: "",
        });
      }, 700);
    } catch (err) {
      console.error("Admin save error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAdmin(admin) {
    const action = admin.isActive ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${admin.name}?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/admins/${admin._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          isActive: !admin.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || `Failed to ${action} admin`);
      }

      setSuccess(
        admin.isActive
          ? "Admin deactivated successfully."
          : "Admin activated successfully."
      );

      await loadAdmins();
    } catch (err) {
      console.error("Toggle admin error:", err);
      setError(err.message || "Something went wrong");
    }
  }

  async function deleteAdmin(admin) {
    const confirmed = window.confirm(
      `Delete ${admin.name} permanently?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/admins/${admin._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete admin");
      }

      setSuccess("Admin deleted successfully.");

      await loadAdmins();
    } catch (err) {
      console.error("Delete admin error:", err);
      setError(err.message || "Something went wrong");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-30 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <FiShield />
              Administration
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Admin Management
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Manage administrator accounts and access.
            </p>
          </div>

          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <FiPlus />
            Add Admin
          </button>
        </div>

        {/* =====================================================
            ALERTS
        ====================================================== */}
        {error && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 rounded-lg p-1 transition hover:bg-red-100"
            >
              <FiX />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="shrink-0 rounded-lg p-1 transition hover:bg-emerald-100"
            >
              <FiX />
            </button>
          </div>
        )}

        {/* =====================================================
            STATS
        ====================================================== */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Admins
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {loading ? "—" : admins.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {loading
                ? "—"
                : admins.filter((admin) => admin.isActive).length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Inactive
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-400">
              {loading
                ? "—"
                : admins.filter((admin) => !admin.isActive).length}
            </p>
          </div>
        </div>

        {/* =====================================================
            ADMIN TABLE
        ====================================================== */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 className="font-semibold text-slate-950">
              Administrators
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              All administrator accounts registered in the system.
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <FiLoader className="animate-spin text-2xl text-slate-500" />

                <p className="text-sm text-slate-400">
                  Loading administrators...
                </p>
              </div>
            </div>
          ) : admins.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <FiShield className="text-2xl text-slate-400" />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-slate-900">
                No administrators
              </h2>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Create your first administrator account to manage the
                system.
              </p>

              <button
                type="button"
                onClick={openAdd}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <FiPlus />
                Add Admin
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Administrator
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Created
                    </th>

                    <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {admins.map((admin) => (
                    <tr
                      key={admin._id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* Administrator */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 font-bold text-white">
                            {admin.name
                              ?.charAt(0)
                              ?.toUpperCase() || "A"}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">
                              {admin.name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Administrator
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {admin.email}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        {admin.isActive ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Created */}
                      <td className="px-6 py-5 text-sm text-slate-500">
                        {admin.createdAt
                          ? new Date(
                              admin.createdAt
                            ).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(admin)}
                            title="Edit admin"
                            className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleAdmin(admin)}
                            title={
                              admin.isActive
                                ? "Deactivate admin"
                                : "Activate admin"
                            }
                            className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
                          >
                            {admin.isActive ? (
                              <FiUserX />
                            ) : (
                              <FiUserCheck />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteAdmin(admin)}
                            title="Delete admin"
                            className="rounded-lg border border-red-100 bg-white p-2.5 text-red-500 transition hover:border-red-200 hover:bg-red-50"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ====================================================== */}
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <FiShield className="text-slate-700" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      {modal === "add"
                        ? "Add Administrator"
                        : "Edit Administrator"}
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {modal === "add"
                        ? "Create a new administrator account."
                        : "Update administrator information."}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  placeholder="Administrator name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  required
                  maxLength={150}
                  autoComplete="email"
                  placeholder="admin@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  {modal === "add"
                    ? "Password"
                    : "New Password"}
                </label>

                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  required={modal === "add"}
                  minLength={12}
                  maxLength={128}
                  autoComplete="new-password"
                  placeholder={
                    modal === "add"
                      ? "Minimum 12 characters"
                      : "Leave empty to keep current password"
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  {modal === "add"
                    ? "Use a strong password with at least 12 characters."
                    : "Leave empty if you do not want to change the password."}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <FiLoader className="animate-spin" />
                  )}

                  {modal === "add"
                    ? "Create Admin"
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}