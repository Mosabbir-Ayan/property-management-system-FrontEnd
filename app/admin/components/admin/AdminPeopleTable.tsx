import Link from "next/link";

export type AdminPeopleRow = { id: number; name: string; email: string; meta?: string; status: string; footer?: string; detailHref: string;};

type AdminPeopleTableProps = { metaLabel: string; rows: AdminPeopleRow[]; emptyMessage: string;

  onEdit?: (row: AdminPeopleRow) => void;
  onDelete?: (row: AdminPeopleRow) => void;
};

function statusBadgeClass(status: string): string {
  const normalized = status.toUpperCase();
  if (normalized === "APPROVED" || normalized === "ACTIVE")
    return "bg-green-100 text-green-700";
  if (normalized === "PENDING") return "bg-amber-100 text-amber-700";
  if (normalized === "REJECTED" || normalized === "INACTIVE")
    return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
}

export default function AdminPeopleTable({
  metaLabel,
  rows,
  emptyMessage,
  onEdit,
  onDelete,
}: AdminPeopleTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">{metaLabel}</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{row.name}</p>
                  {row.footer && (
                    <p className="text-[11px] text-gray-400">{row.footer}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{row.email}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{row.meta ?? "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusBadgeClass(row.status)}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    {/* Link to the dynamic detail route /admin/<role>/[id] */}
                    <Link
                      href={row.detailHref}
                      className="rounded-md px-2 py-1 text-xs font-medium text-dwellix-500 hover:bg-gray-100"
                    >
                      View
                    </Link>

                    {/* Optional Edit/Delete actions (props-driven) */}
                    {onEdit && (
                      <button
                        className="rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                        onClick={() => onEdit(row)}
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-gray-100"
                        onClick={() => onDelete(row)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}