"use client";

import { useEffect, useRef } from "react";

interface HeroVideoProps {
  mp4?: string;
  webm?: string;
  className?: string;
}

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

/**
 * Video de fondo optimizado:
 *  - El póster (next/image, priority) es el LCP; el video NO bloquea el primer render.
 *  - Las <source> se inyectan en idle, tras la carga de la ventana.
 *  - No se descarga con `prefers-reduced-motion`, modo ahorro de datos o conexiones 2G.
 *  - Se pausa fuera del viewport para ahorrar CPU/batería.
 *  - Aparece con fade solo cuando el navegador puede reproducirlo (`canplay`).
 *  - Si el archivo no existe (404), simplemente se queda el póster.
 */
export function HeroVideo({ mp4, webm, className }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || (!mp4 && !webm)) return;

    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const constrained = connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "");
    if (reducedMotion || constrained) return;

    video.muted = true; // requerido para autoplay en iOS/Chrome
    const onCanPlay = () => {
      video.dataset.ready = "true";
    };
    video.addEventListener("canplay", onCanPlay, { once: true });

    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });

    const start = () => {
      if (video.querySelector("source")) return;
      // WebM primero (más liviano); MP4 como fallback universal.
      const sources: Array<[string | undefined, string]> = [
        [webm, "video/webm"],
        [mp4, "video/mp4"],
      ];
      for (const [src, type] of sources) {
        if (!src) continue;
        const source = document.createElement("source");
        source.src = src;
        source.type = type;
        video.appendChild(source);
      }
      video.load();
      visibility.observe(video);
    };

    let idleHandle: number | undefined;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      if ("requestIdleCallback" in window) idleHandle = window.requestIdleCallback(start, { timeout: 2000 });
      else timeoutHandle = setTimeout(start, 500);
    };

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      window.removeEventListener("load", schedule);
      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
      if (timeoutHandle) clearTimeout(timeoutHandle);
      visibility.disconnect();
      video.removeEventListener("canplay", onCanPlay);
    };
  }, [mp4, webm]);

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      disablePictureInPicture
    />
  );
}
