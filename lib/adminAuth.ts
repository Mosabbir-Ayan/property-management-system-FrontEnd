import { cookies } from "next/headers";

export type AdminUser = { id: number; name: string; email: string; account_type: string };
export type AdminSession = { token: string; user: AdminUser };

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("access_token");

  if (!tokenCookie) return null;

  const token = decodeURIComponent(tokenCookie.value);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/profile`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );

    if (!response.ok) {

      return null;
    }

    const admin = await response.json();

    return {
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        account_type: "admin",
      },
    };
  } catch {
    return null;
  }
}