"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { z } from "zod";
import { authHeader } from "@/lib/getToken";

type Building = { id: number; name: string; created_at: string; block: { id: number; name: string };};
type BlockOption = { id: number; name: string };

const buildingSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  blockId: z.coerce.number().min(1, "Please choose a block"),
});

type BuildingForm = z.infer<typeof buildingSchema>;
type FieldErrors = Partial<Record<keyof BuildingForm, string>>;

export default function AdminBuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [blocks, setBlocks] = useState<BlockOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BuildingForm>({ name: "", blockId: 0 });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Building | null>(null);
  const [banner, setBanner] = useState("");

  useEffect(() => {
    fetchBuildings();
    fetchBlocks();
  }, []);

  async function fetchBuildings() {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/admin/building/allbuildings",
        { headers: authHeader() },
      );
      setBuildings(response.data);
    } catch {
      setError("Could not load buildings. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  async function fetchBlocks() {
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/admin/block/allblocks",
        { headers: authHeader() },
      );
      setBlocks(response.data);
    } catch {
      console.error("Could not load blocks for the select");
    }
  }

  function openCreateModal() {
    setEditingId(null);
    setForm({ name: "", blockId: blocks[0]?.id ?? 0 });
    setFieldErrors({});
    setModalOpen(true);
  }

  function openEditModal(building: Building) {
    setEditingId(building.id);
    setForm({ name: building.name, blockId: building.block.id });
    setFieldErrors({});
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setFieldErrors({});
  }

  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBanner("");

    const result = buildingSchema.safeParse(form);
    if (!result.success) {
      const newErrors: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof BuildingForm;
        newErrors[field] = issue.message;
      });
      setFieldErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      setFieldErrors({});

      if (editingId === null) {
        await axios.post(
          process.env.NEXT_PUBLIC_API_URL + "/admin/building/create",
          result.data,
          { headers: authHeader() },
        );
        setBanner("Building created successfully.");
      } else {
        await axios.patch(
          process.env.NEXT_PUBLIC_API_URL + `/admin/building/update/${editingId}`,
          result.data,
          { headers: authHeader() },
        );
        setBanner("Building updated successfully.");
      }

      closeModal();
      await fetchBuildings();
      setTimeout(() => setBanner(""), 4000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        setBanner(typeof message === "string" ? message : "Could not save the building.");
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
        process.env.NEXT_PUBLIC_API_URL + `/admin/building/delete/${deleteTarget.id}`,
        { headers: authHeader() },
      );
      setBanner("Building deleted.");
      setDeleteTarget(null);
      await fetchBuildings();
      setTimeout(() => setBanner(""), 4000);
    } catch {
      setBanner("Could not delete the building (it may have properties attached).");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Buildings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Buildings inside blocks, containing properties. {buildings.length} total.
          </p>
        </div>
        <button
          className="rounded-md bg-dwellix-500 px-4 py-2 text-sm font-medium text-white hover:bg-dwellix-600 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={openCreateModal}
          disabled={blocks.length === 0}
        >
          + New Building
        </button>
      </div>

      {blocks.length === 0 && !loading && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <span className="text-sm text-amber-600">
            You need at least one block before creating a building.
          </span>
        </div>
      )}

      {banner && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <span className="text-sm text-green-600">{banner}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <span className="text-sm text-red-600">{error}</span>
          <button
            className="rounded-md px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
            onClick={fetchBuildings}
          >
            Retry
          </button>
        </div>
      ) : buildings.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500">No buildings created yet.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Block</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {buildings.map((building) => (
                  <tr key={building.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 font-semibold">{building.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                        {building.block?.name ?? "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(building.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                          onClick={() => openEditModal(building)}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-gray-100"
                          onClick={() => setDeleteTarget(building)}
                        >
                          Delete
                        </button>
                      </div>
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
            <h3 className="text-lg font-bold">
              {editingId === null ? "New Building" : "Edit Building"}
            </h3>

            <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Block (parent)
                </label>
                <select
                  name="blockId"
                  value={form.blockId}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-dwellix-500 focus:outline-none focus:ring-1 focus:ring-dwellix-500 disabled:bg-gray-100"
                  disabled={submitting}
                >
                  <option value={0}>Select a block...</option>
                  {blocks.map((block) => (
                    <option key={block.id} value={block.id}>
                      {block.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.blockId && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.blockId}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Building name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Building 1"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-dwellix-500 focus:outline-none focus:ring-1 focus:ring-dwellix-500 disabled:bg-gray-100"
                  disabled={submitting}
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
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
                  {submitting ? "Saving..." : editingId === null ? "Create" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-bold">Delete building?</h3>
            <p className="mt-2 text-sm text-gray-500">
              &quot;{deleteTarget.name}&quot; will be removed permanently.
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