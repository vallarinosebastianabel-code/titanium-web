"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from "@/components/ui/icons";
import { cn } from "@/lib/format";

export interface TestimonialView {
  id: string;
  name: string;
  location?: string;
  vehicle: string;
  quote: string;
  rating: number;
  photoUrl: string;
  photoAlt: string;
}

/** Carrusel nativo con scroll-snap: táctil por defecto + botones y teclado para escritorio. */
export function TestimonialCarousel({ items }: { items: TestimonialView[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const frame = requestAnimationFrame(updateEdges);
    const observer = new ResizeObserver(updateEdges);
    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [updateEdges]);

  const scrollByCard = (direction: 1 | -1) => {
    const el = trackRef.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    el.scrollBy({ left: direction * (card.offsetWidth + 24), behavior: "smooth" });
  };

  return (
    <div role="region" aria-roledescription="carrusel" aria-label="Testimonios de clientes" className="relative">
      <ul
        ref={trackRef}
        onScroll={updateEdges}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") scrollByCard(1);
          if (e.key === "ArrowLeft") scrollByCard(-1);
        }}
        className="-mx-5 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-5 pb-6 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-500 lg:-mx-8 lg:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((t, index) => (
          <li
            key={t.id}
            aria-roledescription="diapositiva"
            aria-label={`${index + 1} de ${items.length}`}
            className="w-[85%] shrink-0 snap-start sm:w-[46%] lg:w-[31.5%]"
          >
            <figure className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card transition-transform duration-300 hover:-translate-y-1">
              <div className="relative aspect-[4/3.2] bg-navy-50">
                <Image
                  src={t.photoUrl}
                  alt={t.photoAlt}
                  fill
                  sizes="(min-width: 1024px) 380px, (min-width: 640px) 46vw, 85vw"
                  className="object-cover"
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-navy-900/90 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                  {t.vehicle}
                </span>
              </div>
              <figcaption className="flex flex-1 flex-col gap-4 p-6">
                <div className="flex gap-0.5 text-accent-500" role="img" aria-label={`${t.rating} de 5 estrellas`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon
                      key={i}
                      width={18}
                      height={18}
                      className={cn(i >= t.rating && "text-navy-100")}
                    />
                  ))}
                </div>
                <blockquote className="flex-1 text-[0.95rem] leading-relaxed text-navy-700">“{t.quote}”</blockquote>
                <div>
                  <p className="font-extrabold">{t.name}</p>
                  {t.location && <p className="text-sm text-navy-400">{t.location}</p>}
                </div>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          disabled={edges.start}
          aria-label="Testimonio anterior"
          className="grid size-12 place-items-center rounded-full border border-navy-200 bg-white text-navy-900 transition hover:border-navy-900 hover:bg-navy-900 hover:text-white disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeftIcon />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          disabled={edges.end}
          aria-label="Siguiente testimonio"
          className="grid size-12 place-items-center rounded-full border border-navy-200 bg-white text-navy-900 transition hover:border-navy-900 hover:bg-navy-900 hover:text-white disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}
