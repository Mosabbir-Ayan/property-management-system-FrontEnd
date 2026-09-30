import AdminAdminManager from "@/app/admin/components/admin/AdminAdminManager";
import { getAdminSession } from "@/lib/adminAuth";
import axios from "axios";
import { z } from "zod";

const adminSchema = z.object({ id: z.number(), name: z.string(), email: z.string(), created_at: z.string(),});
const adminListSchema = z.array(adminSchema);

export default async function AdminAdminsPage() {
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

  const response = await axios.get(
    process.env.NEXT_PUBLIC_API_URL + "/admin",
    { headers: { Authorization: `Bearer ${session.token}` } },
  );

  const parsed = adminListSchema.safeParse(response.data);
  const admins = parsed.success ? parsed.data : [];

  return (
    <AdminAdminManager
      initialAdmins={admins}
      currentAdminId={session.user.id}
    />
  );
}