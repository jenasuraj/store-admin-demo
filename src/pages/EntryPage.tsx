import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CheckIcon,
  ChevronsUpDownIcon,
  XIcon,
  Upload,
  Loader2,
  Eye,
  Trash2,
  Copy,
  Save,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useNavigate, useBlocker } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchCustomers } from "@/app/customerSlice";
import {
  fetchLedgerProducts,
  ledgerProductsDataType,
} from "@/app/ledgerProductsSlice";
import { toast } from "sonner";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

// --- Types ---

interface PriceListItem {
  price: number;
  productId: number;
  productName: string;
  basePrice: number;
}

interface CustomerPriceList {
  id: number;
  userid: number;
  name: string;
  productPrices: PriceListItem[];
}

interface LedgerRowItem {
  internalId: string;

  customerId: string;
  customerName: string;

  date: string;
  productId: number;
  productName: string;
  defaultSku: string;

  width: number;
  height: number;
  sqft: number;
  totalSqft: number;

  basePrice: number;
  ratePerPiece: number;
  quantity: number;

  extraCharge: number;
  amount: number;

  isAutoAmount: boolean;

  payNow: boolean;
  location: string;
  imageUrl: string;
  isUploading?: boolean;
}


interface DraftData {
  rows: LedgerRowItem[];
  savedAt: number;
}

// --- API Services (Images) ---

const uploadImageAPI = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axios.post(
    `${BASE_URL}/api/user/upload?folder=products`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data.url;
};

const deleteImageAPI = async (imageUrl: string) => {
  await axios.delete(`${BASE_URL}/api/user/delete-blob?url=${imageUrl}`);
};

// --- Components ---

