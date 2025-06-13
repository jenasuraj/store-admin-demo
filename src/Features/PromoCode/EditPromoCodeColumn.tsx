"use client";

import { FaEdit } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import type { Promo } from "./type";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchProductAsync, selectProductEntity } from "@/app/ProductSlice";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { Switch } from "@/components/ui/switch";
import { fetchDiscountAsync } from "@/app/DiscountSlice";
import { fetchPromoAsync } from "@/app/PromoSlice";

// Define the form schema
type FormSchema = z.infer<typeof formSchema>;

const formSchema = z.object({
  discountType: z.enum(["DISCOUNT", "PROMOCODE"]),
  discountName: z.string(),
  description: z.string(),
  valueType: z.enum(["PERCENTAGE", "AMOUNT"]),
  value: z.string().min(1, { message: "Value is mandatory" }),
  minimumAmount: z.string(),
  appliesTo: z.string(),
  products: z
    .array(
      z.object({
        productId: z.string(),
        sku: z.string(),
        selected: z.boolean().default(false),
      })
    )
    .optional(),
  isVisible: z.boolean(),
  startDate: z.string().min(1, { message: "Start Date is required" }),
  startTime: z.string().min(1, { message: "Start Time is required" }),
  hasEndDate: z.boolean().default(false),
  endDate: z.string(),
  endTime: z.string(),
  status: z.boolean().default(false),
});

// Update the Product and DiscountDetails interfaces to match the provided types
interface ProductSku {
  productId: number;
  skus: string[];
}

interface Product {
  productId: number;
  tags: string | null;
  defaultSku: string;
  name: string;
  subheading: string;
  description: string;
  groupCompanyId: number;
  companyId: number;
  locationId: number;
  branchId: number;
  createdDate: string;
  productType: {
    id: number;
    productType: string;
    groupCompanyId: number;
    companyId: number;
    categoryMappingId: number;
  };
  productTypeId: string;
  productTypeName: string;
  attributes: {
    imgs: {
      img_Id: number;
      img_url: string;
      img_name: string;
      img_type: string;
    }[];
    size: string;
    color: string;
    price: number;
    sku: string;
    variation_id: number;
    quantity: number;
    fit: string;
    pattern: string;
  }[];
}

interface SkuDetails {
  sku: string;
  imgs: {
    img_Id: string;
    img_url: string;
    img_name: string;
    img_type: string;
  }[];
  size: string;
  fit: string;
  color: string;
  price: string;
  keyName: string;
  pattern: string;
  quantity: string;
}

interface DiscountDetails {
  id: string;
  sku: string;
  productId: string;
  productName: string;
  skuDetails: SkuDetails;
}

interface EditPromoCodeProps {
  promo: Promo;
}

