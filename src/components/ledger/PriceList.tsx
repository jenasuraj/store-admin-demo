import { useState, useEffect, useRef, useCallback, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2, Plus, Check, Loader2, Search, Edit } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  createPriceList,
  fetchPriceLists,
  deletePriceList,
  updatePriceList,
  PriceList as PriceListType,
} from "@/app/priceListSlice";
import { fetchCustomers } from "@/app/customerSlice";
import { useSearchParams } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  fetchLedgerProducts,
  resetProductList,
  ledgerProductsDataType,
} from "@/app/ledgerProductsSlice";

// --- Types & Interfaces ---
interface SelectedProduct {
  productId: number;
  name: string;
  defaultSku?: string;
  customPrice: number;
  basePrice: number;
}

const priceListSchema = z.object({
  name: z.string().min(1, "Price list name is required"),
  userId: z.coerce.number().min(1, "User is required"),
});

type PriceListFormValues = z.infer<typeof priceListSchema>;

// ------------------------------------------------------------------
// PARENT WRAPPER: PriceListManager
// ------------------------------------------------------------------
export default function PriceListManager() {
  const [editingList, setEditingList] = useState<PriceListType | null>(null);
  const [formKey, setFormKey] = useState(0);

  // Ref to the form card
  const formRef = useRef<HTMLDivElement>(null);

  const handleEdit = (list: PriceListType) => {
    setEditingList(list);
    setFormKey((prev) => prev + 1);

    // Scroll to form after render
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
      // Optional: uncomment if you have a fixed header
      // window.scrollBy(0, -80);
    }, 100);
  };

  const handleSaveOrCancel = () => {
    setEditingList(null);
    setFormKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-8">
      <PriceListForm
        key={formKey}
        ref={formRef} // Pass the ref
        initialData={editingList}
        onSave={handleSaveOrCancel}
        onCancel={handleSaveOrCancel}
      />
      <PriceListsDisplay onEdit={handleEdit} />
    </div>
  );
}

// ------------------------------------------------------------------
// COMPONENT: PriceListForm (with forwardRef)
// ------------------------------------------------------------------
interface PriceListFormProps {
  onSave: () => void;
  onCancel: () => void;
  initialData?: PriceListType | null;
}

