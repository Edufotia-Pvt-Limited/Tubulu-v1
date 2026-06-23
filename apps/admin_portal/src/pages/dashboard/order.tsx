import { Box, Pagination, Paper, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { enqueueSnackbar } from 'notistack';
import React, { useState, useEffect } from "react";
import ProductPageSkeleton from 'src/components/catalogue/PageSkeleton';
import OrderActionBar from 'src/components/order/order-action-bar';
import OrderTable from 'src/components/order/order-table';
import { useDebounce } from 'src/hooks/use-debounce';
import { baseUrl, getAllOrders, updateOrderStatus } from 'src/utils/ApiActions';
export interface OrderProps { }

export type OrderStatus =
  | 'waiting'
  | 'accepted'
  | 'packing'
  | 'dispatched'
  | 'delivered'
  | 'canceled';
const backendStatusMap: Record<OrderStatus, string> = {
  waiting: "waiting",
  accepted: "accepted",
  packing: "packing",
  dispatched: "dispatched",
  delivered: "delivered",
  canceled: "canceled",
};
export type StatusFilter = 'all' | OrderStatus;

interface Payment {
  method: string;
  status: string;
  value: number;
}

interface Customer {
  name: string;
  phone: string;
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    pincode: string;
  };
}

export interface ProductCustomizationDetail {
  optionName: string;
  choiceName: string[];
}



export interface Product {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  specialRequest: string;
  total: number;
  customizationDetails?: ProductCustomizationDetail[];
}

