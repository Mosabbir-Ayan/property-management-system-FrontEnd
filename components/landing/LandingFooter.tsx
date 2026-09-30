type FooterLink = { label: string; href: string;};

type LandingFooterProps = { brand: string; tagline: string; accessTitle: string; accessLinks: FooterLink[]; supportTitle: string; supportEmail: string; copyright: string; wordmark: string;};

export default function LandingFooter({ brand, tagline, accessTitle, accessLinks, supportTitle, supportEmail, copyright, wordmark,}: LandingFooterProps) {
  
  return (
    <footer className="bg-[#1d1d1c] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <h3 className="max-w-sm text-xl font-bold leading-8">{tagline}</h3>
          <p className="mt-4 max-w-md text-sm leading-7 text-gray-400">
            Connect properties, people, maintenance and money through one streamlined{" "}
            {brand} experience.
          </p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
            {accessTitle}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-300">
            {accessLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="transition hover:text-white">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
            {supportTitle}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-300">
            <li>
              <a href={`mailto:${supportEmail}`} className="transition hover:text-white">
                Contact Support
              </a>
            </li>
            <li>{supportEmail}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <p className="mx-auto max-w-6xl px-6 text-xs text-gray-500">{copyright}</p>
      </div>

      <div className="overflow-hidden px-6 pb-8">
        <p
          className="select-none text-center text-[18vw] font-black leading-none tracking-tight text-dwellix-500/90"
          aria-hidden="true"
        >
          {wordmark}
        </p>
      </div>
    </footer>
  );
}
