import AdminPageHeader from "@/app/admin/components/admin/AdminPageHeader";
import AdminCard from "@/app/admin/components/admin/AdminCard";
import Link from "next/link";
import { getAdminSession } from "@/lib/adminAuth";
import axios from "axios";
import { z } from "zod";

const adminRefSchema = z.object({id: z.number(),name: z.string(),});

const adminSchema = z.object({id: z.number(),name: z.string(),email: z.string(),created_at: z.string(),});

const announcementSchema = z.object({id: z.number(),title: z.string(),body: z.string(),created_at: z.string(),created_by: adminRefSchema.nullable(),});

const complaintSchema = z.object({ id: z.number(), filed_by_type: z.string(),filed_by_id: z.number(),against_type: z.string(),against_id: z.number().nullable(),description: z.string(),
  status: z.string(),
  admin_note: z.string().nullable(),
  reviewed_by: adminRefSchema.nullable(),
  created_at: z.string(),
});

const personSchema = z.object({id: z.number(), name: z.string(), email: z.string(), status: z.string(),});

const propertySchema = z.object({id: z.number(),unit_number: z.string(),status: z.string(),});

const blockSchema = z.object({id: z.number(),name: z.string(),});

const buildingSchema = z.object({id: z.number(),name: z.string(),});

const adminsSchema = z.array(adminSchema);
const announcementsSchema = z.array(announcementSchema);
const complaintsSchema = z.array(complaintSchema);
const landlordsSchema = z.array(personSchema);
const tenantsSchema = z.array(personSchema);
const staffSchema = z.array(personSchema);
const propertiesSchema = z.array(propertySchema);
const blocksSchema = z.array(blockSchema);
const buildingsSchema = z.array(buildingSchema);

async function fetchValidated<T>(
  url: string,
  token: string,
  schema: z.ZodType<T>,
): Promise<T | null> {
  try {
    const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const parsed = schema.safeParse(response.data);
    if (!parsed.success) {
      console.error(`Zod validation failed for ${url}`);
      return null;
    }
    return parsed.data;
  } catch (error) {
    console.error(`Axios request failed for ${url}`);
    return null;
  }
}

export default async function AdminDashboardPage() {

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

  const { token } = session;

  const [
    admins,
    announcements,
    complaints,
    landlords,
    tenants,
    staff,
    properties,
    blocks,
    buildings,
  ] = await Promise.all([
    fetchValidated("/admin", token, adminsSchema),
    fetchValidated("/admin/announcement/allannouncements", token, announcementsSchema),
    fetchValidated("/admin/complaint/allcomplaints", token, complaintsSchema),
    fetchValidated("/admin/landlord/alllandlord", token, landlordsSchema),
    fetchValidated("/admin/tenant/alltenants", token, tenantsSchema),
    fetchValidated("/admin/staff/allstaff", token, staffSchema),
    fetchValidated("/admin/property/allproperties", token, propertiesSchema),
    fetchValidated("/admin/block/allblocks", token, blocksSchema),
    fetchValidated("/admin/building/allbuildings", token, buildingsSchema),
  ]);

  const pendingComplaints = complaints
    ? complaints.filter((c) => c.status === "PENDING").length
    : 0;
  const resolvedComplaints = complaints
    ? complaints.filter(
        (c) => c.status === "RESOLVED" || c.status === "REJECTED",
      ).length
    : 0;
  const pendingTenants = tenants
    ? tenants.filter((t) => t.status === "PENDING").length
    : 0;

  const latestAnnouncements = announcements ? announcements.slice(0, 3) : [];

  return (
    <>
      <AdminPageHeader
        title="Admin Dashboard"
        subtitle="Monitor properties, people and operational activity from one place."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <AdminCard
          title="Announcements"
          value={announcements ? announcements.length : 0}
          hint="Published to all roles"
          tone="primary"
        />
        <AdminCard
          title="Open Complaints"
          value={pendingComplaints}
          hint={
            complaints
              ? `${resolvedComplaints} closed / ${complaints.length} total`
              : "Backend data unavailable"
          }
          tone="error"
        />
        <AdminCard
          title="Pending Tenants"
          value={pendingTenants}
          hint={tenants ? `${tenants.length} tenants total` : "Backend data unavailable"}
          tone="warning"
        />
        <AdminCard
          title="Properties"
          value={properties ? properties.length : 0}
          hint={
            buildings
              ? `${buildings.length} buildings / ${blocks ? blocks.length : 0} blocks`
              : "Backend data unavailable"
          }
          tone="neutral"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <AdminCard
          title="Admins"
          value={admins ? admins.length : 0}
          hint="Have full system access"
          tone="primary"
        />
        <AdminCard
          title="Landlords"
          value={landlords ? landlords.length : 0}
          hint="Managed by admin"
        />
        <AdminCard
          title="Tenants"
          value={tenants ? tenants.length : 0}
          hint="Created by admin, approved by landlord"
        />
        <AdminCard
          title="Staff"
          value={staff ? staff.length : 0}
          hint="Operational team"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Latest Announcements</h3>
            <Link
              href="/admin/announcements"
              className="text-xs text-dwellix-500 hover:underline"
            >
              Manage all
            </Link>
          </div>

          <div className="mt-2 divide-y divide-gray-200">
            {latestAnnouncements.length === 0 && (
              <p className="py-4 text-sm text-gray-500">
                No announcements published yet.
              </p>
            )}
            {latestAnnouncements.map((announcement) => (
              <div key={announcement.id} className="py-3">
                <p className="text-sm font-semibold">
                  {announcement.title}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
                  {announcement.body}
                </p>
                <p className="mt-1 text-[10px] text-gray-400">
                  by {announcement.created_by?.name ?? "Admin"} ·{" "}
                  {new Date(announcement.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold">Quick Access</h3>
          <div className="mt-2 grid gap-2">
            <Link
              href="/admin/admins"
              className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 hover:border-dwellix-500"
            >
              Admins <span>→</span>
            </Link>
            <Link
              href="/admin/announcements"
              className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 hover:border-dwellix-500"
            >
              Announcements <span>→</span>
            </Link>
            <Link
              href="/admin/complaints"
              className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 hover:border-dwellix-500"
            >
              Complaint Center <span>→</span>
            </Link>
            <Link
              href="/admin/landlords"
              className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 hover:border-dwellix-500"
            >
              Landlords <span>→</span>
            </Link>
            <Link
              href="/admin/tenants"
              className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 hover:border-dwellix-500"
            >
              Tenants <span>→</span>
            </Link>
            <Link
              href="/admin/staff"
              className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 hover:border-dwellix-500"
            >
              Staff <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}