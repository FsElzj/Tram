export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://tiktok.lidialabs.com";

export function shortUrl(slug: string) {
  return `${BASE_URL}/videos/${slug}`;
}
