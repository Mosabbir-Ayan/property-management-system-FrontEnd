"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import axios from "axios";
import { authHeader } from "@/lib/getToken";

type Announcement = { id: number; title: string; body: string; created_at: string; created_by: { id: number; name: string } | null;};

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required").max(150, "Title must be at most 150 characters"), body: z.string().min(1, "Body is required"),});

type AnnouncementForm = z.infer<typeof announcementSchema>;
type FieldErrors = Partial<Record<keyof AnnouncementForm, string>>;

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<AnnouncementForm>({ title: "", body: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [banner, setBanner] = useState("");

  useEffect(() => {fetchAnnouncements();}, []);

  async function fetchAnnouncements() {
    try {
      setLoadingList(true);
      setListError("");

      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/admin/announcement/allannouncements",
        { headers: authHeader() },
      );

      setAnnouncements(response.data);
    } catch (error) {
      setListError("Could not load announcements. Is the backend running?");
    } finally {
      setLoadingList(false);
    }
  }

  function openCreateModal() {
    setEditingId(null);
    setForm({ title: "", body: "" });
    setFieldErrors({});
    setModalOpen(true);
  }

  function openEditModal(announcement: Announcement) {
    setEditingId(announcement.id);
    setForm({ title: announcement.title, body: announcement.body });
    setFieldErrors({});
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setFieldErrors({});
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBanner("");

    const result = announcementSchema.safeParse(form);

    if (!result.success) {
      const newErrors: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof AnnouncementForm;
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
          process.env.NEXT_PUBLIC_API_URL + "/admin/announcement/create",
          result.data,
          { headers: authHeader() },
        );
        setBanner("Announcement published successfully.");
      } else {

        await axios.patch(
          process.env.NEXT_PUBLIC_API_URL + `/admin/announcement/update/${editingId}`,
          result.data,
          { headers: authHeader() },
        );
        setBanner("Announcement updated successfully.");
      }

      closeModal();
      await fetchAnnouncements();

      setTimeout(() => setBanner(""), 4000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        setFieldErrors({
          title:
            typeof message === "string" && message.toLowerCase().includes("title")
              ? message
              : undefined,
          body: undefined,
        });
        if (!(typeof message === "string" && message.toLowerCase().includes("title"))) {
          setBanner(
            typeof message === "string"
              ? message
              : "Could not save the announcement."
          );
        }
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
      setDeleting(true);

      await axios.delete(
        process.env.NEXT_PUBLIC_API_URL + `/admin/announcement/delete/${deleteTarget.id}`,
        { headers: authHeader() },
      );

      setBanner("Announcement deleted.");
      setDeleteTarget(null);
      await fetchAnnouncements();
      setTimeout(() => setBanner(""), 4000);
    } catch (error) {
      setBanner("Could not delete the announcement.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="mt-1 text-sm text-gray-500">
            Publish important messages to your community. {announcements.length} total.
          </p>
        </div>
        <button
          className="rounded-md bg-dwellix-500 px-4 py-2 text-sm font-medium text-white hover:bg-dwellix-600"
          onClick={openCreateModal}
        >
          + New Announcement
        </button>
      </div>
      {banner && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <span className="text-sm text-green-600">{banner}</span>
        </div>
      )}

      {loadingList ? (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-gray-200" />
        </div>
      ) : listError ? (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <span className="text-sm text-red-600">{listError}</span>
          <button
            className="rounded-md px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
            onClick={fetchAnnouncements}
          >
            Retry
          </button>
        </div>
      ) : announcements.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500">No announcements published yet.</p>
          <button
            className="rounded-md bg-dwellix-500 px-4 py-2 text-sm font-medium text-white hover:bg-dwellix-600"
            onClick={openCreateModal}
          >
            Publish the first one
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Message</th>
                  <th className="px-4 py-3 font-semibold">Published</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((announcement) => (
                  <tr key={announcement.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 font-semibold">{announcement.title}</td>
                    <td className="max-w-sm px-4 py-3">
                      <p className="line-clamp-2 text-sm text-gray-500">
                        {announcement.body}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(announcement.created_at).toLocaleDateString()}
                      <br />
                      <span className="text-gray-400">
                        by {announcement.created_by?.name ?? "Admin"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                          onClick={() => openEditModal(announcement)}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-gray-100"
                          onClick={() => setDeleteTarget(announcement)}
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
              {editingId === null ? "New Announcement" : "Edit Announcement"}
            </h3>

            <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Water supply maintenance on Friday"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-dwellix-500 focus:outline-none focus:ring-1 focus:ring-dwellix-500 disabled:bg-gray-100"
                  disabled={submitting}
                />
                {fieldErrors.title && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Message
                </label>
                <textarea
                  name="body"
                  value={form.body}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Write the announcement details..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-dwellix-500 focus:outline-none focus:ring-1 focus:ring-dwellix-500 disabled:bg-gray-100"
                  disabled={submitting}
                />
                {fieldErrors.body && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.body}</p>
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
                  {submitting
                    ? "Saving..."
                    : editingId === null
                      ? "Publish"
                      : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-bold">Delete announcement?</h3>
            <p className="mt-2 text-sm text-gray-500">
              &quot;{deleteTarget.title}&quot; will be removed permanently.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}