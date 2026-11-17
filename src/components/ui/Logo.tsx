import Image from "next/image";

import { cn } from "@/lib/format";

import logoDark from "../../../public/images/brand/logo.png";
import logoLight from "../../../public/images/brand/logo-light.png";

interface LogoProps {
  /** `light`: auto en blanco, para fondos oscuros. */
  variant?: "default" | "light";
  priority?: boolean;
  className?: string;
}

export function Logo({ variant = "default", priority, className }: LogoProps) {
  return (
    <Image
      src={variant === "light" ? logoLight : logoDark}
      alt=""
      priority={priority}
      sizes="160px"
      className={cn("h-12 w-auto", className)}
    />
  );
}
