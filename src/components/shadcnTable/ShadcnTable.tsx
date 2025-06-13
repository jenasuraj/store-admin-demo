import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  type Column,
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  type SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import {
  ArrowLeftToLineIcon,
  ArrowRightToLine,
  ChevronDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Loader,
  PinOff,
  Search,
} from "lucide-react";
import { type CSSProperties, Fragment, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { MixerVerticalIcon } from "@radix-ui/react-icons";
import { BsThreeDots } from "react-icons/bs";

import TableSkeleton from "./TableSkeleton";
import { FaFileExcel } from "react-icons/fa";
import { exportToExcel } from "./xlsx";
import { TableError } from "./TableError";
import { TableNoData } from "./TableNoData";

type CustomColumnProperties<T> = {
  expandedContent?: (row: Row<T>) => React.ReactNode;
};
type CustomColumnDef<T> = ColumnDef<T> & CustomColumnProperties<T>;

const getPinningStyles = (column: any): CSSProperties => {
  const isPinned = column.getIsPinned();
  return {
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    position: isPinned ? "sticky" : "relative",
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  };
};

type ComponentProps<T extends object = any> = {
  data: T[];
  columns: CustomColumnDef<any>[];
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  totalelement?: number;
  api?: boolean;
  title: string;
  children?: React.ReactNode;
  hideGlobalSearch?: boolean;
  loading: boolean;
  error: boolean | string | Error;
  onRowSelectionChange?: (selectedData: T[]) => void;
};

type ColumnMetaType = {
  filterVariant?: "range" | "select" | "search";
  expandedContent?: (row: any) => React.ReactNode;
};

const ShadcnTable: React.FC<ComponentProps> = ({
  data,
  columns,
  currentPage,
  totalPages,
  totalelement,
  pageSize = 10,
  api,
  title,
  children,
  hideGlobalSearch,
  onRowSelectionChange,
  loading,
  error,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isChildOpen, setIsChildOpen] = useState(false);
  const [loader, setLoader] = useState(true);
  const [isdataLoaded, setisdataLoaded] = useState(false);
  const navigate = useNavigate();
  const paramSort = useLocation().search;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [rowSelection, setRowSelection] = useState({});
  const params = new URLSearchParams(searchParams);
  const table = useReactTable({
    data,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getRowCanExpand: (row) => Boolean(row.original.note),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    // In your ShadcnTable component
    onRowSelectionChange: (updatedRowSelection) => {
      setRowSelection(updatedRowSelection);

      if (onRowSelectionChange) {
        // Use setTimeout to ensure the table state is updated
        setTimeout(() => {
          // Get all selected rows directly from the table and map to their data
          const selectedItems = table
            .getSelectedRowModel()
            .rows.map((row) => row.original);

          // Call the callback with just the selected data
          onRowSelectionChange(selectedItems);
        }, 0);
      }
    },
    getExpandedRowModel: getExpandedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    enableSortingRemoval: false,
    initialState: {
      pagination: {
        pageSize:
          api && Number(params.get("size")) ? Number(params.get("size")) : 10,
      },
    },
  });

  useEffect(() => {
    if (globalFilter) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
    setIsLoading(false);
  }, [globalFilter]);

  useEffect(() => {
    setLoader(true);
    setisdataLoaded(false);
    const timer = setTimeout(() => {
      setLoader(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [data, columns]);

  useEffect(() => {
    const page = searchParams.get("page");

    if (page && table && isdataLoaded) {
      const pageNumber = Number(page);
      if (!isNaN(pageNumber)) {
        table.setPageIndex(pageNumber);
      }
    }
  }, [isdataLoaded]);

  if (loader || loading) {
    return <TableSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Title & Description */}
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-semibold flex items-center">
              <span>{title + " List" || "Heading"}</span>
            </h1>
            <span className="text-sm md:text-base">
              Here is a List of {title || "Description"}
            </span>
          </div>
          <div className="hidden lg:block">{children}</div>
          {/* Right-side actions */}
          <div className="flex flex-wrap md:flex-nowrap items-center justify-start gap-4">
            {/* Export Button */}
            {/* <Button
              variant="outline"
              className="p-2"
              onClick={() => {
                const allRows = table
                  .getCoreRowModel()
                  .rows.map((row) => row.original);
                const columns = table
                  .getAllColumns()
                  .filter((col) => col.id !== "expander")
                  .filter((col) => col.id !== "select")
                  .filter((col) => col.getIsVisible())
                  .map((col) => ({
                    label: col.columnDef.header,
                    value: col.id,
                  }));

                exportToExcel(columns, allRows, "dataSheet");
              }}
            >
              <FaFileExcel
                size={24}
                className="text-[#00b400] dark:text-[#00ff00] cursor-pointer transition duration-75 ease-in hover:text-[#4bbd4b]"
              />
            </Button> */}

            {/* Column Toggle Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <MixerVerticalIcon
                    className="opacity-60 rotate-90"
                    strokeWidth={2}
                  />
                  <span className="ml-2 hidden sm:inline">View</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="font-semibold">
                  Toggle columns
                  <Separator />
                </DropdownMenuLabel>

                <ScrollArea className="h-[150px] w-[150px]">
                  {table
                    .getAllColumns()
                    ?.filter((column) => column.getCanHide())
                    ?.filter((column) => column.id !== "expander")
                    ?.filter((column) => column.id !== "select")
                    ?.map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                        onSelect={(event) => event.preventDefault()}
                      >
                        {column?.columnDef?.header?.length
                          ? column?.columnDef?.header
                          : (column?.columnDef as any)?.accessorKey}
                      </DropdownMenuCheckboxItem>
                    ))}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search Bar (Hidden if `hideGlobalSearch` is true) */}
            {!hideGlobalSearch && (
              <div className="relative w-full  sm:w-auto">
                <Input
                  id={globalFilter}
                  className="w-full sm:w-[200px] pl-9 pr-9"
                  placeholder="Search..."
                  type="search"
                  onChange={(e) => {
                    if (api) {
                      params.set("keyword", e.target.value);
                      navigate(`?${params.toString()}`);
                    } else {
                      table.setGlobalFilter(String(e.target.value));
                    }
                  }}
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/80">
                  {isLoading ? (
                    <Loader
                      className="animate-spin"
                      size={16}
                      strokeWidth={2}
                    />
                  ) : (
                    <Search size={16} strokeWidth={2} />
                  )}
                </div>
              </div>
            )}
            <div className="w-full block sm:block lg:hidden">{children}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <TableError></TableError>
        ) : loading ? (
          <TableNoData />
        ) : (
          <Table>
            <TableHeader>
              {table?.getHeaderGroups()?.map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup?.headers?.map((header) => {
                    const { column } = header;
                    const isPinned = column.getIsPinned();
                    const isLastLeftPinned =
                      isPinned === "left" && column.getIsLastColumn("left");
                    const isFirstRightPinned =
                      isPinned === "right" && column.getIsFirstColumn("right");
                    isdataLoaded == false && setisdataLoaded(true);
                    return (
                      <TableHead
                        key={header.id}
                        className={`relative h-10 truncate  [&:not([data-pinned]):has(+[data-pinned])_div.cursor-col-resize:last-child]:opacity-0 [&[data-last-col=left]_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=left][data-last-col=left]]:border-r [&[data-pinned=right]:last-child_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=right][data-last-col=right]]:border-l [&[data-pinned][data-last-col]]:border-border [&[data-pinned]]:bg-muted/90 [&[data-pinned]:backdrop-blur-sm group text-black align-text-top min-w-[20px] `}
                        colSpan={header.colSpan}
                        style={{ ...getPinningStyles(column) }}
                        data-pinned={isPinned || undefined}
                        data-last-col={
                          isLastLeftPinned
                            ? "left"
                            : isFirstRightPinned
                            ? "right"
                            : undefined
                        }
                        aria-sort={
                          header.column.getIsSorted() === "asc"
                            ? "ascending"
                            : header.column.getIsSorted() === "desc"
                            ? "descending"
                            : "none"
                        }
                      >
                        <div
                          className={cn(
                            "flex items-center justify-between gap-2",
                            header.column.getCanSort() &&
                              "cursor-pointer select-none"
                          )}
                          onClick={() => {
                            if (api) {
                              const currentSort = paramSort.split(",")[1];
                              let newSort;
                              if (currentSort === "asc") {
                                newSort = "desc";
                              } else if (currentSort === "desc") {
                                newSort = undefined; // Descending → No Sort
                              } else {
                                newSort = "asc"; // No Sort → Ascending
                              }
                              if (newSort) {
                                params.set(
                                  "sortBy",
                                  `${header.column.id},${newSort}`
                                );
                              } else {
                                params.delete("sortBy"); // Remove if no sort is applied
                              }

                              // Convert params to string and replace `%2C` with `,`
                              const queryString = params
                                .toString()
                                .replace(/%2C/g, ",");

                              navigate(`?${queryString}`);
                            } else {
                              // header.column.getToggleSortingHandler()?.(e);
                              if (header.column.getIsSorted() === "desc") {
                                header.column.toggleSorting(false); // Asc → Desc
                              } else if (
                                header.column.getIsSorted() === "asc"
                              ) {
                                header.column.clearSorting(); // Desc → No Sort
                              } else {
                                header.column.toggleSorting(true); // No Sort → Asc
                              }
                            }
                          }}
                          // tabIndex={header.column.getCanSort() ? 0 : undefined}
                        >
                          <span className="truncate">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </span>
                          <div className="flex items-start gap-2">
                            {api ? (
                              paramSort.split(",")[1] === "asc" ? (
                                <ChevronUp
                                  className="shrink-0 opacity-60"
                                  size={16}
                                  strokeWidth={2}
                                  aria-hidden="true"
                                />
                              ) : paramSort.split(",")[1] === "desc" ? (
                                <ChevronDown
                                  className="shrink-0 opacity-60"
                                  size={16}
                                  strokeWidth={2}
                                  aria-hidden="true"
                                />
                              ) : null
                            ) : (
                              {
                                asc: (
                                  <ChevronUp
                                    className="shrink-0 opacity-60"
                                    size={16}
                                    strokeWidth={2}
                                    aria-hidden="true"
                                  />
                                ),
                                desc: (
                                  <ChevronDown
                                    className="shrink-0 opacity-60"
                                    size={16}
                                    strokeWidth={2}
                                    aria-hidden="true"
                                  />
                                ),
                              }[header.column.getIsSorted() as string] ?? null
                            )}

                            {/* Pin/Unpin column controls with enhanced accessibility */}
                            {!header.isPlaceholder &&
                              header.column.getCanPin() &&
                              (header.column.getIsPinned() ? (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="-mr-1 size-7 shadow-none"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    header.column.pin(false);
                                  }}
                                  aria-label={`Unpin ${
                                    header.column.columnDef.header as string
                                  } column`}
                                  title={`Unpin ${
                                    header.column.columnDef.header as string
                                  } column`}
                                >
                                  <PinOff
                                    className="opacity-60"
                                    size={16}
                                    strokeWidth={2}
                                    aria-hidden="true"
                                  />
                                </Button>
                              ) : (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="-mr-1 size-7 shadow-none"
                                      onClick={(e) => e.stopPropagation()}
                                      aria-label={`Pin options for ${
                                        header.column.columnDef.header as string
                                      } column`}
                                      title={`Pin options for ${
                                        header.column.columnDef.header as string
                                      } column`}
                                    >
                                      <BsThreeDots
                                        className="opacity-60"
                                        size={16}
                                        aria-hidden="true"
                                      />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => header.column.pin("left")}
                                    >
                                      <ArrowLeftToLineIcon
                                        size={16}
                                        strokeWidth={3}
                                        className="opacity-60 mr-2"
                                        aria-hidden="true"
                                      />
                                      Stick to left
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => header.column.pin("right")}
                                    >
                                      <ArrowRightToLine
                                        size={16}
                                        strokeWidth={3}
                                        className="opacity-60 mr-2"
                                        aria-hidden="true"
                                      />
                                      Stick to right
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-full sm:w-auto"
                                    >
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIsChildOpen(!isChildOpen);
                                        }}
                                        className="flex items-center justify-between w-auto  text-sm sm:text-base"
                                      >
                                        <Search
                                          size={16}
                                          strokeWidth={2}
                                          className="mr-2"
                                        />
                                        <span>Search</span>
                                      </button>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              ))}
                          </div>
                        </div>
                        {header.column.getCanResize() && (
                          <div
                            {...{
                              onDoubleClick: () => header.column.resetSize(),
                              onMouseDown: header.getResizeHandler(),
                              onTouchStart: header.getResizeHandler(),
                              className:
                                "absolute top-0 h-full w-4 cursor-col-resize user-select-none touch-none -right-2 z-10 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity before:absolute before:w-px before:inset-y-0 before:bg-border before:-translate-x-px",
                            }}
                          />
                        )}

                        {isChildOpen &&
                          (header.column.getCanFilter() ? (
                            <div>
                              <Filter column={header.column} />
                            </div>
                          ) : null)}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows != undefined &&
              table.getRowModel().rows?.length > 0 ? (
                table.getRowModel().rows?.map((row) => (
                  <Fragment key={row.id}>
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={`h-[55px] `}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const { column } = cell;
                        const isPinned = column.getIsPinned();
                        const isLastLeftPinned =
                          isPinned === "left" && column.getIsLastColumn("left");
                        const isFirstRightPinned =
                          isPinned === "right" &&
                          column.getIsFirstColumn("right");
                        return (
                          <TableCell
                            key={cell.id}
                            className={`truncate [&[data-pinned=left][data-last-col=left]]:border-r [&[data-pinned=right][data-last-col=right]]:border-l [&[data-pinned][data-last-col]]:border-border [&[data-pinned]]:bg-background/90 [&[data-pinned]]:backdrop-blur-sm ${
                              cell.column.id == "expander" ? "w-10" : "w-full"
                            }`}
                            style={{ ...getPinningStyles(column) }}
                            data-pinned={isPinned || undefined}
                            data-last-col={
                              isLastLeftPinned
                                ? "left"
                                : isFirstRightPinned
                                ? "right"
                                : undefined
                            }
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    {row.getIsExpanded() && (
                      <TableRow>
                        <TableCell
                          colSpan={
                            row.getVisibleCells() &&
                            row.getVisibleCells().length
                          }
                        >
                          {columns
                            .find((col) => col.id === "expander")
                            ?.expandedContent?.(row)}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <TableNoData />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
          {/* Pagination Info */}
          <div className="flex-1 text-sm text-muted-foreground text-center sm:text-left">
            Showing{" "}
            {api
              ? currentPage
              : table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                1}{" "}
            to{" "}
            {api
              ? totalPages && totalPages - 1
              : Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}{" "}
            of {api ? totalelement : table.getFilteredRowModel().rows.length}{" "}
            entries
          </div>

          {/* Controls - Responsive Wrap */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-4">
            {/* Rows per Page */}
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <select
                className="h-8 w-[70px] rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={
                  api
                    ? `${searchParams.get("size")}`
                    : `${table.getState().pagination.pageSize}`
                }
                onChange={(e) => {
                  if (api) {
                    params.set("size", e.target.value);
                    const queryString = params.toString().replace(/%2C/g, ",");
                    navigate(`?${queryString}`);
                  } else {
                    table.setPageSize(Number(e.target.value));
                  }
                }}
              >
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>

            {/* Pagination Buttons */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1 sm:gap-2">
              {/* First Page */}
              <Button
                size="icon"
                variant="outline"
                className="w-8 h-8 sm:w-10 sm:h-10 disabled:opacity-50"
                onClick={() => {
                  if (api) {
                    params.set("page", "0");
                    navigate(`?${params.toString()}`);
                  } else {
                    table.setPageIndex(0);
                    setSearchParams({ page: "1" });
                  }
                }}
                disabled={api ? currentPage === 0 : !table.getCanPreviousPage()}
              >
                <ChevronFirst size={16} />
              </Button>

              {/* Previous Page */}
              <Button
                size="icon"
                variant="outline"
                className="w-8 h-8 sm:w-10 sm:h-10 disabled:opacity-50"
                onClick={() => {
                  if (api && currentPage) {
                    params.set("page", String(currentPage - 1));
                    navigate(`?${params.toString()}`);
                  } else {
                    table.previousPage();
                    const currentPage = searchParams.get("page");
                    const nextPage = currentPage ? Number(currentPage) - 1 : 1;
                    setSearchParams({ page: nextPage.toString() });
                  }
                }}
                disabled={api ? currentPage === 0 : !table.getCanPreviousPage()}
              >
                <ChevronLeft size={16} />
              </Button>

              {/* Next Page */}
              <Button
                size="icon"
                variant="outline"
                className="w-8  h-8 sm:w-10 sm:h-10 disabled:opacity-50"
                onClick={() => {
                  if (api) {
                    currentPage && params.set("page", String(currentPage + 1));
                    navigate(`?${params.toString()}`);
                  } else {
                    table.nextPage();
                    const currentPage = searchParams.get("page");
                    const nextPage = currentPage ? Number(currentPage) + 1 : 1;
                    setSearchParams({ page: nextPage.toString() });
                  }
                }}
                disabled={
                  api && totalPages
                    ? currentPage === totalPages - 1
                    : !table.getCanNextPage()
                }
              >
                <ChevronRight size={16} />
              </Button>

              {/* Last Page */}
              <Button
                size="icon"
                variant="outline"
                className="w-8 h-8 sm:w-10 sm:h-10 disabled:opacity-50"
                onClick={() => {
                  if (api && totalPages) {
                    params.set("page", String(totalPages - 1));
                    navigate(`?${params.toString()}`);
                  } else {
                    table.setPageIndex(table.getPageCount() - 1);
                    setSearchParams({
                      page: `${table.getPageCount() - 1}`,
                    });
                  }
                }}
                disabled={
                  api && totalPages
                    ? currentPage === totalPages - 1
                    : !table.getCanNextPage()
                }
              >
                <ChevronLast size={16} />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function Filter({ column }: { column: Column<any> }) {
  const columnFilterValue = column.getFilterValue();
  const filterVariant = (column.columnDef.meta as ColumnMetaType)
    ?.filterVariant;

  return filterVariant === "range" ? (
    <div>
      <div className="flex space-x-2">
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[0] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [value, old?.[1]])
          }
          placeholder="Min"
          className="w-24 border shadow rounded"
        />
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[1] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [old?.[0], value])
          }
          placeholder="Max"
          className="w-24 border shadow rounded"
        />
      </div>
      <div className="h-1" />
    </div>
  ) : filterVariant === "select" ? (
    <select
      onChange={(e) => column.setFilterValue(e.target.value)}
      value={columnFilterValue?.toString() ?? ""}
    >
      <option value="">All</option>
      <option value="complicated">Complicated</option>
      <option value="relationship">Relationship</option>
      <option value="single">Single</option>
    </select>
  ) : (
    <DebouncedInput
      className="w-36 border shadow rounded"
      onChange={(value) => column.setFilterValue(value)}
      placeholder="Search..."
      type="text"
      value={(columnFilterValue as string) ?? ""}
    />
  );
}

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);
  return (
    <div className="relative">
      <Input
        placeholder="Search..."
        type="search"
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
      <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center  text-muted-foreground/80 peer-disabled:opacity-50"></div>
    </div>
  );
}

export default ShadcnTable;
