"use client";

import { useState } from "react";
import { useLinks, useDeleteLink } from "@/hooks/useLinks";
import { CreateLinkForm } from "@/components/CreateLinkForm";
import { LinkTable } from "@/components/LinkTable";
import { SearchBar } from "@/components/SearchBar";
import { Loader2, Link2 } from "lucide-react";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "totalClicks">("createdAt");

  const { data, isLoading, error } = useLinks({
    search: search || undefined,
    sortBy,
    page: 1,
    limit: 100,
  });

  const deleteLink = useDeleteLink();

  const handleDelete = async (code: string) => {
    if (confirm(`Are you sure you want to delete link "${code}"?`)) {
      await deleteLink.mutateAsync(code);
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


        {/* Search and Sort */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 w-full">
            <SearchBar onSearch={setSearch} />
          </div>

          <div className="sm:w-48 w-full flex items-center">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "createdAt" | "totalClicks")
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-0 text-sm"
            >
              <option value="createdAt">Newest First</option>
              <option value="totalClicks">Most Clicks</option>
            </select>
          </div>
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
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}