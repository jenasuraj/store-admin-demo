import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  Package,
  Percent,
  Tag,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

type CustomColumnDef<T> = ColumnDef<T> & {
  expandedContent?: (row: { original: T }) => JSX.Element;
};

interface ExpandedRowProps {
  collection: Collection;
}

interface Img {
  img_Id: number;
  img_url: string;
  img_name: string;
  img_type: string;
}

interface Discount {
  status: boolean;
  valueType: string;
  discountId: number;
  discountOn: string;
  discountName: string;
  discountValue: number;
}

interface SkuDetails {
  sku: string;
  imgs: Img[];
  size: string;
  color: string;
  price: number;
  keyName: string;
  pattern: string;
  quantity: number;
  fit: string;
  discount: Discount;
}

interface Sku {
  id: number;
  productId: number;
  productName: string;
  productDescription: string;
  skuDetails: SkuDetails;
}

interface Collection {
  id: number;
  collectionName: string;
  description: string;
  bannerImage: string | null;
  skus: Sku[];
}

export const columns: CustomColumnDef<Collection>[] = [
  {
    id: "expander",
    header: () => null,
    cell: ({ row, table }) => {
      return (
        <Button
          onClick={() => row.toggleExpanded()}
          className=" shadow-none text-muted-foreground w-full"
          size="icon"
          variant="ghost"
        >
          {row.getIsExpanded() ? (
            <ChevronUp
              className="opacity-60"
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
          ) : (
            <ChevronDown
              className="opacity-60"
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
          )}
        </Button>
      );
    },
    expandedContent: ({ original }) => (
      <ExpandedRowContent collection={original} />
    ),
  },
  {
    header: "Collection Name",
    accessorKey: "collectionName",
  },
  {
    header: "Description",
    accessorKey: "description",
  },
  {
    header: "SKUs",
    cell: ({ row }) => {
      const skus = row.original.skus || [];
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline">{skus.length}</Badge>
        </div>
      );
    },
  },
];

const ExpandedRowContent: React.FC<ExpandedRowProps> = ({ collection }) => {
  const [expandedCollections, setExpandedCollections] = useState<
    Record<number, boolean>
  >({});
  const [expandedSkus, setExpandedSkus] = useState<Record<number, boolean>>({});

  const toggleSku = (skuId: number) => {
    setExpandedSkus((prev) => ({
      ...prev,
      [skuId]: !prev[skuId],
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const getDiscountedPrice = (price: number, discount?: Discount) => {
    if (!discount || !discount.status) return price;

    if (discount.valueType === "PERCENTAGE") {
      return price - (price * discount.discountValue) / 100;
    }

    return price - discount.discountValue;
  };

  const getColorName = (colorCode: string) => {
    const parts = colorCode.split("-");
    return parts[0];
  };
  return (
    <div className="max-h-[200px] overflow-y-auto ">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collection.skus.map((sku: Sku) => (
            <>
              <TableRow
                key={sku.id}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell onClick={() => toggleSku(sku.id)}>
                  {expandedSkus[sku.id] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </TableCell>
                <TableCell
                  className="font-medium"
                  onClick={() => toggleSku(sku.id)}
                >
                  <div className="flex items-center gap-2">
                    {sku.skuDetails.imgs && sku.skuDetails.imgs.length > 0 ? (
                      <Avatar className="h-8 w-8 rounded-sm">
                        <AvatarImage
                          src={sku.skuDetails.imgs[0].img_url}
                          alt={sku.productName}
                        />
                        <AvatarFallback className="rounded-sm">
                          {sku.productName.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-8 w-8 rounded-sm">
                        <AvatarFallback className="rounded-sm">
                          {sku.productName.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span>{sku.productName}</span>
                  </div>
                </TableCell>
                <TableCell onClick={() => toggleSku(sku.id)}>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <span>{sku.skuDetails.sku}</span>
                  </div>
                </TableCell>
                <TableCell onClick={() => toggleSku(sku.id)}>
                  {sku.skuDetails.size || "N/A"}
                </TableCell>
                <TableCell onClick={() => toggleSku(sku.id)}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full border"
                      style={{
                        backgroundColor: `#${
                          sku.skuDetails.color.split("-")[1] || "000000"
                        }`,
                      }}
                    />
                    {getColorName(sku.skuDetails.color)}
                  </div>
                </TableCell>
                <TableCell onClick={() => toggleSku(sku.id)}>
                  {sku.skuDetails.discount && sku.skuDetails.discount.status ? (
                    <div className="flex flex-col">
                      <span className="text-muted-foreground line-through text-xs">
                        {formatPrice(sku.skuDetails.price)}
                      </span>
                      <span className="font-medium">
                        {formatPrice(
                          getDiscountedPrice(
                            sku.skuDetails.price,
                            sku.skuDetails.discount
                          )
                        )}
                      </span>
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <Percent className="h-3 w-3" />
                        {sku.skuDetails.discount.discountValue}% off
                      </span>
                    </div>
                  ) : (
                    formatPrice(sku.skuDetails.price)
                  )}
                </TableCell>
                <TableCell
                  className="text-right"
                  onClick={() => toggleSku(sku.id)}
                >
                  <div className="flex items-center justify-end gap-2">
                    <Package className="h-4 w-4" />
                    <span>{sku.skuDetails.quantity}</span>
                  </div>
                </TableCell>
              </TableRow>

              {expandedSkus[sku.id] && (
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={7} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold mb-2">Product Details</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {sku.productDescription}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {sku.skuDetails.pattern && (
                            <div>
                              <span className="font-medium">Pattern:</span>{" "}
                              {sku.skuDetails.pattern}
                            </div>
                          )}
                          {sku.skuDetails.fit && (
                            <div>
                              <span className="font-medium">Fit:</span>{" "}
                              {sku.skuDetails.fit}
                            </div>
                          )}
                          {sku.skuDetails.discount &&
                            sku.skuDetails.discount.status && (
                              <div>
                                <span className="font-medium">Discount:</span>{" "}
                                {sku.skuDetails.discount.discountName}
                              </div>
                            )}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Product Images</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {sku.skuDetails.imgs &&
                            sku.skuDetails.imgs.map((img, index) => (
                              <div
                                key={img.img_Id}
                                className="relative aspect-square rounded-md overflow-hidden border"
                              >
                                <img
                                  src={img.img_url || "/placeholder.svg"}
                                  alt={img.img_name}
                                  className="object-cover"
                                />
                              </div>
                            ))}
                          {(!sku.skuDetails.imgs ||
                            sku.skuDetails.imgs.length === 0) && (
                            <div className="text-sm text-muted-foreground">
                              No images available
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
