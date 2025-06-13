import { Order } from "@/Features/Orders/type";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

// Register fonts for better typography
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf" },
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9vAw.ttf",
      fontWeight: 500,
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAw.ttf",
      fontWeight: 700,
    },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 8, // Reduced from 10
    padding: 15, // Reduced from 20
  },
  header: {
    textAlign: "center",
    marginBottom: 8, // Reduced from 10
    borderBottom: 1,
    borderBottomColor: "#000",
    paddingBottom: 4, // Reduced from 5
  },
  companyName: {
    fontSize: 10, // Reduced from 16
    fontWeight: "bold",
    marginBottom: 2, // Reduced from 5
  },
  orderInfo: {
    fontSize: 8, // Reduced from 12
    marginBottom: 4, // Reduced from 5
  },
  addressContainer: {
    flexDirection: "row",
    marginTop: 8, // Reduced from 10
    marginBottom: 5, // Reduced from 10
    borderBottom: 1,
    borderBottomColor: "#000",
    paddingBottom: 8, // Reduced from 10
  },
  addressColumn: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 9, // Reduced from 12
    fontWeight: "bold",
    marginBottom: 2, // Reduced from 5
  },
  addressText: {
    fontSize: 8, // Reduced from 10
    marginBottom: 1, // Reduced from 2
  },
  divider: {
    width: 1,
    backgroundColor: "#000",
    margin: "0 8px", // Reduced from 10px
  },
  itemsContainer: {
    marginTop: 5, // Reduced from 10
  },
  itemsTitle: {
    fontSize: 10, // Reduced from 12
    fontWeight: "bold",
    marginBottom: 4, // Reduced from 5
  },
  itemsTable: {
    display: "flex",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableLastRow: {
    borderBottomWidth: 0,
  },
  tableCell: {
    padding: 4, // Reduced from 5
    fontSize: 7, // Reduced from 9
  },
  productSerialNo: {
    width: "5%",
    borderRightWidth: 1,
    borderRightColor: "#000",
  },
  productCell: {
    width: "45%",
    borderRightWidth: 1,
    borderRightColor: "#000",
  },
  quantityCell: {
    width: "15%",
    borderRightWidth: 1,
    borderRightColor: "#000",
    textAlign: "center",
  },
  priceCell: {
    width: "15%",
    borderRightWidth: 1,
    borderRightColor: "#000",
    textAlign: "right",
  },
  totalCell: {
    width: "20%",
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8, // Reduced from 10
    paddingTop: 4, // Reduced from 5
    borderTopWidth: 1,
    borderTopColor: "#000",
  },
  totalLabel: {
    fontSize: 9, // Reduced from 11
    fontWeight: "bold",
    marginRight: 8, // Reduced from 10
  },
  totalValue: {
    fontSize: 9, // Reduced from 11
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 15, // Reduced from 20
    left: 15, // Reduced from 20
    right: 15, // Reduced from 20
    textAlign: "center",
    fontSize: 6, // Reduced from 8
    color: "#666",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 4, // Reduced from 5
  },
  logo: {
    width: 30, // Reduced from 100
    height: 25, // Reduced from 30
    marginBottom: 4, // Reduced from 5
  },
  headerContainer: {
    flexDirection: "row",
    gap: "10px",
    marginBottom: 8, // Reduced from 10
  },
  headerColumn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: "2px",
  },
});

// Define the component props
interface ShippingStickerProps {
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

// Create the PDF component
export const ShippingSticker = ({
  order,
  companyLogo = "/logo.png",
  companyAddress = defaultCompanyAddress,
}: ShippingStickerProps) => {
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
    <Document>
      <Page size="A6" orientation="landscape" style={styles.page}>
        {/* Header with company info */}
        <View style={styles.headerContainer}>
          {/* Logo and company name */}
          <View>
            {companyLogo && (
              <Image
                style={styles.logo}
                src={companyLogo || "/placeholder.svg"}
              />
            )}
          </View>
          {/* Order ID and date */}
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              borderLeftWidth: 1,
              borderLeftColor: "#000",
              paddingLeft: 10,
            }}
          >
            <Text style={styles.orderInfo}>Order Id: {order.id}</Text>
            <Text style={styles.orderInfo}>Date: {orderDate}</Text>
          </View>
        </View>

        {/* Payment info */}
        <View style={{ marginTop: 5 }}>
          <Text style={{ fontSize: 8, fontWeight: "bold" }}>
            Payment mode: {order.paymentMethod}
          </Text>
        </View>

        {/* Addresses section */}
        <View style={styles.addressContainer}>
          {/* From address */}
          <View style={styles.addressColumn}>
            <Text style={styles.addressTitle}>From:</Text>
            <Text style={styles.addressText}>{companyAddress.name}</Text>
            <Text style={styles.addressText}>GSTIN: {companyAddress.gstin}</Text>
            {/* <Text style={styles.addressText}>{companyAddress.street}</Text>
            <Text style={styles.addressText}>
              {companyAddress.city}, {companyAddress.state} -{" "}
              {companyAddress.pincode}
            </Text>
            <Text style={styles.addressText}>{companyAddress.country}</Text>
            <Text style={styles.addressText}>
              Phone: {companyAddress.phone}
            </Text> */}
          </View>

          {/* To address */}
          <View style={styles.addressColumn}>
            <Text style={styles.addressTitle}>To:</Text>
            <Text style={styles.addressText}>
              {order.firstName} {order.lastName}
            </Text>
            <Text style={styles.addressText}>{order.localAddress}</Text>
            {order.landmark && (
              <Text style={styles.addressText}>Landmark: {order.landmark}</Text>
            )}
            <Text style={styles.addressText}>
              {order.city}, {order.state} - {order.pincode}
            </Text>
            <Text style={styles.addressText}>{order.country}</Text>
            <Text style={styles.addressText}>
              Phone: {order.userPhone || "N/A"}
            </Text>
          </View>
        </View>

        {/* Order items */}
        <View style={styles.itemsContainer}>
          <Text style={styles.itemsTitle}>Order Items:</Text>
          <View style={styles.itemsTable}>
            {/* Table header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.productSerialNo]}>
                Sr. No.
              </Text>
              <Text style={[styles.tableCell, styles.productCell]}>
                Product
              </Text>
              <Text style={[styles.tableCell, styles.quantityCell]}>Qty</Text>
              <Text style={[styles.tableCell, styles.priceCell]}>
                Price (INR)
              </Text>
              <Text style={[styles.tableCell, styles.totalCell]}>
                Total (INR)
              </Text>
            </View>

            {/* Table rows */}
            {order.items.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.tableRow,
                  index === order.items.length - 1 ? styles.tableLastRow : {},
                ]}
              >
                <Text style={[styles.tableCell, styles.productSerialNo]}>
                  {index + 1}.
                </Text>
                <Text style={[styles.tableCell, styles.productCell]}>
                  {item.productName} - {item.fit} ({item.color.split("-")[0]})
                </Text>
                <Text style={[styles.tableCell, styles.quantityCell]}>
                  {item.quantity}
                </Text>
                <Text style={[styles.tableCell, styles.priceCell]}>
                  {Math.ceil(item.price)}
                </Text>
                <Text style={[styles.tableCell, styles.totalCell]}>
                  {Math.ceil(item.quantity * item.price)}
                </Text>
              </View>
            ))}
          </View>

          {/* Total amount */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount (INR):</Text>
            <Text style={styles.totalValue}>{Math.ceil(totalAmount)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            This is a system generated shipping label. Thank you for your order!
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ShippingSticker;
