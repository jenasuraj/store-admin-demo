"use client";

import { useState } from "react";
import { Calendar, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateFilterOption, useDateFilter } from "@/customHooks/useDateFilter";

interface DateFilterDialogProps {
  onApplyFilter: (fromDate: string, toDate: string) => void;
}

export function DateFilterDialog({ onApplyFilter }: DateFilterDialogProps) {
  const [open, setOpen] = useState(false);
  const {
    selectedOption,
    setSelectedOption,
    customDateRange,
    setCustomDateRange,
    getDateRange,
  } = useDateFilter();

  const dateOptions: DateFilterOption[] = [
    "This week",
    "Yesterday",
    "This month",
    "Custom",
  ];

  const handleApply = () => {
    const { fromDate, toDate } = getDateRange();

    if (selectedOption === "Custom" && (!fromDate || !toDate)) {
      alert("Please select both from and to dates for custom range");
      return;
    }

    onApplyFilter(fromDate, toDate);
    setOpen(false);
  };

  const handleCustomDateChange = (
    field: "fromDate" | "toDate",
    value: string
  ) => {
    setCustomDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            >
              <Calendar className="h-6 w-6" />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Date Filter
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date-option">Select Date Range</Label>
                <Select
                  value={selectedOption}
                  onValueChange={(value: DateFilterOption) =>
                    setSelectedOption(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedOption === "Custom" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="from-date">From Date</Label>
                    <Input
                      id="from-date"
                      type="date"
                      value={customDateRange.fromDate}
                      onChange={(e) =>
                        handleCustomDateChange("fromDate", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="to-date">To Date</Label>
                    <Input
                      id="to-date"
                      type="date"
                      value={customDateRange.toDate}
                      onChange={(e) =>
                        handleCustomDateChange("toDate", e.target.value)
                      }
                      min={customDateRange.fromDate}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleApply} className="flex-1">
                  Apply Filter
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
