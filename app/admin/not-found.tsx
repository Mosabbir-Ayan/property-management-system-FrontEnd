import Link from "next/link";


export default function AdminNotFound() {
  return (
    <div className="card mx-auto max-w-md border border-base-300 bg-white shadow-sm">
      <div className="card-body items-center text-center">
        <h2 className="card-title text-2xl">404 — Page not found</h2>
        <p className="text-sm text-gray-500">
          The admin page you are looking for does not exist.
        </p>
        <div className="card-actions mt-4">
          <Link href="/admin" className="btn btn-primary btn-sm">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
