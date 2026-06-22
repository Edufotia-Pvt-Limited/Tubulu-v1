import { useState, useEffect, useCallback } from 'react';
// @mui
import {
  Box,
  Card,
  Table,
  Button,
  Divider,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Chip,
  OutlinedInput,
  InputAdornment,
} from '@mui/material';
// routes
import { paths } from 'src/routes/paths';
// auth hooks
import { useAuthContext } from 'src/auth/hooks';
// components
import { useSettingsContext } from 'src/components/settings';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import { TableNoData, TableHeadCustom, TableSkeleton } from 'src/components/table';
import axios, { endpoints } from 'src/utils/axios';
import Label from 'src/components/label';
import { useSnackbar } from 'src/components/snackbar';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { getCountries, getStates, getCities } from 'src/utils/ApiActions';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'firstName', label: 'User', width: 180 },
  { id: 'phoneNumber', label: 'Phone', width: 160 },
  { id: 'role', label: 'Role', width: 120 },
  { id: 'portfolioAccess', label: 'Asset Access', width: 180 },
  { id: 'lastLoginAt', label: 'Last Login', width: 160 },
  { id: 'createdAt', label: 'Joined At', width: 120 },
  { id: 'actions', label: '', width: 80, align: 'right' },
];

// ----------------------------------------------------------------------

