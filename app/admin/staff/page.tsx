import AdminStaffManager from "@/app/admin/components/admin/AdminStaffManager";
import { getAdminSession } from "@/lib/adminAuth";
import { getAdminList, peopleListSchema } from "@/lib/adminPeople";

export default async function AdminStaffPage() {
  const session = await getAdminSession();

  if (!session) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-bold">Session required</h2>
        <p className="mt-1 text-sm text-gray-500">
          Please log in as an admin again.
        </p>
      </div>
    );
  }

  const staff = await getAdminList(
    "/admin/staff/allstaff",
    session.token,
    peopleListSchema,
  );

  return <AdminStaffManager initialStaff={staff} />;
}