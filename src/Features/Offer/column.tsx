"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { toast } from "sonner";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import type React from "react";
import { useAppDispatch } from "@/app/hooks";
import { fetchDiscountAsync } from "@/app/DiscountSlice";
import { Offer, OfferResponse, OfferSkuDetail } from "./type";
import { fetchOfferAsync } from "@/app/OfferSlice";

const formSchema = z.object({
  status: z.boolean(),
});

type CustomColumnDef<T> = ColumnDef<T> & {
  expandedContent?: (row: { original: T }) => JSX.Element;
};

export const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

export const Columns: CustomColumnDef<Offer>[] = [
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
    expandedContent: ({ original }) => <ExpandedRowContent offer={original} />,
  },
  { header: "Offer Name", accessorKey: "name" },
  { header: "Buy Quantity", accessorKey: "buyQuantity" },
  { header: "Get Quantity", accessorKey: "getQuantity" },
  { header: "Offer Key", accessorKey: "attributeKey" },
  {
    header: "Start Date",
    accessorKey: "startDate",
    cell: ({ row }) => {
      return (
        <span>{row.original.startDate?.split("-")?.reverse()?.join("/")}</span>
      );
    },
  },
  {
    header: "Start Time",
    accessorKey: "startTime",
    cell: ({ row }) => {
      return (
        <span>
          {row.original.startTime ? formatTime(row.original.startTime) : ""}
        </span>
      );
    },
  },
  {
    header: "End Date",
    accessorKey: "endDate",
    cell: ({ row }) => {
      return (
        <span>
          {row.original.endDate?.split("-")?.reverse()?.join("/") ||
            "Not mentioned"}
        </span>
      );
    },
  },
  {
    header: "End Time",
    accessorKey: "endTime",
    cell: ({ row }) => {
      return (
        <span>
          {row.original.endTime
            ? formatTime(row.original.endTime)
            : "Not mentioned"}
        </span>
      );
    },
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      type FormSchemaType = z.infer<typeof formSchema>;

      const form = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          status: row.original.status,
        },
      });

      const dispatch = useAppDispatch();

      async function onSubmit(data: FormSchemaType, prevValue: boolean) {
        try {
          await axios.put(
            `${BASE_URL}/api/offer/${row.original.id}?status=${
              !data.status ? false : true
            }`
          );
          toast.success("Offer status updated successfully");
          await dispatch(fetchOfferAsync(""));
        } catch (error) {
          toast.error(
            error?.response?.data?.message ||
              error?.response?.data?.split(":")[1] ||
              "Something went wrong",
            {
              duration: 7000,
            }
          );
          form.setValue("status", prevValue); // Revert to previous value
        }
      }

      return (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => onSubmit(data, !data.status))}
          >
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        const prevValue = field.value; // Store previous value
                        field.onChange(checked); // Update field value
                        form.handleSubmit((data) =>
                          onSubmit(data, prevValue)
                        )(); // Submit form on change
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      );
    },
  },
  // {
  //   id: "actions",
  //   header: "Edit",
  //   cell: ({ row }) => {
  //     return <EditOffer discount={row.original} />;
  //   },
  // },
];

interface ExpandedRowProps {
  offer: Offer;
}

const ExpandedRowContent: React.FC<ExpandedRowProps> = ({ offer }) => {
  const [offerDetails, setOfferDetails] = useState<OfferSkuDetail[] | null>([]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/offer/skus/${offer.id}`);
      setOfferDetails(res.data);
    } catch (error) {
      toast.error("");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="grid  gap-5">
      {offer.selectAll ? (
        <span className="p-2 italic text-purple-800 font-semibold md:text-lg">
          This offer is applicable to all products
        </span>
      ) : (
        <Card>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2 capitalize">
              <h3 className="font-semibold">Products</h3>
              <div className="text-sm flex flex-col gap-7 text-muted-foreground">
                <table className="table-auto border-collapse border border-gray-300 w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 px-4 py-2">SKU</th>
                      <th className="border border-gray-300 px-4 py-2">
                        Product Id
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Product Name
                      </th>
                      <th className="border border-gray-300 px-4 py-2">Fit</th>
                      <th className="border border-gray-300 px-4 py-2">Size</th>
                      <th className="border border-gray-300 px-4 py-2">
                        Color
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Price
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Pattern
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Quantity
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Images
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {offerDetails?.map((detail, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2">
                          {detail.skuId}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {detail.productId}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {detail.productName}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {detail.attribute.fit}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {detail.attribute.size}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <div className="flex items-center">
                            <span
                              className="w-6 h-6 inline-block rounded-full mr-2"
                              style={{
                                backgroundColor: `#${detail.attribute.color
                                  ?.split("-")
                                  .pop()}`,
                              }}
                            ></span>
                            <span>{detail.attribute.color?.split("-")[0]}</span>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          ₹{detail.attribute.price}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {detail.attribute.pattern}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {detail.attribute.quantity}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <div className="flex gap-2">
                            {detail.attribute.imgs.map((img) => (
                              <img
                                key={img.img_Id}
                                src={img.img_url || "/placeholder.svg"}
                                alt={img.img_name}
                                className="w-16 h-16 object-cover"
                              />
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
