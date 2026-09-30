"use client";

import { useState } from "react";

export type Faq = { question: string; answer: string; };

type LandingFaqProps = { titleTop: string; titleBottom: string; intro: string; faqs: Faq[];};

export default function LandingFaq({ titleTop, titleBottom, intro, faqs }: LandingFaqProps) {
  
  const [openIndex, setOpenIndex] = useState(-1);

  return (
    <section id="faq" className="bg-[#f3f1eb] py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-dwellix-500">
            Questions, answered
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            {titleTop}
            <br />
            {titleBottom}
          </h2>
          <p className="mt-5 max-w-xs text-sm leading-7 text-gray-500">{intro}</p>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                >
                  {faq.question}
                  <span
                    className={`shrink-0 text-lg text-dwellix-500 transition-transform ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <p className="border-t border-gray-100 px-5 py-4 text-sm leading-7 text-gray-600">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
