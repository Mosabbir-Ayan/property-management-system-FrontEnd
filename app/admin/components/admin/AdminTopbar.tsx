type AdminTopbarProps = { adminName: string; adminEmail: string; pageTitle: string;};

export default function AdminTopbar({ adminName, adminEmail, pageTitle,}: AdminTopbarProps) {
 
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-4">

      <h2 className="text-lg font-bold text-gray-900">{pageTitle}</h2>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold leading-tight">{adminName}</p>
          <p className="text-xs text-gray-500">{adminEmail}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dwellix-500 text-white">

          <span className="text-lg font-bold">{adminName.charAt(0)}</span>
        </div>
      </div>
    </header>
  );
}