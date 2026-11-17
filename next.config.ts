import type { NextConfig } from "next";

/**
 * El "bucket" (datos JSON + imágenes + video) se resuelve desde una única URL base.
 * - Local:  NEXT_PUBLIC_BUCKET_URL=/bucket
 * - Prod:   NEXT_PUBLIC_BUCKET_URL=https://<space>.<region>.cdn.digitaloceanspaces.com
 *
 * Si hay Supabase, también autorizamos su host de Storage para next/image.
 */
const bucketUrl = process.env.NEXT_PUBLIC_BUCKET_URL ?? "/bucket";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

const remotePatterns: Array<{
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
}> = [];

function pushHost(raw: string) {
  if (!/^https?:\/\//i.test(raw)) return;
  const url = new URL(raw);
  remotePatterns.push({
    protocol: url.protocol.replace(":", "") as "http" | "https",
    hostname: url.hostname,
    ...(url.port ? { port: url.port } : {}),
    pathname: "/**",
  });
}

pushHost(bucketUrl);
pushHost(supabaseUrl);

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com"],
  images: {
    remotePatterns,
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
  },
};

export default nextConfig;
