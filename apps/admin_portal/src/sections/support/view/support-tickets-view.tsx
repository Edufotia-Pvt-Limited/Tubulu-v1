import { useState, useCallback, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { useSnackbar } from 'src/components/snackbar';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
// utils
import axios from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';
import { baseUrl } from 'src/utils/ApiActions';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'Ticket ID' },
  { id: 'subject', label: 'Subject' },
  { id: 'category', label: 'Category', width: 120 },
  { id: 'status', label: 'Status', width: 140 },
  { id: 'priority', label: 'Priority', width: 120 },
  { id: 'createdAt', label: 'Created At', width: 160 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export default function SupportTicketsView() {
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();
  const settings = useSettingsContext();
  const { user } = useAuthContext();

  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState('');
  const [updatingPriority, setUpdatingPriority] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const uniqueCategories = useMemo(() => {
    const categories = tableData.map(ticket => ticket.category || 'General');
    return Array.from(new Set(categories));
  }, [tableData]);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/support/admin/tickets');
      setTableData(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    console.log("🔌 Connecting to SSE for support tickets...");
    const eventSource = new EventSource(`${baseUrl}/orders/stream`);

    eventSource.onopen = () => {
      console.log("✅ Support SSE connection established");
    };

    eventSource.addEventListener("orderUpdate", (event: any) => {
      try {
        const parsedData = JSON.parse(event.data);
        if (parsedData.type === "SUPPORT_TICKET_UPDATE") {
          console.log("📨 Support ticket update received via SSE:", parsedData);

          const isMerchant = user?.role === 'merchant_admin' || user?.role === 'merchant';
          const isOpsManager = user?.role === 'ops_manager';
          const isManager = user?.role === 'city_manager' || user?.role === 'regional_manager' || user?.role === 'state_manager' || isOpsManager;

          if (isMerchant) {
            if (parsedData.integrationId !== user?.id) {
              console.log("Ignore support update for another merchant");
              return;
            }
          }

          if (isManager && parsedData.orderId !== null) {
            console.log("Ignore support update: manager only handles app-level issues");
            return;
          }

          // Invalidate and refresh ticket list
          fetchTickets();

          // If the drawer is open and viewing this ticket, update its details
          setSelectedTicket((prevTicket: any) => {
            if (prevTicket && prevTicket.id === parsedData.ticket.id) {
              setUpdatingStatus(parsedData.ticket.status);
              setUpdatingPriority(parsedData.ticket.priority);
              return parsedData.ticket;
            }
            return prevTicket;
          });
        }
      } catch (err) {
        console.error("❌ Error parsing Support SSE message:", err);
      }
    });

    eventSource.onerror = (err) => {
      console.error("⚠️ Support SSE connection error", err);
    };

    return () => {
      eventSource.close();
    };
  }, [user, fetchTickets]);

  const handleOpenTicket = async (ticket: any) => {
    try {
      const response = await axios.get(`/api/v1/support/admin/ticket/${ticket.id}`);
      setSelectedTicket(response.data.data);
      setUpdatingStatus(response.data.data.status);
      setUpdatingPriority(response.data.data.priority);
      setOpenDrawer(true);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load ticket details', { variant: 'error' });
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    try {
      const response = await axios.post(`/api/v1/support/admin/ticket/${selectedTicket.id}/reply`, {
        message: replyText.trim()
      });
      setSelectedTicket(response.data.data);
      setReplyText('');
      enqueueSnackbar('Reply sent successfully!');
      fetchTickets();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to send reply', { variant: 'error' });
    }
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;
    try {
      const response = await axios.patch(`/api/v1/support/admin/ticket/${selectedTicket.id}`, {
        status: updatingStatus,
        priority: updatingPriority,
      });
      setSelectedTicket(response.data.data);
      enqueueSnackbar('Ticket updated successfully!');
      fetchTickets();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to update ticket', { variant: 'error' });
    }
  };

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    startDate,
    endDate,
    filterStatus,
    filterPriority,
    filterCategory,
  });

  const notFound = !dataFiltered.length && !loading;

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Support Tickets"
          links={[
            { name: 'Dashboard', href: '/' },
            { name: 'Support Tickets' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <Stack
            spacing={2}
            alignItems={{ xs: 'flex-end', md: 'center' }}
            direction={{
              xs: 'column',
              md: 'row',
            }}
            sx={{
              p: 2.5,
            }}
          >
            <DatePicker
              label="Start date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                },
              }}
              sx={{
                maxWidth: { md: 180 },
              }}
            />

            <DatePicker
              label="End date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                },
              }}
              sx={{
                maxWidth: { md: 180 },
              }}
            />

            <FormControl size="small" sx={{ minWidth: 140, maxWidth: { md: 180 }, width: 1 }}>
              <InputLabel id="filter-status-label">Status</InputLabel>
              <Select
                labelId="filter-status-label"
                id="filter-status"
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140, maxWidth: { md: 180 }, width: 1 }}>
              <InputLabel id="filter-priority-label">Priority</InputLabel>
              <Select
                labelId="filter-priority-label"
                id="filter-priority"
                value={filterPriority}
                label="Priority"
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140, maxWidth: { md: 180 }, width: 1 }}>
              <InputLabel id="filter-category-label">Category</InputLabel>
              <Select
                labelId="filter-category-label"
                id="filter-category"
                value={filterCategory}
                label="Category"
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {uniqueCategories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {(startDate || endDate || filterStatus !== 'all' || filterPriority !== 'all' || filterCategory !== 'all') && (
              <Button
                color="error"
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                  setFilterStatus('all');
                  setFilterPriority('all');
                  setFilterCategory('all');
                }}
                startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              >
                Clear
              </Button>
            )}
          </Stack>

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  onSort={table.onSort}
                />

                <TableBody>
                  {loading ? (
                    <TableEmptyRows height={72} emptyRows={5} />
                  ) : (
                    dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row) => (
                        <TableRow key={row.id} hover>
                          <TableCell>#{row.id.substring(0, 8)}</TableCell>
                          <TableCell>
                            <Typography variant="subtitle2">{row.subject}</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              Order ID: {row.orderId ? `#${row.orderId.substring(0, 8)}` : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2">{row.category || 'General'}</Typography>
                          </TableCell>
                          <TableCell>
                            <Label
                              variant="soft"
                              color={
                                (row.status === 'open' && 'error') ||
                                (row.status === 'in_progress' && 'warning') ||
                                (row.status === 'resolved' && 'success') ||
                                'default'
                              }
                            >
                              {row.status.replace('_', ' ')}
                            </Label>
                          </TableCell>
                          <TableCell>
                            <Label
                              variant="soft"
                              color={
                                (row.priority === 'high' && 'error') ||
                                (row.priority === 'medium' && 'warning') ||
                                'default'
                              }
                            >
                              {row.priority}
                            </Label>
                          </TableCell>
                          <TableCell>
                            {format(new Date(row.createdAt), 'dd MMM yyyy, hh:mm a')}
                          </TableCell>
                          <TableCell align="right">
                            <Button variant="outlined" size="small" onClick={() => handleOpenTicket(row)}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  )}

                  <TableEmptyRows
                    height={table.dense ? 52 : 72}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      {/* Ticket Details Drawer */}
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        PaperProps={{ sx: { width: 440, p: 3 } }}
      >
        {selectedTicket && (
          <Stack spacing={3} sx={{ height: '100%' }}>
            <Box>
              <Typography variant="h6">Ticket Detail</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                ID: #{selectedTicket.id}
              </Typography>
            </Box>

            <Stack spacing={2} sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
              <Typography variant="subtitle2">Subject: {selectedTicket.subject}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                Category: {selectedTicket.category || 'General'}
              </Typography>
              <Typography variant="body2">{selectedTicket.description}</Typography>
            </Stack>

            {/* Status & Priority Update */}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={updatingStatus}
                  label="Status"
                  onChange={(e) => setUpdatingStatus(e.target.value)}
                >
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={updatingPriority}
                  label="Priority"
                  onChange={(e) => setUpdatingPriority(e.target.value)}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>

              <Button variant="contained" onClick={handleUpdateTicket}>Save</Button>
            </Stack>

            {/* Conversation/Replies */}
            <Typography variant="subtitle2">Replies</Typography>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 300, border: '1px solid #eee', p: 1, borderRadius: 1 }}>
              {(selectedTicket.replies || []).length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', p: 2, textAlign: 'center' }}>
                  No replies yet
                </Typography>
              ) : (
                <List>
                  {(selectedTicket.replies || []).map((reply: any, index: number) => {
                    const isStaff = reply.sender === 'staff';
                    return (
                      <ListItem key={index} sx={{ flexDirection: 'column', alignItems: isStaff ? 'flex-end' : 'flex-start', mb: 1 }}>
                        <Box sx={{ p: 1, bgcolor: isStaff ? 'primary.lighter' : 'grey.100', borderRadius: 1, maxWidth: '85%' }}>
                          <Typography variant="body2">{reply.message}</Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                          {reply.sender === 'staff' ? 'Staff' : 'Customer'} • {format(new Date(reply.timestamp), 'hh:mm a')}
                        </Typography>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>

            {/* Add Reply */}
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <IconButton color="primary" onClick={handleSendReply}>
                <Iconify icon="eva:paper-plane-fill" />
              </IconButton>
            </Stack>
          </Stack>
        )}
      </Drawer>
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  startDate,
  endDate,
  filterStatus,
  filterPriority,
  filterCategory,
}: {
  inputData: any[];
  comparator: (a: any, b: any) => number;
  startDate: Date | null;
  endDate: Date | null;
  filterStatus: string;
  filterPriority: string;
  filterCategory: string;
}) {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (startDate || endDate) {
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

    inputData = inputData.filter((ticket) => {
      if (!ticket.createdAt) return false;
      const ticketTime = new Date(ticket.createdAt).getTime();
      if (start && ticketTime < start) return false;
      if (end && ticketTime > end) return false;
      return true;
    });
  }

  if (filterStatus !== 'all') {
    inputData = inputData.filter((ticket) => ticket.status === filterStatus);
  }

  if (filterPriority !== 'all') {
    inputData = inputData.filter((ticket) => ticket.priority === filterPriority);
  }

  if (filterCategory !== 'all') {
    inputData = inputData.filter((ticket) => (ticket.category || 'General') === filterCategory);
  }

  return inputData;
}
