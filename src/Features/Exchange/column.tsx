import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";
import { toast } from "sonner";
import { useAppDispatch } from "@/app/hooks";
import { fetchReturnAsync } from "@/app/ReturnSlice";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Exchange, EXCHANGE_STATUS } from "./type";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchExchangeAsync } from "@/app/ExchangeSlice";

// Extend ColumnDef to allow `expandedContent`
type CustomColumnDef<T> = ColumnDef<T> & {
  expandedContent?: (row: { original: T }) => JSX.Element;
};

export const approveFormSchema = z.object({
  approvedQuantity: z.string().min(1, "Approved quantity is required"),
  // rejectedQuantity: z.string().min(1, "Rejected quantity is required"),
  remarks: z.string().min(1, "Remark is required"),
});

export const rejectFormSchema = z.object({
  remarks: z.string().min(1, "Rejection remarks are required"),
});

export const columns: CustomColumnDef<Exchange>[] = [
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
    header: "Exchange ID",
    accessorKey: "id",
  },
  {
    header: "Exchange Date",
    cell: ({ row }) =>
      new Date(row.original.exchangeDate)?.toLocaleDateString(),
  },
  {
    accessorKey: "customerName",
    header: "Customer Name",
  },
  {
    accessorKey: "sku.sku",
    header: "SKU",
  },
  {
    accessorKey: "exchangeSku.sku",
    header: "Exchange SKU",
  },
  {
    accessorKey: "quantity",
    header: "Exchange Quantity",
  },
  {
    accessorKey: "exchangeStatus",
    header: "Status",
    cell: ({ row }) => {
      const dispatch = useAppDispatch();
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const [selectedStatus, setSelectedStatus] =
        useState<EXCHANGE_STATUS | null>(null);
      const [isPopOpen, setIsPopOpen] = useState(false);
      const status = row.original.exchangeStatus;

      // Initialize React Hook Form for approval
      const approveForm = useForm<z.infer<typeof approveFormSchema>>({
        resolver: zodResolver(approveFormSchema),
        defaultValues: {
          approvedQuantity: `${row.original.quantity}`,
          remarks: "",
        },
      });

      // Initialize React Hook Form for rejection
      const rejectForm = useForm<z.infer<typeof rejectFormSchema>>({
        resolver: zodResolver(rejectFormSchema),
        defaultValues: {
          remarks: "",
        },
      });

      const handleStatusChange = async (newStatus: EXCHANGE_STATUS) => {
        // For EXCHANGE_APPROVED and REJECTED, show dialog
        if (newStatus === "EXCHANGE_APPROVED" || newStatus === "REJECTED") {
          setSelectedStatus(newStatus);
          setIsDialogOpen(true);
          return;
        }

        // For other statuses, directly update
        try {
          const res = await axios.put(
            `${BASE_URL}/api/exchange/updateStatus/${row.original.id}`,
            { status: newStatus }
          );
          if (res.status === 200) {
            toast.success("Status updated successfully");
            setIsPopOpen(false);
            await dispatch(fetchExchangeAsync("")).unwrap();
          } else {
            throw new Error("Failed to update status");
          }
        } catch (error) {
          toast.error("Error updating status. Please try again.");
          console.error("Error updating status:", error);
        }
      };

      const onApproveSubmit = async (
        data: z.infer<typeof approveFormSchema>
      ) => {
        try {
          const res = await axios.put(
            `${BASE_URL}/api/exchange/updateStatus/${row.original.id}`,
            {
              status: "EXCHANGE_APPROVED",
              approvedQuantity: +data.approvedQuantity,
              // rejectedQuantity: +data.rejectedQuantity,
              remark: data.remarks || "",
            }
          );

          if (res.status === 200) {
            toast.success("Exchange approved successfully");
            setIsDialogOpen(false);
            setIsPopOpen(false);
            await dispatch(fetchExchangeAsync("")).unwrap();
            approveForm.reset();
          } else {
            throw new Error("Failed to update status");
          }
        } catch (error) {
          toast.error("Error approving exchange. Please try again.");
          console.error("Error updating status:", error);
        }
      };

      const onRejectSubmit = async (data: z.infer<typeof rejectFormSchema>) => {
        try {
          const res = await axios.put(
            `${BASE_URL}/api/exchange/updateStatus/${row.original.id}`,
            {
              status: "REJECTED",
              remark: data.remarks,
            }
          );

          if (res.status === 200) {
            toast.success("Exchange rejected successfully");
            setIsDialogOpen(false);
            setIsPopOpen(false);
            await dispatch(fetchExchangeAsync("")).unwrap();
            rejectForm.reset();
          } else {
            throw new Error("Failed to update status");
          }
        } catch (error) {
          toast.error("Error rejecting exchange. Please try again.");
          console.error("Error updating status:", error);
        }
      };

      const getStatusName = (status: EXCHANGE_STATUS) => {
        switch (status) {
          case "INITIATED":
            return "Initiated";
          case "PICKED_UP":
            return "Picked Up";
          case "EXCHANGE_APPROVED":
            return "Approved";
          case "REJECTED":
            return "Rejected";
          case "REFUNDED":
            return "Refunded";
          case "COMPLETED":
            return "Completed";
          default:
            return status;
        }
      };

      const getStatusColor = (status: EXCHANGE_STATUS) => {
        switch (status) {
          case "INITIATED":
            return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300";
          case "PICKED_UP":
            return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300";
          case "EXCHANGE_APPROVED":
            return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300";
          case "REJECTED":
            return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300";
          case "REFUNDED":
            return "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300";
          case "COMPLETED":
            return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300";
          default:
            return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300";
        }
      };

      // Available status options based on current status
      const getAvailableStatuses = () => {
        const allStatuses: EXCHANGE_STATUS[] = [
          "INITIATED",
          "PICKED_UP",
          "EXCHANGE_APPROVED",
          "REJECTED",
          "REFUNDED",
        ];

        // Filter based on current status
        switch (status) {
          case "INITIATED":
            return ["INITIATED", "PICKED_UP", "EXCHANGE_APPROVED", "REJECTED"];
          case "PICKED_UP":
            return ["PICKED_UP", "EXCHANGE_APPROVED", "REJECTED"];
          case "EXCHANGE_APPROVED":
            return ["EXCHANGE_APPROVED", "COMPLETED"];
          case "REJECTED":
            return ["REJECTED"];
          case "REFUNDED":
            return ["REFUNDED"];
          case "COMPLETED":
            return ["COMPLETED"];
          default:
            return allStatuses;
        }
      };

      // Reset forms when dialog closes
      const handleDialogOpenChange = (open: boolean) => {
        if (!open) {
          approveForm.reset();
          rejectForm.reset();
          setSelectedStatus(null);
        }
        setIsDialogOpen(open);
      };

      return (
        <>
          {status == "COMPLETED" || status == "REJECTED" ? (
            <span
              className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md
                 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 
                 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50
                 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 px-3 border border-input
                  bg-background shadow-sm hover:bg-accent hover:text-accent-foreground py-1 h-auto 
                   ${getStatusColor(status)}`}
            >
              {getStatusName(status)}
            </span>
          ) : (
            <Popover open={isPopOpen} onOpenChange={setIsPopOpen}>
              <PopoverTrigger asChild>
                <Button
                  disabled={
                    approveForm.formState.isSubmitting ||
                    rejectForm.formState.isSubmitting
                  }
                  onClick={() => setIsPopOpen(true)}
                  variant="outline"
                  className={`px-3 py-1 h-auto font-medium ${getStatusColor(
                    status
                  )}`}
                >
                  {approveForm.formState.isSubmitting ||
                  rejectForm.formState.isSubmitting
                    ? "Updating..."
                    : getStatusName(status)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0 z-20">
                <Command>
                  <CommandInput
                    placeholder="Change status..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No status found.</CommandEmpty>
                    <CommandGroup>
                      {status === "INITIATED" && (
                        <CommandItem
                          onSelect={() => handleStatusChange("PICKED_UP")}
                        >
                          <div className="w-full px-2 py-1 rounded-sm">
                            Picked Up
                          </div>
                        </CommandItem>
                      )}
                      {status === "PICKED_UP" && (
                        <>
                          <CommandItem
                            onSelect={() =>
                              handleStatusChange("EXCHANGE_APPROVED")
                            }
                          >
                            <div className="w-full px-2 py-1 rounded-sm">
                              Approved
                            </div>
                          </CommandItem>
                          <CommandItem
                            onSelect={() => handleStatusChange("REJECTED")}
                          >
                            <div className="w-full px-2 py-1 rounded-sm">
                              Rejected
                            </div>
                          </CommandItem>
                        </>
                      )}
                      {status === "EXCHANGE_APPROVED" && (
                        <CommandItem
                          onSelect={() => handleStatusChange("COMPLETED")}
                        >
                          <div className="w-full px-2 py-1 rounded-sm">
                            Completed
                          </div>
                        </CommandItem>
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}

          <AlertDialog
            open={isDialogOpen}
            onOpenChange={handleDialogOpenChange}
          >
            <AlertDialogTrigger></AlertDialogTrigger>
            <AlertDialogContent className="z-[999]">
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {selectedStatus === "REJECTED"
                    ? "Reject Exchange"
                    : "Approve Exchange"}
                </AlertDialogTitle>
              </AlertDialogHeader>

              {selectedStatus === "EXCHANGE_APPROVED" && (
                <Form {...approveForm}>
                  <form
                    onSubmit={approveForm.handleSubmit(onApproveSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={approveForm.control}
                      name="approvedQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Approved Quantity</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              approveForm.setValue(
                                "approvedQuantity",
                                `${
                                  Number(row.original.quantity) - Number(value)
                                }`
                              );
                            }}
                            defaultValue={`${row.original.quantity}`}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select quantity" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="z-[1000] w-[--radix-select-trigger-width]">
                              {[...Array(row.original.quantity + 1).keys()]
                                .slice(1)
                                .map((num) => (
                                  <SelectItem key={num} value={num.toString()}>
                                    {num}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={approveForm.control}
                      name="remarks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Remarks</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter remarks"
                              {...field}
                              className=""
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <Button type="submit">Approve</Button>
                    </AlertDialogFooter>
                  </form>
                </Form>
              )}

              {selectedStatus === "REJECTED" && (
                <Form {...rejectForm}>
                  <form
                    onSubmit={rejectForm.handleSubmit(onRejectSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={rejectForm.control}
                      name="remarks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rejection Remarks</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter reason for rejection"
                              {...field}
                              className="resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <Button type="submit" variant="destructive">
                        Reject
                      </Button>
                    </AlertDialogFooter>
                  </form>
                </Form>
              )}
            </AlertDialogContent>
          </AlertDialog>
        </>
      );
    },
  },
];

export default columns;
interface ExpandedRowProps {
  order: Exchange;
}

const ExpandedRowContent: React.FC<ExpandedRowProps> = ({ order }) => {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2 capitalize">
            <h3 className="font-semibold">Product</h3>
            <div className="text-sm flex flex-col gap-7 text-muted-foreground">
              <div className="flex gap-2">
                {order.sku.images.map((img) => (
                  <div
                    key={img.img_Id}
                    className="relative group cursor-pointer"
                  >
                    <img
                      src={img.img_url || "/placeholder.svg"}
                      alt={img.img_name}
                      className="rounded-lg border h-[150px] overflow-hidden object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0  transition-opacity rounded-lg flex items-center justify-center">
                      <Button variant="secondary" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <p>Product Name: {order.productName}</p>
                <p>Product Subheading: {order.productSubheading}</p>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="border-r">
                    <p className="font-medium">Ordered SKU: </p>
                    <p>SKU: {order.sku.sku} </p>
                    <p>Size: {order.sku.size}</p>
                    <p className="flex items-center gap-2">
                      Color:
                      <span>{order.sku.color?.split("-")[0]}</span>
                      <div
                        style={{
                          backgroundColor: `#${order.sku.color
                            ?.split("-")
                            ?.pop()}`,
                        }}
                        className="h-4 w-4 rounded-full"
                      ></div>
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Exchange SKU: </p>
                    <p>SKU: {order.exchangeSku.sku} </p>
                    <p>Size: {order.exchangeSku.size}</p>
                    <p className="flex items-center gap-2">
                      Color:
                      <span>{order.exchangeSku.color?.split("-")[0]}</span>
                      <div
                        style={{
                          backgroundColor: `#${order.exchangeSku.color
                            ?.split("-")
                            .pop()}`,
                        }}
                        className="h-4 w-4 rounded-full"
                      ></div>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4 capitalize">
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold">Exchange Description</h3>
              <div>
                <p>Order Id: {order.orderId}</p>
                <p>Reason: {order.exchangeReason}</p>
                <p>Exchange Quantity: {order.quantity}</p>
                <p>Ordered Quantity: {order.orderQuantity}</p>
                <p>User Remark: {order.remark || "No remarks added"}</p>
                {order.exchangeStatus == "REJECTED" && (
                  <p>Rejection Remark: {order.rejectedReason}</p>
                )}
                <p className="capitalize">
                  Status: {order.exchangeStatus?.toLowerCase()}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-medium">Shipping Address: </span>
              <div className="text-sm text-muted-foreground">
                <p>{order.localAddress}</p>
                <p>{order.landmark}</p>
                <p>
                  {order.city}, {order.state} - {order.pincode}
                </p>
                <p className="">{order.country}</p>
                <p className="font-semibold">
                  Email <span className="lowercase">- {order.userEmail} </span>
                </p>
                <p className="font-semibold">Phone - {order.mobileNumber}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
