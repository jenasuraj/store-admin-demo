import { BsThreeDotsVertical } from "react-icons/bs";
// import { Input } from "@/components/ui/input";
// import { ColumnInstance } from 'react-table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";



const ColumnFiltering = ({ column }) => {
  const { filterValue, setFilter } = column;

  return (
    <>
      <Popover>
        <PopoverTrigger>
          <BsThreeDotsVertical className="transition-all duration-75 ease-in p-[2px] rounded-sm text-[1rem] hover:bg-white" />
        </PopoverTrigger>
        <PopoverContent className="p-0 w-max">
          <input
            placeholder="Search Here..."
            type="text"
            value={filterValue || ""}
            onChange={(e) => setFilter(e.target.value)}
            // className="p-1 text-[0.8rem]"
            className="flex rounded-sm border border-input bg-transparent px-2 py-1 text-[0.8rem] shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 h-7 w-[150px] lg:w-[180px]"
          />
        </PopoverContent>
      </Popover>
    </>
  );
};

export default ColumnFiltering;
