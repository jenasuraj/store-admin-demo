import { useEffect, useState } from "react";
import ProductTable from "./InventoryTable";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Pagination } from "../Products/Components/pagination";
import {
  fetchInventoryAsync,
  selectinventoryEntity,
  selectinventoryError,
  selectinventoryLoading,
} from "@/app/inventorySlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

function InventoryList() {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const params = useLocation().search;
  const sort = params.split("?")[1];
  const [searchKey, setSearchKey] = useState("");
  const navigate = useNavigate();
  const inventoryProduct = useAppSelector(selectinventoryEntity);

  const loading = useAppSelector(selectinventoryLoading);
  const error = useAppSelector(selectinventoryError);
  const dipatch = useAppDispatch();

  useEffect(() => {
    dipatch(
      fetchInventoryAsync(
        sort
          ? `${sort}&size=${pageSize}&page=${currentPage}`
          : `size=${pageSize}&page=${currentPage}`
      )
    );
    // setTotalPages(inventoryProduct?.totalPages || 1);
  }, [currentPage, pageSize, sort]);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      searchKey && navigate(`?keyword=${searchKey}`);
      !searchKey && navigate(`?`);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchKey]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold flex-col justify-center items-center">
              <span>Inventory</span>
            </h1>
            <span>Here is List of Inventory Stock</span>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Input
                id={searchKey}
                className="peer pe-9 ps-9"
                placeholder="Search..."
                type="search"
                onChange={(e) =>
                  setSearchKey((e.target as HTMLInputElement).value)
                }
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                <Search size={16} strokeWidth={2} />
              </div>
              <button
                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Submit search"
                type="submit"
              ></button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ProductTable
            products={inventoryProduct?.inventory || []}
            pageSize={pageSize}
            currentPage={currentPage}
          />
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={inventoryProduct?.totalPages || 1}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </CardContent>
    </Card>
  );
}

export default InventoryList;
