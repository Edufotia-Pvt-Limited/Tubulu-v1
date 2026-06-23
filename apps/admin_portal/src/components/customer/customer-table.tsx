import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { MdEdit, MdAddCard } from 'react-icons/md';
import { updateCustomer, addCustomerCredits } from 'src/utils/ApiActions';
import { useSnackbar } from 'notistack';

// Customer Type
export interface Customer {
  _id: string;
  name: string;
  phoneNumber: string;
  lastOrderDate: string;
  address: string;
  totalSpent: number;
  totalOrders: number;
  firstName?: string;
  lastName?: string;
  cashBalance?: number;
}

interface CustomersTableProps {
  customers: Customer[];
  onRefresh?: () => void;
}

const CustomersTable: React.FC<CustomersTableProps> = ({ customers, onRefresh }) => {
  const { enqueueSnackbar } = useSnackbar();

  // Edit Name State
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');

  // Add Credits State
  const [creditingCustomer, setCreditingCustomer] = useState<Customer | null>(null);
  const [creditAmount, setCreditAmount] = useState<string>('');

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFirstName(customer.firstName || '');
    setLastName(customer.lastName || '');
  };

  const handleCloseEdit = () => {
    setEditingCustomer(null);
  };

  const handleSaveEdit = async () => {
    if (!editingCustomer) return;
    try {
      await updateCustomer(editingCustomer._id, firstName, lastName);
      enqueueSnackbar('Customer name updated successfully', { variant: 'success' });
      if (onRefresh) onRefresh();
      handleCloseEdit();
    } catch (err: any) {
      console.error(err);
      enqueueSnackbar(err.response?.data?.message || 'Failed to update name', { variant: 'error' });
    }
  };

  const handleOpenCredit = (customer: Customer) => {
    setCreditingCustomer(customer);
    setCreditAmount('');
  };

  const handleCloseCredit = () => {
    setCreditingCustomer(null);
  };

  const handleSaveCredit = async () => {
    if (!creditingCustomer) return;
    const amountNum = parseFloat(creditAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      enqueueSnackbar('Please enter a valid credit amount', { variant: 'warning' });
      return;
    }
    try {
      await addCustomerCredits(creditingCustomer._id, amountNum);
      enqueueSnackbar(`Successfully added ₹${amountNum.toFixed(2)} credits`, { variant: 'success' });
      if (onRefresh) onRefresh();
      handleCloseCredit();
    } catch (err: any) {
      console.error(err);
      enqueueSnackbar(err.response?.data?.message || 'Failed to add credits', { variant: 'error' });
    }
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ maxHeight: 420, overflowY: 'auto' }}>
        <Table sx={{ minWidth: 900 }} stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell align="center">Last Order Date</TableCell>
              <TableCell>Address</TableCell>
              <TableCell align="center">Spent in Total</TableCell>
              <TableCell align="center">Total Orders</TableCell>
              <TableCell align="center">Credits / Wallet</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer._id}>
                <TableCell align="left">
                  <Link
                    to={`/customers/${customer._id}`}
                    style={{
                      display: 'block',
                      width: '100%',
                      color: '#36F',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    {customer.name}
                  </Link>
                </TableCell>

                <TableCell align="left">{customer.phoneNumber}</TableCell>
                <TableCell align="center">
                  {new Date(customer.lastOrderDate).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell align="left">{customer.address}</TableCell>
                <TableCell align="center">{customer.totalSpent.toLocaleString()}</TableCell>
                <TableCell align="center">{customer.totalOrders}</TableCell>
                <TableCell align="center">₹{(customer.cashBalance || 0).toFixed(2)}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit Name">
                    <IconButton size="small" onClick={() => handleOpenEdit(customer)}>
                      <MdEdit size={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Add Credits">
                    <IconButton size="small" color="primary" onClick={() => handleOpenCredit(customer)}>
                      <MdAddCard size={18} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Customer Dialog */}
      <Dialog open={Boolean(editingCustomer)} onClose={handleCloseEdit} fullWidth maxWidth="xs">
        <DialogTitle>Edit Customer Name</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="First Name"
            fullWidth
            variant="outlined"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            sx={{ mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Last Name"
            fullWidth
            variant="outlined"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Credits Dialog */}
      <Dialog open={Boolean(creditingCustomer)} onClose={handleCloseCredit} fullWidth maxWidth="xs">
        <DialogTitle>Add Wallet Credits</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Credit Amount (₹)"
            type="number"
            fullWidth
            variant="outlined"
            value={creditAmount}
            onChange={(e) => setCreditAmount(e.target.value)}
            sx={{ mt: 1 }}
            inputProps={{ min: 0, step: "any" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCredit}>Cancel</Button>
          <Button onClick={handleSaveCredit} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomersTable;
