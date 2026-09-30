import AdminPageHeader from "@/app/admin/components/admin/AdminPageHeader";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/adminAuth";
import { getAdminDetail, personSchema } from "@/lib/adminPeople";

/* ============================================================
   STAFF DETAIL — app/admin/staff/[id]/page.tsx
   ------------------------------------------------------------
   Same concepts as the landlord detail page: dynamic route
   [id] + dynamic SSR rendering (cookies + per-request fetch),
   notFound() for invalid ids, Axios + Zod data layer.
   ============================================================ */

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getAdminSession();
  if (!session) {
    return (
      <AdminPageHeader
        title="Staff"
        subtitle="Please log in as an admin to view this page."
      />
    );
  }

  const staff = await getAdminDetail(
    `/admin/staff/find/${id}`,
    session.token,
    personSchema,
  );

  if (!staff) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/staff" className="text-sm text-dwellix-500 hover:underline">
        ← Back to Staff
      </Link>

      <AdminPageHeader title={staff.name} subtitle={`Staff #${staff.id}`} />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card border border-base-300 bg-white shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-base">Contact</h3>
            <p className="text-sm">
              <span className="text-gray-400">Email:</span> {staff.email}
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Phone:</span> {staff.phone}
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Status:</span>{" "}
              <span className="badge badge-sm badge-success">{staff.status}</span>
            </p>
          </div>
        </div>

        <div className="card border border-base-300 bg-white shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-base">Account</h3>
            <p className="text-sm">
              <span className="text-gray-400">Created:</span>{" "}
              {new Date(staff.created_at).toLocaleString()}
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Created by:</span>{" "}
              {staff.created_by?.name ?? "unknown"} (admin #
              {staff.created_by?.id ?? "-"})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
