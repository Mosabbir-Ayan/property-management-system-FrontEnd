"use client";


import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { authHeader } from "@/lib/getToken";

type Complaint = { id: number; filed_by_type: string; filed_by_id: number; against_type: string; against_id: number | null; description: string; status: string; admin_note: string | null; reviewed_by: { id: number; name: string } | null; created_at: string;};

const STATUS_OPTIONS = ["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"];
const FILER_OPTIONS = ["LANDLORD", "TENANT", "STAFF"];

const STATUS_BADGE: Record<string, string> = {
  PENDING: "badge-warning",
  IN_PROGRESS: "badge-info",
  RESOLVED: "badge-success",
  REJECTED: "badge-ghost",
};

export default function AdminComplaintsPage() {

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [filerFilter, setFilerFilter] = useState("ALL");
  const [keyword, setKeyword] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  async function fetchComplaints() {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/admin/complaint/allcomplaints",
        { headers: authHeader() },
      );
      setComplaints(response.data);
    } catch {
      setError("Could not load complaints. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = keyword.trim();
    if (!trimmed) {
      fetchComplaints();
      return;
    }

    try {
      setSearching(true);
      setError("");
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/admin/complaint/search",
        {
          params: { keyword: trimmed },
          headers: authHeader(),
        },
      );
      setComplaints(response.data);
    } catch {
      setError("Search failed. Is the backend running?");
    } finally {
      setSearching(false);
    }
  }

  function handleClearSearch() {
    setKeyword("");
    fetchComplaints();
  }

  const filteredComplaints = complaints.filter((complaint) => {
    const statusOk = statusFilter === "ALL" || complaint.status === statusFilter;
    const filerOk = filerFilter === "ALL" || complaint.filed_by_type === filerFilter;
    return statusOk && filerOk;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Complaint Center</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review, inspect and resolve complaints filed by landlords, tenants and staff.
        </p>
      </div>

      {error && (
        <div className="alert border-base-300 bg-white shadow-sm">
          <span className="text-sm text-error">{error}</span>
          <button className="btn btn-xs" onClick={fetchComplaints}>
            Retry
          </button>
        </div>
      )}

      <div className="card border border-base-300 bg-white shadow-sm">
        <div className="card-body flex-row flex-wrap items-end gap-4 p-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              Status
            </label>
            <select
              className="select select-bordered select-sm w-40"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="ALL">All statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              Filed by
            </label>
            <select
              className="select select-bordered select-sm w-40"
              value={filerFilter}
              onChange={(event) => setFilerFilter(event.target.value)}
            >
              <option value="ALL">All roles</option>
              {FILER_OPTIONS.map((filer) => (
                <option key={filer} value={filer}>
                  {filer}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSearch} className="flex items-end gap-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Search
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search descriptions..."
                className="input input-bordered input-sm w-56"
              />
            </div>
            <button type="submit" className="btn btn-sm" disabled={searching}>
              {searching ? "Searching..." : "Search"}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleClearSearch}>
              Clear
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="card border border-base-300 bg-white shadow-sm">
          <div className="card-body space-y-3">
            <div className="h-4 w-48 animate-pulse rounded bg-base-300" />
            <div className="h-4 w-full animate-pulse rounded bg-base-300" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-base-300" />
          </div>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="card border border-base-300 bg-white shadow-sm">
          <div className="card-body items-center text-center">
            <p className="text-sm text-gray-500">No complaints match the current filters.</p>
          </div>
        </div>
      ) : (
        <div className="card border border-base-300 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="text-xs uppercase text-gray-500">
                  <th>#</th>
                  <th>Filed by</th>
                  <th>Against</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td>{complaint.id}</td>
                    <td>
                      <span className="font-semibold">{complaint.filed_by_type}</span>
                      <span className="text-gray-400"> #{complaint.filed_by_id}</span>
                    </td>
                    <td>
                      <span className="font-semibold">{complaint.against_type}</span>
                      <span className="text-gray-400">
                        {complaint.against_id ? ` #${complaint.against_id}` : ""}
                      </span>
                    </td>
                    <td className="max-w-xs">
                      <p className="line-clamp-1 text-sm text-gray-500">
                        {complaint.description}
                      </p>
                    </td>
                    {/* DaisyUI badge with per-status color */}
                    <td>
                      <span className={`badge badge-sm ${STATUS_BADGE[complaint.status] ?? "badge-ghost"}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="text-xs text-gray-500">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/admin/complaints/${complaint.id}`}
                        className="btn btn-ghost btn-xs text-dwellix-500"
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
