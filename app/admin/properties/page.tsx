"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { z } from "zod";
import { authHeader } from "@/lib/getToken";

type Property = { id: number; unit_number: string; building: { id: number; name: string } | null; landlord: { id: number; name: string }; tenant: { id: number; name: string } | null; rent_amount: number | string; service_charge: number | string | null; has_parking: boolean; parking_fee: number | string | null; listing_status: string; status: string; created_at: string;};

type IdName = { id: number; name: string };

const optionalPositiveNumber = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().positive("Must be a positive number").optional(),
);

const propertySchema = z.object({
  unit_number: z.string().min(1, "Unit number is required"),
  buildingId: z.coerce.number().min(1, "Please choose a building"),
  landlordId: z.coerce.number().min(1, "Please choose a landlord"),
  rent_amount: z.coerce
    .number({ message: "Rent must be a number" })
    .positive("Rent must be greater than 0"),
  service_charge: optionalPositiveNumber,
  has_parking: z.boolean(),
  parking_fee: optionalPositiveNumber,
  listing_status: z.enum(["not_listed", "for_rent", "for_sale"]),
  status: z.enum(["vacant", "occupied", "sold"]),
});

type PropertyFormState = {
  unit_number: string;
  buildingId: number | string;
  landlordId: number | string;
  rent_amount: string;
  service_charge: string;
  has_parking: boolean;
  parking_fee: string;
  listing_status: string;
  status: string;
};
type FieldErrors = Partial<Record<keyof PropertyFormState, string>>;

const EMPTY_FORM: PropertyFormState = {
  unit_number: "",
  buildingId: 0,
  landlordId: 0,
  rent_amount: "",
  service_charge: "",
  has_parking: false,
  parking_fee: "",
  listing_status: "not_listed",
  status: "vacant",
};

function statusBadgeClass(status: string): string {
  if (status === "occupied") return "bg-green-100 text-green-700";
  if (status === "sold") return "bg-blue-100 text-blue-700";
  return "bg-amber-100 text-amber-700";
}

