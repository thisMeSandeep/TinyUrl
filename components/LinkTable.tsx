import { Link } from "@/hooks/useLinks";
import { Button } from "./ui/Button";
import { Copy, Trash2, ExternalLink, ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { formatDate, truncateUrl, copyToClipboard } from "@/lib/formatters";

interface LinkTableProps {
  links: Link[];
  onDelete: (code: string) => void;
  isLoading?: boolean;
  onSort?: (field: string) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function LinkTable({
  links,
  onDelete,
  isLoading = false,
  onSort,
  sortBy,
  sortOrder,
}: LinkTableProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = async (text: string, code: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  if (links.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No links found</p>
        <p className="text-sm mt-2">Create your first short link above</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort?.("shortCode")}
            >
              <div className="flex items-center gap-2">
                Short Code
                {sortBy === "shortCode" && (
                  <ArrowUpDown className="h-4 w-4" />
                )}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Target URL
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort?.("lastClickedAt")}
            >
              <div className="flex items-center gap-2">
                Last Clicked
                {sortBy === "lastClickedAt" && (
                  <ArrowUpDown className="h-4 w-4" />
                )}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {links.map((link) => (
            <tr key={link.shortCode} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-600">
                    {link.shortCode}
                  </span>
                  <button
                    onClick={() => handleCopy(link.shortUrl, link.shortCode)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy short URL"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  {copiedCode === link.shortCode && (
                    <span className="text-xs text-green-600">Copied!</span>
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
                    className="text-blue-600 hover:text-blue-800"
                    title={link.longUrl}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {link.totalClicks}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(link.lastClickedAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center gap-2">
                  <a
                    href={`/code/${link.shortCode}`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View Stats
                  </a>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(link.shortCode)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

