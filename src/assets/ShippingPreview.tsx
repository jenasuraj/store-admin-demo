import type React from "react";
import type { Order } from "@/Features/Orders/type";

interface ShippingStickerPreviewProps {
  order: Order;
  companyLogo?: string;
  companyAddress?: {
    name: string;
    gstin: string;
  };
}

// Default company address
const defaultCompanyAddress = {
  name: "House of Valor",
  gstin: "27FMVPS3768H1ZZ",
};

export const ShippingStickerPreview: React.FC<ShippingStickerPreviewProps> = ({
  order,
  companyLogo = "/logo.png",
  companyAddress = defaultCompanyAddress,
}) => {
  // Calculate total amount
  const totalAmount = order.items.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );

  // Format date
  const orderDate = new Date(order.orderDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="font-sans text-sm p-4 bg-white">
      {/* Header with company info */}
      <div className="text-center mb-3 pb-2 border-b border-gray-800">
        <div className="flex justify-center mb-1">
          {companyLogo && (
            <img
              src={companyLogo || "/placeholder.svg"}
              alt="Company Logo"
              className="h-8 object-contain"
            />
          )}
        </div>
        <h1 className="text-lg font-bold">{companyAddress.name}</h1>
        <p className="text-sm">
          Order #{order.id} | Date: {orderDate}
        </p>
      </div>

      {/* Addresses section */}
      <div className="flex flex-row mb-3 pb-2 border-b border-gray-800">
        {/* From address */}
        <div className="flex-1 p-2">
          <h2 className="text-xs font-bold uppercase mb-1">From:</h2>
          <p className="text-xs mb-0.5">{companyAddress.name}</p>
          <p className="text-xs mb-0.5">{companyAddress.gstin}</p>
        </div>

        {/* To address */}
        <div className="flex-1 p-2">
          <h2 className="text-xs font-bold uppercase mb-1">To:</h2>
          <p className="text-xs mb-0.5">
            {order.firstName} {order.lastName}
          </p>
          <p className="text-xs mb-0.5">{order.localAddress}</p>
          {order.landmark && (
            <p className="text-xs mb-0.5">Landmark: {order.landmark}</p>
          )}
          <p className="text-xs mb-0.5">
            {order.city}, {order.state} - {order.pincode}
          </p>
          <p className="text-xs mb-0.5">{order.country}</p>
          <p className="text-xs mb-0.5">Phone: {order.userPhone || "N/A"}</p>
        </div>
      </div>

      {/* Order items */}
      <div className="mb-3">
        <h2 className="text-xs font-bold uppercase mb-1">Order Items:</h2>
        <div className="border border-gray-800">
          {/* Table header */}
          <div className="flex bg-gray-100 font-bold text-xs">
            <div className="w-1/2 p-1 border-r border-gray-800">Product</div>
            <div className="w-1/6 p-1 border-r border-gray-800 text-center">
              Qty
            </div>
            <div className="w-1/6 p-1 border-r border-gray-800 text-right">
              Price
            </div>
            <div className="w-1/6 p-1 text-right">Total</div>
          </div>

          {/* Table rows */}
          {order.items.map((item, index) => (
            <div
              key={index}
              className={`flex text-xs ${
                index !== order.items.length - 1
                  ? "border-b border-gray-800"
                  : ""
              }`}
            >
              <div className="w-1/2 p-1 border-r border-gray-800">
                {item.productName} ({item.color.split("-")[0]})
              </div>
              <div className="w-1/6 p-1 border-r border-gray-800 text-center">
                {item.quantity}
              </div>
              <div className="w-1/6 p-1 border-r border-gray-800 text-right">
                ₹{item.price.toFixed(2)}
              </div>
              <div className="w-1/6 p-1 text-right">
                ₹{(item.quantity * item.price).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Total amount */}
        <div className="flex justify-end mt-2 pt-1 border-t border-gray-800">
          <div className="text-xs font-bold mr-2">Total Amount:</div>
          <div className="text-xs font-bold">₹{totalAmount.toFixed(2)}</div>
        </div>
      </div>

      {/* Payment info */}
      <div className="mt-3">
        <p className="text-xs font-bold">Payment Information:</p>
        <p className="text-xs mt-0.5">Method: {order.paymentMethod}</p>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-1 border-t border-gray-300 text-center text-[8px] text-gray-500">
        <p>
          This is a system generated shipping label. Thank you for your order!
        </p>
      </div>
    </div>
  );
};

export default ShippingStickerPreview;
