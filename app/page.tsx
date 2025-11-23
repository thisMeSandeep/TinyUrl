"use client";

import { useState } from "react";
import { useLinks, useDeleteLink } from "@/hooks/useLinks";
import { CreateLinkForm } from "@/components/CreateLinkForm";
import { LinkTable } from "@/components/LinkTable";
import { SearchBar } from "@/components/SearchBar";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data, isLoading, error } = useLinks({
    search: search || undefined,
    sortBy: sortBy || undefined,
    sortOrder,
    page: 1,
    limit: 100,
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
      } catch (error) {
        // Error handled by react-query
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            TinyLink Dashboard
          </h1>
          <p className="text-gray-600">
            Create and manage your short links
          </p>
        </div>

        {/* Create Link Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Create New Link
            </h2>
          </div>
          <CreateLinkForm />
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <SearchBar onSearch={setSearch} />
        </div>

        {/* Links Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              All Links ({data?.total || 0})
            </h2>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">
                <p>Failed to load links. Please try again.</p>
              </div>
            ) : (
              <LinkTable
                links={data?.links || []}
                onDelete={handleDelete}
                isLoading={deleteLink.isPending}
                onSort={handleSort}
                sortBy={sortBy}
                sortOrder={sortOrder}
              />
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
