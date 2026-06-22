import React from 'react';
import { Box, TextField, Select, MenuItem } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

type Status = 'all' | 'pending' | 'complete' | 'failed' | 'active';

interface ActionBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  searchPlaceholder?: string;
  statusFilter: Status;
  setStatusFilter: React.Dispatch<React.SetStateAction<Status>>;
}

const CustomerActionBar: React.FC<ActionBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedDate,
  setSelectedDate,
  searchPlaceholder = 'Search...',
  statusFilter,
  setStatusFilter,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1.5, sm: 2 },
        mb: 2,
        width: '100%',
        px: { xs: 2, sm: 2, md: 1, lg: 0 },
      }}
    >
      {/* Status Filter */}
      <Select
        size="medium"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as Status)}
        sx={{
          flex: { xs: 'none', sm: 0.5 },
          width: { xs: '100%', sm: 'auto' },
        }}
      >
        <MenuItem value="all">All</MenuItem>
        {/* <MenuItem value="pending">In Progress</MenuItem>
        <MenuItem value="complete">Completed</MenuItem>
        <MenuItem value="failed">Failed</MenuItem>
        <MenuItem value="active">Active</MenuItem> */}
      </Select>

      {/* Date Picker */}
      <DatePicker
        label="Select Date"
        value={selectedDate}
        onChange={(newDate) => setSelectedDate(newDate)}
        sx={{
          flex: { xs: 'none', sm: 1 },
          width: { xs: '100%', sm: 'auto' },
        }}
      />

      {/* Search Bar */}
      <TextField
        size="medium"
        variant="outlined"
        placeholder={searchPlaceholder}
        sx={{
          flex: { xs: 'none', sm: 2 },
          width: { xs: '100%', sm: 'auto' },
          mt: { xs: 1, sm: 0 },
        }}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </Box>
  );
};

export default CustomerActionBar;
