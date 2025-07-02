
import { useState, useEffect } from "react"
import axios from "axios"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BASE_URL } from "@/lib/constants"
interface OrderItem {
  id: number
  item: string
  price: number
  quantity: number
}

interface Order {
  orderid: number
  items: OrderItem[]
  totalPrice: number
  status: boolean
  paymentMethod: string
  groupCompanyId: number
}

export default function OrderSummary() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const response = await axios.get(BASE_URL +`/api/orderSummary`)
        setOrders(response.data)
        setError(null)
      } catch (err) {
        setError("Failed to fetch order data. Please try again later.")
        console.error("Error fetching orders:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const updateOrderStatus = async (orderId: number, newStatus: boolean) => {
    try {
      setUpdatingStatus(orderId)
      await axios.put(`http://192.168.0.114:8082/api/orderSummary/update/${orderId}?status=${newStatus}`)
    // console.log(`http://192.168.0.114:8082/api/orderSummary/₹{orderId}?status=₹{newStatus}`);
    

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.orderid === orderId ? { ...order, status: newStatus } : order)),
      )
    } catch (err) {
      console.error("Error updating order status:", err)
      setError("Failed to update order status. Please try again.")
    } finally {
      setUpdatingStatus(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading orders...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
<ScrollArea className="h-[calc(100vh-100px)] border">
  <div className="sticky top-0 z-10 bg-white px-6 py-4 ">
      <h1 className="text-3xl font-bold">Order Summary</h1>
      <p className="text-muted-foreground">View and manage your orders</p>
    </div>
  <div className="container mx-auto p-6 pt-0">

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">No orders found</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
           
            <Card key={order.orderid} className="w-full">
              <CardHeader>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline space-x-4">
                    <CardTitle className="text-xl">Order #{order.orderid}</CardTitle>
<div className="flex-col items-center">
                        <Badge variant={order.status ? "default" : "secondary"} className="w-18">
                      {order.status ? "Completed" : "Pending"}
                    </Badge>
                        <Badge variant={order.status ? "default" : "secondary" }className="w-18">
                        {order.paymentMethod}
                    </Badge>
</div>
                  </div>
                  <div className="flex items-baseline ">
                   
                   <div className=" ml-4 mt-4">
                     
                   <div className="">  <span className="font-semibold text-xl">₹{order.totalPrice.toFixed(2)}</span></div>
                    <Button
                      variant={order.status ? "outline" : "default"}
                      size="sm"
                      className="h-8 w-30 overflow-hidden mt-8"
                      onClick={() => updateOrderStatus(order.orderid, !order.status)}
                      disabled={updatingStatus === order.orderid}
                    >
                      {updatingStatus === order.orderid ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Updating...
                        </>
                      ) : order.status ? (
                        "Mark Pending"
                      ) : (
                        "Mark Complete"
                      )}
                    </Button>
                   </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value={`items-₹{order.orderid}`} className="border-none">
                    <AccordionTrigger className="hover:no-underline py-2">
                      <span className="text-sm font-medium">
                        View Items ({order.items.length} item{order.items.length !== 1 ? "s" : ""})
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-2">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item</TableHead>
                              <TableHead className="text-right">Price</TableHead>
                              <TableHead className="text-right">Quantity</TableHead>
                              <TableHead className="text-right">Subtotal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {order.items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.item}</TableCell>
                                <TableCell className="text-right">₹{item.price.toFixed(2)}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right font-semibold">
                                  ₹{(item.price * item.quantity).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <div className="flex justify-between items-center mt-4 pt-4 border-t">
                          <div className="text-sm text-muted-foreground">Payment Method: {order.paymentMethod}</div>
                          <div className="text-lg font-bold">Total: ₹{order.totalPrice.toFixed(2)}</div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
            
          ))}
        </div>
      )}
      </div>


    </ScrollArea>
  )
}
