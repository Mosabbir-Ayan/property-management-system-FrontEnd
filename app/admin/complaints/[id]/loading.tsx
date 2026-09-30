import AdminStatSkeleton from "@/app/admin/components/admin/AdminStatSkeleton";

/* ============================================================
   loading.tsx — app/admin/complaints/[id]/loading.tsx
   ------------------------------------------------------------
   Course requirement: "loading" files. Next.js shows this
   automatically while the dynamic complaint detail page is
   being prepared. (React Suspense via the App Router.)
   ============================================================ */

export default function ComplaintDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-56 animate-pulse rounded bg-base-300" />
      <AdminStatSkeleton count={0} />
      <div className="card border border-base-300 bg-white shadow-sm">
        <div className="card-body space-y-3">
          <div className="h-5 w-40 animate-pulse rounded bg-base-300" />
          <div className="h-4 w-full animate-pulse rounded bg-base-300" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-base-300" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-base-300" />
        </div>
      </div>
    </div>
  );
}
