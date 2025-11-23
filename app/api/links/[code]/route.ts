import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

//Get stats for a  code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const cacheKey = `link:${code}`;

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
      const baseUrl = process.env.BASE_URL || "http://localhost:3000";
      return NextResponse.json({
        shortCode: link.shortCode,
        longUrl: link.longUrl,
        shortUrl: `${baseUrl}/${link.shortCode}`,
        totalClicks: link.totalClicks,
        lastClickedAt: link.lastClickedAt,
        createdAt: link.createdAt,
      });
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

    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    return NextResponse.json({
      shortCode: link.shortCode,
      longUrl: link.longUrl,
      shortUrl: `${baseUrl}/${link.shortCode}`,
      totalClicks: link.totalClicks,
      lastClickedAt: link.lastClickedAt,
      createdAt: link.createdAt,
    });
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

    // Check if link exists
    const link = await prisma.link.findUnique({
      where: { shortCode: code },
    });

    if (!link) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      );
    }

    // Delete from database
    await prisma.link.delete({
      where: { shortCode: code },
    });

    // Remove from cache
    await redis.del(`link:${code}`);
    await redis.del("links:list"); // Invalidate list cache

    return NextResponse.json(
      { message: "Link deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

