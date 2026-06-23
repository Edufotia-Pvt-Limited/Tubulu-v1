import { useState, useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { useSnackbar } from 'src/components/snackbar';
// types
import {
  IOrderCustomer,
  IOrderDelivery,
  IOrderPayment,
  IOrderShippingAddress,
} from 'src/types/order';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  customer: IOrderCustomer;
  delivery: IOrderDelivery;
  payment: IOrderPayment;
  shippingAddress: IOrderShippingAddress;
  pidgeOrderId?: string | null;
  trackingUrl?: string | null;
  deliveryQuote?: number | null;
};

export default function OrderDetailsInfo({
  customer,
  delivery,
  payment,
  shippingAddress,
  pidgeOrderId,
  trackingUrl,
  deliveryQuote,
}: Props) {
  const renderCustomer = (
    <>
      <CardHeader
        title="Customer Info"
        action={
          <IconButton>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        }
      />
      <Stack direction="row" sx={{ p: 3 }}>
        <Avatar
          alt={customer.name}
          src={customer.avatarUrl}
          sx={{ width: 48, height: 48, mr: 2 }}
        />

        <Stack spacing={0.5} alignItems="flex-start" sx={{ typography: 'body2' }}>
          <Typography variant="subtitle2">{customer.name}</Typography>

          <Box sx={{ color: 'text.secondary' }}>{customer.email}</Box>

          <Box>
            IP Address:
            <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
              {customer.ipAddress}
            </Box>
          </Box>

          <Button
            size="small"
            color="error"
            startIcon={<Iconify icon="mingcute:add-line" />}
            sx={{ mt: 1 }}
          >
            Add to Blacklist
          </Button>
        </Stack>
      </Stack>
    </>
  );

  const { enqueueSnackbar } = useSnackbar();

  const handleCopyTracking = useCallback(() => {
    if (pidgeOrderId) {
      navigator.clipboard.writeText(pidgeOrderId);
      enqueueSnackbar('Pidge Order ID copied!', { variant: 'success' });
    }
  }, [pidgeOrderId, enqueueSnackbar]);

  const renderDelivery = (
    <>
      <CardHeader
        title="Delivery"
        action={
          <IconButton>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        }
      />
      <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
        {pidgeOrderId && (
          <Stack direction="row" sx={{ mb: 0.5 }}>
            <Chip
              icon={<Iconify icon="solar:delivery-bold" />}
              label="Pidge Delivery Booked"
              color="success"
              variant="soft"
              size="small"
            />
          </Stack>
        )}

        <Stack direction="row" alignItems="center">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Ship by
          </Box>
          {pidgeOrderId ? 'Pidge' : delivery.shipBy}
        </Stack>

        <Stack direction="row" alignItems="center">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Speedy
          </Box>
          {delivery.speedy}
        </Stack>

        <Stack direction="row" alignItems="center">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Tracking No.
          </Box>
          {pidgeOrderId ? (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {pidgeOrderId}
              </Typography>
              <IconButton size="small" onClick={handleCopyTracking} sx={{ p: 0.5 }}>
                <Iconify icon="solar:copy-bold" width={16} />
              </IconButton>
            </Stack>
          ) : (
            <Link underline="always" color="inherit">
              {delivery.trackingNumber || 'N/A'}
            </Link>
          )}
        </Stack>

        {trackingUrl && (
          <Stack direction="row" alignItems="center" sx={{ mt: 0.5 }}>
            <Button
              size="small"
              variant="soft"
              color="primary"
              component={Link}
              href={trackingUrl}
              target="_blank"
              rel="noopener"
              startIcon={<Iconify icon="solar:routing-bold" />}
              endIcon={<Iconify icon="solar:arrow-right-up-linear" />}
            >
              Track Delivery
            </Button>
          </Stack>
        )}

        {deliveryQuote !== undefined && deliveryQuote !== null && (
          <Stack direction="row" alignItems="center">
            <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
              Delivery Cost
            </Box>
            ₹{deliveryQuote}
          </Stack>
        )}
      </Stack>
    </>
  );

  const renderShipping = (
    <>
      <CardHeader
        title="Shipping"
        action={
          <IconButton>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        }
      />
      <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
        <Stack direction="row" alignItems="center">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Address
          </Box>
          {shippingAddress.fullAddress}
        </Stack>
        <Stack direction="row" alignItems="center">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Phone number
          </Box>
          {shippingAddress.phoneNumber}
        </Stack>
      </Stack>
    </>
  );

  const renderPayment = (
    <>
      <CardHeader
        title="Payment"
        action={
          <IconButton>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        }
      />
      <Stack direction="row" alignItems="center" sx={{ p: 3, typography: 'body2' }}>
        <Box component="span" sx={{ color: 'text.secondary', flexGrow: 1 }}>
          Phone number
        </Box>

        {payment.cardNumber}
        <Iconify icon="logos:mastercard" width={24} sx={{ ml: 0.5 }} />
      </Stack>
    </>
  );

  return (
    <Card>
      {renderCustomer}

      <Divider sx={{ borderStyle: 'dashed' }} />

      {renderDelivery}

      <Divider sx={{ borderStyle: 'dashed' }} />

      {renderShipping}

      <Divider sx={{ borderStyle: 'dashed' }} />

      {renderPayment}
    </Card>
  );
}
