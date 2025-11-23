import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Link {
  shortCode: string;
  longUrl: string;
  shortUrl: string;
  totalClicks: number;
  lastClickedAt: string | null;
  createdAt: string;
}

export interface LinksResponse {
  links: Link[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterValues {
  minClicks?: number;
  maxClicks?: number;
  createdAfter?: string;
  createdBefore?: string;
  lastClickedAfter?: string;
  lastClickedBefore?: string;
  hasClicks?: boolean;
}

interface GetLinksParams {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  filters?: FilterValues;
}

// GET all links
export function useLinks(params?: GetLinksParams) {
  return useQuery<LinksResponse>({
    queryKey: ["links", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set("search", params.search);
      if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
      if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);
      if (params?.page) searchParams.set("page", params.page.toString());
      if (params?.limit) searchParams.set("limit", params.limit.toString());

      // Add filter params
      if (params?.filters) {
        const filters = params.filters;
        if (filters.minClicks !== undefined) searchParams.set("minClicks", filters.minClicks.toString());
        if (filters.maxClicks !== undefined) searchParams.set("maxClicks", filters.maxClicks.toString());
        if (filters.createdAfter) searchParams.set("createdAfter", filters.createdAfter);
        if (filters.createdBefore) searchParams.set("createdBefore", filters.createdBefore);
        if (filters.lastClickedAfter) searchParams.set("lastClickedAfter", filters.lastClickedAfter);
        if (filters.lastClickedBefore) searchParams.set("lastClickedBefore", filters.lastClickedBefore);
        if (filters.hasClicks !== undefined) searchParams.set("hasClicks", filters.hasClicks.toString());
      }

      const res = await fetch(`/api/links?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch links");
      return res.json();
    },
  });
}

// GET single link stats
export function useLinkStats(code: string) {
  return useQuery<Link>({
    queryKey: ["link", code],
    queryFn: async () => {
      const res = await fetch(`/api/links/${code}`);
      if (!res.ok) throw new Error("Failed to fetch link stats");
      return res.json();
    },
    enabled: !!code,
  });
}

// CREATE link
export function useCreateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { longUrl: string; shortCode?: string }) => {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create link");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });
}

// DELETE link
export function useDeleteLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch(`/api/links/${code}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete link");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      queryClient.invalidateQueries({ queryKey: ["link"] });
    },
  });
}

