import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { CACHE_KEYS } from "@/lib/api-helpers";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function RedirectPage({ params }: PageProps) {
  const { code } = await params;

  // Check cache first
  const cacheKey = CACHE_KEYS.link(code);
  const cached = await redis.get(cacheKey);
  
  let link;
  if (cached && typeof cached === "string") {
    link = JSON.parse(cached) as {
      shortCode: string;
      longUrl: string;
      totalClicks: number;
      lastClickedAt: Date | null;
      createdAt: Date;
    };
  } else {
    // Fetch from database
    link = await prisma.link.findUnique({
      where: { shortCode: code },
    });

    if (!link) {
      notFound();
    }

    // Cache for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(link));
  }

  // Increment click count and update last clicked timestamp
  const updatedLink = await prisma.link.update({
    where: { shortCode: code },
    data: {
      totalClicks: { increment: 1 },
      lastClickedAt: new Date(),
    },
  });

  // Update cache with new click count
  await redis.setex(cacheKey, 3600, JSON.stringify(updatedLink));
  // Invalidate list cache
  await redis.del(CACHE_KEYS.linksList());

  // Perform 302 redirect
  redirect(link.longUrl);
}
