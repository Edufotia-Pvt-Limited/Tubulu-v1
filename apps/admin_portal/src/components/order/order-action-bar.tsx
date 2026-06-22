import React from 'react';
import { Box, Select, MenuItem, TextField } from '@mui/material';
import { OrderStatus } from 'src/pages/dashboard/order';

interface StatusOption {
  label: string;
  value: OrderStatus | 'all';
}

interface OrderActionBarProps {
  statusFilter: OrderStatus | 'all';
  setStatusFilter: React.Dispatch<React.SetStateAction<OrderStatus | 'all'>>;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  searchPlaceholder?: string;
  statusOptions?: StatusOption[];
  extraActions?: React.ReactNode; // optional buttons or menu
}

// Default status options compatible with orders.tsx
const defaultStatusOptions: StatusOption[] = [
  { label: 'All Orders', value: 'all' },
  { label: 'Waiting', value: 'waiting' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Packing', value: 'packing' },
  { label: 'Dispatched', value: 'dispatched' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Canceled', value: 'canceled' },
];

const OrderActionBar: React.FC<OrderActionBarProps> = ({
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  searchPlaceholder = 'Search orders...',
  statusOptions = defaultStatusOptions,
  extraActions,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' }, // stack on mobile
        gap: { xs: 1.5, sm: 2 },
        mb: 2,
        width: '100%',
        alignItems: 'center',
        px: { xs: 2, sm: 2, md: 1, lg: 0 },
      }}
    >
      {/* Status Filter */}
      <Select
        size="medium"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
        sx={{ width: { xs: '100%', sm: 200 } }}
      >
        {statusOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>

      {/* Search Input */}
      <TextField
        size="medium"
        variant="outlined"
        placeholder={searchPlaceholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        // sx={{ flex: 1, mt: { xs: 1, sm: 0 } }}
        sx={{
          flex: { xs: 'none', sm: 2 },
          width: { xs: '100%', sm: 'auto' },
          mt: { xs: 1, sm: 0 },
        }}
      />

      {/* Optional Extra Actions */}
      {extraActions && <Box sx={{ display: 'flex', gap: 1 }}>{extraActions}</Box>}
    </Box>
  );
};

export default OrderActionBar;
