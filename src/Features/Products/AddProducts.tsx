import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  X,
  Trash2,
  ImagePlusIcon,
  SquareIcon,
  Plus,
  Check,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import {
  ImageUploadModal,
  type ProcessedImage,
} from "./Components/ImageUploadModal";
import { ImageViewModal } from "./Components/ImageViewModal";
import { BsPlusSquareDotted } from "react-icons/bs";
import { toast } from "sonner";
import {
  getProductsType,
  selectProductsType,
} from "../Masters/ProductType/productTypeSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  getAttributeValues,
  selectAttributeValues,
} from "../Masters/AttributeValues/attributeValuesSlice";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ReactQuill from "react-quill";
import {
  getSubCategories,
  selectSubCategories,
} from "../Masters/Category/categorySlice";
import { ProductType } from "../Masters/ProductType/types";

// Types
interface Variant {
  id: string;
  sku: string;
  price: string;
  description : string
  title: string;
  quantity: string;
  Variant : string;
  attributes: Record<string, any>;
  isDefault: boolean;
  images?: Array<{
    img_Id: number;
    img_name: string;
    img_type: string;
    img_url: string;
  }>;
}

interface VariantAttribute {
  keyId: number | string;
  keyName: string;
  // type: "select" | "text" | "number";
  value?: string[];
  groupCompanyId?: number | null;
}

interface ProductFormData {
  productTypeId: string;
  title: string;
  subheading: string;
  description: string;
  status: "draft" | "active";
  subCategory: string;
}

