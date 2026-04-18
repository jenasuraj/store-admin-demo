import React, { useEffect, useState } from "react";
import { HeaderActions } from "./header-actions";
import ProductTable from "./Productable";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";
import { Product, PaginatedResponse } from "./type";
import { Pagination } from "./pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, ChevronUp, Package, Ruler, Tag } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ShadcnTable from "@/components/shadcnTable/ShadcnTable";


type CustomColumnDef<T> = ColumnDef<T> & {
  expandedContent?: (row: { original: T }) => JSX.Element;
};

interface ExpandedRowProps {
  order: Product;
}

const column: CustomColumnDef<Product>[] = [
  {
    header: "Product",
    accessorKey: "name",
  },
  {
    header: "Status",
    accessorFn: (row) => row.status,
    cell: ({ row }) => {
      return (
        <Badge
          variant={
            row.original.status === "active" ? "default" : "secondary"
          }
          className="cursor-pointer"
        >
          {row.original.status}
        </Badge>
      )
    },
  },
  {
    header: "Variant",
    accessorFn: (row) => (row.attributes?.length || 0) + " variants",
  },
  {
    header: "Default SKU",
    accessorKey: "defaultSku",
  },
  {
    id: "expander",
    size: 40,
    header: () => null,
    cell: ({ row }) => (
      <Button
        onClick={() => row.toggleExpanded()}
        className="size-7  w-full"
        size="icon"
        variant="ghost"
      >
        {row.getIsExpanded() ? (
          <ChevronDown
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
        ) : (
          <ChevronRight
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
        )}
      </Button>
    ),
    expandedContent: ({ original }) => <ExpandedRowContent order={original} />,
  },
]

const ExpandedRowContent: React.FC<ExpandedRowProps> = ({ order }) => {
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
    <div className="w-full p-4 bg-muted/30 border-t">
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
          {order?.attributes?.map((attribute, index) => (
            <React.Fragment key={attribute.sku + index}>
              <TableRow
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() =>
                  toggleAttribute(order.productId, index)
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
                    order.productId
                  ]?.includes(index) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </TableCell>
              </TableRow>
              {expandedAttributes[order.productId]?.includes(
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
  )
};

export default function ProductList() {
  // Store the current list of products being displayed
  const [products, setProducts] = useState<Product[]>([]);

  // Filter State
  const [status, setStatus] = useState("active");

  const navigate = useNavigate();
  const location = useLocation();

  // Unified fetch function that handles pagination and status
  const fetchProducts = async () => {
    try {
      // Construct URL with pagination parameters
      const url = `${BASE_URL}/api/products?status=${status}&page=${0}&size=${10000}`;

      const res = await axios.get<PaginatedResponse<Product>>(url);

      if (res.status === 200) {
        setProducts(res.data.content);
        // Optional: Update total elements if you display counts
        // setTotalElements(res.data.totalElements); 
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Effect to fetch data when dependencies change
  useEffect(() => {
    fetchProducts();

    // Update URL params for shareability (optional)
    navigate({
      search: `?status=${status}&page=${0}&size=${10000}`,
    });
  }, [status]);

  // Handle Tab Change
  const handleTabChange = (newStatus: string) => {
    setStatus(newStatus);
    // setCurrentPage(0); // Reset to first page when switching tabs
  };

  const updateStatus = async (productId: number, newStatus: string) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/api/products/updateStatus/${productId}?status=${newStatus}`
      );

      if (res.status === 200) {
        // Remove the item from the current view immediately (Optimistic UI)
        // or re-fetch data. Removing is smoother for pagination.
        setProducts((prev) => prev.filter((p) => p.productId !== productId));

        // Optionally refetch to ensure pagination count is correct
        // fetchProducts(); 
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="p-8 w-full max-w-[100vw] bg-white mx-auto">
      <Tabs value={status} onValueChange={handleTabChange} defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          {/* <TabsTrigger value="draft">Draft</TabsTrigger> */}
        </TabsList>

        <TabsContent value={status}>
          <div className="space-y-4">
            {/* <ProductTable products={products} onStatusChange={updateStatus} /> */}
            <ShadcnTable
              title="Product"
              data={products}
              columns={column}
              loading={false}
              error={false}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}