export default function AdminPropertiesPage() {

  const [properties, setProperties] = useState<Property[]>([]);
  const [buildings, setBuildings] = useState<IdName[]>([]);
  const [landlords, setLandlords] = useState<IdName[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PropertyFormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [banner, setBanner] = useState("");

  useEffect(() => {
    fetchProperties();
    fetchBuildings();
    fetchLandlords();
  }, []);

  async function fetchProperties() {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/admin/property/allproperties",
        { headers: authHeader() },
      );
      setProperties(response.data);
    } catch {
      setError("Could not load properties. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  async function fetchBuildings() {
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/admin/building/allbuildings",
        { headers: authHeader() },
      );
      setBuildings(response.data);
    } catch {
      console.error("Could not load buildings for the select");
    }
  }

  async function fetchLandlords() {
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/admin/landlord/alllandlord",
        { headers: authHeader() },
      );
      setLandlords(response.data);
    } catch {
      console.error("Could not load landlords for the select");
    }
  }

  function openCreateModal() {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      buildingId: buildings[0]?.id ?? 0,
      landlordId: landlords[0]?.id ?? 0,
    });
    setFieldErrors({});
    setModalOpen(true);
  }

  function openEditModal(property: Property) {
    setEditingId(property.id);
    setForm({
      unit_number: property.unit_number,
      buildingId: property.building?.id ?? 0,
      landlordId: property.landlord.id,
      rent_amount: String(property.rent_amount),
      service_charge:
        property.service_charge === null || property.service_charge === undefined
          ? ""
          : String(property.service_charge),
      has_parking: property.has_parking,
      parking_fee:
        property.parking_fee === null || property.parking_fee === undefined
          ? ""
          : String(property.parking_fee),
      listing_status: property.listing_status,
      status: property.status,
    });
    setFieldErrors({});
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setFieldErrors({});
  }

  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function handleParkingChange(event: React.ChangeEvent<HTMLInputElement>) {
    setForm((previous) => ({ ...previous, has_parking: event.target.checked }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBanner("");

    const result = propertySchema.safeParse(form);
    if (!result.success) {
      const newErrors: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof PropertyFormState;
        if (field && !newErrors[field]) newErrors[field] = issue.message;
      });
      setFieldErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      setFieldErrors({});

      if (editingId === null) {
        await axios.post(
          process.env.NEXT_PUBLIC_API_URL + "/admin/property/create",
          result.data,
          { headers: authHeader() },
        );
        setBanner("Property created successfully.");
      } else {
        await axios.patch(
          process.env.NEXT_PUBLIC_API_URL + `/admin/property/update/${editingId}`,
          result.data,
          { headers: authHeader() },
        );
        setBanner("Property updated successfully.");
      }

      closeModal();
      await fetchProperties();
      setTimeout(() => setBanner(""), 4000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        setBanner(
          typeof message === "string" ? message : "Could not save the property.",
        );
      } else {
        setBanner("Something went wrong.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      setSubmitting(true);
      await axios.delete(
        process.env.NEXT_PUBLIC_API_URL + `/admin/property/delete/${deleteTarget.id}`,
        { headers: authHeader() },
      );
      setBanner("Property deleted.");
      setDeleteTarget(null);
      await fetchProperties();
      setTimeout(() => setBanner(""), 4000);
    } catch {
      setBanner("Could not delete the property.");
    } finally {
      setSubmitting(false);
    }
  }

  function money(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === "") return "-";
    return `${Number(value).toLocaleString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Property Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all properties, pricing and availability. {properties.length} total.
          </p>
        </div>
        <button
          className="rounded-md bg-dwellix-500 px-4 py-2 text-sm font-medium text-white hover:bg-dwellix-600 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={openCreateModal}
          disabled={buildings.length === 0 || landlords.length === 0}
        >
          + New Property
        </button>
      </div>

      {(buildings.length === 0 || landlords.length === 0) && !loading && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <span className="text-sm text-amber-600">
            You need at least one building and one landlord before creating a property.
          </span>
        </div>
      )}

      {banner && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <span className="text-sm text-green-600">{banner}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <span className="text-sm text-red-600">{error}</span>
          <button
            className="rounded-md px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
            onClick={fetchProperties}
          >
            Retry
          </button>
        </div>
      ) : properties.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500">No properties created yet.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                  <th className="px-4 py-3 font-semibold">Unit</th>
                  <th className="px-4 py-3 font-semibold">Building</th>
                  <th className="px-4 py-3 font-semibold">Landlord</th>
                  <th className="px-4 py-3 font-semibold">Tenant</th>
                  <th className="px-4 py-3 font-semibold">Rent</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Listing</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 font-semibold">{property.unit_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {property.building?.name ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{property.landlord?.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {property.tenant?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm">{money(property.rent_amount)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusBadgeClass(property.status)}`}
                      >
                        {property.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{property.listing_status}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                          onClick={() => openEditModal(property)}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-gray-100"
                          onClick={() => setDeleteTarget(property)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-bold">
              {editingId === null ? "New Property" : "Edit Property"}
            </h3>

            <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Unit number
                  </label>
                  <input
                    type="text"
                    name="unit_number"
                    value={form.unit_number}
                    onChange={handleInputChange}
                    placeholder="e.g. A-101"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-dwellix-500 focus:outline-none focus:ring-1 focus:ring-dwellix-500 disabled:bg-gray-100"
                    disabled={submitting}
                  />
                  {fieldErrors.unit_number && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.unit_number}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Building
                  </label>
                  <select
                    name="buildingId"
                    value={form.buildingId}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-dwellix-500 focus:outline-none focus:ring-1 focus:ring-dwellix-500 disabled:bg-gray-100"
                    disabled={submitting}
                  >
                    <option value={0}>Select...</option>
                    {buildings.map((building) => (
                      <option key={building.id} value={building.id}>
                        {building.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.buildingId && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.buildingId}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Landlord
                  </label>
                  <select
                    name="landlordId"
                    value={form.landlordId}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-dwellix-500 focus:outline-none focus:ring-1 focus:ring-dwellix-500 disabled:bg-gray-100"
                    disabled={submitting}
                  >
                    <option value={0}>Select...</option>
                    {landlords.map((landlord) => (
                      <option key={landlord.id} value={landlord.id}>
                        {landlord.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.landlordId && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.landlordId}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Rent amount
                  </label>
                  <input
                    type="number"
                    name="rent_amount"
                    value={form.rent_amount}
                    onChange={handleInputChange}
                    placeholder="e.g. 15000"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-dwellix-500 focus:outline-none focus:ring-1 focus:ring-dwellix-500 disabled:bg-gray-100"
                    disabled={submitting}
                  />
                  {fieldErrors.rent_amount && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.rent_amount}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Service charge (optional)
                  </label>
                  <input
                    type="number"
                    name="service_charge"
                    value={form.service_charge ?? ""}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-dwellix-500 focus:outline-none focus:ring-1 focus:ring-dwellix-500 disabled:bg-gray-100"
                    disabled={submitting}
                  />
                  {fieldErrors.service_charge && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.service_charge}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Parking fee (optional)
                  </label>
                  <input
                    type="number"
                    name="parking_fee"
                    value={form.parking_fee ?? ""}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-dwellix-500 focus:outline-none focus:ring-1 focus:ring-dwellix-500 disabled:bg-gray-100"
                    disabled={submitting}
                  />
                  {fieldErrors.parking_fee && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.parking_fee}</p>
                  )}
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-dwellix-500 focus:ring-dwellix-500"
                      checked={form.has_parking}
                      onChange={handleParkingChange}
                      disabled={submitting}
                    />
                    <span className="text-xs font-semibold text-gray-600">
                      Has parking
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Listing status
                  </label>
                  <select
                    name="listing_status"
                    value={form.listing_status}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-dwellix-500 focus:outline-none focus:ring-1 focus:ring-dwellix-500 disabled:bg-gray-100"
                    disabled={submitting}
                  >
                    <option value="not_listed">not_listed</option>
                    <option value="for_rent">for_rent</option>
                    <option value="for_sale">for_sale</option>
                  </select>
                  {fieldErrors.listing_status && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.listing_status}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Occupancy status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-dwellix-500 focus:outline-none focus:ring-1 focus:ring-dwellix-500 disabled:bg-gray-100"
                    disabled={submitting}
                  >
                    <option value="vacant">vacant</option>
                    <option value="occupied">occupied</option>
                    <option value="sold">sold</option>
                  </select>
                  {fieldErrors.status && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.status}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-dwellix-500 px-4 py-2 text-sm font-medium text-white hover:bg-dwellix-600 disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : editingId === null ? "Create" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-bold">Delete property?</h3>
            <p className="mt-2 text-sm text-gray-500">
              Unit &quot;{deleteTarget.unit_number}&quot; will be removed permanently.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                onClick={() => setDeleteTarget(null)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                onClick={handleDelete}
                disabled={submitting}
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}