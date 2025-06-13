import * as React from "react";
import { ChevronDown, ChevronRight, Package, Ruler, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductResponse } from "./type";
import { Pagination } from "./pagination";

interface ProductAttribute {
  fit: string;
  sku: string;
  imgs: {
    img_Id: number;
    img_url: string;
    img_name: string;
    img_type: string;
  }[];
  size: string;
  color: string;
  price: number;
  pattern: string;
  quantity: number;
}

interface Product {
  productId: number;
  tags: string[];
  name: string;
  subheading: string;
  description: string;
  status: string;
  attributes: ProductAttribute[];
}

export default function ProductTable({
  products,
}: {
  products: ProductResponse[];
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
          {products.map((product) => (
            <React.Fragment key={product.productId}>
              <TableRow
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => toggleProduct(product.productId)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    {product.attributes[0]?.imgs[0] && (
                      <img
                        src={
                          product.attributes[0].imgs[0].img_url ||
                          "/placeholder.svg"
                        }
                        alt={product.name}
                        width={40}
                        height={40}
                        className="rounded-md object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium">{product.subheading}</div>
                      {/* <div className="text-sm text-muted-foreground">
                        {product.subheading}
                      </div> */}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      product.status === "active" ? "default" : "secondary"
                    }
                  >
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell>{product.attributes.length} variants</TableCell>
                <TableCell>{product.attributes[0]?.sku || "N/A"}</TableCell>
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
                            <TableHead>Final Stock</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {product.attributes.map((attribute, index) => (
                            <React.Fragment key={attribute.sku}>
                              <TableRow
                                className="hover:bg-muted/50 cursor-pointer"
                                onClick={() =>
                                  toggleAttribute(product.productId, index)
                                }
                              >
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-4 h-4 rounded-full border"
                                      style={{
                                        backgroundColor: `#${
                                          attribute.color?.split("-")[1]
                                        }`,
                                        borderColor:
                                          attribute.color?.split("-")[1] ===
                                          "FFFFFF"
                                            ? "e2e2e2"
                                            : "transparent",
                                      }}
                                    />
                                    <span>
                                      {attribute.color?.split("-")[0]} /{" "}
                                      {attribute.size}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>{attribute.sku}</TableCell>
                                <TableCell>
                                  ₹{attribute.price.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  {attribute.quantity} in stock
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
                                                      {attribute.price.toLocaleString()}
                                                    </div>
                                                  </div>
                                                  <div>
                                                    <div className="text-sm font-medium">
                                                      Size
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                      {attribute.size}
                                                    </div>
                                                  </div>
                                                  <div>
                                                    <div className="text-sm font-medium">
                                                      Color
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                      <div
                                                        className="w-4 h-4 rounded-full border"
                                                        style={{
                                                          backgroundColor: `#${
                                                            attribute?.color?.split(
                                                              "-"
                                                            )[1]
                                                          }`,
                                                          borderColor:
                                                            attribute?.color?.split(
                                                              "-"
                                                            )[1] === "#FFFFFF"
                                                              ? "#e2e2e2"
                                                              : "transparent",
                                                        }}
                                                      />
                                                      <span className="text-sm text-muted-foreground">
                                                        {
                                                          attribute?.color?.split(
                                                            "-"
                                                          )[0]
                                                        }
                                                      </span>
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
                                                      {attribute.fit}
                                                    </div>
                                                  </div>
                                                  <div>
                                                    <div className="text-sm font-medium">
                                                      Pattern
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                      {attribute.pattern}
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
                                                {attribute.imgs.map((img) => (
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
                                                    <div className="absolute inset-0 bg-black/40 opacity-0  transition-opacity rounded-lg flex items-center justify-center">
                                                      <Button
                                                        variant="secondary"
                                                        size="sm"
                                                      >
                                                        View
                                                      </Button>
                                                    </div>
                                                  </div>
                                                ))}
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
