"use client";

import { useLinkStats } from "@/hooks/useLinks";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ExternalLink, Copy, Calendar, MousePointerClick } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { formatDate, copyToClipboard } from "@/lib/formatters";

export default function StatsPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [copied, setCopied] = useState(false);

  const { data: link, isLoading, error } = useLinkStats(code);

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stats...</p>
        </div>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Link Not Found</h1>
          <p className="text-gray-600 mb-6">The link you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Link Statistics</h1>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Short Code */}
            <div>
              <label className="text-sm font-medium text-gray-500 mb-1 block">
                Short Code
              </label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-blue-600">
                  {link.shortCode}
                </span>
                <button
                  onClick={() => handleCopy(link.shortUrl)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy short URL"
                >
                  <Copy className="h-4 w-4" />
                </button>
                {copied && (
                  <span className="text-xs text-green-600">Copied!</span>
                )}
              </div>
            </div>

            {/* Total Clicks */}
            <div>
              <label className="text-sm font-medium text-gray-500 mb-1 block">
                Total Clicks
              </label>
              <div className="flex items-center gap-2">
                <MousePointerClick className="h-5 w-5 text-blue-600" />
                <span className="text-lg font-semibold text-gray-900">
                  {link.totalClicks}
                </span>
              </div>
            </div>

            {/* Long URL */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500 mb-1 block">
                Target URL
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900 break-all">
                  {link.longUrl}
                </span>
                <a
                  href={link.longUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Last Clicked */}
            <div>
              <label className="text-sm font-medium text-gray-500 mb-1 block">
                Last Clicked
              </label>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-900">
                  {formatDate(link.lastClickedAt)}
                </span>
              </div>
            </div>

            {/* Created At */}
            <div>
              <label className="text-sm font-medium text-gray-500 mb-1 block">
                Created At
              </label>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-900">
                  {formatDate(link.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Short URL Card */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <label className="text-sm font-medium text-blue-900 mb-2 block">
            Short URL
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white px-4 py-2 rounded border border-blue-200 text-blue-900">
              {link.shortUrl}
            </code>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleCopy(link.shortUrl)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
