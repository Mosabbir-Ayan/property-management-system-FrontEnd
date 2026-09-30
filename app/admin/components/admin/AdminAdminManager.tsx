"use client";

import { useState } from "react";
import axios from "axios";
import { z } from "zod";
import { authHeader } from "@/lib/getToken";

type AdminUser = { id: number; name: string; email: string; created_at: string;};

const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(4, "Password must be at least 6 characters"),
});

type CreateForm = z.infer<typeof createSchema>;
type FieldErrors = Partial<Record<keyof CreateForm, string>>;

const EMPTY_CREATE: CreateForm = { name: "", email: "", password: "" };

export default function AdminAdminManager({ initialAdmins, currentAdminId,}: {
  initialAdmins: AdminUser[];
  currentAdminId?: number;
}) {
  const [admins, setAdmins] = useState<AdminUser[]>(initialAdmins);
  const [banner, setBanner] = useState("");
  const [keyword, setKeyword] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CreateForm>(EMPTY_CREATE);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function openCreateModal() {
    setForm(EMPTY_CREATE);
    setFieldErrors({});
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setFieldErrors({});
  }

  async function refresh() {
    const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/admin", {
      headers: authHeader(),
    });
    setAdmins(response.data);
  }

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) {
      refresh();
      return;
    }
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/admin/search",
        { params: { keyword: trimmed }, headers: authHeader() },
      );
      setAdmins(response.data);
    } catch {
      setBanner("Search failed.");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBanner("");

    const result = createSchema.safeParse(form);
    if (!result.success) {
      const newErrors: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof CreateForm;
        if (field && !newErrors[field]) newErrors[field] = issue.message;
      });
      setFieldErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      setFieldErrors({});

      await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/admin/register",
        result.data,
        { headers: authHeader() },
      );
      setBanner("Admin created successfully.");

      closeModal();
      await refresh();
      setTimeout(() => setBanner(""), 4000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        setBanner(typeof message === "string" ? message : "Could not create the admin.");
      } else {
        setBanner("Something went wrong.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      setSubmitting(true);
      await axios.delete(
        process.env.NEXT_PUBLIC_API_URL + `/admin/${deleteTarget.id}`,
        { headers: authHeader() },
      );
      setBanner("Admin deleted.");
      setDeleteTarget(null);
      await refresh();
      setTimeout(() => setBanner(""), 4000);
    } catch {
      setBanner("Could not delete this admin.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Everyone with admin access. {admins.length} total.
          </p>
        </div>
        <button
          className="rounded-md bg-dwellix-500 px-4 py-2 text-sm font-medium text-white hover:bg-dwellix-600"
          onClick={openCreateModal}
        >
          + Add Admin
        </button>
      </div>

      {banner && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <span className="text-sm text-green-600">{banner}</span>
        </div>
      )}

      <form onSubmit={handleSearch} className="flex items-end gap-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">
            Search admins
          </label>
          <input
            type="text"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search by name or email..."
            className="w-64 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-dwellix-500 focus:outline-none focus:ring-1 focus:ring-dwellix-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Search
        </button>
        <button
          type="button"
          className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
          onClick={() => {
            setKeyword("");
            refresh();
          }}
        >
          Clear
        </button>
      </form>

      {admins.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500">No admins found.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 font-semibold">
                      {admin.name}
                      {admin.id === currentAdminId && (
                        <span className="ml-2 text-xs font-normal text-gray-400">(You)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{admin.email}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(admin.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {admin.id === currentAdminId ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : (
                        <button
                          className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-gray-100"
                          onClick={() => setDeleteTarget(admin)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-bold">Add Admin</h3>

            <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-dwellix-500 focus:outline-none focus:ring-1 focus:ring-dwellix-500 disabled:bg-gray-100"
                  disabled={submitting}
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-dwellix-500 focus:outline-none focus:ring-1 focus:ring-dwellix-500 disabled:bg-gray-100"
                  disabled={submitting}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Password (min 6 characters)
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-dwellix-500 focus:outline-none focus:ring-1 focus:ring-dwellix-500 disabled:bg-gray-100"
                  disabled={submitting}
                />
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-dwellix-500 px-4 py-2 text-sm font-medium text-white hover:bg-dwellix-600 disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-bold">Delete admin?</h3>
            <p className="mt-2 text-sm text-gray-500">
              &quot;{deleteTarget.name}&quot; will lose admin access permanently.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                onClick={() => setDeleteTarget(null)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                onClick={handleDelete}
                disabled={submitting}
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}