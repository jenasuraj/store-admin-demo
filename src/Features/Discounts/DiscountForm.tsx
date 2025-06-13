"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, ChevronDown, ChevronsUpDown, X } from "lucide-react";
import axios from "axios";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Product } from "../Products/Components/type";
import { fetchProductAsync, selectProductEntity } from "@/app/ProductSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { toast } from "sonner";
import { BASE_URL } from "@/lib/constants";
import { Textarea } from "@/components/ui/textarea";
import { fetchDiscountAsync } from "@/app/DiscountSlice";
import { Switch } from "@/components/ui/switch";
import { fetchPromoAsync } from "@/app/PromoSlice";
import {
  selectAttributeByProductTypeValues,
  selectAttributeValues,
  getAttributeValues,
  getAttributeValuesByAttributeId,
  selectValuesByAttributeId,
} from "../Masters/AttributeValues/attributeValuesSlice";
import {
  getAttributes,
  selectAttribute,
} from "../Masters/Attribute/attributeSlice";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { fetchOfferAsync } from "@/app/OfferSlice";

export interface FormSchema {
  discountType: "DISCOUNT" | "PROMOCODE" | "OFFER";
  discountCode: string;
  description: string;
  valueType: "PERCENTAGE" | "AMOUNT" | "BUY_X_GET_Y";
  value: string;
  appliesTo: string;
  products?: Product[];
  startDate: string;
  startTime: string;
  hasEndDate: boolean;
  endDate: string;
  endTime: string;
  status: boolean;
  isVisible: boolean;
  selectAll: boolean;
  minimumAmount: string;
  buyQuantity: string;
  getQuantity: string;
  keyAttribute: string;
  keyAttributeValue: string[];
}

type SelectedProducts = {
  productId: number;
  sku: string;
  selected: boolean;
  name: string;
};

