import ShadcnTable from "@/components/shadcnTable/ShadcnTable";
import { columns } from "./column";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { TransactionResponse } from "./type";

function TransactionHistory() {
  const [transactions, setTransactions] = useState<TransactionResponse>();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2025, 0, 20),
    to: addDays(new Date(2025, 0, 20), 20),
  });

  // Function to fetch transaction history
  const fetchTransactionHistory = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin${location.search}`);
      if (res.status === 200) {
        setTransactions(res.data);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleDate = () => {
    if (date?.from && date?.to) {
      // Get the current query params
      const params = new URLSearchParams(searchParams);

      // Set the new date parameters
      params.set("fromDate", format(date.from, "yyyy-MM-dd"));
      params.set("toDate", format(date.to, "yyyy-MM-dd"));

      // Navigate with updated query params
      navigate(`?${params.toString()}`);
    }
  };

  const clearDate = () => {
    // Get the current query params
    const params = new URLSearchParams(searchParams);

    // Remove the date parameters
    params.delete("fromDate");
    params.delete("toDate");

    // Navigate with updated query params
    navigate(`?${params.toString()}`);
  };

  // Fetch data whenever the URL parameters change
  useEffect(() => {
    fetchTransactionHistory();
  }, [location.search]);

  return (
    <ShadcnTable
      loading={false}
      error={false}
      columns={columns}
      data={transactions && transactions.content ? transactions.content : []}
      totalPages={transactions && transactions.totalPages}
      totalelement={transactions && transactions.totalElements}
      currentPage={1}
      api={true}
      hideGlobalSearch={false}
      title="Inventory History"
    >
      <div className="flex items-center justify-between gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        <Button type="button" size="sm" onClick={() => handleDate()}>
          Submit
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => clearDate()}
          variant="outline"
        >
          Reset
        </Button>
      </div>
    </ShadcnTable>
  );
}

export default TransactionHistory;
