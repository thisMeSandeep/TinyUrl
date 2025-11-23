import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { createLinkSchema, getLinksQuerySchema } from "@/lib/validations";
import { generateShortCode } from "@/lib/utils";
import { mapLinkToResponse, CACHE_KEYS } from "@/lib/api-helpers";

// Create a new short link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createLinkSchema.parse(body);

    // Generate shortcode if not provided
    const shortCode = validated.shortCode || generateShortCode(6);

    // Check if shortcode already exists
    const existing = await prisma.link.findUnique({
      where: { shortCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Shortcode already exists" },
        { status: 409 }
      );
    }

    // Create the link
    const link = await prisma.link.create({
      data: {
        shortCode,
        longUrl: validated.longUrl,
        totalClicks: 0,
      },
    });

    // Cache the link in Redis (expire after 1 hour)
    const cacheKey = CACHE_KEYS.link(shortCode);
    await redis.setex(cacheKey, 3600, JSON.stringify(link));

    // Invalidate the links list cache
    await redis.del(CACHE_KEYS.linksList());

    return NextResponse.json(mapLinkToResponse(link), { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    // Handle Prisma unique constraint error
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Shortcode already exists" },
        { status: 409 }
      );
    }

    console.error("Error creating link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

//Get all links with filtering and sorting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = {
      search: searchParams.get("search") || undefined,
      sortBy: searchParams.get("sortBy") || undefined,
      sortOrder: searchParams.get("sortOrder") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      minClicks: searchParams.get("minClicks") || undefined,
      maxClicks: searchParams.get("maxClicks") || undefined,
      createdAfter: searchParams.get("createdAfter") || undefined,
      createdBefore: searchParams.get("createdBefore") || undefined,
      lastClickedAfter: searchParams.get("lastClickedAfter") || undefined,
      lastClickedBefore: searchParams.get("lastClickedBefore") || undefined,
      hasClicks: searchParams.get("hasClicks") || undefined,
    };

    const validated = getLinksQuerySchema.parse(query);

    // Create cache key based on query params
    const cacheKey = CACHE_KEYS.linksList(JSON.stringify(validated));
    
    // Try to get from cache
    const cached = await redis.get(cacheKey);
    if (cached && typeof cached === "string") {
      return NextResponse.json(JSON.parse(cached));
    }

    // Build where clause with all filters
    const where: any = {};

    // Search filter
    if (validated.search) {
      where.OR = [
        { shortCode: { contains: validated.search, mode: "insensitive" as const } },
        { longUrl: { contains: validated.search, mode: "insensitive" as const } },
      ];
    }

    // Click count filters
    const hasClickFilters = validated.minClicks !== undefined || 
                           validated.maxClicks !== undefined || 
                           validated.hasClicks !== undefined;
    
    if (hasClickFilters) {
      where.totalClicks = where.totalClicks || {};
      
      if (validated.hasClicks !== undefined) {
        if (validated.hasClicks) {
          where.totalClicks.gt = 0;
        } else {
          where.totalClicks.equals = 0;
        }
      } else {
        // Only apply min/max if hasClicks is not set
        if (validated.minClicks !== undefined) {
          where.totalClicks.gte = validated.minClicks;
        }
        if (validated.maxClicks !== undefined) {
          where.totalClicks.lte = validated.maxClicks;
        }
      }
    }

    // Created date filters
    if (validated.createdAfter || validated.createdBefore) {
      where.createdAt = {};
      if (validated.createdAfter) {
        where.createdAt.gte = new Date(validated.createdAfter);
      }
      if (validated.createdBefore) {
        where.createdAt.lte = new Date(validated.createdBefore);
      }
    }

    // Last clicked date filters
    if (validated.lastClickedAfter || validated.lastClickedBefore) {
      where.lastClickedAt = {};
      if (validated.lastClickedAfter) {
        where.lastClickedAt.gte = new Date(validated.lastClickedAfter);
      }
      if (validated.lastClickedBefore) {
        where.lastClickedAt.lte = new Date(validated.lastClickedBefore);
      }
    }

    // Build orderBy clause
    const orderBy: Record<string, "asc" | "desc"> = {};
    if (validated.sortBy) {
      orderBy[validated.sortBy] = validated.sortOrder || "desc";
    } else {
      orderBy.createdAt = "desc"; // Default sort
    }

    // Fetch links
    const [links, total] = await Promise.all([
      prisma.link.findMany({
        where,
        orderBy,
        skip: (validated.page - 1) * validated.limit,
        take: validated.limit,
      }),
      prisma.link.count({ where }),
    ]);

    const result = {
      links: links.map(mapLinkToResponse),
      total,
      page: validated.page,
      limit: validated.limit,
      totalPages: Math.ceil(total / validated.limit),
    };

    // Cache for 30 seconds
    await redis.setex(cacheKey, 30, JSON.stringify(result));

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error fetching links:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

