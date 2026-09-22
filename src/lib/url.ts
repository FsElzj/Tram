export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://tiktok.looma.studio";

export function shortUrl(slug: string) {
  return `${BASE_URL}/videos/${slug}`;
}
