import React, { useEffect, useState } from 'react';
import {
  Box,
  Pagination,
  Stack,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router';
import CustomerAddressCard from './cutomer-address-card';
import OrderActionBar from '../order/order-action-bar';
import OrderTable from '../order/order-table';
import { baseUrl, getAllCustomerOrder } from 'src/utils/ApiActions';
import { useDebounce } from 'src/hooks/use-debounce';
import { Order, Product, StatusFilter } from 'src/pages/dashboard/order';
import { GridCloseIcon } from '@mui/x-data-grid';
import { MdArrowBack } from 'react-icons/md';
import ProductPageSkeleton from '../catalogue/PageSkeleton';
import { enqueueSnackbar } from 'notistack';

type AddressType = 'Home' | 'Office' | 'Other';

interface AddressCardProps {
  type: AddressType;
  name: string;
  phone: string;
  address: string;
}

interface ApiAddress {
  addressType: string;
  fullName: string;
  contact: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  pincode: string;
}

export function CustomerOrder() {
  const { id } = useParams<{ id: string }>();
  const [customerInfo, setCustomerInfo] = useState<AddressCardProps[]>([]);
  const [customerOrderData, setCustomerOrderData] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [customerName, setCustomerName] = useState<string>('');
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const debouncedSearch = useDebounce(searchQuery, 500);
  const navigate = useNavigate();

  const visibleAddresses = customerInfo.slice(0, 3);

  // Map API order to table row
  const mapApiOrderToTableOrder = (apiOrder: Order): Order => ({
    orderId: apiOrder.orderId,
    products: apiOrder.products.map((p: Product) => ({
      name: p.name,
      quantity: p.quantity,
      price: p.price,
      specialRequest: p.specialRequest,
      total: p.total,
      customizationDetails: p.customizationDetails || [],

    })),
    payment: apiOrder.payment,
    customer: {
      name: apiOrder.customer.name,
      phone: apiOrder.customer.phone,
      address: apiOrder.customer.address,
    },
    orderDate: apiOrder.orderDate,
    orderStatus: apiOrder.orderStatus,
    deliveryType: apiOrder.deliveryType || 'Delivery',
    orderMessage: apiOrder.orderMessage || '',
    itemsWithNotes: Array.isArray(apiOrder.products)
      ? apiOrder.products
          .filter((p: Product) => p.specialRequest && p.specialRequest.trim() !== '')
          .map((p: Product) => ({
            name: p.name,
            specialRequest: p.specialRequest,
          }))
      : [],
  });

  const fetchCustomerOrder = async (
    status = statusFilter,
    search = debouncedSearch,
    pageNum = page,
    limit = 5
  ) => {
    setLoading(true);
    try {
      if (!id) return;

      // Fetch all orders at once
      const res = await getAllCustomerOrder(id, { status, search, page: pageNum, limit });

      if (res && res.data && Array.isArray(res.data.data)) {
        const allOrders = res.data.data;

        const mappedOrders = allOrders.map(mapApiOrderToTableOrder);

        setCustomerOrderData(mappedOrders);
        setTotalPages(res.data.totalPages);
        setPage(res.data.currentPage);

        if (res.data.userName) {
          setCustomerName(res.data.userName);
        }
      }

      if (res && res.data && res.data.addresses && res.data.addresses.length > 0) {
        const addresses: AddressCardProps[] = res.data.addresses.map((addr: ApiAddress) => ({
          type:
            addr.addressType === 'home'
              ? 'Home'
              : addr.addressType === 'office'
              ? 'Office'
              : 'Other',
          name: addr.fullName,
          phone: addr.contact,
          address: `${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}, ${
            addr.city
          }, ${addr.pincode}`,
        }));

        setCustomerInfo(addresses);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount & filter change - reset to page 1
  useEffect(() => {
    fetchCustomerOrder(statusFilter, debouncedSearch, 1, 5);
  }, [statusFilter, debouncedSearch]);

useEffect(() => {
  if (!id) return; // only connect if we have customer id

  console.log("🔌 Connecting to SSE for Customer Orders...");

  const eventSource = new EventSource(`${baseUrl}/orders/stream`);

  eventSource.onopen = () => {
    console.log("✅ SSE connection established for Customer Orders");
  };

  eventSource.addEventListener("orderUpdate", (event: any) => {
    try {
      console.log("📨 Raw SSE message (Customer Orders):", event.data);
      const parsed = JSON.parse(event.data);

      // Only react to NEW_ORDER or updates relevant to this customer
      if (parsed.type !== "NEW_ORDER") return;

      const order = parsed.order;

      // Make sure this order belongs to the customer we're viewing
      if (order.userId !== id) return;

      // Map API order to frontend Order structure
      const formattedOrder: Order = {
        orderId: order._id,
        products: Array.isArray(order.orderItems)
          ? order.orderItems.map((p: any) => ({
              id: p._id,
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
        itemsWithNotes: order.orderItems
          .filter((p: any) => p.specialRequest?.trim() !== "")
          .map((p: any) => ({
            name: p.name,
            specialRequest: p.specialRequest,
          })),
      };

      console.log("📦 Customer Order update received:", formattedOrder);

      // Prepend new order at top
      setCustomerOrderData((prev) => [formattedOrder, ...prev]);
      enqueueSnackbar("🆕 New order received!", { variant: "info" });
    } catch (err) {
      console.error("❌ Error parsing SSE message (Customer Orders):", err, event.data);
    }
  });

  eventSource.onerror = (err) => {
    console.error("⚠️ SSE connection error (Customer Orders):", err);
  };

  return () => {
    console.log("🔌 Closing SSE connection (Customer Orders)");
    eventSource.close();
  };
}, [id]);

  

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={1}>
        <IconButton onClick={() => navigate(-1)}>
          <MdArrowBack size={24} />
        </IconButton>
        <Typography sx={{ fontSize: { xs: 20, sm: 22, md: 24 }, fontWeight: 700 }}>
          {customerName || 'Unknown'}
        </Typography>
      </Stack>

      <Box>
        <Box display="flex" justifyContent="flex-end">
          {customerInfo.length > 3 && (
            <Typography
              sx={{
                cursor: 'pointer',
                color: 'primary.main',
                fontWeight: 500,
              }}
              onClick={() => setOpenDialog(true)}
            >
              View All
            </Typography>
          )}
        </Box>

        {visibleAddresses.length > 0 && <CustomerAddressCard customers={visibleAddresses} />}
      </Box>

      <OrderActionBar
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchPlaceholder="Search Orders..."
      />

      {loading ? (
        <ProductPageSkeleton />
      ) : customerOrderData.length === 0 ? (
        <Paper elevation={3}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 3,
            }}
          >
            No orders found
          </Box>
        </Paper>
      ) : (
        <>
          <Paper elevation={3}>
            <OrderTable orders={customerOrderData} showDropdown={false} />
          </Paper>

          <Stack spacing={2} alignItems="center" mt={3} mb={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => fetchCustomerOrder(statusFilter, debouncedSearch, value, 5)}
              color="primary"
            />
          </Stack>
        </>
      )}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          All Addresses
          <IconButton onClick={() => setOpenDialog(false)}>
            <GridCloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            maxHeight: '70vh',
            overflowY: 'auto',
            px: { xs: 0, sm: 1, md: 2 },
          }}
        >
          <CustomerAddressCard customers={customerInfo} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
