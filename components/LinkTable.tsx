import type { Link } from "@/hooks/useLinks";
import NextLink from "next/link";
import { Copy, Trash2, ExternalLink, ArrowUpDown } from "lucide-react";
import { useState, useEffect } from "react";
import { formatDate, truncateUrl, copyToClipboard } from "@/lib/formatters";

interface LinkTableProps {
  links: Link[];
  onDelete: (code: string) => void;
  isLoading?: boolean;
  onSort?: (field: string) => void;
  sortBy?: string;
}

export function LinkTable({
  links,
  onDelete,
  isLoading = false,
  onSort,
  sortBy,
}: LinkTableProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = async (text: string, code: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedCode(code);
    }
  };

  // Clear copied state after 2 seconds
  useEffect(() => {
    if (copiedCode) {
      const timer = setTimeout(() => setCopiedCode(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedCode]);

  if (links.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        <p className="text-base font-medium">No links found</p>
        <p className="text-sm mt-2">Create your first short link above</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onSort?.("shortCode")}
            >
              <div className="flex items-center gap-2">
                Short Code
                {sortBy === "shortCode" && (
                  <ArrowUpDown className="h-4 w-4" />
                )}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
              Target URL
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onSort?.("totalClicks")}
            >
              <div className="flex items-center gap-2">
                Total Clicks
                {sortBy === "totalClicks" && (
                  <ArrowUpDown className="h-4 w-4" />
                )}
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onSort?.("lastClickedAt")}
            >
              <div className="flex items-center gap-2">
                Last Clicked
                {sortBy === "lastClickedAt" && (
                  <ArrowUpDown className="h-4 w-4" />
                )}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-300">
          {links.map((link) => (
            <tr key={link.shortCode} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-black">
                    {link.shortCode}
                  </span>
                  <button
                    onClick={() => handleCopy(link.shortUrl, link.shortCode)}
                    className="text-gray-400 hover:text-black transition-colors"
                    title="Copy short URL"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  {copiedCode === link.shortCode && (
                    <span className="text-xs text-green-600 font-medium">Copied!</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-900 max-w-md truncate">
                    {truncateUrl(link.longUrl)}
                  </span>
                  <a
                    href={link.longUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-black transition-colors"
                    title={link.longUrl}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {link.totalClicks}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {formatDate(link.lastClickedAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center gap-3">
                  <NextLink
                    href={`/code/${link.shortCode}`}
                    className="text-black hover:text-gray-600 font-medium text-sm transition-colors"
                  >
                    View Stats
                  </NextLink>
                  <button
                    onClick={() => onDelete(link.shortCode)}
                    disabled={isLoading}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete link"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}