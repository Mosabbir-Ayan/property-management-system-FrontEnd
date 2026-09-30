import Image from "next/image";

type LandingHeroProps = { TopName: string; headlineTop: string; headlineBottom: string; copy: string; imageSrc: string; imageAlt: string;};

export default function LandingHero({ TopName, headlineTop, headlineBottom, copy, imageSrc, imageAlt,}: LandingHeroProps) {
  
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-14 pt-16 md:grid-cols-2">

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-dwellix-500">
            {TopName}
          </p>

          <h1 className="mt-5 max-w-xl text-5xl font-bold leading-[0.95] tracking-tight text-gray-900 md:text-7xl">
            {headlineTop} <span className="text-dwellix-500">{headlineBottom}</span>
          </h1>

          <p className="mt-6 max-w-md text-[15px] leading-7 text-gray-500">{copy}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#how"
              className="inline-flex items-center justify-center rounded-lg bg-dwellix-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-dwellix-600"
            >
              Explore Dwellix →
            </a>
            <a
              href="#roles"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-gray-900"
            >
              See how it works
            </a>
          </div>

        </div>

        <div className="relative">
          <div className="relative h-[420px] overflow-hidden rounded-md shadow-sm md:h-[500px]">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/*Floating unit card*/}
          <div className="absolute bottom-6 -left-2 w-56 rounded-md bg-white p-4 shadow-xl md:left-6">
            <p className="text-[10px] uppercase tracking-widest text-gray-400">Occupancy</p>
            <p className="mt-1 text-xl font-bold text-gray-900">30%</p>
            <p className="text-[11px] text-gray-500">9 of 30 units occupied</p>
          </div>

          {/*Floating stat card*/}
          <div className="absolute right-4 top-7 min-w-36 bg-dwellix-500 p-4 text-white shadow-lg">
            <p className="text-2xl font-bold">24</p>
            <p className="text-[10px] opacity-90">Work orders resolved</p>
          </div>
        </div>
      </div>
    </section>
  );
}
