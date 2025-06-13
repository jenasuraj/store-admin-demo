"use client";

import { useRef, useState } from "react";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FaSpinner } from "react-icons/fa6";
import type { Order } from "@/Features/Orders/type";
import ShippingSticker from "./ShippingSticker";

interface ShippingStickerButtonProps {
  order: Order;
  companyLogo?: string;
  companyAddress?: {
    name: string;
    gstin: string;
  };
}

export const ShippingStickerButton = ({
  order,
  companyLogo,
  companyAddress,
}: ShippingStickerButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const stickerRef = useRef<HTMLDivElement>(null);

  // Function to handle PDF generation
  const handleDownload = () => {
    setIsPrinting(true);
    // Simulate loading for better UX
    setTimeout(() => {
      setIsPrinting(false);
    }, 1000);
  };

  console.log(order);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          Print Sticker
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="h-[80vh] max-w-3xl overflow-y-auto">
        <AlertDialogHeader>
          <h2 className="text-lg font-semibold">Shipping Label</h2>
        </AlertDialogHeader>

        {/* Sticker Preview */}
        <div className="my-4 border rounded-md bg-white">
          <PDFViewer
            style={{ width: "100%", height: "60vh" }}
            showToolbar={false}
          >
            <ShippingSticker
              order={order}
              companyLogo={companyLogo}
              companyAddress={companyAddress}
            />
          </PDFViewer>
        </div>

        <AlertDialogFooter className="flex justify-between">
          <AlertDialogCancel>Close</AlertDialogCancel>
          <PDFDownloadLink
            document={
              <ShippingSticker
                order={order}
                companyLogo={companyLogo}
                companyAddress={companyAddress}
              />
            }
            fileName={`shipping-label-order-${order.id}.pdf`}
            className="w-auto"
            onClick={handleDownload}
          >
            {({ loading }) => (
              <Button disabled={loading || isPrinting}>
                {loading || isPrinting ? (
                  <>
                    <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  "Download PDF"
                )}
              </Button>
            )}
          </PDFDownloadLink>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ShippingStickerButton;
