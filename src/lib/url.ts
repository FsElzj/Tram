export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://tram-gamma.vercel.app";

export function shortUrl(slug: string) {
  return `${BASE_URL}/videos/${slug}`;
}