const DiscountForm = () => {
  const [selectedProducts, setSelectedProducts] = useState<SelectedProducts[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Initialize form with the new schema
  const form = useForm<FormSchema>({
    resolver: async (values, context, options) => {
      const formSchema = z
        .object({
          discountType: z.enum(["DISCOUNT", "PROMOCODE", "OFFER"]),
          discountCode: z
            .string()
            .refine((code) => code.trim().length > 0, {
              message: `${values.discountType} code cannot be empty`,
            })
            .refine((code) => /^[A-Z0-9]+$/.test(code), {
              message: "Discount code must be in uppercase letters",
            }),

          description: z.string(),
          valueType:
            values.discountType === "OFFER"
              ? z.string().optional()
              : z.enum(["PERCENTAGE", "AMOUNT", "BUY_X_GET_Y"]),
          value:
            values.valueType === "PERCENTAGE"
              ? z
                  .string()
                  .min(1, { message: "Value is mandatory" })
                  .refine((value) => /^\d+(\.\d+)?$/.test(value), {
                    message: "Value must be a valid number",
                  })
                  .refine((value) => Number.parseFloat(value) > 0, {
                    message: "Value must be greater than 0",
                  })
              : values.valueType === "AMOUNT"
              ? z.string().min(1, { message: "Value is mandatory" })
              : z.string().optional(),
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
          startDate: z.string().min(1, { message: "Start Date is required" }),
          startTime: z
            .string()
            .min(1, { message: "Start Time is required" })
            .refine(
              (time) => {
                const now = new Date();
                const currentTime = now.toTimeString().slice(0, 5); // Get HH:MM format
                return time >= currentTime;
              },
              {
                message:
                  "Start time must be greater than or equal to the current time",
              }
            ),
          isVisible:
            values.discountType == "PROMOCODE"
              ? z.boolean()
              : z.boolean().optional(),
          selectAll:
            values.discountType == "PROMOCODE"
              ? z.boolean()
              : z.boolean().optional(),
          minimumAmount:
            values.discountType == "PROMOCODE"
              ? z.string().min(1, { message: "Minimum amount is required" })
              : z.string().optional(),
          hasEndDate: z.boolean().default(false),
          endDate: z.string(),
          endTime: z.string(),
          status: z.boolean().default(false),
          buyQuantity: z
            .string()
            .trim()
            .min(1, { message: "Buy Quantity is required" }),
          getQuantity: z
            .string()
            .trim()
            .min(1, { message: "Get Quantity is required" }),
          keyAttribute: z.string(),
          keyAttributeValue: z.array(z.string()),
        })
        .superRefine(async (values, ctx) => {
          try {
            const response = await axios.get(
              `${BASE_URL}/api/discount/validate?discountName=${values.discountCode}`
            );
            if (response.data.exists) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                  "This discount code already exists, please choose another one.",
                path: ["discountCode"],
              });
            }
          } catch (error) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `${
                error?.response?.data || "Discount Name already exists"
              }`,
              path: ["discountCode"],
            });
          }
        });

      return zodResolver(formSchema)(values, context, options);
    },
    defaultValues: {
      discountType: "DISCOUNT",
      discountCode: "",
      description: "",
      valueType: "PERCENTAGE",
      value: "",
      appliesTo: "PRODUCT",
      products: [],
      startDate: "",
      startTime: "",
      hasEndDate: false,
      endDate: "",
      endTime: "",
      status: false,
      minimumAmount: "",
      isVisible: false,
      selectAll: false,
      getQuantity: "",
      buyQuantity: "",
      keyAttribute: "",
      keyAttributeValue: [],
    },
  });

  const listOfProducts = useAppSelector(selectProductEntity)?.content?.filter(
    (prod) => prod.status != "draft"
  );

  const dispatch = useAppDispatch();
  const [attriOpen, setAttriOpen] = useState(false);
  const [attriValOpen, setAttriValOpen] = useState(false);

  useEffect(() => {
    if (!listOfProducts) {
      dispatch(fetchProductAsync("?page=0"));
    }
  }, [listOfProducts]);

  // Filter products based on search term
  // Utility function to search in nested objects and arrays
  const deepSearch = (obj: any, searchTerm: string): boolean => {
    if (typeof obj === "string") {
      return obj.toLowerCase().includes(searchTerm.toLowerCase());
    }

    if (Array.isArray(obj)) {
      return obj.some((item) => deepSearch(item, searchTerm));
    }

    if (typeof obj === "object" && obj !== null) {
      return Object.values(obj).some((value) => deepSearch(value, searchTerm));
    }

    return false;
  };

  // Filter products based on search term
  const filteredProducts = listOfProducts
    ?.map((product: Product) => {
      // Filter attributes based on search term
      const filteredAttributes = product.attributes?.filter((attribute) =>
        deepSearch(attribute, searchTerm)
      );

      // If there are matching attributes, return the product with only the filtered attributes
      if (filteredAttributes?.length > 0) {
        return { ...product, attributes: filteredAttributes };
      }

      // Return null for products without matching attributes
      return null;
    })
    .filter((product) => product !== null);

  // Handle product selection
  const handleProductSelection = (productId: number, checked: boolean) => {
    const updatedProducts = [...selectedProducts];
    const productIndex = updatedProducts.findIndex(
      (p) => p.productId === productId
    );
    const product = listOfProducts?.find((p) => p.productId === productId);

    if (!product) return;

    if (productIndex === -1 && checked) {
      // Add product with all attributes selected
      product.attributes.forEach((attr) => {
        updatedProducts.push({
          productId: product.productId,
          sku: attr.sku,
          selected: true,
          name: product.name,
        });
      });
    } else if (checked) {
      // If product exists but we're checking it, make sure all SKUs are selected
      const productSkus = product.attributes.map((attr) => attr.sku);

      // Add any missing SKUs
      productSkus.forEach((sku) => {
        if (
          !updatedProducts.some(
            (p) => p.productId === productId && p.sku === sku
          )
        ) {
          updatedProducts.push({
            productId,
            sku,
            selected: true,
            name: product.name,
          });
        }
      });
    } else {
      // Remove all SKUs for this product
      const indicesToRemove = updatedProducts
        .map((p, index) => (p.productId === productId ? index : -1))
        .filter((index) => index !== -1);

      indicesToRemove.forEach((index) => {
        updatedProducts.splice(index, 1);
      });
    }

    setSelectedProducts(updatedProducts);
  };

  // Handle attribute/SKU selection
  const handleAttributeSelection = (
    productId: number,
    sku: string,
    checked: boolean
  ) => {
    const updatedProducts = [...selectedProducts];
    const product = listOfProducts?.find((p) => p.productId === productId);

    if (!product) return;

    const skuIndex = updatedProducts.findIndex(
      (p) => p.productId === productId && p.sku === sku
    );

    if (skuIndex === -1 && checked) {
      // Add this specific SKU
      updatedProducts.push({
        productId,
        sku,
        selected: true,
        name: product.name,
      });
    } else if (skuIndex !== -1 && !checked) {
      // Remove this specific SKU
      updatedProducts.splice(skuIndex, 1);
    }

    setSelectedProducts(updatedProducts);
  };

  // Count selected variants for a product
  const countSelectedVariants = (productId: number) => {
    return selectedProducts.filter((p) => p.productId === productId).length;
  };

  // Get all unique product IDs from selected products
  const getUniqueProductIds = () => {
    return [...new Set(selectedProducts.map((p) => p.productId))];
  };

  // Get product name by ID
  const getProductName = (productId: number) => {
    const product = listOfProducts?.find((p) => p.productId === productId);
    return product?.subheading || "Unknown Product";
  };

  // Get total attributes count for a product
  const getTotalAttributesCount = (productId: number) => {
    const product = listOfProducts?.find((p) => p.productId === productId);
    return product?.attributes.length || 0;
  };

  // Remove a product from selection
  const removeProduct = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.filter((p) => p.productId !== productId)
    );
  };

  // Edit a specific product
  const editProduct = (productId: number) => {
    setEditingProductId(productId);
    setIsProductDialogOpen(true);
  };

  // Check if a product is selected (any of its SKUs)
  const isProductSelected = (productId: number) => {
    return selectedProducts.some((p) => p.productId === productId);
  };

  // Check if a specific SKU is selected
  const isSkuSelected = (productId: number, sku: string) => {
    return selectedProducts.some(
      (p) => p.productId === productId && p.sku === sku
    );
  };

  const attributeList = useAppSelector(selectAttribute);

  useEffect(() => {
    !attributeList && dispatch(getAttributes());
  }, [attributeList]);

  const attributeValueList = useAppSelector(selectValuesByAttributeId);

  // useEffect(() => {
  //   !attributeValueList && dispatch(getAttributeValues());
  // }, [attributeValueList]);

  // Handle form submission
  const onSubmit = async (data: FormSchema) => {
    if (data.discountType === "DISCOUNT") {
      // Transform form data to the required JSON format
      const formattedData = {
        discount: {
          discountName: data.discountCode,
          description: data.description || "",
          valueType: data.valueType,
          value: Number.parseInt(data.value),
          startDate: data.startDate,
          startTime: data.startTime,
          endDate: data.endDate,
          endTime: data.endTime,
          status: false,
          discountOn: data.appliesTo,
        },
        productSkus: (() => {
          const productMap = new Map();

          selectedProducts.forEach(({ productId, sku }) => {
            if (!productMap.has(productId)) {
              productMap.set(productId, { productId, skus: [] });
            }
            productMap.get(productId).skus.push(sku);
          });

          return Array.from(productMap.values());
        })(),
      };
      return;
      try {
        const res = await axios.post(
          BASE_URL + "/api/discount/apply",
          formattedData
        );
        if (res.status == 200 || res.status == 201) {
          fetchDiscountAsync("");
          toast.success("Discount Created");
          form.reset();
          setSelectedProducts([]);
        }
      } catch (error) {
        const errorMsg = error;
        toast.error(
          `Failed to create discount : ${errorMsg.response.data.split(":")[1]}`,
          {
            duration: 10000,
          }
        );
      }
    } else if (data.discountType === "PROMOCODE") {
      // console.log(data);
      const formattedData = {
        promoName: data.discountCode,
        description: data.description || "",
        valueType: data.valueType,
        value: Number.parseInt(data.value),
        startDate: data.startDate,
        startTime: data.startTime,
        endDate: data.endDate,
        endTime: data.endTime,
        status: false,
        discountOn: data.appliesTo,
        promoOn: "PRODUCT",
        isVisible: data.isVisible,
        selectAll: data.selectAll,
        minimumAmount: data.minimumAmount,
        productSkuMappings: (() => {
          const productMap = new Map();

          selectedProducts.forEach(({ productId, sku }) => {
            if (!productMap.has(productId)) {
              productMap.set(productId, { productId, skus: [] });
            }
            productMap.get(productId).skus.push(sku);
          });

          return Array.from(productMap.values());
        })(),
      };

      return;
      try {
        const res = await axios.post(
          BASE_URL + "/api/promoCode/add",
          formattedData
        );
        if (res.status == 200 || res.status == 201) {
          fetchPromoAsync("");
          toast.success("PromoCode Created");
          form.reset();
          setSelectedProducts([]);
        }
      } catch (error) {
        const errorMsg = error;
        toast.error(
          `Failed to create promoCode : ${
            errorMsg.response.data.split(":")[1]
          }`,
          {
            duration: 5000,
          }
        );
      }
    } else {
      const formattedData = {
        name: data.discountCode,
        description: data.description || "",
        startDate: data.startDate,
        startTime: data.startTime,
        endDate: data.endDate,
        endTime: data.endTime,
        status: false,
        applyLevel: "PRODUCT",
        selectAll: data.selectAll,
        attributeKey: data.keyAttribute,
        attributeValues: data.keyAttributeValue,
        buyQuantity: data.buyQuantity,
        getQuantity: data.getQuantity,
        productSkuMappings: (() => {
          const productMap = new Map();

          selectedProducts.forEach(({ productId, sku }) => {
            if (!productMap.has(productId)) {
              productMap.set(productId, { productId, skus: [] });
            }
            productMap.get(productId).skus.push(sku);
          });

          return Array.from(productMap.values());
        })(),
      };
      try {
        const res = await axios.post(
          BASE_URL + "/api/offer/add",
          formattedData
        );
        if (res.status == 200 || res.status == 201) {
          toast.success("Offer Created");
          await fetchOfferAsync("");
          form.reset();
          setSelectedProducts([]);
        }
      } catch (error) {
        const errorMsg = error;
        toast.error(
          `Failed to create offer : ${errorMsg.response.data.split(":")[1]}`,
          {
            duration: 10000,
          }
        );
      }
    }
  };

  const handleProductScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrollPosition = target.scrollTop + target.clientHeight;
    const scrollHeight = target.scrollHeight;

    // Load more when user scrolls to 80% of the available scroll height
    if (scrollPosition > scrollHeight * 0.8 && !isLoadingMore) {
      loadMoreProducts();
    }
  };

  const loadMoreProducts = () => {
    // const productEntity = useAppSelector(selectProductEntity);
    // if (productEntity?.last) return; // Don't load more if we're on the last page

    setIsLoadingMore(true);
    // const nextPage = currentPage + 1;

    // dispatch(fetchProductAsync(`?page=${nextPage}`))
    //   .unwrap()
    //   .then(() => {
    //     setCurrentPage(nextPage);
    //     setIsLoadingMore(false);
    //   })
    //   .catch(() => {
    //     setIsLoadingMore(false);
    //   });
  };

  if (listOfProducts)
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Discount Type Section */}
              <Card className="p-6">
                <h2 className="text-lg font-medium mb-4">
                  Amount off products
                </h2>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="discountType"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          Method
                          <span className="text-red-500 font-medium"> *</span>
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(e) => {
                              field.onChange(e);
                              if (e == "DISCOUNT") {
                                form.setValue("selectAll", false);
                              }
                              if (e == "PROMOCODE") {
                                setSelectedProducts([]);
                              }
                              if (e == "OFFER") {
                                // setSelectedProducts([]);
                                form.setValue("valueType", "BUY_X_GET_Y");
                              }
                            }}
                            value={field.value}
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
                                Discount code
                              </FormLabel>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="PROMOCODE"
                                id="automatic-discount"
                              />
                              <FormLabel
                                htmlFor="automatic-discount"
                                className="font-normal cursor-pointer"
                              >
                                Promo Code
                              </FormLabel>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="OFFER"
                                id="automatic-offer"
                              />
                              <FormLabel
                                htmlFor="automatic-offer"
                                className="font-normal cursor-pointer"
                              >
                                Offer
                              </FormLabel>
                            </div>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountCode"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          {form.watch("discountType") == "DISCOUNT"
                            ? "Discount "
                            : form.watch("discountType") == "OFFER"
                            ? "Offer "
                            : "Promo "}
                          Code
                          <span className="text-red-500 font-medium"> *</span>
                        </FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input
                              placeholder="e.g., SUMMER20"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e); // Update form state
                                form.trigger("discountCode"); // Manually validate this field
                              }}
                            />
                          </FormControl>
                        </div>
                        {form.watch("discountType") == "PROMOCODE" && (
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
                        <FormLabel>Description (optional)</FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Textarea placeholder="" {...field} />
                          </FormControl>
                          {/* <Button type="button" variant="outline">
                            Generate
                          </Button> */}
                        </div>
                        <FormDescription>
                          Add Description about
                          {form.watch("discountType") == "DISCOUNT"
                            ? "discount"
                            : "promo code"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              {/* Minimum Amount Section */}
              {form.watch("discountType") == "PROMOCODE" && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Minimum Amount
                      <span className="text-red-500 font-medium"> *</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              )}

              {/* Value Section */}
              {form.watch("discountType") != "OFFER" && (
                <Card className="p-6">
                  <h2 className="text-lg font-medium mb-4">
                    Value <span className="text-red-500 font-medium"> *</span>
                  </h2>
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
                                  field.value === "AMOUNT"
                                    ? "secondary"
                                    : "ghost"
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
                              <Input {...field} className="pr-8" />
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
              )}

              <Card>
                <CardHeader>
                  <CardTitle>
                    Quantity
                    <span className="text-red-500 font-medium"> *</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="buyQuantity"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Buy Quantity</FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e); // Update form state
                                form.trigger("discountCode"); // Manually validate this field
                              }}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="getQuantity"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Get Quantity</FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e); // Update form state
                                form.trigger("discountCode"); // Manually validate this field
                              }}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    Quantity
                    <span className="text-red-500 font-medium"> *</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="keyAttribute"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          Attribute
                        </FormLabel>
                        <Popover open={attriOpen} onOpenChange={setAttriOpen}>
                          <PopoverTrigger asChild className="w-full">
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "justify-between capitalize",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? attributeList &&
                                    attributeList.find(
                                      (attribute) =>
                                        `${attribute.attributeName}` ===
                                        field.value
                                    )?.attributeName
                                  : "Select Attribute"}
                                <ChevronsUpDown className="opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] shadow-lg rounded-md border">
                            <Command>
                              <CommandInput
                                placeholder="Search category..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>No category found.</CommandEmpty>
                                <CommandGroup>
                                  {attributeList &&
                                    attributeList.map((attribute) => (
                                      <CommandItem
                                        className="capitalize"
                                        value={`${attribute.attributeName}`}
                                        key={attribute.id}
                                        onSelect={async () => {
                                          form.setValue(
                                            "keyAttribute",
                                            `${attribute.attributeName}`,
                                            {
                                              shouldValidate: true,
                                            }
                                          );
                                          form.setValue(
                                            "keyAttributeValue",
                                            []
                                          );
                                          dispatch(
                                            getAttributeValuesByAttributeId(
                                              `${attribute.id}`
                                            )
                                          );
                                          setAttriOpen(false);
                                        }}
                                      >
                                        {attribute.attributeName}
                                        <Check
                                          className={cn(
                                            "ml-auto",
                                            `${attribute.attributeName}` ===
                                              field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
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
                  {/* <FormField
                    control={form.control}
                    name="keyAttributeValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          Attribute Value
                        </FormLabel>
                        <Popover
                          open={attriValOpen}
                          onOpenChange={setAttriValOpen}
                        >
                          <PopoverTrigger asChild className="w-full">
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "justify-between capitalize",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? "No attribute"
                                  : "Select Attribute"}
                                <ChevronsUpDown className="opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] shadow-lg rounded-md border">
                            <Command>
                              <CommandInput
                                placeholder="Search attribute values..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>
                                  No attribute values found.
                                </CommandEmpty>
                                <CommandGroup>
                                  {attributeValueList &&
                                    attributeValueList.map((value, i) => (
                                      <CommandItem
                                        className="capitalize"
                                        key={i}
                                        onSelect={() => {
                                          const currentValues =
                                            field.value || [];
                                          const valueToToggle = `${value}`;

                                          if (
                                            currentValues.includes(
                                              valueToToggle
                                            )
                                          ) {
                                            // Remove the value
                                            const newValues =
                                              currentValues.filter(
                                                (val) => val !== valueToToggle
                                              );
                                            field.onChange(newValues);
                                          } else {
                                            // Add the value
                                            field.onChange([
                                              ...currentValues,
                                              valueToToggle,
                                            ]);
                                          }
                                        }}
                                      >
                                        <Checkbox
                                          defaultChecked={
                                            field.value?.includes(`${value}`) ||
                                            false
                                          }
                                          className="mr-2"
                                        />
                                        {value}
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
                  /> */}
                  <div className="space-y-2">
                    <Label
                      className={`${
                        form.formState.errors.keyAttributeValue &&
                        "text-destructive"
                      } after:content-['*'] after:ml-0.5 after:text-red-500`}
                    >
                      Attribute Value
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between font-normal"
                        >
                          {form.getValues("keyAttributeValue")?.length === 0
                            ? "Select value"
                            : `${
                                form.watch("keyAttributeValue").length
                              } selected`}
                          <ChevronDown />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="shadow-lg w-[--radix-popover-trigger-width]">
                        <Command className="bg-white shadow-2xl">
                          <CommandInput placeholder="Search value..." />
                          <CommandList>
                            <CommandEmpty>No value found.</CommandEmpty>
                            <CommandGroup>
                              <FormField
                                control={form.control}
                                name="keyAttributeValue"
                                render={() => (
                                  <FormItem>
                                    <CommandItem>
                                      <FormControl>
                                        <Checkbox
                                          checked={attributeValueList.every(
                                            (item) =>
                                              form
                                                .watch("keyAttributeValue")
                                                ?.includes(`${item}`)
                                          )}
                                          onCheckedChange={(checked) => {
                                            if (checked && attributeValueList) {
                                              form.setValue(
                                                "keyAttributeValue",
                                                attributeValueList.map(
                                                  (item) => `${item}`
                                                )
                                              );
                                            } else {
                                              form.setValue(
                                                "keyAttributeValue",
                                                []
                                              );
                                            }
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="ml-3 font-normal">
                                        Select All
                                      </FormLabel>
                                    </CommandItem>

                                    {attributeValueList.map((item, i) => (
                                      <CommandItem key={i}>
                                        <FormField
                                          control={form.control}
                                          name="keyAttributeValue"
                                          render={({ field }) => {
                                            return (
                                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                  <Checkbox
                                                    checked={field.value?.includes(
                                                      `${item}`
                                                    )}
                                                    onCheckedChange={(
                                                      checked
                                                    ) => {
                                                      return checked
                                                        ? field.onChange([
                                                            ...field.value,
                                                            `${item}`,
                                                          ])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                              (value) =>
                                                                value !==
                                                                `${item}`
                                                            )
                                                          );
                                                    }}
                                                  />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                  {item}
                                                </FormLabel>
                                              </FormItem>
                                            );
                                          }}
                                        />
                                      </CommandItem>
                                    ))}
                                  </FormItem>
                                )}
                              />
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {form.formState.errors.keyAttributeValue && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.keyAttributeValue.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  {
                    <div className="flex justify-between">
                      <CardTitle className="text-lg font-medium">
                        {form.watch("discountType") !== "DISCOUNT"
                          ? "Applies to all product"
                          : "Choose products"}
                      </CardTitle>
                      {form.watch("discountType") !== "DISCOUNT" && (
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="selectAll"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
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
                      )}
                    </div>
                  }
                </CardHeader>
                <CardContent>
                  {!form.watch("selectAll") && (
                    <div>
                      {/* <span className="font-medium">Select Products</span> */}
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Search products"
                          className="flex-1"
                          readOnly
                          onClick={() => {
                            setEditingProductId(null);
                            setIsProductDialogOpen(true);
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingProductId(null);
                            setIsProductDialogOpen(true);
                          }}
                        >
                          Browse
                        </Button>
                      </div>

                      {getUniqueProductIds().length > 0 && (
                        <div className="mt-4 space-y-2">
                          {getUniqueProductIds().map((productId) => (
                            <div
                              key={productId}
                              className="flex items-center justify-between border p-3 rounded-md"
                            >
                              <div>
                                <div className="font-medium">
                                  {getProductName(productId)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  ({countSelectedVariants(productId)} of{" "}
                                  {getTotalAttributesCount(productId)} variants
                                  selected)
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => editProduct(productId)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeProduct(productId)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {form.watch("discountType") == "PROMOCODE" && (
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
              )}
              {/* Active Dates */}
              <Card className="p-6">
                <h2 className="text-lg font-medium mb-4">Active dates</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>
                            Start date
                            <span className="text-red-500 font-medium"> *</span>
                          </FormLabel>
                          <Input
                            {...field}
                            placeholder=""
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>
                            Start time
                            <span className="text-red-500 font-medium"> *</span>
                          </FormLabel>
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
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="has-end-date"
                          />
                        </FormControl>
                        <FormLabel
                          htmlFor="has-end-date"
                          className="font-normal cursor-pointer"
                        >
                          Set end date
                        </FormLabel>
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
                            <Input {...field} placeholder="" type="date" />

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
                              <Input {...field} placeholder="" type="time" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </Card>

              {/* Status Toggle */}
              {/* <Card className="p-6">
                <h2 className="text-lg font-medium mb-4">Status</h2>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Discount Status
                          </FormLabel>
                          <FormDescription>
                            {field.value
                              ? "Active: Discount will be applied"
                              : "Inactive: Discount is not applied"}
                          </FormDescription>
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
              </Card> */}

              {/* Form Actions */}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline">
                  Discard
                </Button>
                <Button disabled={form.formState.isSubmitting} type="submit">
                  {form.formState.isSubmitting
                    ? "Saving code...."
                    : "Save code"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Summary Card */}
        <div className="md:col-span-1">
          <Card className="p-6 sticky top-0">
            <h2 className="text-lg font-medium mb-4">Summary</h2>
            <div className="space-y-6">
              <div>
                <p className="text-muted-foreground">
                  {form.watch("discountCode")
                    ? `Discount code: ${form.watch("discountCode")}`
                    : "No discount code yet"}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Type and method</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Amount off products</li>
                  <li>
                    {form.watch("discountType") === "DISCOUNT"
                      ? "Discount code"
                      : "Automatic discount"}
                  </li>
                </ul>
              </div>

              {getUniqueProductIds().length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Products</h3>
                  <p className="text-sm">
                    {getUniqueProductIds().length} products selected (
                    {selectedProducts.length} variants)
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-medium">Details</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {form.watch("valueType") === "PERCENTAGE" && (
                    <li>{form.watch("value") || 0}% off products</li>
                  )}
                  {form.watch("valueType") === "AMOUNT" && (
                    <li>₹{form.watch("value") || 0} off products</li>
                  )}
                  <li>Can't combine with other discounts</li>
                  <li>Active from {form.watch("startDate") || "today"}</li>
                  {form.watch("hasEndDate") && form.watch("endDate") && (
                    <li>Ends on {form.watch("endDate")}</li>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="font-medium">Performance</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Discount is not active yet
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Product Selection Dialog */}
        <AlertDialog
          open={isProductDialogOpen}
          onOpenChange={setIsProductDialogOpen}
        >
          <AlertDialogContent className="max-w-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {editingProductId
                  ? `Edit ${getProductName(editingProductId)}`
                  : "Add products"}
              </AlertDialogTitle>
              <AlertDialogDescription></AlertDialogDescription>
              <div className="mt-4">
                {!editingProductId && (
                  <Input
                    placeholder="Search products"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-4"
                  />
                )}
                <ScrollArea
                  className="h-[400px] pr-4"
                  onScrollCapture={(e) => {
                    handleProductScroll(e);
                  }}
                >
                  {(editingProductId
                    ? filteredProducts.filter(
                        (p) => p.productId === editingProductId
                      )
                    : filteredProducts
                  ).map((product) => (
                    <div key={product.productId} className="mb-4 border-b pb-4">
                      <div className="flex items-center mb-2">
                        <Checkbox
                          id={`product-${product.productId}`}
                          checked={isProductSelected(product.productId)}
                          onCheckedChange={(checked) =>
                            handleProductSelection(
                              product.productId,
                              checked as boolean
                            )
                          }
                          className="mr-2"
                        />
                        <label
                          htmlFor={`product-${product.productId}`}
                          className="font-medium cursor-pointer"
                        >
                          {product.name}
                        </label>
                      </div>
                      <div className="ml-6 space-y-2">
                        {product.attributes.map((attr) => (
                          <div
                            key={attr.sku}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <Checkbox
                                id={`attr-${attr.sku}`}
                                checked={isSkuSelected(
                                  product.productId,
                                  attr.sku
                                )}
                                onCheckedChange={(checked) =>
                                  handleAttributeSelection(
                                    product.productId,
                                    attr.sku,
                                    checked as boolean
                                  )
                                }
                                className="mr-2"
                              />
                              <label
                                htmlFor={`attr-${attr.sku}`}
                                className="cursor-pointer flex items-center gap-2"
                              >
                                <p className="border text-sm p-1 rounded-md shadow-sm">
                                  {attr.sku}
                                </p>
                                <p
                                  style={{
                                    backgroundColor: `#${attr.color
                                      ?.split("-")
                                      .pop()}`,
                                  }}
                                  className="h-4 w-4 rounded-full"
                                ></p>
                                <span>
                                  {attr.color?.split("-")[0]} / {attr.size}
                                </span>
                              </label>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span>{attr.quantity} Qty</span>
                              <span className="font-medium">
                                ₹{attr.price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {/* {isLoadingMore && (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      Loading more products...
                    </div>
                  )} */}
                </ScrollArea>
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsProductDialogOpen(false);
                  setSearchTerm("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsProductDialogOpen(false);
                  setSearchTerm("");
                }}
              >
                Add
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
};

export default DiscountForm;
