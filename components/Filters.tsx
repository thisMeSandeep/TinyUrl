"use client";

import { Input } from "./ui/Input";
import { Filter, X } from "lucide-react";
import { useState } from "react";

interface FiltersProps {
  onFilterChange: (filters: FilterValues) => void;
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

export function Filters({ onFilterChange }: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({});

  const handleFilterChange = (key: keyof FilterValues, value: string | number | boolean | undefined) => {
    const newFilters = {
      ...filters,
      [key]: value === "" || value === undefined ? undefined : value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: FilterValues = {};
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== "");

  return (
    <div className="border border-gray-300 rounded-xl bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-black" />
          <span className="font-semibold text-black">Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-black text-white text-xs rounded-full font-medium">
              Active
            </span>
          )}
        </div>
        <span className="text-black font-medium">{isOpen ? "−" : "+"}</span>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-gray-300 space-y-4">
          {/* Click Count Range */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Min Clicks"
              placeholder="0"
              value={filters.minClicks?.toString() || ""}
              onChange={(e) =>
                handleFilterChange("minClicks", e.target.value ? parseInt(e.target.value, 10) : undefined)
              }
            />
            <Input
              type="number"
              label="Max Clicks"
              placeholder="1000"
              value={filters.maxClicks?.toString() || ""}
              onChange={(e) =>
                handleFilterChange("maxClicks", e.target.value ? parseInt(e.target.value, 10) : undefined)
              }
            />
          </div>

          {/* Created Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Created After"
              value={filters.createdAfter || ""}
              onChange={(e) => handleFilterChange("createdAfter", e.target.value)}
            />
            <Input
              type="date"
              label="Created Before"
              value={filters.createdBefore || ""}
              onChange={(e) => handleFilterChange("createdBefore", e.target.value)}
            />
          </div>

          {/* Last Clicked Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Last Clicked After"
              value={filters.lastClickedAfter || ""}
              onChange={(e) => handleFilterChange("lastClickedAfter", e.target.value)}
            />
            <Input
              type="date"
              label="Last Clicked Before"
              value={filters.lastClickedBefore || ""}
              onChange={(e) => handleFilterChange("lastClickedBefore", e.target.value)}
            />
          </div>

          {/* Has Clicks Filter */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Click Status
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-0 text-sm"
              value={filters.hasClicks === undefined ? "" : filters.hasClicks ? "yes" : "no"}
              onChange={(e) => {
                const value = e.target.value;
                handleFilterChange(
                  "hasClicks",
                  value === "" ? undefined : value === "yes"
                );
              }}
            >
              <option value="">All</option>
              <option value="yes">Has Clicks</option>
              <option value="no">No Clicks</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

