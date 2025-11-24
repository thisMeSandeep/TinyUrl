import { z } from "zod";

// Shortcode validation
const shortcodeRegex = /^[A-Za-z0-9]{6,8}$/;

export const createLinkSchema = z.object({
  longUrl: z.url("Invalid URL format"),
  shortCode: z
    .union([
      z.string().regex(shortcodeRegex, "Shortcode must be 6-8 alphanumeric characters"),
      z.literal(""),
    ])
    .optional(),
});

export const getLinksQuerySchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "totalClicks"]).optional(),
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 100)),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type GetLinksQuery = z.infer<typeof getLinksQuerySchema>;

