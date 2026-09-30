export type LandingFeature = { number: string; title: string; copy: string; };

type LandingFeatureGridProps = { kicker: string; titleTop: string; titleBottom: string; intro: string; features: LandingFeature[];};

export default function LandingFeatureGrid({ kicker, titleTop, titleBottom, intro, features,}: LandingFeatureGridProps) {
  
  return (
    <section id="features" className="bg-[#f3f1eb] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">

        <div className="mb-12 grid items-end gap-8 md:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-dwellix-500">
              {kicker}
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
              {titleTop}
              <br />
              {titleBottom}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-gray-500">{intro}</p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-lg border border-gray-300 bg-gray-300 sm:grid-cols-2 lg:grid-cols-4">
          
          {features.map((feature) => (
            <div
              key={feature.number}
              className="bg-white p-6 transition-colors hover:bg-[#fff0ed]"
            >
              <p className="text-5xl font-semibold text-gray-900">{feature.number}</p>
              <h3 className="mt-10 text-lg font-bold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-xs leading-6 text-gray-500">{feature.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
