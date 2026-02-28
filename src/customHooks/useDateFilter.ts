;

import { useState } from "react";

export interface DateRange {
  fromDate: string;
  toDate: string;
}

export type DateFilterOption =
  | "This week"
  | "Yesterday"
  | "This month"
  | "Custom";

export function useDateFilter() {
  const [selectedOption, setSelectedOption] =
    useState<DateFilterOption>("This week");
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    fromDate: "",
    toDate: "",
  });

  const getDateRange = (): DateRange => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    switch (selectedOption) {
      case "Yesterday": {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return {
          fromDate: formatDate(yesterday),
          toDate: formatDate(yesterday),
        };
      }

      case "This week": {
        const startOfWeek = new Date(today);
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        startOfWeek.setDate(diff);

        return {
          fromDate: formatDate(startOfWeek),
          toDate: formatDate(today),
        };
      }

      case "This month": {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          fromDate: formatDate(startOfMonth),
          toDate: formatDate(today),
        };
      }

      case "Custom":
        return customDateRange;

      default:
        return {
          fromDate: formatDate(today),
          toDate: formatDate(today),
        };
    }
  };

  return {
    selectedOption,
    setSelectedOption,
    customDateRange,
    setCustomDateRange,
    getDateRange,
  };
}
