import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Package,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";
import { toast } from "sonner";
import { useAppDispatch } from "@/app/hooks";
import { Return, RETURN_STATUS, Returns } from "./type";
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
import { approveFormSchema, rejectFormSchema } from "../Exchange/column";
import { fetchReturnAsync } from "@/app/ReturnSlice";

// Extend ColumnDef to allow `expandedContent`
type CustomColumnDef<T> = ColumnDef<T> & {
  expandedContent?: (row: { original: T }) => JSX.Element;
};

export const columns: CustomColumnDef<Return>[] = [
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
    header: "Return ID",
    accessorKey: "returnProductId",
  },
  {
    header: "Return Date",
    cell: ({ row }) => new Date(row.original.returnDate).toLocaleDateString(),
  },
  {
    accessorKey: "customerName",
    header: "Customer Name",
  },
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "quantity",
    header: "Return Quantity",
  },
  {
    accessorKey: "refundAmount",
    header: "Return Amount",
  },
  // {
  //   accessorKey: "returnStatus",
  //   header: "Status",
  //   cell: ({ row }) => {
  //     const dispatch = useAppDispatch();
  //     const [openPop, setOpenPop] = useState(false);
  //     const [selectedStatus, setSelectedStatus] = useState("");
  //     const [remark, setRemark] = useState("");

  //     const handleStatusChange = async (newStatus: RETURN_STATUS) => {
  //       if (newStatus === "REJECTED") {
  //         setSelectedStatus(newStatus);
  //         return;
  //       }
  //       try {
  //         const res = await axios.put(
  //           `${BASE_URL}/api/returns/admin/update/${row.original.returnProductId}`,
  //           {
  //             status: newStatus,
  //             remark: "",
  //           }
  //         );
  //         if (res.status === 200) {
  //           setSelectedStatus(newStatus);
  //           toast.success("Status updated successfully");
  //           setOpenPop(false);
  //           dispatch(fetchReturnAsync()).unwrap();
  //         } else {
  //           throw new Error("Failed to update status");
  //         }
  //       } catch (error) {
  //         toast.error("Error updating status. Please try again.");
  //         console.error("Error updating status:", error);
  //       }
  //     };

  //     const handleSubmit = async () => {
  //       if (!remark.trim()) {
  //         toast.error("Remarks cant be empty.");
  //         return;
  //       }
  //       try {
  //         const res = await axios.put(
  //           `${BASE_URL}/api/returns/admin/update/${row.original.returnProductId}`,
  //           {
  //             status: selectedStatus,
  //             remark: remark,
  //           }
  //         );
  //         if (res.status === 200) {
  //           toast.success("Status updated successfully");
  //           dispatch(fetchReturnAsync()).unwrap();
  //           setOpenPop(false);
  //         } else {
  //           throw new Error("Failed to update status");
  //         }
  //       } catch (error) {
  //         toast.error("Error updating status. Please try again.");
  //         console.error("Error updating status:", error);
  //       }
  //     };

  //     const getStatusName = (status: RETURN_STATUS) => {
  //       switch (status) {
  //         case "INITIATED":
  //           return "Initiated";
  //         case "PICKED_UP":
  //           return "Picked Up";
  //         case "REFUND_INITIATED":
  //           return "Approve";
  //         case "REJECTED":
  //           return "Reject";
  //         case "REFUNDED":
  //           return "Refunded";
  //         default:
  //           return status;
  //       }
  //     };

  //     return (
  //       <>
  //         <Popover open={openPop} onOpenChange={setOpenPop}>
  //           <PopoverTrigger
  //             onClick={() => {
  //               setOpenPop(true);
  //             }}
  //             className="w-[200px] border p-1 rounded-md shadow-sm"
  //           >
  //             {getStatusName(row.original.returnStatus)}
  //           </PopoverTrigger>
  //           <PopoverContent className="bg-white z-10 border w-[--radix-popover-trigger-width] p-1 rounded-md mt-1 shadow-sm">
  //             <Command>
  //               <CommandInput placeholder="Search status..." className="h-9" />
  //               <CommandList>
  //                 <CommandEmpty>No status found.</CommandEmpty>
  //                 <CommandGroup>
  //                   {[
  //                     "INITIATED",
  //                     "PICKED_UP",
  //                     "REFUND_INITIATED",
  //                     "REJECTED",
  //                     "REFUNDED",
  //                   ].map((status) => {
  //                     const isVisible = (() => {
  //                       switch (status) {
  //                         case "INITIATED":
  //                           return row.original.returnStatus === "INITIATED";
  //                         case "PICKED_UP":
  //                           return ["INITIATED", "PICKED_UP"].includes(
  //                             row.original.returnStatus
  //                           );
  //                         case "REFUND_INITIATED":
  //                           return ["PICKED_UP", "REFUND_INITIATED"].includes(
  //                             row.original.returnStatus
  //                           );
  //                         case "REJECTED":
  //                           return ["PICKED_UP", "REJECTED"].includes(
  //                             row.original.returnStatus
  //                           );
  //                         case "REFUNDED":
  //                           return ["REFUND_INITIATED"].includes(
  //                             row.original.returnStatus
  //                           );
  //                         default:
  //                           return false;
  //                       }
  //                     })();
  //                     return (
  //                       isVisible && (
  //                         <CommandItem
  //                           key={status}
  //                           onSelect={() =>
  //                             handleStatusChange(status as RETURN_STATUS)
  //                           }
  //                         >
  //                           {getStatusName(status as RETURN_STATUS)}
  //                         </CommandItem>
  //                       )
  //                     );
  //                   })}
  //                 </CommandGroup>
  //               </CommandList>
  //             </Command>
  //             {selectedStatus === "REJECTED" && (
  //               <div className="mt-2 gap-2 flex flex-col">
  //                 <Label htmlFor="remarks">Enter remark for rejection:</Label>
  //                 <Textarea
  //                   placeholder="Enter remark"
  //                   value={remark || ""}
  //                   id="remarks"
  //                   onChange={(e) => setRemark(e.target.value)}
  //                   className="w-full p-2 border rounded-md"
  //                 />
  //                 <Button onClick={handleSubmit} className="mt-2 w-full">
  //                   Submit
  //                 </Button>
  //               </div>
  //             )}
  //           </PopoverContent>
  //         </Popover>
  //       </>
  //     );
  //   },
  // },
  {
    accessorKey: "returnStatus",
    header: "Status",
    cell: ({ row }) => {
      const dispatch = useAppDispatch();
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const [selectedStatus, setSelectedStatus] =
        useState<RETURN_STATUS | null>(null);
      const [isPopOpen, setIsPopOpen] = useState(false);
      const status = row.original.returnStatus;

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

      const handleStatusChange = async (newStatus: RETURN_STATUS) => {
        // For EXCHANGE_APPROVED and REJECTED, show dialog
        if (newStatus === "REFUND_INITIATED" || newStatus === "REJECTED") {
          setSelectedStatus(newStatus);
          setIsDialogOpen(true);
          return;
        }

        // For other statuses, directly update
        try {
          const res = await axios.put(
            `${BASE_URL}/api/returns/updateStatus/${row.original.returnProductId}`,
            { status: newStatus }
          );
          if (res.status === 200) {
            toast.success("Status updated successfully");
            setIsPopOpen(false);
            await dispatch(fetchReturnAsync("")).unwrap();
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
            `${BASE_URL}/api/returns/updateStatus/${row.original.returnProductId}`,
            {
              status: "REFUND_INITIATED",
              approvedQuantity: +data.approvedQuantity,
              remark: data.remarks || "",
            }
          );

          if (res.status === 200) {
            toast.success("Return approved successfully");
            setIsDialogOpen(false);
            setIsPopOpen(false);
            await dispatch(fetchReturnAsync("")).unwrap();
            approveForm.reset();
          } else {
            throw new Error("Failed to update status");
          }
        } catch (error) {
          toast.error("Error approving return. Please try again.");
          console.error("Error updating status:", error);
        }
      };

      const onRejectSubmit = async (data: z.infer<typeof rejectFormSchema>) => {
        try {
          const res = await axios.put(
            `${BASE_URL}/api/returns/updateStatus/${row.original.returnProductId}`,
            {
              status: "REJECTED",
              remark: data.remarks,
            }
          );

          if (res.status === 200) {
            toast.success("Return rejected successfully");
            setIsDialogOpen(false);
            setIsPopOpen(false);
            await dispatch(fetchReturnAsync("")).unwrap();
            rejectForm.reset();
          } else {
            throw new Error("Failed to update status");
          }
        } catch (error) {
          toast.error("Error rejecting return. Please try again.");
          console.error("Error updating status:", error);
        }
      };

      const getStatusName = (status: RETURN_STATUS) => {
        switch (status) {
          case "INITIATED":
            return "Initiated";
          case "PICKED_UP":
            return "Picked Up";
          case "REFUND_INITIATED":
            return "Approved";
          case "REJECTED":
            return "Rejected";
          case "REFUNDED":
            return "Refunded";
          default:
            return status;
        }
      };

      const getStatusColor = (status: RETURN_STATUS) => {
        switch (status) {
          case "INITIATED":
            return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300";
          case "PICKED_UP":
            return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300";
          case "REFUND_INITIATED":
            return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300";
          case "REJECTED":
            return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300";
          case "REFUNDED":
            return "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300";
          default:
            return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300";
        }
      };

      // Available status options based on current status
      const getAvailableStatuses = () => {
        const allStatuses: RETURN_STATUS[] = [
          "INITIATED",
          "PICKED_UP",
          "REFUND_INITIATED",
          "REJECTED",
          "REFUNDED",
        ];

        // Filter based on current status
        switch (status) {
          case "INITIATED":
            return ["INITIATED", "PICKED_UP", "REFUND_INITIATED", "REJECTED"];
          case "PICKED_UP":
            return ["PICKED_UP", "REFUND_INITIATED", "REJECTED"];
          case "REFUND_INITIATED":
            return ["REFUND_INITIATED", "REFUNDED"];
          case "REJECTED":
            return ["REJECTED"];
          case "REFUNDED":
            return ["REFUNDED"];
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
          {status == "REFUNDED" || status == "REJECTED" ? (
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
                    : getStatusName(status)}{" "}
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
                              handleStatusChange("REFUND_INITIATED")
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
                      {status === "REFUND_INITIATED" && (
                        <CommandItem
                          onSelect={() => handleStatusChange("REFUNDED")}
                        >
                          <div className="w-full px-2 py-1 rounded-sm">
                            Refunded
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
                    ? "Reject Return"
                    : "Approve Return"}
                </AlertDialogTitle>
              </AlertDialogHeader>

              {selectedStatus === "REFUND_INITIATED" && (
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
                            onValueChange={field.onChange}
                            defaultValue={`${field.value}`}
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
  order: Return;
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
                {order.skuDetails.images.map((img) => (
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
                <p>SKU: {order.sku}</p>
                <p>Size: {order.skuDetails.size}</p>
                <p className="flex items-center gap-2">
                  Color:
                  <span>{order.skuDetails.color?.split("-")[0]}</span>
                  <div
                    style={{
                      backgroundColor: `#${order.skuDetails.color
                        ?.split("-")
                        ?.pop()}`,
                    }}
                    className="h-4 w-4 rounded-full"
                  ></div>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4 capitalize">
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold">Return Description</h3>
              <div>
                <p>Order Id: {order.orderId}</p>
                <p>Reason: {order.returnReason}</p>
                <p>Return Quantity: {order.quantity}</p>
                <p>Ordered Quantity: {order.orderQuantity}</p>
                <p>User Remark: {order.remark || "No remarks added"}</p>
                {order.returnStatus == "REJECTED" && (
                  <p>Rejection Remark: {order?.rejectedReason}</p>
                )}
                <p className="capitalize">
                  Status: {order.returnStatus?.toLowerCase()}
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
                  Email <span className="lowercase">- {order.userName} </span>
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