export interface Order {
  orderId: string;
  // items: string[];
  products: Product[];
  payment: Payment;
  customer: Customer;
  orderDate: string;
  orderStatus: OrderStatus;
  orderMessage?: string;
  deliveryType?: string;
  itemsWithNotes?: { name: string; specialRequest: string }[];
}
export function Order(props: OrderProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const debouncedSearch = useDebounce(searchQuery, 500);





  const fetchOrders = async (
    status = statusFilter,
    search = debouncedSearch,
    pageNum = page,
    limit = 5
  ) => {
    setLoading(true);
    try {
      const backendData = await getAllOrders({ status, search, page: pageNum, limit });

      // Extract the array of orders
      const ordersArray = backendData.data?.data;
      console.log("[DEBUG] Orders Array from backend:", ordersArray);

      if (!Array.isArray(ordersArray)) {
        console.error("Invalid response structure:", backendData);
        setOrders([]);
        setTotalPages(1);
        return;
      }

      const formattedOrders: Order[] = ordersArray.map((order: Order) => ({
        orderId: order.orderId,

        products: Array.isArray(order.products)
          ? order.products.map((p) => ({
            id: p.id,
            name: p.name,
            quantity: p.quantity,
            price: p.price,
            total: p.total,
            specialRequest: p.specialRequest,
            customizationDetails: p.customizationDetails || [],  // ✅ FIX
          }))
          : [],



        payment: order.payment,
        customer: {
          name: order.customer.name,
          phone: order.customer.phone,
          address: {
            addressLine1: order.customer.address.addressLine1 || "",
            addressLine2: order.customer.address.addressLine2 || "",
            city: order.customer.address.city || "",
            pincode: order.customer.address.pincode || "",
          },
        },
        orderDate: order.orderDate,
        orderStatus: order.orderStatus as OrderStatus,
        orderMessage: order.orderMessage || "",
        deliveryType: order.deliveryType || "",

        // ✅ Extract product-level notes
        itemsWithNotes: Array.isArray(order.products)
          ? order.products
            .filter((p: Product) => p.specialRequest && p.specialRequest.trim() !== "")
            .map((p: Product) => ({
              name: p.name,
              specialRequest: p.specialRequest,
            }))
          : [],
      }));

      setOrders(formattedOrders);
      setTotalPages(backendData.data.totalPages || 1);
      setPage(backendData.data.currentPage || pageNum);


    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(statusFilter, debouncedSearch, 1, 5);
  }, [statusFilter, debouncedSearch]);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);




  const statusOrder: OrderStatus[] = [
    "waiting",
    "accepted",
    "packing",
    "dispatched",
    "delivered",
    "canceled",
  ];

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    const order = orders.find(o => o.orderId === id);
    if (!order) return;

    const currentStatus = order.orderStatus;
    const backendStatus = backendStatusMap[newStatus];

    try {


 // Prevent canceling order if status is packing, dispatched, or delivered
      if (newStatus === 'canceled' && ['packing', 'dispatched', 'delivered'].includes(currentStatus)) {
        throw new Error(`Cannot cancel order with status '${currentStatus}'. Order has already been processed.`);
      }


      const currentIndex = statusOrder.indexOf(currentStatus);
      const newIndex = statusOrder.indexOf(newStatus);

      // Prevent backward move
      if (newIndex < currentIndex) {
        throw new Error(`Cannot change order status from '${currentStatus}' back to '${newStatus}'`);
      }

      // Call backend
      await updateOrderStatus(id, backendStatus);

      // Update local state
      setOrders(prev =>
        prev.map(o => (o.orderId === id ? { ...o, status: newStatus } : o))
      );

      fetchOrders();

      enqueueSnackbar(`Successfully updated the order status to ${capitalize(newStatus)}`, {
        variant: "success",
        autoHideDuration: 5000,
      });
    } catch (err) {
      console.error("Error updating status:", err);
     const errorMessage = err instanceof Error ? err.message : `Cannot change order status from ${currentStatus} to ${newStatus}`;
      enqueueSnackbar(errorMessage, {
        variant: "error",
        autoHideDuration: 5000,
      });
    }
  };


  useEffect(() => {
  console.log("🔌 Connecting to SSE...");

  const eventSource = new EventSource(`${baseUrl}/orders/stream`);

  eventSource.onopen = () => {
    console.log("✅ SSE connection established");
  };

  // Listen for named event: orderUpdate (VERY IMPORTANT)
  eventSource.addEventListener("orderUpdate", (event: any) => {
    try {
      console.log("📨 Raw SSE message:", event.data);

      const parsedData = JSON.parse(event.data);
      
      if (parsedData.type === "ORDER_STATUS_UPDATE") {
        console.log("🔄 Order status update received via SSE:", parsedData);
        setOrders((prev) => 
          prev.map(o => o.orderId === parsedData.orderId 
            ? { 
                ...o, 
                orderStatus: parsedData.status,
                payment: {
                  ...o.payment,
                  status: parsedData.paymentStatus !== undefined ? parsedData.paymentStatus : o.payment.status
                }
              } 
            : o)
        );
        return;
      }

      if (parsedData.type !== "NEW_ORDER") return;

      const order = parsedData.order;

    
const formattedOrder: Order = {
  orderId: order.id || order.orderId || order._id,
  products: Array.isArray(order.orderItems)
    ? order.orderItems.map((p: any) => ({
        id: p.productId || p.id || p._id, // or p.productId if you prefer
        name: p.name,
        quantity: p.quantity,
        price: p.price,
        total: p.total,
        specialRequest: p.specialRequest,
        customizationDetails: p.customizationDetails || [],
      }))
    : [],
  payment: {
    method: order.paymentMethod || "",
    status: order.paymentStatus || "",
    value: order.discountAmount || 0,
  },
  customer: {
    name: order.customer?.name || "Unknown",
    phone: order.customer?.phone || "",
    address: {
      addressLine1: order.customer?.address?.addressLine1 || "",
      addressLine2: order.customer?.address?.addressLine2 || "",
      city: order.customer?.address?.city || "",
      pincode: order.customer?.address?.pincode || "",
    },
  },
  orderDate: order.createdAt,
  orderStatus: order.orderStatus,
  orderMessage: order.orderMessage || "",
  deliveryType: order.deliveryType || "Other",
  itemsWithNotes: (order.orderItems || [])
    .filter((p: any) => p.specialRequest?.trim() !== "")
    .map((p: any) => ({
      name: p.name,
      specialRequest: p.specialRequest,
    })),
};


      console.log("📦 New order received via SSE:", formattedOrder);

      // Play a premium sound alert for new orders
      try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav");
        audio.play().catch(() => {});
      } catch (soundErr) {
        console.warn("Failed to play sound notification:", soundErr);
      }

      setOrders((prev) => [formattedOrder, ...prev]);
      enqueueSnackbar("🆕 New order received!", { variant: "info" });
    } catch (err) {
      console.error("❌ Error parsing SSE message:", err, event.data);
    }
  });

  eventSource.onerror = (err) => {
    console.error("⚠️ SSE connection error", err);
  };

  return () => eventSource.close();
}, []);






//  Add dependencies to re-connect if filters change

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4, maxHeight: "70vh" } }}>
      <Typography
        sx={{
          fontSize: { xs: 20, sm: 22, md: 24 },
          fontWeight: 700,
          mb: 2,
        }}
      >
        Orders
      </Typography>
      <OrderActionBar
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchPlaceholder="Search Orders..."
      />
      {
        loading ? (<ProductPageSkeleton />

        ) :
          orders.length === 0 ? (

            <Paper elevation={3}>
              <Typography sx={{ p: 3, textAlign: 'center' }}>No orders found</Typography>
            </Paper>
          ) : (
            <>
              <Paper elevation={3}>
                <OrderTable
                  orders={orders}
                  onStatusChange={handleStatusChange}
                  showDropdown={true}
                />
              </Paper>
              <Stack spacing={2} alignItems="center" mt={3}>
                <Pagination
                  color="primary"
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => {
                    setPage(value);
                    fetchOrders(statusFilter, debouncedSearch, value, 5);

                  }}
                />
              </Stack>
            </>
          )
      }

    </Box>
  );
}
