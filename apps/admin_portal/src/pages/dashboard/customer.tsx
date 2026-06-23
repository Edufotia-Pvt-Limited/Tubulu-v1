import { Box, Paper, Typography, Stack, Pagination } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useDebounce } from 'src/hooks/use-debounce';
import CustomerActionBar from 'src/components/customer/customer-action-bar';
import CustomersTable, { Customer } from 'src/components/customer/customer-table';
import { baseUrl, getCustomersSummary } from 'src/utils/ApiActions';
import ProductPageSkeleton from 'src/components/catalogue/PageSkeleton';
import { enqueueSnackbar } from 'notistack';

export interface CustomerPageProps {}

export function CustomerPage(props: CustomerPageProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'complete' | 'failed' | 'active'
  >('all');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const debouncedSearch = useDebounce(searchQuery, 500);

  const formatDateLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchCustomers = async (
    search: string = debouncedSearch,
    pageNum: number = page,
    limit: number = 5,
    date?: Date | null
  ) => {
    setLoading(true);

    try {
      const lastOrderDate = date ? formatDateLocal(date) : '';
      const res = await getCustomersSummary({ search, page: pageNum, limit, lastOrderDate });
      if (res && res.data && Array.isArray(res.data.data)) {
        const mapped: Customer[] = res.data.data.map((c: any) => ({
          _id: c._id || c.id || '',
          name: c.name || 'Unknown',
          phoneNumber: c.phoneNumber || '',
          lastOrderDate: c.lastOrderDate || '-',
          address: c.address || '-',
          totalSpent: c.totalSpent || 0,
          totalOrders: c.totalOrders || 0,
          firstName: c.firstName || '',
          lastName: c.lastName || '',
          cashBalance: c.cashBalance || 0,
        }));
        setCustomers(mapped);
        setTotalPages(res.data.totalPages);
        setPage(res.data.currentPage);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(debouncedSearch, 1, 5, selectedDate); // reset to page 1
  }, [debouncedSearch, selectedDate]);


useEffect(() => {
  console.log("🔌 Connecting to SSE for Customer Summary...");

  const eventSource = new EventSource(`${baseUrl}/orders/stream`);

  eventSource.onopen = () => {
    console.log("✅ SSE connection established (Customer Summary Page)");
  };

  // Listen for "orderUpdate" event
  eventSource.addEventListener("orderUpdate", (event: any) => {
    try {
      const parsed = JSON.parse(event.data);

      // Only react to CUSTOMER_SUMMARY_UPDATE
      if (parsed.type !== "CUSTOMER_SUMMARY_UPDATE") return;

      console.log("📊 CUSTOMER_SUMMARY_UPDATE received:", parsed);
      enqueueSnackbar("🆕 New order received!", { variant: "info" });

      // Update local state safely
      const formattedSummary = (Array.isArray(parsed.summary) ? parsed.summary : []).map((c: any) => ({
        ...c,
        _id: c._id || c.id || '',
        firstName: c.firstName || '',
        lastName: c.lastName || '',
        cashBalance: c.cashBalance || 0,
      }));
      setCustomers(formattedSummary);
      setTotalPages(typeof parsed.totalPages === "number" ? parsed.totalPages : 1);
      setPage(typeof parsed.currentPage === "number" ? parsed.currentPage : 1);

    } catch (err) {
      console.error("❌ Error parsing CUSTOMER_SUMMARY_UPDATE:", err);
    }
  });

  eventSource.onerror = (err) => {
    console.error("⚠️ SSE connection error (Customer Summary)", err);
  };

  return () => {
    console.log("🔌 Closing SSE connection (Customer Summary)");
    eventSource.close();
  };
}, []);


  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, maxHeight: '70vh' }}>
      <Typography sx={{ fontSize: { xs: 20, sm: 22, md: 24 }, fontWeight: 700, mb: 2 }}>
        Customers
      </Typography>

      <CustomerActionBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchPlaceholder="Search Customers..."
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {loading ? (
        <ProductPageSkeleton/>
      ) : customers.length === 0 ? (
        <Paper elevation={3}>
          <Typography sx={{ p: 3, textAlign: 'center' }}>No customers found</Typography>
        </Paper>
      ) : (
        <>
          <Paper elevation={3}>
            <CustomersTable 
              customers={customers} 
              onRefresh={() => fetchCustomers(debouncedSearch, page, 5, selectedDate)} 
            />
          </Paper>

          <Stack spacing={2} alignItems="center" mt={2} mb={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => fetchCustomers(debouncedSearch, value, 5, selectedDate)}
              color="primary"
            />
          </Stack>
        </>
      )}
    </Box>
  );
}
