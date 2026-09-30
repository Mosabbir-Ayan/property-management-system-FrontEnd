type AdminPageHeaderProps = { title: string; subtitle: string; actionLabel?: string; actionHref?: string;};

export default function AdminPageHeader({ title, subtitle, actionLabel, actionHref,}: AdminPageHeaderProps) {
  
  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      </div>

      {actionLabel && actionHref && (
        
         <a href={actionHref}
          className="inline-flex items-center justify-center rounded-md bg-dwellix-500 px-4 py-2 text-sm font-medium text-white hover:bg-dwellix-600"
        >
          {actionLabel}
        </a>
      )}
    </section>
  );
}