export default function SuperAdminUsersPage() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const loggedInRole = user?.role?.toLowerCase();

  const [tableData, setTableData] = useState([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [searchVal, setSearchVal] = useState('');
  const [search, setSearch] = useState('');

  // Scope lists
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  // Dialog Management
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const getAvailableRoles = () => {
    const roleLower = loggedInRole || '';
    if (roleLower === 'super_admin') {
      return [
        { value: 'regional_manager', label: 'Regional Manager' },
      ];
    }
    if (roleLower === 'regional_manager' || roleLower === 'state_manager') {
      return [
        { value: 'city_manager', label: 'City Manager' },
      ];
    }
    return [];
  };

  const [formData, setFormData] = useState<any>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
    role: loggedInRole === 'super_admin' ? 'regional_manager' : 'city_manager',
    scopedCountryId: '',
    scopedStateId: '',
    scopedCityId: '',
    portfolioAccess: {
      accessType: 'GLOBAL',
      merchants: []
    }
  });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchVal);
      setPage(0);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchVal]);

  // 📦 Step 1: Fetch System Lists
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, vendorsRes] = await Promise.all([
        axios.get('/api/v1/admin/users', { params: { page, size: rowsPerPage, search } }),
        axios.get('/api/v1/admin/integrations') // Fetch list of available businesses
      ]);

      if (usersRes.data.success) {
        setTableData(usersRes.data.data);
        setTotalUsers(usersRes.data.total);
      }
      if (vendorsRes.data.success) {
        setVendors(vendorsRes.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    getCountries().then((res) => {
      if (res.success) {
        const list = res.data || [];
        setCountries(list);
        const india = list.find((c: any) => c.name.toLowerCase() === 'india');
        if (india) {
          setFormData((prev: any) => ({
            ...prev,
            scopedCountryId: prev.scopedCountryId || india.id
          }));
        }
      }
    });
  }, []);

  useEffect(() => {
    const countryId = formData.scopedCountryId || (['regional_manager', 'state_manager'].includes(loggedInRole) ? user?.scopedCountryId : null);
    if (countryId) {
      getStates(countryId).then((res) => {
        if (res.success) setStates(res.data || []);
      });
    } else {
      setStates([]);
    }
  }, [formData.scopedCountryId, loggedInRole, user?.scopedCountryId]);

  useEffect(() => {
    const stateId = formData.scopedStateId || (loggedInRole === 'regional_manager' || loggedInRole === 'state_manager' ? user?.scopedStateId : null);
    if (stateId) {
      getCities(stateId).then((res) => {
        if (res.success) setCities(res.data || []);
      });
    } else {
      setCities([]);
    }
  }, [formData.scopedStateId, loggedInRole, user?.scopedStateId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 🎛️ Utility Handlers
  const handleOpenCreate = () => {
    setEditingUser(null);
    const india = countries.find((c: any) => c.name.toLowerCase() === 'india');
    setFormData({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      password: '',
      role: loggedInRole === 'super_admin' ? 'regional_manager' : 'city_manager',
      scopedCountryId: india ? india.id : (['regional_manager', 'state_manager'].includes(loggedInRole) ? user?.scopedCountryId : ''),
      scopedStateId: (['regional_manager', 'state_manager'].includes(loggedInRole)) ? user?.scopedStateId : '',
      scopedCityId: '',
      portfolioAccess: { accessType: 'GLOBAL', merchants: [] }
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (userItem: any) => {
    setEditingUser(userItem);
    setFormData({
      id: userItem.id,
      firstName: userItem.firstName || '',
      lastName: userItem.lastName || '',
      phoneNumber: userItem.phoneNumber || '',
      email: userItem.email || '',
      password: userItem.password || '',
      role: userItem.role || 'regional_manager',
      scopedCountryId: userItem.scopedCountryId || '',
      scopedStateId: userItem.scopedStateId || '',
      scopedCityId: userItem.scopedCityId || '',
      portfolioAccess: userItem.portfolioAccess || { accessType: 'GLOBAL', merchants: [] }
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === 'phoneNumber') {
      finalValue = value.replace(/\D/g, '').slice(0, 10);
    }
    setFormData((prev: any) => ({ ...prev, [name]: finalValue }));
  };

  const handlePortfolioChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      portfolioAccess: {
        ...prev.portfolioAccess,
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.phoneNumber || !formData.email) {
      enqueueSnackbar('First name, Last name, Phone number, and Email are compulsory.', { variant: 'warning' });
      return;
    }

    const cleanedPhone = formData.phoneNumber.replace(/\D/g, '');
    if (cleanedPhone.length !== 10) {
      enqueueSnackbar('Phone number must be exactly 10 digits.', { variant: 'warning' });
      return;
    }

    setIsSubmitting(true);
    try {
      const isEdit = !!editingUser;
      const endpoint = isEdit ? '/api/v1/admin/users/update' : '/api/v1/admin/users/create';
      
      const res = await axios.post(endpoint, {
        ...formData,
        phoneNumber: cleanedPhone
      });
      if (res.data.success) {
        enqueueSnackbar(isEdit ? 'User updated successfully!' : 'User provisioned successfully!', { variant: 'success' });
        handleCloseDialog();
        fetchData();
      }
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Action failed.', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await axios.delete(`/api/v1/admin/users/${id}`);
      if (res.data.success) {
        enqueueSnackbar('User deleted successfully!', { variant: 'success' });
        fetchData();
      }
    } catch (error: any) {
      console.error("Delete Error:", error);
      enqueueSnackbar(error.response?.data?.message || 'Failed to delete user.', { variant: 'error' });
    } finally {
      setConfirmDeleteId(null);
    }
  };

  // Lookup business name for UI rendering helper
  const getBusinessNames = (merchants: string[]) => {
    if (!merchants || merchants.length === 0) return 'None';
    const names = merchants.map(mId => vendors.find(v => v.id === mId)?.integrationName || 'Unknown Store');
    return names.join(', ');
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={loggedInRole === 'super_admin' ? "Regional Manager Creation" : loggedInRole === 'regional_manager' ? "City Manager Creation" : "User Management"}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Authorization Pool' },
        ]}
        action={
          <Button variant="contained" startIcon={<Iconify icon="eva:person-add-fill" />} onClick={handleOpenCreate}>
            {loggedInRole === 'super_admin' ? "New Regional Manager" : loggedInRole === 'regional_manager' ? "New City Manager" : "New User"}
          </Button>
        }
        sx={{ mb: 5 }}
      />

      <Card>
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{
            p: 2.5,
            pr: 1,
          }}
        >
          <TextField
            fullWidth
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search users by name, phone, or email..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
        <Divider />
        <Scrollbar>
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHeadCustom headLabel={TABLE_HEAD} />
              <TableBody>
                {loading ? (
                  [...Array(rowsPerPage)].map((_, i) => <TableSkeleton key={i} />)
                ) : (
                  tableData.map((row: any) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Stack>
                          <Typography variant="subtitle2" noWrap>{row.firstName} {row.lastName}</Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>{row.email || 'No Email'}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{row.phoneNumber}</TableCell>
                      <TableCell>
                        <Label color={(row.role === 'SuperAdmin' && 'error') || (row.role === 'Merchant' && 'success') || 'info'} variant="soft">
                          {row.role}
                        </Label>
                      </TableCell>
                      <TableCell>
                        {row.portfolioAccess?.accessType === 'GLOBAL' ? (
                          <Label color="warning" variant="filled">Global Super-Access</Label>
                        ) : (
                          <Typography variant="caption">
                            {row.portfolioAccess?.merchants?.length || 0} Businesses assigned
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleDateString() : 'Never'}</TableCell>
                      <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Tooltip title="Edit Permissions & Details">
                          <IconButton color="primary" onClick={() => handleOpenEdit(row)}>
                            <Iconify icon="solar:pen-bold-duotone" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton color="error" onClick={() => setConfirmDeleteId(row.id)}>
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                <TableNoData notFound={!loading && tableData.length === 0} />
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
        <Divider />
        <TablePagination
          component="div"
          count={totalUsers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Card>

      {/* ==========================================
          DYNAMIC UPSERT & MULTI-ACCESS DIALOG
          ========================================== */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon={editingUser ? "solar:pen-bold" : "solar:user-plus-bold"} />
          {editingUser ? 'Modify User Permissions' : 'Provision New User'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ pt: 1 }}>
            
            {/* 👥 BASE IDENTITY */}
            <Stack direction="row" spacing={2}>
              <TextField fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
              <TextField fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField 
                fullWidth 
                label="Phone Number" 
                name="phoneNumber" 
                value={formData.phoneNumber} 
                onChange={handleInputChange} 
                required 
                disabled={!!editingUser}
                error={formData.phoneNumber.length > 0 && !/^\d{10}$/.test(formData.phoneNumber)}
                helperText={formData.phoneNumber.length > 0 && !/^\d{10}$/.test(formData.phoneNumber) ? "Must be exactly 10 digits" : ""}
              />
              <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleInputChange} required />
            </Stack>
            <TextField fullWidth label="Login Password" name="password" value={formData.password} onChange={handleInputChange} type="password" />

            <Divider sx={{ borderStyle: 'dashed' }} />
            
            {/* 🔐 ROLE & ACCESS BINDING */}
            <Typography variant="overline" color="text.secondary">Security & Portfolio Bound</Typography>
            
            <FormControl fullWidth>
              <InputLabel>System Privilege Role</InputLabel>
              <Select 
                label="System Privilege Role" 
                name="role" 
                value={formData.role} 
                onChange={handleInputChange}
                disabled={loggedInRole === 'regional_manager'}
              >
                {getAvailableRoles().map((r) => (
                  <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Geographical scope selectors */}
            {['regional_manager', 'state_manager', 'city_manager'].includes(formData.role) && (
              <Stack spacing={2}>
                <Typography variant="caption" color="text.secondary">Geographic Scoping Jurisdiction</Typography>

                {/* State selector */}
                {['regional_manager', 'state_manager', 'city_manager'].includes(formData.role) && (
                  <FormControl fullWidth disabled={loggedInRole === 'state_manager' || loggedInRole === 'regional_manager'}>
                    <InputLabel>State Scope</InputLabel>
                    <Select
                      label="State Scope"
                      name="scopedStateId"
                      value={formData.scopedStateId || (loggedInRole === 'state_manager' ? user?.scopedStateId : '')}
                      onChange={(e) => {
                        handleInputChange(e);
                        setFormData((prev: any) => ({ ...prev, scopedCityId: '' }));
                      }}
                      disabled={loggedInRole === 'regional_manager'}
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      {states.map((s) => (
                        <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* City selector */}
                {formData.role === 'city_manager' && (
                  <FormControl fullWidth>
                    <InputLabel>City Scope</InputLabel>
                    <Select
                      label="City Scope"
                      name="scopedCityId"
                      value={formData.scopedCityId}
                      onChange={handleInputChange}
                      disabled={!formData.scopedStateId && loggedInRole !== 'state_manager'}
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      {cities.map((cityItem) => (
                        <MenuItem key={cityItem.id} value={cityItem.id}>{cityItem.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Stack>
            )}

          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting} startIcon={isSubmitting ? <Iconify icon="svg-spinners:180-ring" /> : null}>
            {isSubmitting ? 'Syncing...' : (editingUser ? 'Save Changes' : 'Create User')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CONFIRM DELETE DIALOG */}
      <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to permanently delete this user? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)} color="inherit">Cancel</Button>
          <Button onClick={() => { if(confirmDeleteId) handleDelete(confirmDeleteId); }} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}
