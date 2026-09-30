export default function AdminStatSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-8 w-16 animate-pulse rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}