import AdminPageHeader from "@/app/admin/components/admin/AdminPageHeader";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/adminAuth";
import { getAdminDetail, personSchema } from "@/lib/adminPeople";

/* ============================================================
   LANDLORD DETAIL — app/admin/landlords/[id]/page.tsx
   ------------------------------------------------------------
   COURSE CONCEPTS DEMONSTRATED IN THIS FILE:

   1. DYNAMIC ROUTING + DYNAMIC RENDERING — the [id] folder
      makes /admin/landlords/1, /admin/landlords/2, ... render
      through this one page. Because it reads COOKIES and
      fetches per-request, Next.js renders it DYNAMICALLY on
      every request (SSR) — appropriate for private, user-
      specific data (course table: "Authenticated account page
      -> SSR"). No generateStaticParams: we do not want pre-
      built copies of private data at build time.

   2. notFound() + not-found.tsx — an invalid id (404 from the
      backend) triggers Next's notFound(), which renders the
      nearest not-found.tsx (course requirement).

   3. AXIOS + ZOD — same server-side data layer
      (lib/adminPeople.ts) as the list pages.
   ============================================================ */

export default async function LandlordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next 15/16: params is a Promise -> await it.
  const { id } = await params;

  // AUTH first (SSR, cookie-based).
  const session = await getAdminSession();
  if (!session) {
    return (
      <AdminPageHeader
        title="Landlord"
        subtitle="Please log in as an admin to view this page."
      />
    );
  }

  // SSR fetch of this landlord (Axios + Zod). null = not found.
  const landlord = await getAdminDetail(
    `/admin/landlord/find/${id}`,
    session.token,
    personSchema,
  );

  // Invalid id -> render the not-found UI (course requirement).
  if (!landlord) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/landlords" className="text-sm text-dwellix-500 hover:underline">
        ← Back to Landlords
      </Link>

      <AdminPageHeader
        title={landlord.name}
        subtitle={`Landlord #${landlord.id}`}
      />

      {/* Info cards (DaisyUI card components) */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card border border-base-300 bg-white shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-base">Contact</h3>
            <p className="text-sm">
              <span className="text-gray-400">Email:</span> {landlord.email}
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Phone:</span> {landlord.phone}
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Status:</span>{" "}
              <span className="badge badge-sm badge-success">{landlord.status}</span>
            </p>
          </div>
        </div>

        <div className="card border border-base-300 bg-white shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-base">Account</h3>
            <p className="text-sm">
              <span className="text-gray-400">Created:</span>{" "}
              {new Date(landlord.created_at).toLocaleString()}
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Created by:</span>{" "}
              {landlord.created_by?.name ?? "unknown"} (admin #
              {landlord.created_by?.id ?? "-"})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