export const schema = z.object({
  title: z.string(),
  subheading: z.string().min(1, { message: "Subheading is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  status: z.string().min(1, { message: "Status is required" }),
  productTypeId: z.string().min(1, { message: "Product Type is required" }),
  subCategory: z.string().min(1, { message: "Subcategoy is required" }),
});

function stripHtml(html: string) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

export default function ProductForm() {
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [variants, setVariants] = useState<Variant[]>([
    {
      id: crypto.randomUUID(),
      sku: "",
      Variant : "",
      description : "",
      title: "",
      price: "",
      quantity: "",
      attributes: {
        keyName: "",
      },
      isDefault: true,
      images: [],
    },
  ]);

  const quillModules = {
    toolbar: [[{ list: "ordered" }, { list: "bullet" }]],
  };

  const [btnClick, setBtnClick] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentVariantId, setCurrentVariantId] = useState<string | null>(null);
  const [isImageViewModalOpen, setIsImageViewModalOpen] = useState(false);
  const [currentViewingImages, setCurrentViewingImages] = useState<
    Array<{ id: number; url: string; name: string; type: string }>
  >([]);
  const [skuErrors, setSkuErrors] = useState<{ [variantId: string]: string }>(
    {}
  );
  const dispatch = useAppDispatch();
  // const PRODUCT_TYPES = useAppSelector(selectProductsType);
  // console.log(PRODUCT_TYPES, 'product type');

  const [productType, setproductType] = useState<ProductType[]>([]);

  const MOCK_ATTRIBUTES = useAppSelector(selectAttributeValues);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      subheading: "",
      description: "",
      productTypeId: "",
      status: "active",
      subCategory: "",
    },
  });

  console.log(control._formValues.subCategory);
  const subCategoryValue = watch("subCategory");

  const getProductBySubCategory = async () => {
    await axios
      .get(BASE_URL + `/api/productAttributes/${subCategoryValue}`)
      .then((response) => {
        // Store the response as needed, e.g. in state
        console.log(response.data);

        setproductType(response.data);
      })
      .catch((error) => {
        console.error("Error fetching product attributes:", error);
      });
  };

  useEffect(() => {
    console.log(subCategoryValue);
    getProductBySubCategory();
  }, [subCategoryValue]);

  useEffect(() => {
    if (variants.length === 0 && selectedAttributes.length > 0) {
      addVariant();
    }
    !productType && dispatch(getProductsType());
    !MOCK_ATTRIBUTES && dispatch(getAttributeValues());
  }, [selectedAttributes, variants.length, productType, MOCK_ATTRIBUTES]);
  console.log("skuError", skuErrors);

  const validateSku = async (sku: string, variantId: string) => {
    try {
      const res = await axios.get(
        BASE_URL + `/api/products/check-sku?sku=${sku?.trim()}`
      );
      if (res.status === 200) {
        if (res.data.exists) {
          setSkuErrors((prev) => ({
            ...prev,
            [variantId]: "SKU already exists",
          }));
        } else {
          setSkuErrors((prev) => ({ ...prev, [variantId]: "" }));
        }
      }
    } catch (error) {
      setSkuErrors((prev) => ({
        ...prev,
        [variantId]: "Error validating SKU",
      }));
      toast.error("SKU already exists");
    }
  };

  const addVariant = () => {
    const newVariant: Variant = {
      id: crypto.randomUUID(),
      sku: "",
      Variant : "",
      title: "",
      price: "",
      description : "",
      quantity: "",
      attributes: {},
      isDefault: variants.length === 0,
      images: [],
    };
    setVariants([...variants, newVariant]);
  };

  const handleImageUpload = (variantId: string, images: ProcessedImage[]) => {
    const currentVariant = variants.find((v) => v.id === variantId);
    const currentColor = currentVariant?.attributes["color"];

    // If color is selected, sync images across variants with same color
    if (currentColor) {
      setVariants((prevVariants) =>
        prevVariants.map((variant) => {
          const variantColor = variant.attributes["color"];
          if (variantColor === currentColor) {
            return {
              ...variant,
              images: images.map((img) => ({
                img_Id: img.img_Id,
                img_url: img.img_url,
                img_name: img.img_name,
                img_type: img.img_type,
              })),
            };
          }
          return variant;
        })
      );
    } else {
      // If no color selected, just update the current variant's images
      setVariants((prevVariants) =>
        prevVariants.map((variant) => {
          if (variant.id === variantId) {
            return {
              ...variant,
              images: images.map((img) => ({
                img_Id: img.img_Id,
                img_url: img.img_url,
                img_name: img.img_name,
                img_type: img.img_type,
              })),
            };
          }
          return variant;
        })
      );
    }
  };

  const getImagesForVariant = (variant: Variant) => {
    const currentColor = variant.attributes["color"];

    // If the variant has its own images, return them
    if (variant.images && variant.images.length > 0) {
      return variant.images;
    }

    // If color is selected, try to find images from another variant with same color
    if (currentColor) {
      const variantWithImages = variants.find(
        (v) =>
          v.attributes["color"] === currentColor &&
          v.images &&
          v.images.length > 0
      );
      if (variantWithImages) {
        return variantWithImages.images || [];
      }
    }

    return [];
  };
  const syncImagesAcrossColorVariants = (
    variants: Variant[],
    updatedVariantId: string
  ): Variant[] => {
    const updatedVariant = variants.find((v) => v.id === updatedVariantId);
    if (!updatedVariant) return variants;

    // Only sync if color attribute exists and has changed
    if (!updatedVariant.attributes["color"]) return variants;

    const updatedColor = updatedVariant.attributes["color"];
    const variantWithImages = variants.find(
      (v) =>
        v.attributes["color"] === updatedColor &&
        v.images &&
        v.images.length > 0
    );

    if (!variantWithImages) return variants;

    return variants.map((variant) => {
      if (variant.attributes["color"] === updatedColor) {
        return {
          ...variant,
          images: [...(variantWithImages.images || [])],
          title: variantWithImages.title, // Sync title across variants with the same color
        };
      }
      return variant;
    });
  };

  const onSubmit = async (formData: ProductFormData) => {
    if (
      !variants[0].sku ||
      +variants[0].price <= 0 ||
      +variants[0].quantity <= 0
    ) {
      setBtnClick(true);
      return;
    }

    // Check if all selected attributes are filled for each variant
    const hasEmptyAttributes = variants.some((variant) =>
      selectedAttributes.some(
        (attr) => !variant.attributes[attr] || variant.attributes[attr] === ""
      )
    );

    if (hasEmptyAttributes) {
      toast.error("Please fill all mandatory attributes for each variant.");
      return;
    }

    const defaultVariant = variants.find((v) => v.isDefault);
    const productData = {
      productTypeId: formData.productTypeId,

      subcategoryId: formData.subCategory,
      name: "",
      subheading: formData.subheading,
      description: formData.description,
      status: formData.status,
      tags,
      defaultSku: defaultVariant?.sku || "",
      attributes: variants.map((variant) => ({
        sku: variant.sku,
        title: variant.title,
        ...variant.attributes,
        price: +variant.price,
        quantity: +variant.quantity,
        description : +variant.description,
        imgs:
          variant.images?.map((img) => ({
            img_Id: img.img_Id,
            img_url: img.img_url,
            img_name: img.img_name,
            img_type: img.img_type,
          })) || [],
      })),
    };

    // return;
    try {
      const res = await axios.post(BASE_URL + "/api/products", productData);
      if (res.status === 201) {
        setSelectedAttributes([]);
        setVariants([
          {
            id: crypto.randomUUID(),
            sku: "",
            Variant: "",
            title: "",
            price: "",
            quantity: "",
            description: "",
            attributes: {
              keyName: "",
            },
            isDefault: true,
            images: [],
          },
        ]);
        setTags([]);
        setTagInput("");
        setCurrentVariantId(null);
        setCurrentViewingImages([]);
        reset();
        setBtnClick(false);
        toast.success("Product added successfully");
      } else {
        toast.error("Error adding product");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const updateVariant = (id: string, updates: Partial<Variant>) => {
    setVariants((prevVariants) => {
      const updatedVariants = prevVariants.map((v) => {
        if (v.id === id) {
          const oldVariant = v;
          const newVariant = { ...v, ...updates };

          // Handle color attribute changes
          if (
            updates.attributes &&
            "color" in updates.attributes &&
            oldVariant.attributes["color"] !== updates.attributes["color"]
          ) {
            const newColor = updates.attributes["color"];
            const variantWithSameColor = prevVariants.find(
              (variant) =>
                variant.attributes["color"] === newColor && variant.id !== id
            );

            // Update the title based on the new color
            return {
              ...newVariant,
              title: variantWithSameColor ? variantWithSameColor.title : "", // Set title to match or reset to ""
            };
          }

          return newVariant;
        }
        return v;
      }); // Only sync images if we're updating color attributes

      // Sync title across variants with the same color
      if (updates.title) {
        const updatedVariant = updatedVariants.find((v) => v.id === id);
        if (updatedVariant?.attributes["color"]) {
          const updatedColor = updatedVariant.attributes["color"];
          return updatedVariants.map((variant) => {
            if (
              variant.attributes["color"] === updatedColor &&
              variant.id !== id
            ) {
              return {
                ...variant,
                title: updates.title,
              };
            }
            return variant;
          });
        }
      }
      // Sync images across variants if color is updated
      if (updates.attributes && "color" in updates.attributes) {
        return syncImagesAcrossColorVariants(updatedVariants, id);
      }

      return updatedVariants;
    });
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const setDefaultVariant = (id: string) => {
    setVariants(variants.map((v) => ({ ...v, isDefault: v.id === id })));
  };

  const handleImageDelete = (imageId: number) => {
    const variantWithImage = variants.find((v) =>
      v.images?.some((img) => img.img_Id === imageId)
    );
    if (!variantWithImage) return;

    const color = variantWithImage.attributes["color"];

    setVariants((prevVariants) =>
      prevVariants.map((v) => {
        // If this variant has the same color as the one containing the deleted image,
        // remove the image from its array too
        if (v.attributes["color"] === color) {
          return {
            ...v,
            title: v.title,
            images: (v.images || []).filter((img) => img.img_Id !== imageId),
          };
        }
        return v;
      })
    );

    setCurrentViewingImages((prev) => {
      const updatedImages = prev.filter((img) => img.id !== imageId);
      if (updatedImages.length === 0) {
        setIsImageViewModalOpen(false);
      }
      return updatedImages;
    });
  };

  const subCategoryList = useAppSelector(selectSubCategories);
  console.log(subCategoryList);

  useEffect(() => {
    !subCategoryList && dispatch(getSubCategories());
  }, [subCategoryList, dispatch]);
  return (
    <div className="grid gap-6">
      {/* Main Product Information */}
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            Enter the basic information about your product.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* <div className="max-w-6xl mx-auto"> */}
          <div className="w-full">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-8  mx-auto p-6"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
            >
              {/* Product Type */}
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2 ">
                    <Label
                      htmlFor="subCategory "
                      className="after:ml-0.5 after:text-red-500 after:content-['*']"
                    >
                      Sub Cateogary
                    </Label>
                    <Controller
                      name="subCategory"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={`${field.value}`}
                        >
                          <SelectTrigger>
                            {field.value
                              ? `${
                                  subCategoryList?.find(
                                    (i) => `${i.categoryId}` == `${field.value}`
                                  )?.categoryName
                                }`
                              : "Select product type"}
                          </SelectTrigger>
                          <SelectContent>
                            {subCategoryList?.map((type) => (
                              <SelectItem
                                key={type.id}
                                value={`${type.categoryId}`}
                              >
                                {type.categoryName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.productTypeId && (
                      <p className="text-sm text-red-500">
                        {errors.productTypeId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 ">
                    <Label
                      htmlFor="productType "
                      className="after:ml-0.5 after:text-red-500 after:content-['*']"
                    >
                      Product Type
                    </Label>
                    <Controller
                      name="productTypeId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            {/* <SelectValue placeholder="Select product type" /> */}
                            {field.value
                              ? `${
                                  productType?.find(
                                    (i) => `${i.id}` == `${field.value}`
                                  )?.productType
                                }`
                              : "Select product type"}{" "}
                          </SelectTrigger>
                          <SelectContent>
                            {productType?.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.productType}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.productTypeId && (
                      <p className="text-sm text-red-500">
                        {errors.productTypeId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="after:ml-0.5 after:text-red-500 after:content-['*']">
                      Status
                    </Label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                {/* Basic Info */}
                {/*  <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="after:ml-0.5 after:text-red-500 after:content-['*']"
                  >
                    Title
                  </Label>
                  <Input id="title" {...register("title")} />
                  {errors.title && (
                    <p className="text-sm text-red-500">
                      {errors.title.message}
                    </p>
                  )}
                </div>*/}

                <div className="space-y-2">
                  <Label
                    htmlFor="subheading"
                    className="after:ml-0.5 after:text-red-500 after:content-['*']"
                  >
                    Subheading
                  </Label>
                  <Input id="subheading" {...register("subheading")} />
                  {errors.subheading && (
                    <p className="text-sm text-red-500">
                      {errors.subheading.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="after:ml-0.5 after:text-red-500 after:content-['*']"
                  >
                    Description
                  </Label>
                  <></>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      // <ReactQuill
                      //   theme="snow"
                      //   value={field.value}
                      //   onChange={field.onChange}
                      //   onBlur={field.onBlur}
                      //   placeholder="Enter product description..."
                      //   style={{ minHeight: 120 }}
                      //   modules={quillModules}
                      // />
                      <Input type="text" {...field} />
                    )}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <Separator />

                {/* Variant Attributes Selection */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold ">Product Variants</h3>
                  <div className="space-y-2">
                    <Label className="after:ml-0.5 after:text-red-500 after:content-['*']">
                      Variant Attributes
                    </Label>
                    <Popover>
                      <PopoverTrigger className="w-max" asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          Select attributes...
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Search attributes..." />
                          <CommandList>
                            <CommandEmpty>No attributes found.</CommandEmpty>
                            <CommandGroup>
                              {MOCK_ATTRIBUTES?.map((attr) => (
                                <CommandItem
                                  className="w-full"
                                  key={attr?.keyId}
                                  onSelect={() => {
                                    if (
                                      selectedAttributes.includes(attr?.keyName)
                                    ) {
                                      setSelectedAttributes(
                                        selectedAttributes.filter(
                                          (id) => id !== attr?.keyName
                                        )
                                      );
                                    } else {
                                      setSelectedAttributes([
                                        ...selectedAttributes,
                                        attr?.keyName,
                                      ]);
                                    }
                                  }}
                                >
                                  <div
                                    className={
                                      selectedAttributes.includes(attr?.keyId)
                                        ? "text-primary w-full"
                                        : "w-full"
                                    }
                                  >
                                    <div className="flex justify-between items-center w-full">
                                      {attr?.keyName?.charAt(0).toUpperCase() +
                                        attr?.keyName?.slice(1)}
                                      {selectedAttributes.includes(
                                        attr?.keyName
                                      ) && (
                                        <Check className="h-5 w-5 text-primary" />
                                      )}
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Variants Table */}
                  <div className="space-y-4">
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">Default</TableHead>
                            <TableHead>Images</TableHead>
                            {selectedAttributes.map((attrId, index) => {
                              const attribute = MOCK_ATTRIBUTES?.find(
                                (a) => a.keyName === attrId
                              );
                              const formattedAttributeName = attribute
                                ? attribute.keyName.charAt(0).toUpperCase() +
                                  attribute.keyName.slice(1)
                                : "";

                              return (
                                <TableHead
                                  key={index}
                                  className="after:ml-0.5 after:text-red-500 after:content-['*']"
                                >
                                  {formattedAttributeName}
                                </TableHead>
                              );
                            })}
                            <TableHead className="after:ml-0.5 after:text-red-500 after:content-['*']">
                              SKU
                            </TableHead>
                            <TableHead className="after:ml-0.5 after:text-red-500 after:content-['*']">
                              Title
                            </TableHead>
                            <TableHead className="after:ml-0.5 after:text-red-500 after:content-['*']">
                              Price
                            </TableHead>
                            <TableHead className="after:ml-0.5 after:text-red-500 after:content-['*']">
                              Quantity
                            </TableHead>
                             <TableHead className="after:ml-0.5 after:text-red-500 after:content-['*']">
                              Description
                            </TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {variants.map((variant, index) => (
                            <TableRow key={index}>
                              {/* Checkbox */}
                              <TableCell>
                                <Checkbox
                                  checked={variant.isDefault}
                                  onCheckedChange={() =>
                                    setDefaultVariant(variant.id)
                                  }
                                />
                              </TableCell>

                              {/* Images */}
                              <TableCell>
                                <div className="flex flex-col space-y-2">
                                  <div className="flex flex-wrap gap-2">
                                    {getImagesForVariant(variant).map(
                                      (img, index) => (
                                        <img
                                          key={index}
                                          src={
                                            img.img_url || "/placeholder.svg"
                                          }
                                          alt={img.img_name}
                                          className="w-10 h-10 object-cover rounded cursor-pointer"
                                          onClick={() => {
                                            setCurrentViewingImages(
                                              getImagesForVariant(variant).map(
                                                (img) => ({
                                                  id: img.img_Id,
                                                  url: img.img_url,
                                                  name: img.img_name,
                                                  type: img.img_type,
                                                })
                                              )
                                            );
                                            setIsImageViewModalOpen(true);
                                          }}
                                        />
                                      )
                                    )}
                                    <Button
                                      variant="outline"
                                      type="button"
                                      className="w-[50px] h-8 rounded-md border-dashed hover:border-primary hover:bg-primary/5 transition-colors group"
                                      size="icon"
                                      onClick={() => {
                                        setCurrentVariantId(variant.id);
                                        setIsImageModalOpen(true);
                                      }}
                                    >
                                      <ImagePlusIcon size={22} />
                                      {/* Add Images */}
                                    </Button>
                                  </div>
                                </div>
                              </TableCell>

                              {/* Selected Attributes */}
                              {selectedAttributes.map((attrId) => {
                                const attribute = MOCK_ATTRIBUTES?.find(
                                  (a) => a.keyName === attrId
                                );
                                return (
                                  <TableCell key={attrId}>
                                    {attribute?.keyName === "color" ? (
                                      <Select
                                        value={`${
                                          variant.attributes[
                                            attribute?.keyName
                                          ] || ""
                                        }`}
                                        onValueChange={(value) =>
                                          updateVariant(variant.id, {
                                            attributes: {
                                              ...variant.attributes,
                                              [String(attribute?.keyName)]:
                                                value,
                                            },
                                          })
                                        }
                                      >
                                        <SelectTrigger
                                          className={`w-[120px] truncate ${
                                            btnClick &&
                                            !variant.attributes[
                                              attribute?.keyName
                                            ]
                                              ? "border-red-500 focus:border-red-500"
                                              : ""
                                          }`}
                                        >
                                          {attribute?.keyName === "color" &&
                                          variant?.attributes[
                                            attribute?.keyName
                                          ] ? (
                                            <div className="flex items-center gap-2 overflow-hidden">
                                              {variant?.attributes[
                                                attribute?.keyName
                                              ].includes("-") ? (
                                                <>
                                                  <SquareIcon
                                                    fill={`#${
                                                      variant?.attributes[
                                                        attribute?.keyName
                                                      ].split("-")[1]
                                                    }`}
                                                    stroke="lightgrey"
                                                  />
                                                  <p
                                                    className="truncate overflow-hidden whitespace-nowrap"
                                                    title={stripHtml(
                                                      variant?.attributes[
                                                        attribute?.keyName
                                                      ].split("-")[0]
                                                    )}
                                                  >
                                                    {stripHtml(
                                                      variant?.attributes[
                                                        attribute?.keyName
                                                      ].split("-")[0]
                                                    )}
                                                  </p>
                                                </>
                                              ) : (
                                                <p
                                                  className="truncate overflow-hidden whitespace-nowrap"
                                                  title={stripHtml(
                                                    variant?.attributes[
                                                      attribute?.keyName
                                                    ]
                                                  )}
                                                >
                                                  {stripHtml(
                                                    variant?.attributes[
                                                      attribute?.keyName
                                                    ]
                                                  )}
                                                </p>
                                              )}
                                            </div>
                                          ) : (
                                            <p className="truncate">
                                              Select {attribute?.keyName}
                                            </p>
                                          )}
                                        </SelectTrigger>
                                        <SelectContent>
                                          {attribute?.value?.map((option) => {
                                            const COLOR_VALUE =
                                              option.split("-");
                                            return (
                                              <SelectItem
                                                key={option}
                                                value={option}
                                              >
                                                <div className="flex items-center gap-2">
                                                  <SquareIcon
                                                    fill={`#${COLOR_VALUE[1]}`}
                                                    stroke="lightgrey"
                                                  />
                                                  <p>
                                                    {stripHtml(COLOR_VALUE[0])}
                                                  </p>
                                                </div>
                                              </SelectItem>
                                            );
                                          })}
                                        </SelectContent>
                                      </Select>
                                    ) : (
                                      <Select
                                        value={`${
                                          variant.attributes[
                                            attribute?.keyName
                                          ] || ""
                                        }`}
                                        onValueChange={(value) =>
                                          updateVariant(variant.id, {
                                            attributes: {
                                              ...variant.attributes,
                                              [String(attribute?.keyName)]:
                                                value,
                                            },
                                          })
                                        }
                                      >
                                        <SelectTrigger
                                          className={`w-[120px] truncate ${
                                            btnClick &&
                                            !variant.attributes[
                                              attribute?.keyName
                                            ]
                                              ? "border-red-500 focus:border-red-500"
                                              : ""
                                          }`}
                                        >
                                          {attribute?.keyName &&
                                          variant?.attributes[
                                            attribute?.keyName
                                          ] ? (
                                            <div className="flex items-center gap-2 overflow-hidden">
                                              <p
                                                className="truncate overflow-hidden whitespace-nowrap"
                                                title={stripHtml(
                                                  variant.attributes[
                                                    attribute?.keyName
                                                  ].split("-")[0]
                                                )}
                                              >
                                                {stripHtml(
                                                  variant.attributes[
                                                    attribute?.keyName
                                                  ].split("-")[0]
                                                )}
                                              </p>
                                            </div>
                                          ) : (
                                            <p className="truncate">
                                              Select {attribute?.keyName}
                                            </p>
                                          )}
                                        </SelectTrigger>
                                        <SelectContent>
                                          {attribute?.value?.map((option) => (
                                            <SelectItem
                                              key={option}
                                              value={option}
                                            >
                                              {stripHtml(option)}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                    {btnClick &&
                                      !variant.attributes[
                                        attribute?.keyName
                                      ] && (
                                        <p className="text-xs text-red-500 mt-1">
                                          <span className="capitalize">
                                            {attribute?.keyName}
                                          </span>{" "}
                                          is required
                                        </p>
                                      )}
                                  </TableCell>
                                );
                              })}

                              {/* SKU */}
                              <TableCell>
                                <Input
                                  value={variant.sku}
                                  onChange={(e) => {
                                    updateVariant(variant.id, {
                                      sku: e.target.value,
                                    });
                                    if (e.target.value.length > 0) {
                                      console.log(
                                        "here",
                                        e.target.value.length
                                      );
                                      validateSku(
                                        e.target.value?.trim(),
                                        variant.id
                                      );
                                    }
                                  }}
                                  placeholder="SKU-123"
                                  className={`border ${
                                    btnClick && !variant.sku
                                      ? "border-red-500 focus:border-red-500"
                                      : skuErrors[variant.id]
                                      ? "border-red-500 focus-visible:ring-red-500"
                                      : ""
                                  }`}
                                />
                                {btnClick && !variant.sku?.trim() && (
                                  <p className="text-xs text-red-500 mt-1">
                                    SKU is required
                                  </p>
                                )}
                                {skuErrors[variant.id] && (
                                  <p className="text-xs text-red-500 mt-1">
                                    {skuErrors[variant.id]}
                                  </p>
                                )}
                                {variants.some(
                                  (i) =>
                                    i.sku?.trim().length > 0 &&
                                    i.sku === variant.sku &&
                                    i.id !== variant.id
                                ) && (
                                  <p className="text-xs text-red-500 mt-1">
                                    Sku Already Selected
                                  </p>
                                )}
                              </TableCell>

                              {/* Title */}
                              <TableCell>
                                <Input
                                  value={variant.title}
                                  onChange={(e) =>
                                    updateVariant(variant.id, {
                                      title: e.target.value,
                                    })
                                  }
                                  className={`${
                                    btnClick && +variant.price <= 0
                                      ? "border-red-500 focus:border-red-500"
                                      : ""
                                  }`}
                                />
                                {btnClick && +variant.price <= 0 && (
                                  <p className="text-xs text-red-500 mt-1">
                                    Title is Required
                                  </p>
                                )}
                              </TableCell>

                              {/* Price */}
                              <TableCell>
                                <Input
                                  // type="number"
                                  value={variant.price}
                                  onChange={(e) =>
                                    updateVariant(variant.id, {
                                      price: e.target.value,
                                    })
                                  }
                                  className={`${
                                    btnClick && +variant.price <= 0
                                      ? "border-red-500 focus:border-red-500"
                                      : ""
                                  }`}
                                />
                                {btnClick &&
                                  (!variant.price || +variant.price <= 0 ? (
                                    <p className="text-xs text-red-500 mt-1">
                                      Price is Required
                                    </p>
                                  ) : isNaN(+variant.price) ? (
                                    <p className="text-xs text-red-500 mt-1">
                                      Please enter a valid price
                                    </p>
                                  ) : null)}
                              </TableCell>

                              {/* Quantity */}
                              <TableCell>
                                <Input
                                  // type="number"
                                  value={variant.quantity}
                                  onChange={(e) =>
                                    updateVariant(variant.id, {
                                      quantity: e.target.value,
                                    })
                                  }
                                  className={`${
                                    btnClick && +variant.quantity <= 0
                                      ? "border-red-500 focus:border-red-500"
                                      : ""
                                  }`}
                                />

                                {btnClick &&
                                  (!variant.quantity ||
                                  +variant.quantity <= 0 ? (
                                    <p className="text-xs text-red-500 mt-1">
                                      Quantity is Required
                                    </p>
                                  ) : isNaN(+variant.quantity) ? (
                                    <p className="text-xs text-red-500 mt-1">
                                      Please enter a valid quantity
                                    </p>
                                  ) : null)}
                              </TableCell>

                              {/* Description */}
                               <TableCell>
                                <Input
                                  // type="number"
                                  value={variant.description}
                                  onChange={(e) =>
                                    updateVariant(variant.id, {
                                      description: e.target.value,
                                    })
                                  }
                                  className={`${
                                    btnClick && +variant.description <= 0
                                      ? "border-red-500 focus:border-red-500"
                                      : ""
                                  }`}
                                />

                                {btnClick &&
                                  (!variant.description ||
                                  +variant.description <= 0 ? (
                                    <p className="text-xs text-red-500 mt-1">
                                      Quantity is Required
                                    </p>
                                  ) : isNaN(+variant.description) ? (
                                    <p className="text-xs text-red-500 mt-1">
                                      Please enter a valid description
                                    </p>
                                  ) : null)}
                              </TableCell>

                              {/* Actions */}
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeVariant(variant.id)}
                                  type="button"
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-6 w-6" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      <div className="p-4 border-t">
                        <Button
                          variant="outline"
                          type="button"
                          onClick={addVariant}
                        >
                          <Plus size={22} />
                          Add Variant
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label className="after:ml-0.5 after:text-red-500 after:content-['*']">
                    Product Tags
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1"
                          type="button"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag(tagInput);
                        }
                      }}
                      placeholder="Add tags..."
                    />
                    <Button type="button" onClick={() => addTag(tagInput)}>
                      Add
                    </Button>
                  </div>
                </div>

                {/* Status */}
              </div>

              <Button
                type="submit"
                onClick={() => setBtnClick(true)}
                disabled={isSubmitting}
              >
                Save Product
              </Button>

              <ImageUploadModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                onUpload={(processedImages) => {
                  if (currentVariantId) {
                    handleImageUpload(
                      currentVariantId,
                      processedImages.map((img) => ({
                        img_Id: img.img_Id,
                        img_url: img.img_url,
                        img_name: img.img_name,
                        img_type: img.img_type,
                      }))
                    );
                  }
                  setIsImageModalOpen(false);
                }}
              />
              <ImageViewModal
                isOpen={isImageViewModalOpen}
                onClose={() => setIsImageViewModalOpen(false)}
                images={currentViewingImages}
                onDelete={handleImageDelete}
              />
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
