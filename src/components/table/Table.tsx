import { useMemo } from "react";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  useFilters,
  usePagination,
} from "react-table";
import NoData from "@/assets/NoData.gif";
import spinner from "@/assets/spinner.svg";
import apiError from "@/assets/apiError.gif";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import {
  RxChevronLeft,
  RxChevronRight,
  RxDoubleArrowLeft,
  RxDoubleArrowRight,
  RxMixerHorizontal,
} from "react-icons/rx";
import { FaChevronDown, FaChevronUp, FaFileExcel } from "react-icons/fa6";
import { Button } from "../ui/button";
import CheckboxToggle from "./Checkbox";
import GlobalFiltering from "./GlobalFiltering";
import ColumnFiltering from "./ColumnFiltering";

type props = {
  data: any;
  COLUMNS: any;
  title: string;
  desc: string;
  className?: string;
  loading: boolean;
  error: boolean;
  children?: React.ReactNode;
};

const Table = ({
  COLUMNS,
  data,
  title,
  desc,
  loading,
  error,
  children,
  className,
}: props) => {
  const defaultColumn: any = useMemo(() => {
    return {
      Filter: ColumnFiltering,
    };
  }, []);
  const rowData = useMemo(() => data || [], [data]);

  const {
    rows,
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    pageCount,
    setGlobalFilter,
    allColumns,
    visibleColumns,
    getToggleHideAllColumnsProps,
  } = useTable(
    {
      columns: COLUMNS,
      data: rowData,
      defaultColumn,
      initialState: { pageIndex: 0 } as any,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination
  ) as any;

  const { globalFilter } = state;

  const { pageIndex } = state;

  return (
    <>
      <div
        className={`rounded-xl border bg-card text-card-foreground shadow px-6 py-3 ${className}`}
      >
        <div className="space-y-5 sm:flex justify-between items-center">
          <div className="flex justify-between items-start flex-col">
            <h2 className="text-base sm:text-xl font-semibold tracking-tight text-gray-800 dark:text-gray-200">
              {title} List
            </h2>
            {desc && (
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                Here&apos;s a list of {desc}.
              </p>
            )}
          </div>
          <div>{children}</div>
          <div className="sm:flex justify-between items-center gap-2">
            {/* <FaFileExcel
              className="hidden sm:block text-[1.5rem] text-[#00b400] dark:text-[#00ff00] cursor-pointer  transition duration-75 ease-in hover:text-[#4bbd4b]"
              onClick={() =>
                exportToExcel(
                  visibleColumns.map((a: any) => {
                    return { label: a.Header, value: a.id };
                  }),
                  rows.map((row: any) => row.original),
                  "dataSheets"
                )
              }
            /> */}
            <div className="hidden lg:block">
              <Popover>
                <PopoverTrigger>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="ml-auto hidden h-8 lg:flex dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700"
                  >
                    <RxMixerHorizontal className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="bg-white dark:bg-secondary shadow-md p-2 dark:text-gray-200 max-h-[50vh] overflow-auto space-y-1">
                  <div className="dark:bg-gray-700 font-semibold flex items-center gap-1">
                    <CheckboxToggle {...getToggleHideAllColumnsProps()} />
                    Toggle All
                  </div>

                  {allColumns.map((column: any) => (
                    <div key={column.id}>
                      <label className="flex items-center gap-2 dark:text-gray-200">
                        <input
                          type="checkbox"
                          {...column.getToggleHiddenProps()}
                        />
                        {column.Header}
                      </label>
                    </div>
                  ))}
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex mb-2 sm:mb-0 items-center justify-between">
              <GlobalFiltering
                filter={globalFilter}
                setFilter={setGlobalFilter}
              />
              {/* <FaFileExcel
                className="sm:hidden text-[1.5rem] text-[#00b400] dark:text-[#00ff00] cursor-pointer transition duration-75 ease-in hover:text-[#4bbd4b]"
                onClick={() =>
                  exportToExcel(
                    visibleColumns.map((a: any) => {
                      return { label: a.Header, value: a.id };
                    }),
                    rows.map((row: any) => row.original),
                    "dataSheet"
                  )
                }
              /> */}
            </div>
          </div>
        </div>
        {loading ? (
          <div className="w-full flex items-center justify-center gap-1 py-52">
            <img src={spinner} className="w-20" alt="Loading..." />
            <p className="text-lg font-semibold">Loading...</p>
          </div>
        ) : (
          <>
            <div className="overflow-auto">
              <table
                {...getTableProps()}
                className="w-full text-sm bg-white  dark:bg-secondary"
              >
                <thead>
                  {headerGroups.map((headerGroup: any) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column: any) => (
                        <th
                          className="text-nowrap dark:bg-gray-700 dark:text-gray-200"
                          {...column.getHeaderProps(
                            column.getSortByToggleProps()
                          )}
                        >
                          <div className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                              {column.render("Header")}
                              {column.isSorted ? (
                                column.isSortedDesc ? (
                                  <FaChevronDown className="text-[10px]" />
                                ) : (
                                  <FaChevronUp className="text-[10px]" />
                                )
                              ) : null}
                            </div>
                            {column.canFilter ? (
                              <div className="flex items-center">
                                {column.filterValue && (
                                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                )}
                                {column.render("Filter")}
                              </div>
                            ) : column.canFilter ? (
                              column.render("Filter")
                            ) : null}{" "}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                  {error ? (
                    <tr>
                      <td colSpan={COLUMNS.length} className="py-16">
                        <span className="flex flex-col items-center justify-center gap-5">
                          <img src={apiError} alt="Error" className="w-20" />
                          <p className="text-lg font-semibold">
                            Error while loading data.
                          </p>
                        </span>
                      </td>
                    </tr>
                  ) : page.length === 0 ? (
                    <tr>
                      <td
                        colSpan={COLUMNS.length}
                        className="text-center p-4 dark:text-gray-200"
                      >
                        <span className="flex items-center justify-center">
                          <img
                            src={NoData}
                            alt="No Data"
                            className="w-[10rem]"
                          />
                          No data available.
                        </span>
                      </td>
                    </tr>
                  ) : (
                    page.map((row: any) => {
                      prepareRow(row);
                      return (
                        <tr
                          {...row.getRowProps()}
                          className="dark:border-b dark:border-gray-700 hover:bg-gray-100 "
                        >
                          {row.cells.map((cell: any) => (
                            <td
                              {...cell.getCellProps()}
                              className="py-2 px-4 capitalize dark:bg-secondary dark:text-gray-200 "
                            >
                              {/* {cell.render("Cell")} */}
                              {typeof cell.value === "string" && /<\/?[a-z][\s\S]*>/i.test(cell.value) ? (
                                <span
                                  dangerouslySetInnerHTML={{ __html: cell.value }}
                                  className="not-capitalize"
                                />
                              ) : (
                                cell.render("Cell")
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              {...{
                rowData,
                pageIndex,
                pageOptions,
                gotoPage,
                canPreviousPage,
                previousPage,
                nextPage,
                canNextPage,
                pageCount,
              }}
            />
          </>
        )}
      </div>
    </>
  );
};

export default Table;

const Pagination = ({
  rowData,
  pageIndex,
  pageOptions,
  gotoPage,
  canPreviousPage,
  previousPage,
  nextPage,
  canNextPage,
  pageCount,
}: any) => {
  return (
    <div className="text-sm sm:text-base flex justify-between items-center p-1  dark:bg-secondary dark:text-gray-200">
      <div className="space-x-1 flex items-center">
        <span>
          Page <strong>{pageIndex + 1} - </strong>
          <strong>{pageOptions.length} </strong> of
          <strong> {rowData.length} </strong>
          data
        </span>
      </div>

      <div className="flex justify-around my-3 sm:block sm:m-0 sm:space-x-1">
        <Button
          type="button"
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => gotoPage(0)}
          disabled={!canPreviousPage}
        >
          <RxDoubleArrowLeft />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => previousPage()}
          disabled={!canPreviousPage}
        >
          <RxChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => nextPage()}
          disabled={!canNextPage}
        >
          <RxChevronRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => gotoPage(pageCount - 1)}
          disabled={!canNextPage}
        >
          <RxDoubleArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