export function EditPromoCode({ promo }: EditPromoCodeProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSkus, setSelectedSkus] = useState<Record<number, string[]>>(
    {}
  );
  const [initialSelectedSkus, setInitialSelectedSkus] = useState<
    Record<number, string[]>
  >({});
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const dispatch = useAppDispatch();
  const productList = useAppSelector(selectProductEntity);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      discountType: "DISCOUNT",
      discountName: promo.promoName || "",
      description: promo.description || "",
      valueType: promo.valueType as "PERCENTAGE" | "AMOUNT",
      minimumAmount: "",
      value: promo.value.toString(),
      appliesTo: promo.promoOn as "PRODUCT" | "COLLECTION",
      products: [],
      startDate: promo.startDate,
      isVisible: false,
      startTime: promo.startTime,
      hasEndDate: !!promo.endDate,
      endDate: promo.endDate || "",
      endTime: promo.endTime || "",
      status: promo.status,
    },
  });

  const setData = () => {
    form.setValue("discountType", "DISCOUNT");
    form.setValue("minimumAmount", `${promo.minimumAmount}`);
    form.setValue("appliesTo", promo.promoOn);
    form.setValue("isVisible", promo.isVisible);
  };

  // Update the fetchProductSkus function to handle the new DiscountDetails structure
  const fetchProductSkus = async () => {
    try {
      setIsLoading(true);
      // Fetch the products with SKUs that are currently associated with the discount
      const res = await axios.get(`${BASE_URL}/api/promo/skus/${promo.id}`);

      // Transform the data to the required format for tracking selected SKUs
      const skusByProduct: Record<number, string[]> = {};
      res.data.content.forEach((item: DiscountDetails) => {
        const productId = Number.parseInt(item.productId);
        if (!skusByProduct[productId]) {
          skusByProduct[productId] = [];
        }
        skusByProduct[productId].push(item.sku);
      });

      setSelectedSkus(skusByProduct);
      setInitialSelectedSkus(JSON.parse(JSON.stringify(skusByProduct))); // Deep copy for comparison later

      // Fetch first page of products
      dispatch(fetchProductAsync(`?page=0`));
    } catch (error) {
      toast.error("Failed to fetch product SKUs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      !promo.selectAll && fetchProductSkus();
      setCurrentPage(0);
    }
  }, [open, promo.id]);

  useEffect(() => {
    if (productList) {
      setTotalPages(productList.totalPages);
    }
  }, [productList]);

  useEffect(() => {
    if (open) {
      dispatch(fetchProductAsync(`?page=${currentPage}`));
    }
  }, [currentPage, dispatch, open]);

  const handleSkuChange = (
    productId: number,
    sku: string,
    checked: boolean
  ) => {
    setSelectedSkus((prev) => {
      const newSelectedSkus = { ...prev };

      if (!newSelectedSkus[productId]) {
        newSelectedSkus[productId] = [];
      }

      if (checked) {
        newSelectedSkus[productId] = [...newSelectedSkus[productId], sku];
      } else {
        newSelectedSkus[productId] = newSelectedSkus[productId].filter(
          (s) => s !== sku
        );

        // If no SKUs are selected for this product, remove the product entry
        if (newSelectedSkus[productId].length === 0) {
          delete newSelectedSkus[productId];
        }
      }

      return newSelectedSkus;
    });
  };

  // Update the handleSelectAllSkus function to work with the new Product structure
  const handleSelectAllSkus = (productId: number, checked: boolean) => {
    setSelectedSkus((prev) => {
      const newSelectedSkus = { ...prev };

      if (checked) {
        // Find all SKUs for this product
        const product = productList?.content.find(
          (p) => p.productId === productId
        );
        if (product) {
          newSelectedSkus[productId] = product.attributes.map(
            (attr) => attr.sku
          );
        }
      } else {
        // Remove all SKUs for this product
        delete newSelectedSkus[productId];
      }

      return newSelectedSkus;
    });
  };

  const isProductSelected = (productId: number) => {
    return !!selectedSkus[productId] && selectedSkus[productId].length > 0;
  };

  // Update the isAllSkusSelected function to work with the new Product structure
  const isAllSkusSelected = (productId: number) => {
    const product = productList?.content.find((p) => p.productId === productId);
    if (!product || !selectedSkus[productId]) return false;

    return product.attributes.length === selectedSkus[productId].length;
  };

  const isSkuSelected = (productId: number, sku: string) => {
    return !!selectedSkus[productId] && selectedSkus[productId].includes(sku);
  };

  const getAddedSkus = () => {
    const addedSkus: ProductSku[] = [];

    Object.entries(selectedSkus).forEach(([productId, skus]) => {
      const productIdNum = Number(productId);

      // Find SKUs that were not in the initial selection
      const newSkus = skus.filter(
        (sku) =>
          !initialSelectedSkus[productIdNum] ||
          !initialSelectedSkus[productIdNum].includes(sku)
      );

      if (newSkus.length > 0) {
        addedSkus.push({
          productId: productIdNum,
          skus: newSkus,
        });
      }
    });

    return addedSkus;
  };

  const getRemovedSkus = () => {
    const removedSkus: ProductSku[] = [];

    Object.entries(initialSelectedSkus).forEach(([productId, skus]) => {
      const productIdNum = Number(productId);

      // Find SKUs that were in the initial selection but are no longer selected
      const removedSkusList = skus.filter(
        (sku) =>
          !selectedSkus[productIdNum] ||
          !selectedSkus[productIdNum].includes(sku)
      );

      if (removedSkusList.length > 0) {
        removedSkus.push({
          productId: productIdNum,
          skus: removedSkusList,
        });
      }
    });

    return removedSkus;
  };

  // Update the onSubmit function to handle the new structure
  const onSubmit = async (data: FormSchema) => {
    try {
      setIsLoading(true);

      // Get added and removed SKUs for the payload
      const addedSkus = getAddedSkus();
      const removedSkus = getRemovedSkus();

      const payload = {
        id: promo.id,
        promoName: data.discountName,
        description: data.description,
        valueType: data.valueType,
        value: Number.parseFloat(data.value),
        minimumAmount: +data.minimumAmount,
        isVisible: data.isVisible,
        startDate: data.startDate,
        startTime: data.startTime,
        endDate: data.hasEndDate ? data.endDate : null,
        endTime: data.hasEndDate ? data.endTime : null,
        status: data.status,
        promoOn: data.appliesTo,
        selectAll: promo.selectAll,
        productSkus: addedSkus,
        removeProductSkus: removedSkus,
      };

      await axios.post(`${BASE_URL}/api/promoCode/update`, payload);
      toast.success("PromoCode updated successfully");
      setOpen(false);
      dispatch(fetchPromoAsync(""));
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update discount"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderPagination = () => {
    if (!totalPages || totalPages <= 1) return null;

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </PaginationItem>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show current page and 2 pages before and after
            let pageToShow;
            if (totalPages <= 5) {
              pageToShow = i;
            } else {
              const start = Math.max(
                0,
                Math.min(currentPage - 2, totalPages - 5)
              );
              pageToShow = start + i;
            }

            return (
              <PaginationItem key={pageToShow}>
                <PaginationLink
                  isActive={currentPage === pageToShow}
                  onClick={() => setCurrentPage(pageToShow)}
                >
                  {pageToShow + 1}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {totalPages > 5 && currentPage < totalPages - 3 && (
            <PaginationItem>
              <span className="px-2">...</span>
            </PaginationItem>
          )}

          {totalPages > 5 && currentPage < totalPages - 3 && (
            <PaginationItem>
              <PaginationLink onClick={() => setCurrentPage(totalPages - 1)}>
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
              }
              disabled={currentPage === totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setData();
          }}
        >
          <FaEdit className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit PromoCode</AlertDialogTitle>
          <AlertDialogDescription>
            Make changes to the discount code. Click save when you're done.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Promo Type Section */}
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Amount off products</h2>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="discountType"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Method</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="DISCOUNT"
                              id="discount-code"
                            />
                            <FormLabel
                              htmlFor="discount-code"
                              className="font-normal cursor-pointer"
                            >
                              Promo code
                            </FormLabel>
                          </div>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountName"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>
                        {form.watch("discountType") === "DISCOUNT"
                          ? "Discount"
                          : "Promo"}{" "}
                        Code
                      </FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input
                            placeholder="e.g., SUMMER20"
                            {...field}
                            disabled={true}
                          />
                        </FormControl>
                      </div>
                      {form.watch("discountType") === "PROMOCODE" && (
                        <FormDescription>
                          Customers must enter this code at checkout.
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Description</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Textarea placeholder="" {...field} />
                        </FormControl>
                      </div>
                      <FormDescription>
                        Add Description about{" "}
                        {form.watch("discountType") === "DISCOUNT"
                          ? "discount"
                          : "promo code"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Minimum amount section */}
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">
                Minimum Amount
                <span className="text-red-500 font-medium"> *</span>
              </h2>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="minimumAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input {...field} className="pr-8" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Value Section */}
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Value</h2>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="valueType"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormControl>
                        <div className="inline-flex rounded-md border">
                          <Button
                            type="button"
                            variant={
                              field.value === "PERCENTAGE"
                                ? "secondary"
                                : "ghost"
                            }
                            className={cn(
                              "rounded-r-none",
                              field.value === "PERCENTAGE" ? "bg-muted" : ""
                            )}
                            onClick={() => field.onChange("PERCENTAGE")}
                          >
                            Percentage
                          </Button>
                          <Button
                            type="button"
                            variant={
                              field.value === "AMOUNT" ? "secondary" : "ghost"
                            }
                            className={cn(
                              "rounded-l-none",
                              field.value === "AMOUNT" ? "bg-muted" : ""
                            )}
                            onClick={() => field.onChange("AMOUNT")}
                          >
                            Fixed amount
                          </Button>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input {...field} className="pr-8" type="text" />
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            {form.watch("valueType") === "PERCENTAGE"
                              ? "%"
                              : ""}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Is visible to all user */}
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Visibility</h2>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isVisible"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Is Visible to all users ?
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Active Dates */}
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Active dates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="startDate"
                    disabled
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start date</FormLabel>
                        <Input {...field} placeholder="" type="date" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="startTime"
                    disabled
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start time</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="" type="time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="hasEndDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Set end date</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("hasEndDate") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End date</FormLabel>
                          <Input
                            {...field}
                            placeholder=""
                            type="date"
                            disabled
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End time</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder=""
                              type="time"
                              // disabled
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Product SKUs Section */}
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Product SKUs</h2>
              {promo.selectAll ? (
                <div className="flex items-center space-x-2 text-purple-700 font-bold italic">
                  This promo is applicable to all products
                </div>
              ) : isLoading || !productList ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2">Loading product SKUs...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <ScrollArea className="h-[400px] pr-4">
                    <Accordion type="multiple" className="w-full">
                      {productList?.content
                        ?.filter((product) => product.status != "draft")
                        .map((product) => (
                          <AccordionItem
                            key={product.productId}
                            value={`product-${product.productId}`}
                          >
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`product-${product.productId}`}
                                  checked={isProductSelected(product.productId)}
                                  onCheckedChange={(checked) =>
                                    handleSelectAllSkus(
                                      product.productId,
                                      checked === true
                                    )
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <Label
                                  htmlFor={`product-${product.productId}`}
                                  className="font-medium cursor-pointer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {product.name} (ID: {product.productId})
                                  {isProductSelected(product.productId) &&
                                    !isAllSkusSelected(product.productId) && (
                                      <span className="ml-2 text-sm text-muted-foreground">
                                        (Partially selected)
                                      </span>
                                    )}
                                </Label>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="pl-6 space-y-2">
                                {product?.attributes?.map((attr, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`sku-${product.productId}-${attr.sku}`}
                                      checked={isSkuSelected(
                                        product.productId,
                                        attr.sku
                                      )}
                                      onCheckedChange={(checked) =>
                                        handleSkuChange(
                                          product.productId,
                                          attr.sku,
                                          checked === true
                                        )
                                      }
                                    />
                                    <Label
                                      htmlFor={`sku-${product.productId}-${attr.sku}`}
                                      className="cursor-pointer"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <span>{attr.sku}</span>
                                        {attr.size && (
                                          <span>Size: {attr.size}</span>
                                        )}
                                        {attr.color && (
                                          <span className="flex items-center">
                                            Color: {attr.color.split("-")[0]}
                                            <span
                                              className="ml-1 w-3 h-3 rounded-full inline-block"
                                              style={{
                                                backgroundColor: `#${
                                                  attr.color.split("-")[1]
                                                }`,
                                              }}
                                            />
                                          </span>
                                        )}
                                        {attr.price && (
                                          <span>₹{attr.price}</span>
                                        )}
                                        {attr.fit && (
                                          <span>Fit: {attr.fit}</span>
                                        )}
                                        {attr.pattern && (
                                          <span>Pattern: {attr.pattern}</span>
                                        )}
                                      </div>
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                    </Accordion>
                  </ScrollArea>

                  {renderPagination()}
                </div>
              )}
            </Card>

            {/* Form Actions */}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? "Updating..."
                    : "Update Promo"}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
