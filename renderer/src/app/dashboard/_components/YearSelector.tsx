// YEAR SELECTOR
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/YearSelector.tsx

"use client";

import React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

type YearSelectorProps = {
  selectedYear: string;
  onYearChange: (year: string) => void;
  minYear?: number;
  maxYear?: number;
  className?: string;
};

export function YearSelector({
  selectedYear,
  onYearChange,
  minYear = 1970, // default earliest year
  maxYear = new Date().getFullYear() + 10, // default is about 10 years from now
  className,
}: YearSelectorProps) {
  const years: string[] = React.useMemo(() => {
    const arr = [];
    for (let y = minYear; y <= maxYear; y++) {
      arr.push(String(y));
    }
    return arr;
  }, [minYear, maxYear]);

  // Only use selectedYear if it exists in our years array
  if (!years.includes(selectedYear)) {
    return null;
  }

  return (
    <Select value={selectedYear} onValueChange={onYearChange}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>

      {/* The only difference: set a max-height and overflow to limit visible items to ~5 */}
      <SelectContent className="max-h-56 overflow-y-auto">
        {years.map((year) => (
          <SelectItem key={year} value={year}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}