// Refactored: Single Select Combobox for Table Rows
function RowProductCombobox({
  items,
  selectedProductId,
  selectedProductName,
  onSelect,
  priceListMap,
  searchTerm,
  setSearchTerm,
  loading,
  hasMore,
  onLoadMore,
}: {
  items: ledgerProductsDataType[];
  selectedProductId: number;
  selectedProductName: string;
  onSelect: (product: ledgerProductsDataType) => void;
  priceListMap: Record<number, number>;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: (node: HTMLDivElement) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasAutoOpenedRef = useRef(false);


  // Find selected item name for display
  const selectedItemName =
    selectedProductId !== 0
      ? selectedProductName
      : "Select Product...";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-between text-left font-normal h-8 text-xs px-2",
            !selectedProductId && "text-muted-foreground"
          )}
          onKeyDown={(e) => {
            // ✅ Open ONLY ONCE per focus
            if (
              e.key === "Tab" &&
              !open &&
              !hasAutoOpenedRef.current &&
              !e.shiftKey
            ) {
              e.preventDefault();
              e.stopPropagation();

              hasAutoOpenedRef.current = true; // 🔒 lock auto-open
              setOpen(true);
              return;
            }

            // Enter opens normally (optional)
            if (e.key === "Enter" && !open) {
              e.preventDefault();
              setOpen(true);
            }

            // Esc closes
            if (e.key === "Escape" && open) {
              e.preventDefault();
              setOpen(false);
            }
          }}

        >
          <span className="truncate">{selectedItemName}</span>
          <ChevronsUpDownIcon className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search products..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList className="max-h-[300px] overflow-y-auto">
            {loading && items.length === 0 && (
              <div className="p-4 text-center flex justify-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...
              </div>
            )}
            {items.length === 0 && !loading && (
              <CommandEmpty>No products found.</CommandEmpty>
            )}

            <CommandGroup>
              {items.map((item) => {
                const isSelected = selectedProductId === item.productId;
                const isSpecial = priceListMap.hasOwnProperty(item.productId);
                const price = isSpecial
                  ? priceListMap[item.productId]
                  : item.attributes?.[0]?.price ?? 0;

                return (
                  <CommandItem
                    key={item.productId}
                    value={item.name}
                    onSelect={() => {
                      onSelect(item);
                      setSearchTerm("");
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center w-full">
                      <CheckIcon
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col flex-1">
                        <span className="flex items-center gap-2 font-medium">
                          {item.attributes?.[0]?.title || item.name}
                          {isSpecial && (
                            <Badge
                              variant="secondary"
                              className="h-5 px-1.5 text-[10px] bg-green-100 text-green-800"
                            >
                              ₹{price} (Special)
                            </Badge>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          SKU: {item.defaultSku} | Base: ₹{price}
                        </span>
                      </div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>

            {!loading && hasMore && (
              <div
                ref={onLoadMore}
                className="p-2 flex justify-center items-center w-full h-8"
              >
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Customer Combobox
function CustomerCombobox({
  customers,
  selectedCustomerId,
  onSelect,
}: {
  customers: any[];
  selectedCustomerId: string;
  onSelect: (id: string) => void;
}) {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const hasAutoOpenedRef = useRef(false);
  const selectedCustomer = customers.find(
    (c) => c.id === selectedCustomerId
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchCustomers({ search }));
    }, 400);

    return () => clearTimeout(timer);
  }, [search, dispatch]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          onKeyDown={(e) => {
            // ✅ Open ONLY ONCE per focus
            if (
              e.key === "Tab" &&
              !open &&
              !hasAutoOpenedRef.current &&
              !e.shiftKey
            ) {
              e.preventDefault();
              e.stopPropagation();

              hasAutoOpenedRef.current = true; // 🔒 lock auto-open
              setOpen(true);
              return;
            }

            // Enter opens normally (optional)
            if (e.key === "Enter" && !open) {
              e.preventDefault();
              setOpen(true);
            }

            // Esc closes
            if (e.key === "Escape" && open) {
              e.preventDefault();
              setOpen(false);
            }
          }}
        >
          {selectedCustomer
            ? `${selectedCustomer.firstname} ${selectedCustomer.lastname || ""}`
            : "Select customer..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] sm:w-[400px] p-0">
        <Command>
          <CommandInput
            placeholder="Search customer..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No customer found.</CommandEmpty>
            <CommandGroup>
              {customers.map((customer) => {
                const id = (customer.id || customer.customerId).toString();
                return (
                  <CommandItem
                    key={id}
                    value={`${customer.firstname} ${customer.lastname || ""}`}
                    onSelect={() => {
                      onSelect(id);
                      setOpen(false);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCustomerId === id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {customer.firstname} {customer.lastname}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// --- Main Page ---

export default function CreateEntryPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { customers } = useAppSelector((state) => state.customer);
  const {
    infiniteList: products,
    hasMore,
    loading: fetchingProducts,
    currentPage,
    isSearching,
  } = useAppSelector((state) => state.ledgerProducts);

  // Form State
  // const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [payNowForAll, setPayNowForAll] = useState<boolean>(false);
  const [rows, setRows] = useState<LedgerRowItem[]>([]);
  const [priceList, setPriceList] = useState<CustomerPriceList | null>(null);
  const [isLoadingPriceList, setIsLoadingPriceList] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // New Loading State
  const [searchTerm, setSearchTerm] = useState("");
  const observer = useRef<IntersectionObserver | null>(null);

  // UI State
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    internalId: string;
  } | null>(null);

  // Navigation & Draft Logic State
  const [showSaveDraftDialog, setShowSaveDraftDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [draftToRestore, setDraftToRestore] = useState<DraftData | null>(null);

  // Helper to create an empty row
  const createEmptyRow = (date?: string): LedgerRowItem => ({
    internalId: Math.random().toString(36).substr(2, 9),

    customerId: "",
    customerName: "",

    date: date || format(new Date(), "yyyy-MM-dd"),
    productId: 0,
    productName: "",
    defaultSku: "",
    width: 0,
    height: 0,
    sqft: 0,
    totalSqft: 0,
    basePrice: 0,
    ratePerPiece: 0,
    quantity: 1,
    extraCharge: 0,
    amount: 0,
    isAutoAmount: true,
    payNow: false,
    location: "",
    imageUrl: "",
  });

  // --- 1. Check for Draft on Mount ---
  useEffect(() => {
    const savedDraft = localStorage.getItem("ledger_draft");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft) as DraftData;
        if (parsed.rows.length > 0) {
          setDraftToRestore(parsed);
          setShowRestoreDialog(true);
        }
      } catch (e) {
        console.error("Failed to parse draft", e);
        localStorage.removeItem("ledger_draft");
      }
    } else {
      // If no draft, ensure at least one empty row exists
      setRows([createEmptyRow()]);
    }
    dispatch(fetchCustomers());
  }, [dispatch]);

  // --- 2. Browser Refresh Protection ---
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only warn if we have a customer or rows with data
      const hasData = rows.some((r) => r.productId !== 0);
      const hasCustomer = rows.some(r => r.customerId !== "")
      if (hasCustomer || hasData) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [rows]);

  // --- 3. Internal Navigation Blocking ---
  const isDirty =
    rows.some(r => r.customerId !== "" || r.productId !== 0);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      setShowSaveDraftDialog(true);
    }
  }, [blocker]);

  // --- Draft & Navigation Handlers ---

  const handleSaveDraft = () => {
    const draftData: DraftData = {
      rows,
      savedAt: Date.now(),
    };
    localStorage.setItem("ledger_draft", JSON.stringify(draftData));
    toast.success("Progress saved as draft");
    if (blocker.state === "blocked") blocker.proceed();
    setShowSaveDraftDialog(false);
  };

  const handleDiscardAndExit = async () => {
    const deletePromises = rows
      .filter((r) => r.imageUrl && r.imageUrl.startsWith("http"))
      .map((r) => deleteImageAPI(r.imageUrl));

    if (deletePromises.length > 0) {
      toast.info(`Cleaning up ${deletePromises.length} uploaded images...`);
      await Promise.all(deletePromises).catch((e) => console.error(e));
    }

    setRows([createEmptyRow()]);
    if (blocker.state === "blocked") blocker.proceed();
    setShowSaveDraftDialog(false);
  };

  const handleCancelNavigation = () => {
    if (blocker.state === "blocked") blocker.reset();
    setShowSaveDraftDialog(false);
  };

  const handleRestoreDraft = () => {
    if (draftToRestore) {
      setRows(draftToRestore.rows);
      toast.success("Draft restored");
    }
    setShowRestoreDialog(false);
  };

  const handleDiscardDraftOnStart = () => {
    localStorage.removeItem("ledger_draft");
    setDraftToRestore(null);
    setRows([createEmptyRow()]); // Ensure one row on fresh start
    setShowRestoreDialog(false);
    toast.info("Draft discarded");
  };

  // --- Fetch Price List ---
  // useEffect(() => {
  //   if (!selectedCustomerId) {
  //     setPriceList(null);
  //     return;
  //   }
  //   setSearchTerm(""); // Clear product search on customer change
  //   const fetchPriceList = async () => {
  //     setIsLoadingPriceList(true);
  //     try {
  //       const response = await axios.get(
  //         `${BASE_URL}/api/pricelist/${selectedCustomerId}`
  //       );
  //       if (Array.isArray(response.data) && response.data.length > 0) {
  //         setPriceList(response.data[0]);
  //         toast.success(`Applied: ${response.data[0].name}`);
  //       } else {
  //         setPriceList(null);
  //       }
  //     } catch (error) {
  //       setPriceList(null);
  //     } finally {
  //       setIsLoadingPriceList(false);
  //     }
  //   };
  //   fetchPriceList();
  // }, [selectedCustomerId]);

  const priceListMap = useMemo(() => {
    const map: Record<number, number> = {};
    if (priceList && priceList.productPrices) {
      priceList.productPrices.forEach((p) => (map[p.productId] = p.price));
    }
    return map;
  }, [priceList]);

  // --- Product Search ---
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchLedgerProducts({ page: 0, size: 10, search: searchTerm }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, dispatch]);

  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (fetchingProducts) return;
      if (observer.current) observer.current.disconnect();
      if (!isSearching && hasMore) {
        observer.current = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            dispatch(
              fetchLedgerProducts({
                page: currentPage + 1,
                size: 10,
                search: "",
              })
            );
          }
        });
        if (node) observer.current.observe(node);
      }
    },
    [fetchingProducts, hasMore, currentPage, isSearching, dispatch]
  );

  // --- Row Logic ---

  // When a product is selected in a specific row
  const handleRowProductSelect = (
    internalId: string,
    product: ledgerProductsDataType
  ) => {
    const basePrice =
      priceListMap[product.productId] ?? product.attributes?.[0]?.price ?? 0;

    // Default dimensions
    // ✅ SAFE dimension extraction
    const width = Number(product.attributes?.[0]?.width ?? 0);
    const height = Number(product.attributes?.[0]?.height ?? 0);

    // sqft only if both exist
    const sqft =
      width > 0 && height > 0
        ? parseFloat((width * height).toFixed(2))
        : 0;

    setRows((prev) => {
      const updatedRows = prev.map((row) => {
        if (row.internalId !== internalId) return row;

        // Populate the row with product details
        const newRow = {
          ...row,
          productId: product.productId,
          productName: product.attributes?.[0]?.title || product.name,
          defaultSku: product.defaultSku,
          width,
          height,
          sqft,
          basePrice,
          ratePerPiece: basePrice * sqft,
          amount: basePrice * sqft * row.quantity + row.extraCharge,
          payNow: false,
        };
        // Ensure totalSqft is calculated
        newRow.totalSqft = sqft * row.quantity;
        return newRow;
      });

      // Check if we need to add a new empty row (Auto-add)
      const currentIndex = updatedRows.findIndex(
        (r) => r.internalId === internalId
      );
      if (currentIndex === updatedRows.length - 1) {
        updatedRows.push(createEmptyRow(updatedRows[currentIndex].date));
      }

      return updatedRows;
    });
  };

  const duplicateRow = (row: LedgerRowItem) => {
    const newRow = {
      ...row,
      internalId: Math.random().toString(36).substr(2, 9),
      date: row.date,
    };
    setRows((prev) => {
      // Insert duplicate after current row or at end? Typically at end.
      // But logic requires empty row at end.
      const list = [...prev];
      // If last row is empty, insert before it
      const lastRow = list[list.length - 1];
      if (lastRow.productId === 0) {
        list.splice(list.length - 1, 0, newRow);
      } else {
        list.push(newRow);
        // Ensure empty row exists after
        list.push(createEmptyRow());
      }
      return list;
    });
  };

  const updateRow = (
    internalId: string,
    field: keyof LedgerRowItem,
    value: any
  ) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.internalId !== internalId) return row;

        const updated = { ...row, [field]: value };

        /* 1️⃣ Recalculate SQFT */
        if (field === "width" || field === "height") {
          updated.sqft = parseFloat(
            (updated.width * updated.height).toFixed(2)
          );
        }

        /* 2️⃣ Recalculate ratePerPiece */
        if (
          ["width", "height", "sqft", "basePrice"].includes(field)
        ) {
          updated.ratePerPiece = parseFloat(
            (updated.sqft * updated.basePrice).toFixed(2)
          );
        }

        /* 3️⃣ Total Sqft */
        if (field !== "totalSqft") {
          updated.totalSqft = parseFloat(
            (updated.sqft * updated.quantity).toFixed(2)
          );
        }

        /* 4️⃣ Amount Logic */

        // If auto mode is ON → calculate
        if (updated.isAutoAmount && field !== "amount") {
          updated.amount = parseFloat(
            (
              updated.ratePerPiece *
              updated.quantity +
              updated.extraCharge
            ).toFixed(2)
          );
        }

        return updated;
      })
    );
  };

  const removeRow = (internalId: string) => {
    setRows((prev) => {
      const filtered = prev.filter((r) => r.internalId !== internalId);
      // Ensure there is always at least one empty row if all deleted
      if (filtered.length === 0) {
        return [createEmptyRow()];
      }
      return filtered;
    });
  };

  // --- Image API Handling ---

  const handleImageUpload = async (internalId: string, file: File) => {
    updateRow(internalId, "isUploading", true);
    try {
      const uploadedUrl = await uploadImageAPI(file);
      updateRow(internalId, "imageUrl", uploadedUrl);
      toast.success("Image uploaded");
    } catch (error) {
      console.error(error);
      toast.error("Image upload failed");
    } finally {
      updateRow(internalId, "isUploading", false);
    }
  };

  const handleDeleteImage = async (internalId: string, imageUrl: string) => {
    try {
      await deleteImageAPI(imageUrl);
      updateRow(internalId, "imageUrl", "");
      setPreviewImage(null);
      toast.success("Image deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete image");
    }
  };

  // --- Submit ---
  const handleSubmit = async () => {
    // if (!selectedCustomerId) return toast.error("Select a customer");

    // Filter out rows that have no product selected
    const validRows = rows.filter((r) => r.productId !== 0);

    if (validRows.length === 0)
      return toast.error("Add at least one product to ledger");

    setIsSubmitting(true);

    const payload = {
      // customerId: parseInt(selectedCustomerId),
      paymentStatus: "PENDING",
      payNowForAll: false,
      totalAmount: validRows.reduce((sum, r) => sum + r.amount, 0),
      items: validRows.map((r) => ({
        date: r.date,
        customerId: parseInt(r.customerId),
        productId: r.productId,
        height: r.height,
        width: r.width,
        sqft: r.sqft,
        totalSqft: `${r.totalSqft}`,
        basePrice: r.basePrice,
        ratePerPiece: r.ratePerPiece,
        quantity: r.quantity,
        location: r.location || "",
        imageUrl: r.imageUrl || "",
        extraCharge: r.extraCharge,
        amount: r.amount,
        payNow: payNowForAll ? true : r.payNow,
      })),
    };
    try {
      const res = await axios.post(`${BASE_URL}/api/ledger/create`, payload);
      if (res.status === 200 || res.status === 201) {
        toast.success("Ledger entry created!");
        localStorage.removeItem("ledger_draft");
        // setSelectedCustomerId("");
        setRows([createEmptyRow()]); // Reset to initial state
        // setTimeout(() => navigate("/ledger-sheet"), 1000);
      }
    } catch (e) {
      toast.error("Failed to create entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const grandTotal = rows.reduce((sum, r) => sum + r.amount, 0);

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Create Ledger Entry
            </h1>
            <p className="text-muted-foreground text-sm">New sales entry</p>
          </div>
        </div>

        {/* <Card>
          <CardContent className="p-6 grid gap-6 items-end">
            <div className="flex flex-col gap-2 max-w-md">
              <Label>Customer</Label>
              <CustomerCombobox
              
                customers={customers}
                selectedCustomerId={selectedCustomerId}
                onSelect={setSelectedCustomerId}
              />
            </div>
          </CardContent>
        </Card> */}

        {isLoadingPriceList ? (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" /> Loading Price List...
          </div>
        ) : (
          priceList && (
            <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm">
              Active Price List: <strong>{priceList.name}</strong>
            </div>
          )
        )}

        <Card>
          <CardContent className="p-0 overflow-hidden">
            <div className="overflow-x-auto min-h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[130px]"></TableHead>
                    <TableHead className="w-[130px]">Date</TableHead>
                    <TableHead className="min-w-[200px]">Customer</TableHead>
                    <TableHead className="min-w-[250px]">Product</TableHead>
                    <TableHead className="min-w-[100px]">Description</TableHead>
                    <TableHead className="min-w-[80px]">Width</TableHead>
                    <TableHead className="min-w-[80px]">Height</TableHead>
                    <TableHead className="min-w-[80px]">SqFt</TableHead>
                    <TableHead className="min-w-[80px]">Rate per SqFt</TableHead>
                    <TableHead className="min-w-[80px]">Total Rate</TableHead>
                    <TableHead className="min-w-[80px]">Qty</TableHead>
                    <TableHead className="min-w-[80px]">Total Sqft</TableHead>
                    <TableHead className="min-w-[100px]">Extra</TableHead>
                    <TableHead className="min-w-[60px]">Image</TableHead>
                    <TableHead className="min-w-[100px] text-right">
                      Amount
                    </TableHead>
                    <TableHead className="min-w-[100px] text-right">
                      Paid
                    </TableHead>
                    <TableHead className="min-w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.internalId}
                      className={cn(row.productId === 0 && "bg-muted/5")}
                    >
                      <TableCell>
                        <Checkbox
                          checked={row.isAutoAmount}
                          onCheckedChange={(checked) =>
                            updateRow(row.internalId, "isAutoAmount", Boolean(checked))
                          }
                        />
                      </TableCell>


                      <TableCell>
                        <Input
                          type="date"
                          className="h-8 w-full px-2 text-xs"
                          value={row.date}
                          onChange={(e) =>
                            updateRow(row.internalId, "date", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <CustomerCombobox
                          customers={customers}
                          selectedCustomerId={row.customerId}
                          onSelect={(id) => {
                            const customer = customers.find(
                              (c) => (c.id || c.customerId).toString() === id
                            );

                            updateRow(row.internalId, "customerId", id);
                            updateRow(
                              row.internalId,
                              "customerName",
                              customer
                                ? `${customer.firstname}`
                                : ""
                            );
                            setSearchTerm("");
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        {/* New Row-Based Product Combobox */}
                        <div
                          className={cn(
                            !row.customerId &&
                            "pointer-events-none touch-none",
                            "flex flex-col gap-1"
                          )}
                        >
                          <RowProductCombobox
                            items={products}
                            selectedProductId={row.productId}
                            selectedProductName={row.productName}
                            onSelect={(p) =>
                              handleRowProductSelect(row.internalId, p)
                            }
                            priceListMap={priceListMap}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            loading={fetchingProducts}
                            hasMore={hasMore}
                            onLoadMore={lastElementRef}
                          />
                        </div>
                      </TableCell>

                      <TableCell>
                        <Input
                          className="h-8 px-1"
                          value={row.location}
                          disabled={row.productId === 0}
                          onChange={(e) =>
                            updateRow(
                              row.internalId,
                              "location",
                              e.target.value
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          className="h-8 px-1"
                          value={row.width}
                          disabled={row.productId === 0}
                          onChange={(e) =>
                            updateRow(
                              row.internalId,
                              "width",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          className="h-8 px-1"
                          value={row.height}
                          disabled={row.productId === 0}
                          onChange={(e) =>
                            updateRow(
                              row.internalId,
                              "height",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          className="h-8 px-1 bg-muted/30"
                          value={row.sqft}
                          // disabled={row.productId === 0}
                          disabled={true}
                          onChange={(e) =>
                            updateRow(
                              row.internalId,
                              "sqft",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <Input
                            type="number"
                            min={0}
                            className="h-8 px-1"
                            value={row.basePrice}
                            disabled={row.productId === 0}
                            onChange={(e) =>
                              updateRow(
                                row.internalId,
                                "basePrice",
                                parseFloat(e.target.value) || 0
                              )
                            }

                          />
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">

                          <Input
                            type="number"
                            min={0}
                            className="h-8 px-1 font-medium text-blue-600"
                            value={row.ratePerPiece}
                            disabled={row.productId === 0}
                            onChange={(e) =>
                              updateRow(
                                row.internalId,
                                "ratePerPiece",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">

                          <Input
                            type="number"
                            className="h-8 px-1"
                            min={0}
                            value={row.quantity}
                            disabled={row.productId === 0}
                            onChange={(e) =>
                              updateRow(
                                row.internalId,
                                "quantity",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </span>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="h-8 px-1 bg-muted/30"
                          min={0}
                          value={row.totalSqft}
                          // disabled={row.productId === 0}
                          disabled={true}
                          onChange={(e) =>
                            updateRow(
                              row.internalId,
                              "totalSqft",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          className="h-8 px-1"
                          value={row.extraCharge}
                          disabled={row.productId === 0}
                          onChange={(e) =>
                            updateRow(
                              row.internalId,
                              "extraCharge",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </TableCell>

                      {/* Image Upload */}
                      <TableCell>
                        <div className="flex justify-center items-center">
                          {row.productId !== 0 && (
                            <>
                              {row.isUploading ? (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              ) : row.imageUrl ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-600"
                                  onClick={() =>
                                    setPreviewImage({
                                      url: row.imageUrl,
                                      internalId: row.internalId,
                                    })
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              ) : (
                                <>
                                  <Label
                                    htmlFor={`file-${row.internalId}`}
                                    className="cursor-pointer hover:bg-muted p-1 rounded-md"
                                  >
                                    <Upload className="h-4 w-4 text-muted-foreground" />
                                  </Label>
                                  <Input
                                    id={`file-${row.internalId}`}
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) =>
                                      e.target.files?.[0] &&
                                      handleImageUpload(
                                        row.internalId,
                                        e.target.files[0]
                                      )
                                    }
                                  />
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-right font-bold text-sm flex items-center justify-end gap-2">


                          {/* {row.amount.toFixed(0)} */}
                          <Input
                            type="number"
                            className="h-8 px-1 font-bold text-sm text-primary"
                            value={row.amount}
                            onChange={(e) =>
                              updateRow(
                                row.internalId,
                                "amount",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />

                        </div>
                      </TableCell>
                      <TableCell className="flex justify-end">
                        <Checkbox
                          className="mr-4"
                          checked={payNowForAll ? true : row.payNow}
                          disabled={row.productId === 0}
                          onCheckedChange={(checked) =>
                            updateRow(row.internalId, "payNow", checked)
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <div className="flex gap-1">
                          {row.productId !== 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-500 hover:bg-blue-50"
                              title="Duplicate"
                              onClick={() => duplicateRow(row)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                            onClick={() => removeRow(row.internalId)}
                            // Prevent deleting the only row if it's the last empty one, unless explicit intention
                            disabled={rows.length === 1 && row.productId === 0}
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 bg-muted/20 border-t flex flex-col justify-center items-end gap-4">
              <div className="text-xl font-bold">
                Grand Total:{" "}
                <span className="text-primary">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
              <span className="flex gap-2 flex-row">
                <Checkbox id="payNowForAll"
                  checked={payNowForAll}
                  onCheckedChange={(checked) => setPayNowForAll(checked as boolean)}
                />
                <Label htmlFor="payNowForAll">
                  Fully Paid
                </Label>
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pb-10">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              rows.filter((r) => r.productId !== 0).length === 0
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              "Submit Ledger Entry"
            )}
          </Button>
        </div>
      </div>

      {/* Image Preview & Delete Modal */}
      <Dialog
        open={!!previewImage}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4 bg-muted/10 rounded-md">
            {previewImage && (
              <img
                src={previewImage.url}
                alt="Preview"
                className="max-h-[400px] w-auto object-contain rounded-md"
              />
            )}
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setPreviewImage(null)}>
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                previewImage &&
                handleDeleteImage(previewImage.internalId, previewImage.url)
              }
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Navigation Guard Dialog (Save Draft?) */}
      <Dialog open={showSaveDraftDialog} onOpenChange={handleCancelNavigation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Unsaved Changes
            </DialogTitle>
            <DialogDescription className="text-gray-800">
              You have unsaved changes in this ledger entry. If you leave now,
              your progress will be lost.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm">
            Would you like to save this as a draft to finish later?
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="destructive" onClick={handleDiscardAndExit}>
              No, Discard & Exit
            </Button>
            <Button onClick={handleSaveDraft} className="gap-2">
              <Save className="h-4 w-4" /> Yes, Save Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Draft Dialog (On Mount) */}
      <Dialog
        open={showRestoreDialog}
        onOpenChange={(open) => !open && handleDiscardDraftOnStart()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5 text-blue-500" />
              Restore Draft?
            </DialogTitle>
            <DialogDescription>
              We found an unfinished ledger entry saved on{" "}
              {draftToRestore &&
                new Date(draftToRestore.savedAt).toLocaleDateString()}
              .
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            Would you like to continue where you left off?
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleDiscardDraftOnStart}>
              Discard Draft
            </Button>
            <Button onClick={handleRestoreDraft}>Restore</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
