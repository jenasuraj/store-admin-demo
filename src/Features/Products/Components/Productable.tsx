import * as React from "react";
import { ChevronDown, ChevronRight, Package, Ruler, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product } from "./type";

export default function ProductTable({
  products,
  onStatusChange,
}: {
  products: Product[];
  onStatusChange?: (productId: number, newStatus: string) => void;
}) {
  const [expandedProducts, setExpandedProducts] = React.useState<number[]>([]);
  const [expandedAttributes, setExpandedAttributes] = React.useState<{
    [key: number]: number[];
  }>({});

  const toggleProduct = (productId: number) => {
    setExpandedProducts((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  };

  const toggleAttribute = (productId: number, attributeIndex: number) => {
    setExpandedAttributes((current) => ({
      ...current,
      [productId]: current[productId]?.includes(attributeIndex)
        ? current[productId].filter((id) => id !== attributeIndex)
        : [...(current[productId] || []), attributeIndex],
    }));
  };

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Variants</TableHead>
            <TableHead>Default SKU</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products?.map((product) => (
            <React.Fragment key={product.productId}>
              <TableRow
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => toggleProduct(product.productId)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    {product?.attributes?.[0]?.imgs?.[0] ? (
                      <img
                        src={
                          product?.attributes?.[0]?.imgs?.[0]?.img_url ||
                          "/placeholder.svg"
                        }
                        alt={product.name || "No name"}
                        width={40}
                        height={40}
                        className="rounded-md object-cover"
                      />
                    ) : (
                       <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400">
                         No Img
                       </div>
                    )}
                    <div>
                      <div className="font-medium">
                        {product?.subheading || product?.name}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      product.status === "active" ? "default" : "secondary"
                    }
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onStatusChange) {
                        const newStatus =
                          product?.status === "active" ? "draft" : "active";
                        onStatusChange(product?.productId, newStatus);
                      }
                    }}
                  >
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell>{product?.attributes?.length || 0} variants</TableCell>
                <TableCell>
                  {product?.defaultSku || product?.attributes?.[0]?.sku || "N/A"}
                </TableCell>
                <TableCell>
                  {expandedProducts.includes(product.productId) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </TableCell>
              </TableRow>
              {expandedProducts.includes(product.productId) && (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <div className="p-4 bg-muted/30 border-t">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Variant</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {product?.attributes?.map((attribute, index) => (
                            <React.Fragment key={attribute.sku + index}>
                              <TableRow
                                className="hover:bg-muted/50 cursor-pointer"
                                onClick={() =>
                                  toggleAttribute(product.productId, index)
                                }
                              >
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {attribute.color && (
                                      <div
                                        className="w-4 h-4 rounded-full border"
                                        style={{
                                          backgroundColor: attribute.color.includes("-") 
                                            ? `#${attribute.color.split("-")[1]}` 
                                            : attribute.color,
                                        }}
                                      />
                                    )}
                                    <span>
                                      {attribute.color?.split("-")[0]}
                                      {attribute.color && attribute.size ? " / " : ""}
                                      {attribute.size}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>{attribute.sku}</TableCell>
                                <TableCell>
                                  ₹{attribute.price?.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                   {attribute.quantity}
                                </TableCell>
                                <TableCell>
                                  {expandedAttributes[
                                    product.productId
                                  ]?.includes(index) ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </TableCell>
                              </TableRow>
                              {expandedAttributes[product.productId]?.includes(
                                index
                              ) && (
                                <TableRow>
                                  <TableCell colSpan={5} className="p-0">
                                    <div className="p-6 bg-muted/50 border-t">
                                      <Tabs
                                        defaultValue="details"
                                        className="w-full"
                                      >
                                        <TabsList className="mb-4">
                                          <TabsTrigger value="details">
                                            Details
                                          </TabsTrigger>
                                          <TabsTrigger value="images">
                                            Images
                                          </TabsTrigger>
                                          <TabsTrigger value="inventory">
                                            Inventory
                                          </TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="details">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Card>
                                              <CardContent className="p-6">
                                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                  <Tag className="h-5 w-5" />
                                                  Variant Information
                                                </h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                  <div>
                                                    <div className="text-sm font-medium">
                                                      SKU
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                      {attribute.sku}
                                                    </div>
                                                  </div>
                                                  <div>
                                                    <div className="text-sm font-medium">
                                                      Price
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                      ₹
                                                      {attribute.price?.toLocaleString()}
                                                    </div>
                                                  </div>
                                                  <div>
                                                    <div className="text-sm font-medium">
                                                      Size
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                      {attribute.size || "N/A"}
                                                    </div>
                                                  </div>
                                                </div>
                                              </CardContent>
                                            </Card>
                                            <Card>
                                              <CardContent className="p-6">
                                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                  <Ruler className="h-5 w-5" />
                                                  Specifications
                                                </h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                  <div>
                                                    <div className="text-sm font-medium">
                                                      Fit
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                      {attribute.fit || "N/A"}
                                                    </div>
                                                  </div>
                                                  <div>
                                                    <div className="text-sm font-medium">
                                                      Pattern
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                      {attribute.pattern || "N/A"}
                                                    </div>
                                                  </div>
                                                </div>
                                              </CardContent>
                                            </Card>
                                          </div>
                                        </TabsContent>
                                        <TabsContent value="images">
                                          <Card>
                                            <CardContent className="p-6">
                                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {attribute.imgs?.map((img) => (
                                                  <div
                                                    key={img.img_Id}
                                                    className="relative group cursor-pointer"
                                                  >
                                                    <img
                                                      src={
                                                        img.img_url ||
                                                        "/placeholder.svg"
                                                      }
                                                      alt={img.img_name}
                                                      width={300}
                                                      height={300}
                                                      className="rounded-lg object-cover transition-transform group-hover:scale-105"
                                                    />
                                                  </div>
                                                ))}
                                                {(!attribute.imgs || attribute.imgs.length === 0) && (
                                                    <div className="text-sm text-muted-foreground">No images available</div>
                                                )}
                                              </div>
                                            </CardContent>
                                          </Card>
                                        </TabsContent>
                                        <TabsContent value="inventory">
                                          <Card>
                                            <CardContent className="p-6">
                                              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                <Package className="h-5 w-5" />
                                                Stock Information
                                              </h3>
                                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div>
                                                  <div className="text-sm font-medium">
                                                    In Stock
                                                  </div>
                                                  <div className="text-2xl font-bold">
                                                    {attribute.quantity}
                                                  </div>
                                                </div>
                                                <div>
                                                  <div className="text-sm font-medium">
                                                    Status
                                                  </div>
                                                  <div className="text-sm">
                                                    <Badge
                                                      variant={
                                                        attribute.quantity > 0
                                                          ? "default"
                                                          : "destructive"
                                                      }
                                                    >
                                                      {attribute.quantity > 0
                                                        ? "In Stock"
                                                        : "Out of Stock"}
                                                    </Badge>
                                                  </div>
                                                </div>
                                              </div>
                                            </CardContent>
                                          </Card>
                                        </TabsContent>
                                      </Tabs>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}