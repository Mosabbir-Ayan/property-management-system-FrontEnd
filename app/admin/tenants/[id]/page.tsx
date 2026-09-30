import AdminPageHeader from "@/app/admin/components/admin/AdminPageHeader";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/adminAuth";
import { getAdminDetail, tenantSchema } from "@/lib/adminPeople";

/* ============================================================
   TENANT DETAIL — app/admin/tenants/[id]/page.tsx
   ------------------------------------------------------------
   Same concepts as the landlord/staff detail pages: dynamic
   route [id] + dynamic SSR rendering, notFound() handling,
   Axios + Zod server-side data layer.

   SECURITY NOTE (good to explain to your instructor): the
   backend's find endpoint returns password_hash for tenants —
   our Zod schema (tenantSchema) deliberately EXCLUDES that
   field, so the hash is validated away and never reaches the
   page or the browser. The UI shows only safe fields.
   ============================================================ */

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getAdminSession();
  if (!session) {
    return (
      <AdminPageHeader
        title="Tenant"
        subtitle="Please log in as an admin to view this page."
      />
    );
  }

  const tenant = await getAdminDetail(
    `/admin/tenant/find/${id}`,
    session.token,
    tenantSchema,
  );

  if (!tenant) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/tenants" className="text-sm text-dwellix-500 hover:underline">
        ← Back to Tenants
      </Link>

      <AdminPageHeader title={tenant.name} subtitle={`Tenant #${tenant.id}`} />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card border border-base-300 bg-white shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-base">Contact</h3>
            <p className="text-sm">
              <span className="text-gray-400">Email:</span> {tenant.email}
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Phone:</span> {tenant.phone}
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Status:</span>{" "}
              <span
                className={`badge badge-sm ${
                  tenant.status === "APPROVED"
                    ? "badge-success"
                    : tenant.status === "PENDING"
                      ? "badge-warning"
                      : "badge-error"
                }`}
              >
                {tenant.status}
              </span>
            </p>
          </div>
        </div>

        <div className="card border border-base-300 bg-white shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-base">Tenancy</h3>
            <p className="text-sm">
              <span className="text-gray-400">NID:</span> {tenant.nid_number}
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Vehicle:</span>{" "}
              {tenant.has_vehicle ? "Yes" : "No"}
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Property:</span>{" "}
              {tenant.property
                ? `Unit ${tenant.property.unit_number} (property #${tenant.property.id})`
                : "Not assigned yet"}
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Approved by:</span>{" "}
              {tenant.approved_by
                ? `${tenant.approved_by.name} (landlord #${tenant.approved_by.id})`
                : "Not approved yet"}
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Created:</span>{" "}
              {new Date(tenant.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
