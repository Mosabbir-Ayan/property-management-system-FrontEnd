import axios from "axios";
import { z } from "zod";

export const adminRefSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const personSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  status: z.string(),
  created_at: z.string(),
  created_by: adminRefSchema.nullable(),
});
export type AdminPerson = z.infer<typeof personSchema>;

export const tenantSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  nid_number: z.string(),
  has_vehicle: z.boolean(),
  status: z.string(),
  created_at: z.string(),
  property: z
    .object({ id: z.number(), unit_number: z.string() })
    .nullable(),
  approved_by: adminRefSchema.nullable(),
});
export type AdminTenant = z.infer<typeof tenantSchema>;

export const peopleListSchema = z.array(personSchema);
export const tenantListSchema = z.array(tenantSchema);

export async function getAdminList<T>(
  url: string,
  token: string,
  schema: z.ZodType<T[]>,
): Promise<T[]> {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + url,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const parsed = schema.safeParse(response.data);
    if (!parsed.success) {
      console.error(`Zod validation failed for ${url}`);
      return [];
    }
    return parsed.data;
  } catch (error) {
    console.error(`Axios request failed for ${url}`);
    return [];
  }
}

export async function getAdminDetail<T>(
  url: string,
  token: string,
  schema: z.ZodType<T>,
): Promise<T | null> {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + url,
      { headers: { Authorization: `Bearer ${token}` } },
    );

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
