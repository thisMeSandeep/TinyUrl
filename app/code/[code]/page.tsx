"use client";

import { useLinkStats } from "@/hooks/useLinks";
import { ArrowLeft, ExternalLink, Copy, Calendar, MousePointerClick, Loader2 } from "lucide-react";
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading stats...</p>
        </div>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Link Not Found</h1>
          <p className="text-gray-600 mb-6">The link you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <button className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors mb-6 font-medium">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          </Link>
          <h1 className="text-4xl font-bold text-black">Link Statistics</h1>
        </div>

        {/* Stats Card */}
        <div className="border border-gray-300 rounded-xl p-6 mb-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Short Code */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">
                Short Code
              </label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-black">
                  {link.shortCode}
                </span>
                <button
                  onClick={() => handleCopy(link.shortUrl)}
                  className="text-gray-400 hover:text-black transition-colors"
                  title="Copy short URL"
                >
                  <Copy className="h-4 w-4" />
                </button>
                {copied && (
                  <span className="text-xs text-green-600 font-medium">Copied!</span>
                )}
              </div>
            </div>

            {/* Total Clicks */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">
                Total Clicks
              </label>
              <div className="flex items-center gap-2">
                <MousePointerClick className="h-5 w-5 text-gray-600" />
                <span className="text-lg font-semibold text-black">
                  {link.totalClicks}
                </span>
              </div>
            </div>

            {/* Long URL */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-600 mb-2 block">
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
                  className="text-gray-400 hover:text-black transition-colors shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Last Clicked */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">
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
              <label className="text-sm font-medium text-gray-600 mb-2 block">
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
        <div className="border border-gray-300 rounded-xl p-6 bg-gray-50">
          <label className="text-sm font-medium text-black mb-3 block">
            Short URL
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <code className="flex-1 bg-white px-4 py-2 rounded-lg border border-gray-300 text-black font-mono text-sm break-all">
              {link.shortUrl}
            </code>
            <button
              onClick={() => handleCopy(link.shortUrl)}
              className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Copy className="h-4 w-4" />
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}