import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { mapLinkToResponse, CACHE_KEYS } from "@/lib/api-helpers";

//Get stats for a  code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const cacheKey = CACHE_KEYS.link(code);

    // Try to get from cache
    const cached = await redis.get(cacheKey);
    if (cached && typeof cached === "string") {
      const link = JSON.parse(cached) as {
        shortCode: string;
        longUrl: string;
        totalClicks: number;
        lastClickedAt: Date | null;
        createdAt: Date;
      };
      return NextResponse.json(mapLinkToResponse(link));
    }

    // Fetch from database
    const link = await prisma.link.findUnique({
      where: { shortCode: code },
    });

    if (!link) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      );
    }

    // Cache for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(link));

    return NextResponse.json(mapLinkToResponse(link));
  } catch (error) {
    console.error("Error fetching link stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a link
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Delete from database 
    await prisma.link.delete({
      where: { shortCode: code },
    });

    // Remove from cache
    await redis.del(CACHE_KEYS.link(code));
    await redis.del(CACHE_KEYS.linksList()); // Invalidate list cache

    return NextResponse.json(
      { message: "Link deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    // Handle Prisma not found error
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      );
    }

    console.error("Error deleting link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

