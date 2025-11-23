"use client";

import { useState } from "react";
import { useLinks, useDeleteLink, type FilterValues } from "@/hooks/useLinks";
import { CreateLinkForm } from "@/components/CreateLinkForm";
import { LinkTable } from "@/components/LinkTable";
import { SearchBar } from "@/components/SearchBar";
import { Filters } from "@/components/Filters";
import { Loader2, Link2 } from "lucide-react";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<FilterValues>({});

  const { data, isLoading, error } = useLinks({
    search: search || undefined,
    sortBy: sortBy || undefined,
    sortOrder,
    page: 1,
    limit: 100,
    filters: Object.keys(filters).length > 0 ? filters : undefined,
  });

  const deleteLink = useDeleteLink();

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleDelete = async (code: string) => {
    if (confirm(`Are you sure you want to delete link "${code}"?`)) {
      try {
        await deleteLink.mutateAsync(code);
      } catch {
        // Error handled by react-query
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gray-50 rounded-lg border border-gray-300">
              <Link2 className="h-6 w-6 text-black" />
            </div>
            <h1 className="text-4xl font-bold text-black">
              TinyLink
            </h1>
          </div>
          <p className="text-gray-600 text-base">
            Create and manage your short links with ease
          </p>
        </div>

        {/* Create Link Section */}
        <div className="mb-8 border border-gray-300 rounded-xl p-6 bg-gray-50">
          <h2 className="text-lg font-semibold text-black mb-6">
            Create New Link
          </h2>
          <CreateLinkForm />
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <SearchBar onSearch={setSearch} />
          <Filters onFilterChange={setFilters} />
        </div>

        {/* Links Table */}
        <div className="border border-gray-300 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-300 bg-gray-50">
            <h2 className="text-lg font-semibold text-black">
              Links <span className="text-gray-600 font-normal">({data?.total || 0})</span>
            </h2>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Failed to load links. Please try again.</p>
              </div>
            ) : (
              <LinkTable
                links={data?.links || []}
                onDelete={handleDelete}
                isLoading={deleteLink.isPending}
                onSort={handleSort}
                sortBy={sortBy}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}