import { useState, useCallback, useEffect } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
// utils
import axios, { endpoints } from 'src/utils/axios';
import { getSessionDetails } from 'src/utils/ApiActions';
// components
import { useSettingsContext } from 'src/components/settings';
import { useSnackbar } from 'src/components/snackbar';
// types
import { IOrderItem } from 'src/types/order';
//
import OrderDetailsInfo from '../order-details-info';
import OrderDetailsItems from '../order-details-item';
import OrderDetailsToolbar from '../order-details-toolbar';
import OrderDetailsHistory from '../order-details-history';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

const MERCHANT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Accepted' },
  { value: 'packing', label: 'Packing' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_MAP_FE_TO_BE: Record<string, string> = {
  pending: 'waiting',
  completed: 'accepted',
  packing: 'packing',
  dispatched: 'dispatched',
  delivered: 'delivered',
  cancelled: 'canceled',
};

export default function OrderDetailsView({ id }: Props) {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const [order, setOrder] = useState<IOrderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const authToken = getSessionDetails()?.authToken;
      const response = await axios.get(endpoints.orders.details(id), {
        headers: { Authorization: authToken },
      });
      if (response.data?.success) {
        setOrder(response.data.data);
      } else {
        enqueueSnackbar(response.data?.message || 'Failed to load order details', { variant: 'error' });
      }
    } catch (error: any) {
      console.error('Failed to load order:', error);
      enqueueSnackbar(error?.message || 'Failed to load order details', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id, enqueueSnackbar]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleChangeStatus = useCallback(async (newValue: string) => {
    const dbStatus = STATUS_MAP_FE_TO_BE[newValue];
    if (!dbStatus) {
      enqueueSnackbar('Invalid status selection', { variant: 'error' });
      return;
    }

    try {
      setUpdating(true);
      const authToken = getSessionDetails()?.authToken;
      const response = await axios.put(
        endpoints.orders.updateStatus,
        { orderId: id, status: dbStatus },
        { headers: { Authorization: authToken } }
      );
      if (response.data?.success) {
        enqueueSnackbar('Order status updated successfully', { variant: 'success' });
        // Refresh details (this is crucial so Pidge order ID and tracking details are loaded after dispatching)
        await fetchOrder();
      } else {
        enqueueSnackbar(response.data?.message || 'Failed to update order status', { variant: 'error' });
      }
    } catch (error: any) {
      console.error('Failed to update status:', error);
      enqueueSnackbar(error?.message || 'Failed to update order status', { variant: 'error' });
    } finally {
      setUpdating(false);
    }
  }, [id, fetchOrder, enqueueSnackbar]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Order not found
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      {updating && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(255,255,255,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      )}

      <OrderDetailsToolbar
        backLink={paths.dashboard.order.root}
        orderNumber={order.orderNumber}
        createdAt={new Date(order.createdAt)}
        status={order.status}
        onChangeStatus={handleChangeStatus}
        statusOptions={MERCHANT_STATUS_OPTIONS}
      />

      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Stack spacing={3} direction={{ xs: 'column-reverse', md: 'column' }}>
            <OrderDetailsItems
              items={order.items}
              taxes={order.taxes}
              shipping={order.shipping}
              discount={order.discount}
              subTotal={order.subTotal}
              totalAmount={order.totalAmount}
            />

            {order.history && <OrderDetailsHistory history={order.history} />}
          </Stack>
        </Grid>

        <Grid xs={12} md={4}>
          <OrderDetailsInfo
            customer={order.customer}
            delivery={order.delivery || { shipBy: 'Self', speedy: 'Standard', trackingNumber: '' }}
            payment={order.payment || { cardType: 'COD', cardNumber: 'COD' }}
            shippingAddress={order.shippingAddress || { fullAddress: 'N/A', phoneNumber: '' }}
            pidgeOrderId={(order as any).pidgeOrderId}
            trackingUrl={(order as any).trackingUrl}
            deliveryQuote={(order as any).deliveryQuote}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
