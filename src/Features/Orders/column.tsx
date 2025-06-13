import { ColumnDef } from "@tanstack/react-table";
import { Order } from "./type";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Package,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";
import { toast } from "sonner";
import { useAppDispatch } from "@/app/hooks";
import { fetchOrderAsync } from "@/app/OrderSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa6";
import Logo from "../../assets/LOGO.png";
import ShippingStickerButton from "@/assets/ShippingStickerButton";

// Extend ColumnDef to allow `expandedContent`
type CustomColumnDef<T> = ColumnDef<T> & {
  expandedContent?: (row: { original: T }) => JSX.Element;
};

interface ExpandedRowProps {
  order: Order;
}

const ExpandedRowContent: React.FC<ExpandedRowProps> = ({ order }) => {
  const companyAddress = {
    name: "House of Valor",
    gstin: "27FMVPS3768H1ZZ",
  };

  return (
    <Tabs defaultValue="details" className="w-full bg-muted/50">
      <div className="flex mb-4 items-center justify-between">
        <TabsList>
          <TabsTrigger className="space-x-2" value="details">
            <Package className="h-4 w-4" />
            <span>Order Details</span>
          </TabsTrigger>
          <TabsTrigger className="space-x-2" value="shipping">
            <Truck className="h-4 w-4" />
            <span>User Details</span>
          </TabsTrigger>
          <TabsTrigger className="space-x-2" value="items">
            <ShoppingCart className="h-4 w-4" />
            <span>Items</span>
          </TabsTrigger>
        </TabsList>

        {/* Shipping Sticker */}
        <div className="flex justify-end">
          {/* Use the new ShippingStickerButton component */}
          <ShippingStickerButton
            order={order}
            companyLogo={Logo}
            companyAddress={companyAddress}
          />
        </div>
      </div>
      {/* Order Details */}
      <TabsContent value="details">
        <Card>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Payment Information</h3>
              <div className="text-sm text-muted-foreground">
                <p>Method: {order.paymentMethod}</p>
                <p>Status: {order.paymentStatus}</p>
                <p>Transaction ID: {order.transactionId}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Badge
                  variant={
                    order.paymentStatus === "SUCCESSFUL"
                      ? "default"
                      : "destructive"
                  }
                >
                  {order.paymentStatus}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Total Items</p>
                  <p className="text-sm text-muted-foreground">
                    {order.totalItems}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Shipping Address */}
      <TabsContent value="shipping">
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm flex gap-1 flex-col">
              <p>Eamil: {order.userEmail}</p>
              <div>
                <p>Address: {order.localAddress}</p>
                <p>
                  {order.city}, {order.state} {order.pincode}
                </p>
                <p>{order.country}</p>
                <p>Landmark: {order.landmark ?? "NA"}</p>
              </div>
              <p>Mobile: {order.userPhone}</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Items List */}
      <TabsContent value="items">
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="h-auto w-full rounded-md">
              <div className="p-4 space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-md">
                      <img
                        src={item.images[0] || "/placeholder.svg"}
                        alt={item.productName}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.productName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        SKU Detail: {item.sku}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} | ₹ {item.price} | Size:{" "}
                        {item.size}
                      </p>
                      <div className="flex gap-2">
                        <span>Color:</span>
                        <div
                          className="mt-1 w-4 h-4 border-2 border-gray-300 shadow-md rounded-full"
                          style={{
                            // backgroundColor: "white",
                            backgroundColor: `#${item.color.split("-")[1]}`,
                          }}
                          title={item.color.split("-")[0]}
                        ></div>
                        <span>Fit - {item.fit}</span>
                      </div>
                    </div>
                    <div>
                      {/* <Badge
                        className="text-xs cursor-pointer"
                        onClick={handlePrintSticker}
                      >
                        Print Sticker
                      </Badge> */}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export const columns: CustomColumnDef<Order>[] = [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => (
      <Button
        onClick={() => row.toggleExpanded()}
        className="size-7 shadow-none text-muted-foreground w-full"
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
    ),
    expandedContent: ({ original }) => <ExpandedRowContent order={original} />,
  },
  {
    accessorKey: "id",
    header: "Order ID",
  },
  {
    accessorKey: "orderDate",
    header: "Order Date",
    cell: ({ row }) => new Date(row.original.orderDate).toLocaleDateString(),
  },
  {
    header: "Customer Name",
    cell: ({ row }) => (
      <p>
        {row.original.firstName} {row.original.lastName}
      </p>
    ),
  },
  {
    accessorKey: "orderStatus",
    header: "Status",
    cell: ({ row }) => {
      const dispatch = useAppDispatch();
      const params = useLocation().search;
      const sort = params.split("?")[1];
      const [selectedStatus, setSelectedStatus] = useState("");
      const [loading, setLoading] = useState(true);
      const [open, setOpen] = useState(false);

      useEffect(() => {
        if (row.original?.orderStatus) {
          setSelectedStatus(row.original.orderStatus);
        }
        setLoading(false);
      }, [row.original?.orderStatus]);

      const handleStatusChange = async (newStatus: string) => {
        try {
          const res = await axios.put(
            `${BASE_URL}/api/orders/${row.original.id}/status?status=${newStatus}`
          );
          setLoading(true);

          if (res.status === 200) {
            toast.success("Status updated successfully");
            dispatch(
              fetchOrderAsync(
                params
                  ? params
                  : `?status=${row.original.orderStatus?.toLowerCase()}`
              )
            ).unwrap();
            setLoading(false);
          } else {
            throw new Error("Failed to update status");
          }
        } catch (error) {
          toast.error("Error updating status. Please try again.");
          console.error("Error updating status:", error);
        }
      };

      const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
          case "pending":
            return "boder border-red-500 text-black bg-red-100 text-red-700"; // Tailwind class
          case "packed":
            return "border border-orange-500 bg-orange-100 text-black text-orange-700";
          case "shipped":
            return "border border-yellow-500 bg-yellow-100 text-black text-yellow-700";
          case "delivered":
            return "border border-green-500 bg-green-100 text-black text-green-700";
          case "PAYMENT_FAILED":
            return "border border-red-600 bg-red-200 text-black text-red-800";
          default:
            return "bg-gray-400"; // fallback color
        }
      };

      return loading ? (
        <span>
          <FaSpinner className="animate-spin " />
        </span>
      ) : (
        <>
          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger
              className={`max-w-2xl text-white px-3 py-1 rounded-md ${getStatusColor(
                selectedStatus
              )} capitalize`}
            >
              <SelectValue placeholder="Select Order Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="SHIPPED">Shipped</SelectItem>
              <SelectItem value="PACKED">Packed</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PAYMENT_FAILED">Payment Failed</SelectItem>
            </SelectContent>
          </Select>
        </>
      );
    },
  },
  {
    accessorKey: "orderAmount",
    header: "Order Amount",
  },
];

export default columns;

export const columnsForPaymentFailed: CustomColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
  },
  {
    accessorKey: "orderDate",
    header: "Order Date",
    cell: ({ row }) => new Date(row.original.orderDate).toLocaleDateString(),
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }) => (
      <span className="p-2 border rounded-lg text-red-600 border-red-500 bg-red-200">
        {row.original.paymentStatus?.split("_").join(" ")}
      </span>
    ),
  },
  {
    accessorKey: "orderAmount",
    header: "Order Amount",
  },
];