const PriceListForm = forwardRef<HTMLDivElement, PriceListFormProps>(
  ({ onSave, onCancel, initialData }, ref) => {
    const dispatch = useAppDispatch();

    const { loading: submitting } = useAppSelector((state) => state.priceList);
    const { customers } = useAppSelector((state) => state.customer);
    const {
      infiniteList: products,
      hasMore,
      loading: fetchingProducts,
      currentPage,
      isSearching,
    } = useAppSelector((state) => state.ledgerProducts);

    const [showForm, setShowForm] = useState(!!initialData);
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
    const [openUserCombo, setOpenUserCombo] = useState(false);
    const [openProductCombo, setOpenProductCombo] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [searchParams] = useSearchParams();
    const observer = useRef<IntersectionObserver | null>(null);

    const form = useForm<PriceListFormValues>({
      resolver: zodResolver(priceListSchema),
      defaultValues: {
        name: initialData?.name || "",
        userId: initialData?.userid || 0,
      },
    });

    useEffect(() => {
      if (initialData) {
        setShowForm(true);
        const mappedProducts: SelectedProduct[] = initialData.productPrices.map(
          (p) => ({
            productId: p.productId,
            name: p.productName,
            customPrice: p.price,
            basePrice: p.basePrice,
            defaultSku: "N/A",
          })
        );
        setSelectedProducts(mappedProducts);

        form.setValue("name", initialData.name);
        form.setValue("userId", initialData.userid);
      } else {
        dispatch(fetchCustomers());
      }
    }, [initialData, form, dispatch]);

    useEffect(() => {
      if (!initialData) {
        const userIdParam = searchParams.get("userId");
        if (userIdParam && customers.length > 0) {
          const userExists = customers.find(
            (c) =>
              c.id.toString() === userIdParam ||
              c.customerId.toString() === userIdParam
          );
          if (userExists) {
            form.setValue(
              "userId",
              Number(userExists.id || userExists.customerId)
            );
            setShowForm(true);
          }
        }
      }
    }, [searchParams, customers, form, initialData]);

    useEffect(() => {
      const timer = setTimeout(() => {
        if (openProductCombo) {
          dispatch(
            fetchLedgerProducts({
              page: 0,
              size: 10,
              search: searchTerm,
            })
          );
        }
      }, 500);
      return () => clearTimeout(timer);
    }, [searchTerm, openProductCombo, dispatch]);

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

    const handleSelectProduct = (product: ledgerProductsDataType) => {
      const exists = selectedProducts.find(
        (p) => p.productId === product.productId
      );
      if (exists) {
        setSelectedProducts((prev) =>
          prev.filter((p) => p.productId !== product.productId)
        );
      } else {
        const basePrice = product.attributes?.[0]?.price || 0;
        setSelectedProducts((prev) => [
          ...prev,
          {
            productId: product.productId,
            name: product.name,
            defaultSku: product.defaultSku,
            basePrice: basePrice,
            customPrice: basePrice,
          },
        ]);
      }
    };

    const handlePriceChange = (productId: number, newPrice: string) => {
      const priceValue = parseFloat(newPrice);
      setSelectedProducts((prev) =>
        prev.map((p) =>
          p.productId === productId
            ? { ...p, customPrice: isNaN(priceValue) ? 0 : priceValue }
            : p
        )
      );
    };

    const onSubmit = async (data: PriceListFormValues) => {
      if (selectedProducts.length === 0) {
        alert("Please select at least one product.");
        return;
      }

      const payloadData = {
        name: data.name,
        userId: data.userId,
        productPrices: selectedProducts.map((p) => ({
          productId: p.productId,
          price: p.customPrice,
        })),
      };

      let resultAction;
      if (initialData) {
        resultAction = await dispatch(
          updatePriceList({
            id: initialData.id,
            data: payloadData,
          })
        );
      } else {
        resultAction = await dispatch(createPriceList(payloadData));
      }

      if (
        createPriceList.fulfilled.match(resultAction) ||
        updatePriceList.fulfilled.match(resultAction)
      ) {
        form.reset();
        setSelectedProducts([]);
        setSearchTerm("");
        setShowForm(false);
        onSave();
      }
    };

    if (!showForm) {
      return (
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create New Price List
        </Button>
      );
    }

    return (
      <Card ref={ref} className="w-full border-2 border-muted/40">
        <CardHeader>
          <CardTitle>
            {initialData
              ? `Edit Price List: ${initialData.name}`
              : "Create Custom Price List"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price List Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Wholesale Pricing" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem className="flex mt-2.5 flex-col">
                      <FormLabel>Customer</FormLabel>
                      <Popover
                        open={openUserCombo}
                        onOpenChange={setOpenUserCombo}
                        modal={false}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? customers.find(
                                    (c) =>
                                      (c.id || c.customerId) ==
                                      field.value.toString()
                                  )?.firstname ||
                                  (initialData ? "Selected User" : "Unknown User")
                                : "Select customer"}
                              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] sm:w-[400px] p-0">
                          <Command>
                            <CommandInput placeholder="Search customer..." />
                            <CommandList>
                              <CommandEmpty>No customer found.</CommandEmpty>
                              <CommandGroup>
                                {customers.map((customer) => (
                                  <CommandItem
                                    value={customer.firstname}
                                    key={customer.id || customer.customerId}
                                    onSelect={() => {
                                      form.setValue(
                                        "userId",
                                        Number(customer.id || customer.customerId)
                                      );
                                      setOpenUserCombo(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        (customer.id || customer.customerId) ==
                                          field.value.toString()
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {customer.firstname}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Product Selection */}
              <div className="space-y-2">
                <Label>Select Products</Label>
                <Popover
                  open={openProductCombo}
                  onOpenChange={(open) => {
                    setOpenProductCombo(open);
                    if (!open) {
                      dispatch(resetProductList());
                      setSearchTerm("");
                    }
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between text-left font-normal"
                    >
                      <span className="truncate">
                        {selectedProducts.length > 0
                          ? `${selectedProducts.length} products selected`
                          : "Search and select products..."}
                      </span>
                      <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[600px] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search products..."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                      />
                      <CommandList className="max-h-[300px] overflow-y-auto">
                        {fetchingProducts && currentPage === 0 ? (
                          <div className="p-4 text-center flex justify-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />{" "}
                            Loading...
                          </div>
                        ) : (
                          products.length === 0 && (
                            <CommandEmpty>No products found.</CommandEmpty>
                          )
                        )}

                        <CommandGroup>
                          {products.map((product) => {
                            const isSelected = selectedProducts.some(
                              (p) => p.productId === product.productId
                            );
                            return (
                              <CommandItem
                                key={product.productId}
                                value={product.name}
                                onSelect={() => handleSelectProduct(product)}
                              >
                                <div className="flex items-center w-full cursor-pointer">
                                  <div
                                    className={cn(
                                      "mr-3 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                      isSelected
                                        ? "bg-primary text-primary-foreground"
                                        : "opacity-50 [&_svg]:invisible"
                                    )}
                                  >
                                    <Check className="h-3 w-3" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {product.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      SKU: {product.defaultSku} | Base: ₹
                                      {product.attributes?.[0]?.price ?? "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>

                        {!isSearching && hasMore && (
                          <div
                            ref={lastElementRef}
                            className="p-2 flex justify-center items-center w-full h-8"
                          >
                            {fetchingProducts && (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Table */}
              {selectedProducts.length > 0 && (
                <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Product Name</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Base Price</TableHead>
                        <TableHead className="w-[140px]">Special Price</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedProducts.map((product) => (
                        <TableRow key={product.productId}>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {product.defaultSku}
                          </TableCell>
                          <TableCell>₹{product.basePrice.toFixed(2)}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={product.customPrice}
                              onChange={(e) =>
                                handlePriceChange(
                                  product.productId,
                                  e.target.value
                                )
                              }
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setSelectedProducts((prev) =>
                                  prev.filter(
                                    (p) => p.productId !== product.productId
                                  )
                                )
                              }
                              className="text-red-500 hover:bg-red-50 h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedProducts([]);
                    onCancel();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {submitting
                    ? initialData
                      ? "Updating..."
                      : "Creating..."
                    : initialData
                    ? "Update Price List"
                    : "Create Price List"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }
);

PriceListForm.displayName = "PriceListForm";

// ------------------------------------------------------------------
// COMPONENT: PriceListsDisplay
// ------------------------------------------------------------------
interface PriceListsDisplayProps {
  onEdit?: (list: PriceListType) => void;
}

export function PriceListsDisplay({ onEdit }: PriceListsDisplayProps) {
  const dispatch = useAppDispatch();
  const { priceLists, loading } = useAppSelector((state) => state.priceList);

  useEffect(() => {
    dispatch(fetchPriceLists());
  }, [dispatch]);

  if (loading && priceLists.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading price lists...
      </div>
    );
  }

  if (priceLists.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center py-8">
            No price lists created yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      <h3 className="text-lg font-semibold">Existing Price Lists</h3>
      {priceLists.map((list) => (
        <Card key={list.id} className="overflow-hidden">
          <CardHeader className="bg-muted/20 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{list.name} for {list.firstname}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Customer ID: {list.userid} • {list.productPrices?.length}{" "}
                  Products
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => onEdit && onEdit(list)}
                  disabled={!onEdit}
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    if (confirm("Delete this price list?")) {
                      dispatch(deletePriceList(list.id.toString()));
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="border-t">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/10">
                    <TableHead>Product Name</TableHead>
                    <TableHead>Base Price</TableHead>
                    <TableHead>Special Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.productPrices?.map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell className="font-medium">
                        {product.productName}
                      </TableCell>
                      <TableCell>₹{product.basePrice.toFixed(2)}</TableCell>
                      <TableCell className="font-bold text-green-600">
                        ₹{product.price.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!list.productPrices || list.productPrices.length === 0) && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground py-4"
                      >
                        No products in this list
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}