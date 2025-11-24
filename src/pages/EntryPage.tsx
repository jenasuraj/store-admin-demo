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
  ArrowLeft,
  Loader2,
  Eye,
  Trash2,
  Copy,
  Save,
  AlertTriangle,
  ShoppingBasket,
  Info,
} from "lucide-react";
import { useNavigate, useBlocker } from "react-router-dom"; // Added useBlocker
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchCustomers } from "@/app/customerSlice";
import {
  fetchLedgerProducts,
  resetProductList,
  ledgerProductsDataType,
} from "@/app/ledgerProductsSlice";
import { toast } from "sonner";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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
  date: string;
  productId: number;
  productName: string;
  defaultSku: string;

  width: number;
  height: number;
  sqft: number;

  basePrice: number;
  ratePerPiece: number;

  quantity: number;
  extraCharge: number;
  amount: number;

  location: string;
  imageUrl: string;
  isUploading?: boolean;
}

// Interface for Draft Data in LocalStorage
interface DraftData {
  selectedCustomerId: string;
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
  // Sending URL or ID to delete
  await axios.delete(`${BASE_URL}/api/user/delete-blob?url=${imageUrl}`);
};

// --- Components ---

// 1. Multi-Select Combobox
function MultiSelectCombobox({
  items,
  selectedProductIds,
  onToggle,
  priceListMap,
  searchTerm,
  setSearchTerm,
  loading,
  hasMore,
  onLoadMore,
}: {
  items: ledgerProductsDataType[];
  selectedProductIds: number[];
  onToggle: (product: ledgerProductsDataType) => void;
  priceListMap: Record<number, number>;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: (node: HTMLDivElement) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between text-left font-normal h-auto min-h-[30px]"
        >
          <div className="flex flex-wrap gap-1">
            {selectedProductIds.length > 0 ? (
              <span className="py-0">
                {selectedProductIds.length} products selected
              </span>
            ) : (
              <span className="text-muted-foreground py-0">
                Search & Select Products...
              </span>
            )}
          </div>
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="start">
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
                const isSelected = selectedProductIds.includes(item.productId);
                const isSpecial = priceListMap.hasOwnProperty(item.productId);
                const price = isSpecial
                  ? priceListMap[item.productId]
                  : item.attributes?.[0]?.price ?? 0;

                return (
                  <CommandItem
                    key={item.productId}
                    value={item.name}
                    onSelect={() => onToggle(item)}
                  >
                    <div className="flex items-center w-full">
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="flex items-center gap-2 font-medium">
                          {item.name}
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

// 2. Customer Combobox
function CustomerCombobox({
  customers,
  selectedCustomerId,
  onSelect,
}: {
  customers: any[];
  selectedCustomerId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedCustomer = customers.find(
    (c) => (c.id || c.customerId).toString() === selectedCustomerId
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCustomer
            ? `${selectedCustomer.firstname} ${selectedCustomer.lastname || ""}`
            : "Select customer..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] sm:w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search customer..." />
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
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [rows, setRows] = useState<LedgerRowItem[]>([]);
  const [priceList, setPriceList] = useState<CustomerPriceList | null>(null);
  const [isLoadingPriceList, setIsLoadingPriceList] = useState(false);
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

  // --- 1. Check for Draft on Mount ---
  useEffect(() => {
    const savedDraft = localStorage.getItem("ledger_draft");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft) as DraftData;
        // Validate basic structure
        if (
          parsed.selectedCustomerId ||
          (parsed.rows && parsed.rows.length > 0)
        ) {
          setDraftToRestore(parsed);
          setShowRestoreDialog(true);
        }
      } catch (e) {
        console.error("Failed to parse draft", e);
        localStorage.removeItem("ledger_draft");
      }
    }
    dispatch(fetchCustomers());
  }, [dispatch]);

  // --- 2. Browser Refresh Protection (beforeunload) ---
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (selectedCustomerId || rows.length > 0) {
        e.preventDefault();
        e.returnValue = ""; // Standard browser behavior triggers a generic warning
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [selectedCustomerId, rows]);

  // --- 3. Internal Navigation Blocking (useBlocker) ---
  // Detects if user tries to navigate via React Router while form is dirty
  const isDirty = selectedCustomerId !== "" || rows.length > 0;

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
      selectedCustomerId,
      rows,
      savedAt: Date.now(),
    };
    localStorage.setItem("ledger_draft", JSON.stringify(draftData));
    toast.success("Progress saved as draft");

    // If triggered by navigation blocker
    if (blocker.state === "blocked") {
      blocker.proceed();
    }
    setShowSaveDraftDialog(false);
  };

  const handleDiscardAndExit = async () => {
    // 1. Delete images from server (Cleanup)
    const deletePromises = rows
      .filter((r) => r.imageUrl && r.imageUrl.startsWith("http")) // Simple check for valid URL
      .map((r) => deleteImageAPI(r.imageUrl));

    if (deletePromises.length > 0) {
      toast.info(`Cleaning up ${deletePromises.length} uploaded images...`);
      try {
        await Promise.all(deletePromises);
      } catch (error) {
        console.error("Failed to clean up images", error);
      }
    }

    // 2. Clear local storage if any
    // localStorage.removeItem('ledger_draft'); // Requirement implies "reset the form", optional if we want to kill old drafts too

    // 3. Reset Form (State)
    setSelectedCustomerId("");
    setRows([]);

    // 4. Proceed with navigation
    if (blocker.state === "blocked") {
      blocker.proceed();
    }
    setShowSaveDraftDialog(false);
  };

  const handleCancelNavigation = () => {
    if (blocker.state === "blocked") {
      blocker.reset();
    }
    setShowSaveDraftDialog(false);
  };

  const handleRestoreDraft = () => {
    if (draftToRestore) {
      setSelectedCustomerId(draftToRestore.selectedCustomerId);
      setRows(draftToRestore.rows);
      toast.success("Draft restored");
    }
    setShowRestoreDialog(false);
  };

  const handleDiscardDraftOnStart = () => {
    localStorage.removeItem("ledger_draft");
    setDraftToRestore(null);
    setShowRestoreDialog(false);
    toast.info("Draft discarded");
  };

  // --- Fetch Price List ---
  useEffect(() => {
    if (!selectedCustomerId) {
      setPriceList(null);
      return;
    }
    const fetchPriceList = async () => {
      setIsLoadingPriceList(true);
      try {
        const response = await axios.get(
          `${BASE_URL}/api/pricelist/${selectedCustomerId}`
        );
        if (Array.isArray(response.data) && response.data.length > 0) {
          setPriceList(response.data[0]);
          toast.success(`Applied: ${response.data[0].name}`);
        } else {
          setPriceList(null);
        }
      } catch (error) {
        setPriceList(null);
      } finally {
        setIsLoadingPriceList(false);
      }
    };
    fetchPriceList();
  }, [selectedCustomerId]);

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

  const handleProductToggle = (product: ledgerProductsDataType) => {
    const existingRows = rows.filter((r) => r.productId === product.productId);

    if (existingRows.length > 0) {
      // Deselect: Remove all rows for this product
      // (If user wants to keep one but remove others, they should use the X button on the row)
      setRows((prev) => prev.filter((r) => r.productId !== product.productId));
    } else {
      // Select: Add new row
      addRow(product);
    }
  };

  const addRow = (product: ledgerProductsDataType) => {
    const basePrice =
      priceListMap[product.productId] ?? product.attributes?.[0]?.price ?? 0;
    const width = 1,
      height = 1,
      sqft = 1;

    const newRow: LedgerRowItem = {
      internalId: Math.random().toString(36).substr(2, 9),
      date: format(new Date(), "yyyy-MM-dd"),
      productId: product.productId,
      productName: product.name,
      defaultSku: product.defaultSku,
      width,
      height,
      sqft,
      basePrice,
      ratePerPiece: basePrice * sqft,
      quantity: 1,
      extraCharge: 0,
      amount: basePrice * sqft,
      location: "",
      imageUrl: "",
    };
    setRows((prev) => [...prev, newRow]);
  };

  const duplicateRow = (row: LedgerRowItem) => {
    const newRow = {
      ...row,
      internalId: Math.random().toString(36).substr(2, 9),
    };
    setRows((prev) => [...prev, newRow]);
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

        // Calculations
        if (
          [
            "width",
            "height",
            "sqft",
            "basePrice",
            "ratePerPiece",
            "quantity",
            "extraCharge",
          ].includes(field)
        ) {
          if (field === "width" || field === "height") {
            updated.sqft = parseFloat(
              (updated.width * updated.height).toFixed(2)
            );
          }
          if (["width", "height", "sqft", "basePrice"].includes(field)) {
            updated.ratePerPiece = parseFloat(
              (updated.sqft * updated.basePrice).toFixed(2)
            );
          }
          updated.amount = parseFloat(
            (
              updated.ratePerPiece * updated.quantity +
              updated.extraCharge
            ).toFixed(2)
          );
        }
        return updated;
      })
    );
  };

  const removeRow = (internalId: string) => {
    setRows((prev) => prev.filter((r) => r.internalId !== internalId));
  };

  // --- Image API Handling ---

  const handleImageUpload = async (internalId: string, file: File) => {
    // Set loading state for this row (optional UI enhancement)
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
    if (!selectedCustomerId) return toast.error("Select a customer");
    if (rows.length === 0) return toast.error("Add items to ledger");

    const payload = {
      customerId: parseInt(selectedCustomerId),
      paymentStatus: "PENDING",
      totalAmount: rows.reduce((sum, r) => sum + r.amount, 0),
      items: rows.map((r) => ({
        date: r.date,
        productId: r.productId,
        height: r.height,
        width: r.width,
        sqft: r.sqft,
        basePrice: r.basePrice,
        ratePerPiece: r.ratePerPiece,
        quantity: r.quantity,
        location: r.location || "",
        imageUrl: r.imageUrl || "",
        extraCharge: r.extraCharge,
        amount: r.amount,
      })),
    };

    try {
      const res = await axios.post(`${BASE_URL}/api/ledger/create`, payload);
      if (res.status === 200 || res.status === 201) {
        toast.success("Ledger entry created!");
        // Clear draft if successful
        localStorage.removeItem("ledger_draft");
        // Manually reset form before navigation to avoid blocker
        setSelectedCustomerId("");
        setRows([]);
        setTimeout(() => navigate("/ledger-sheet"), 1000);
      }
    } catch (e) {
      toast.error("Failed to create entry");
    }
  };

  const grandTotal = rows.reduce((sum, r) => sum + r.amount, 0);

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Create Ledger Entry
            </h1>
            <p className="text-muted-foreground text-sm">New sales entry</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 grid gap-6 md:grid-cols-2 items-end">
            <div className="flex flex-col gap-2">
              <Label>Customer</Label>
              <CustomerCombobox
                customers={customers}
                selectedCustomerId={selectedCustomerId}
                onSelect={setSelectedCustomerId}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Add Products</Label>
              <MultiSelectCombobox
                items={products}
                selectedProductIds={rows.map((r) => r.productId)}
                onToggle={handleProductToggle}
                priceListMap={priceListMap}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                loading={fetchingProducts}
                hasMore={hasMore}
                onLoadMore={lastElementRef}
              />
            </div>
          </CardContent>
        </Card>

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

        {rows.length > 0 ? (
          <Card>
            <CardContent className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[130px]">Date</TableHead>
                      <TableHead className="min-w-[120px]">Product</TableHead>
                      <TableHead className="min-w-[100px]">Width</TableHead>
                      <TableHead className="min-w-[100px]">Height</TableHead>
                      <TableHead className="min-w-[100px]">SqFt</TableHead>
                      <TableHead className="min-w-[100px]">Rate</TableHead>
                      <TableHead className="min-w-[100px]">1pc Rate</TableHead>
                      <TableHead className="min-w-[100px]">Qty</TableHead>
                      <TableHead className="min-w-[130px]">
                        Extra Charges
                      </TableHead>
                      <TableHead className="min-w-[120px]">Location</TableHead>
                      <TableHead className="min-w-[60px]">Image</TableHead>
                      <TableHead className="min-w-[100px] text-right">
                        Amount
                      </TableHead>
                      <TableHead className="min-w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.internalId}>
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
                          <div className="flex flex-col">
                            <span
                              className="font-medium text-sm truncate max-w-[150px]"
                              title={row.productName}
                            >
                              {row.productName}
                            </span>
                            {priceListMap[row.productId] !== undefined && (
                              <span className="text-[10px] text-green-600">
                                Special Price
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            className="h-8 px-1"
                            value={row.width}
                            onChange={(e) =>
                              updateRow(
                                row.internalId,
                                "width",
                                parseFloat(e.target.value)
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
                            onChange={(e) =>
                              updateRow(
                                row.internalId,
                                "height",
                                parseFloat(e.target.value)
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
                            onChange={(e) =>
                              updateRow(
                                row.internalId,
                                "sqft",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            className="h-8 px-1"
                            value={row.basePrice}
                            onChange={(e) =>
                              updateRow(
                                row.internalId,
                                "basePrice",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            className="h-8 px-1 font-medium text-blue-600"
                            value={row.ratePerPiece}
                            onChange={(e) =>
                              updateRow(
                                row.internalId,
                                "ratePerPiece",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="h-8 px-1"
                            min={1}
                            value={row.quantity}
                            onChange={(e) =>
                              updateRow(
                                row.internalId,
                                "quantity",
                                parseFloat(e.target.value)
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
                            onChange={(e) =>
                              updateRow(
                                row.internalId,
                                "extraCharge",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="h-8 px-1"
                            value={row.location}
                            onChange={(e) =>
                              updateRow(
                                row.internalId,
                                "location",
                                e.target.value
                              )
                            }
                          />
                        </TableCell>

                        {/* Image Upload */}
                        <TableCell>
                          <div className="flex justify-center items-center">
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
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-right font-bold text-sm">
                            {row.amount.toFixed(0)}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-500 hover:bg-blue-50"
                              title="Duplicate"
                              onClick={() => duplicateRow(row)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                              onClick={() => removeRow(row.internalId)}
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
              <div className="p-4 bg-muted/20 border-t flex justify-end items-center gap-4">
                <div className="text-xl font-bold">
                  Grand Total:{" "}
                  <span className="text-primary">
                    {grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[400px] bg-muted/5 animate-in fade-in-50">
            <div className="bg-background p-4 rounded-full mb-4 shadow-sm ring-1 ring-border">
              <Info className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">
              Start Adding Products
            </h3>
            <p className="text-muted-foreground max-w-sm mt-2 text-sm">
              Your ledger entry is currently empty. Use the{" "}
              <strong>Add Products</strong> search bar above to select items and
              populate this table.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-4 pb-10">
          <Button variant="outline" size="lg" onClick={() => navigate("/")}>
            Cancel
          </Button>
          <Button size="lg" onClick={handleSubmit} disabled={rows.length === 0}>
            Submit Ledger Entry
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
