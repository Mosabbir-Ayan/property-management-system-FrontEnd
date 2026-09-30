import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import AdminSidebar from "@/app/admin/components/admin/AdminSidebar";
import AdminTopbar from "@/app/admin/components/admin/AdminTopbar";
import AdminAnnouncementToast from "@/app/admin/components/admin/AdminAnnouncementToast";
import { getAdminSession } from "@/lib/adminAuth";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          adminName={session.user.name}
          adminEmail={session.user.email}
          pageTitle="Admin Panel"
        />
        <main className="flex-1 space-y-6 p-6">{children}</main>

        <AdminAnnouncementToast />
      </div>
    </div>
  );
}