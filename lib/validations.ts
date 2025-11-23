import { z } from "zod";

// Shortcode validation: 6-8 alphanumeric characters
const shortcodeRegex = /^[A-Za-z0-9]{6,8}$/;

export const createLinkSchema = z.object({
  longUrl: z.string().url("Invalid URL format"),
  shortCode: z
    .union([
      z.string().regex(shortcodeRegex, "Shortcode must be 6-8 alphanumeric characters"),
      z.literal(""),
    ])
    .optional(),
});

export const getLinksQuerySchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["shortCode", "longUrl", "totalClicks", "lastClickedAt", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 100)),
  minClicks: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
  maxClicks: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
  createdAfter: z.string().optional(),
  createdBefore: z.string().optional(),
  lastClickedAfter: z.string().optional(),
  lastClickedBefore: z.string().optional(),
  hasClicks: z.string().optional().transform((val) => {
    if (val === "true") return true;
    if (val === "false") return false;
    return undefined;
  }),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type GetLinksQuery = z.infer<typeof getLinksQuerySchema>;

