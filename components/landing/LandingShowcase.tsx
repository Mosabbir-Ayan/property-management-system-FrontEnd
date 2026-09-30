import Image from "next/image";

export type ShowcaseImage = { src: string; alt: string;};

type LandingShowcaseProps = { kicker: string; titleTop: string; titleBottom: string; intro: string; checks: string[]; images: ShowcaseImage[];};

export default function LandingShowcase({ kicker, titleTop, titleBottom, intro, checks, images,}: LandingShowcaseProps) {
  
  return (
    <section id="platform" className="bg-white py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-2">

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-dwellix-500">
            {kicker}
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            {titleTop}
            <br />
            {titleBottom}
          </h2>
          <p className="mt-6 max-w-md text-sm leading-7 text-gray-500">{intro}</p>

          <ul className="mt-8 space-y-3">
            {checks.map((check) => (
              <li key={check} className="flex items-start gap-3 text-sm text-gray-600">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dwellix-500 text-[10px] font-bold text-white">
                  
                </span>
                {check}
              </li>
            ))}
          </ul>

          <a
            href="/login"
            className="mt-10 inline-flex items-center justify-center rounded-lg bg-dwellix-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-dwellix-600"
          >
            Access your workspace →
          </a>
        </div>

        <div className="space-y-4">
          <figure className="relative h-64 overflow-hidden rounded-md shadow-md md:h-80">
            <Image
              src={images[0].src}
              alt={images[0].alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </figure>

          <div className="grid grid-cols-2 gap-4">
            {images.slice(1).map((image) => (
              <figure
                key={image.src}
                className="relative h-40 overflow-hidden rounded-md shadow-md md:h-48"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </figure>
            ))}
          </div>

          <div className="flex flex-wrap justify-between gap-2 pt-1">
            {images.map((image) => (
              <p
                key={image.src}
                className="text-[10px] uppercase tracking-widest text-gray-400"
              >
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
