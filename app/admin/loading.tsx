import AdminStatSkeleton from "@/app/admin/components/admin/AdminStatSkeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6">

      <div className="h-16 animate-pulse rounded-lg bg-gray-200" />

      <AdminStatSkeleton count={4} />
    </div>
  );
}