// Get base URL 
export const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

export interface LinkResponse {
  shortCode: string;
  longUrl: string;
  shortUrl: string;
  totalClicks: number;
  lastClickedAt: Date | string | null;
  createdAt: Date | string;
}

//  Maps a database link to API response format
export function mapLinkToResponse(link: {
  shortCode: string;
  longUrl: string;
  totalClicks: number;
  lastClickedAt: Date | null;
  createdAt: Date;
}): LinkResponse {
  return {
    shortCode: link.shortCode,
    longUrl: link.longUrl,
    shortUrl: `${BASE_URL}/${link.shortCode}`,
    totalClicks: link.totalClicks,
    lastClickedAt: link.lastClickedAt,
    createdAt: link.createdAt,
  };
}

// Cache keys for redis cache
export const CACHE_KEYS = {
  link: (code: string) => `link:${code}`,
  linksList: (params?: string) => `links:list${params ? `:${params}` : ""}`,
} as const;
