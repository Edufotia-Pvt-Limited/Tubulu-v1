import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSnackbar } from 'notistack';
// @mui
import {
  Box,
  Card,
  Table,
  Button,
  Dialog,
  TextField,
  Typography,
  TableBody,
  TableCell,
  Container,
  TableHead,
  TableRow,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  Stack,
  MenuItem,
  IconButton,
  Paper,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import Map from 'react-map-gl';
// config
import { MAPBOX_API } from 'src/config-global';
// utils
import axios from 'src/utils/axios';
// components
import { MapMarker, MapControl } from 'src/components/map';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import DeleteConfirmationDialog from 'src/components/catalogue/delete-dialog-confirmation';
// api
import { getMyBranches, createBranch, deleteBranch } from 'src/utils/ApiActions';

// ----------------------------------------------------------------------

export default function ManageBranchesPage() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const [branches, setBranches] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    integrationName: '',
    phoneNumber: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    category: 'Retail',
    inheritCatalogue: false,
    latitude: 12.9716,
    longitude: 77.5946,
  });

  const fetchBranches = async () => {
    try {
      const res: any = await getMyBranches();
      if (res?.data?.success) {
        setBranches(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch branches', err);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setGoogleMapsLink('');
    setFormData({
      integrationName: '',
      phoneNumber: '',
      addressLine: '',
      city: '',
      state: '',
      pincode: '',
      category: 'Retail',
      inheritCatalogue: false,
      latitude: 12.9716,
      longitude: 77.5946,
    });
  };

  const [googleMapsLink, setGoogleMapsLink] = useState('');

  const handleResolveGoogleMapsLink = async (url: string) => {
    if (!url) return;
    try {
      // 1. Try local/regex parsing first if it's a full URL
      const atRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
      const atMatch = url.match(atRegex);
      if (atMatch) {
        const lat = parseFloat(atMatch[1]);
        const lng = parseFloat(atMatch[2]);
        setFormData((prev) => ({
          ...prev,
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lng.toFixed(6)),
        }));
        enqueueSnackbar('Coordinates imported from Google Maps link!', { variant: 'success' });
        return;
      }

      const queryRegex = /[?&](?:q|query|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/;
      const queryMatch = url.match(queryRegex);
      if (queryMatch) {
        const lat = parseFloat(queryMatch[1]);
        const lng = parseFloat(queryMatch[2]);
        setFormData((prev) => ({
          ...prev,
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lng.toFixed(6)),
        }));
        enqueueSnackbar('Coordinates imported from Google Maps link!', { variant: 'success' });
        return;
      }

      // 2. If it's a shortened link, make a backend call to resolve it
      const response = await axios.post('/api/v1/integrations/admin/resolve-google-maps-link', { url });
      if (response?.data?.success) {
        const { lat, lng } = response.data.data;
        setFormData((prev) => ({
          ...prev,
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lng.toFixed(6)),
        }));
        enqueueSnackbar('Coordinates resolved successfully!', { variant: 'success' });
      }
    } catch (err: any) {
      console.error('Failed to parse Google Maps URL:', err);
      enqueueSnackbar(err?.message || 'Could not parse Google Maps URL. Please drag marker or enter manually.', { variant: 'warning' });
    }
  };

  const handleSubmit = async () => {
    if (!formData.integrationName || !formData.phoneNumber) {
      enqueueSnackbar('Name and Phone are required', { variant: 'error' });
      return;
    }
    if (formData.phoneNumber.length !== 10) {
      enqueueSnackbar('Phone number must be exactly 10 digits', { variant: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res: any = await createBranch(formData);
      if (res?.data?.success) {
        enqueueSnackbar('Branch created successfully!', { variant: 'success' });
        fetchBranches();
        handleClose();
      } else {
        enqueueSnackbar(res?.data?.message || 'Failed to create branch', { variant: 'error' });
      }
    } catch (err) {
      enqueueSnackbar('An error occurred', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteConfirm = (branchId: string) => {
    setSelectedBranchId(branchId);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setSelectedBranchId(null);
    setDeleteConfirmOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBranchId) return;
    try {
      const res: any = await deleteBranch(selectedBranchId);
      if (res?.data?.success) {
        enqueueSnackbar('Branch deleted successfully!', { variant: 'success' });
        fetchBranches();
      } else {
        enqueueSnackbar(res?.data?.message || 'Failed to delete branch', { variant: 'error' });
      }
    } catch (err) {
      enqueueSnackbar('Failed to delete branch', { variant: 'error' });
    } finally {
      handleCloseDeleteConfirm();
    }
  };

  return (
    <>
      <Helmet>
        <title> Dashboard: Manage Branches</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">Manage Branches</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleOpen}
          >
            Add New Branch
          </Button>
        </Stack>

        <Card>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Branch Name</TableCell>
                  <TableCell>Phone Number</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {branches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 10, color: 'text.secondary' }}>
                      No branches found. Start by adding one.
                    </TableCell>
                  </TableRow>
                ) : (
                  branches.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell sx={{ fontWeight: 'bold' }}>{row.integrationName}</TableCell>
                      <TableCell>{row.phoneNumber}</TableCell>
                      <TableCell>{row.city || 'N/A'}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            display: 'inline-block',
                            fontSize: 12,
                            fontWeight: 'bold',
                            bgcolor: !row.isApproved
                              ? 'warning.lighter'
                              : row.isSuspended
                              ? 'error.lighter'
                              : row.isActive
                              ? 'success.lighter'
                              : 'error.lighter',
                            color: !row.isApproved
                              ? 'warning.darker'
                              : row.isSuspended
                              ? 'error.darker'
                              : row.isActive
                              ? 'success.darker'
                              : 'error.darker',
                          }}
                        >
                          {!row.isApproved
                            ? 'Pending Approval'
                            : row.isSuspended
                            ? 'Suspended'
                            : row.isActive
                            ? 'Active'
                            : 'Inactive'}
                        </Box>
                      </TableCell>
                      <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <IconButton color="primary">
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleOpenDeleteConfirm(row.id)}>
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle>Create Sub Branch</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1, display: 'grid', gap: 2.5 }}>
              <TextField
                label="Branch Name"
                value={formData.integrationName}
                onChange={(e) => setFormData({ ...formData, integrationName: e.target.value })}
                fullWidth
              />
              <TextField
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, ''); // keep only numbers
                  if (val.length <= 10) {
                    setFormData({ ...formData, phoneNumber: val });
                  }
                }}
                fullWidth
              />
              <TextField
                label="Address Line"
                value={formData.addressLine}
                onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                fullWidth
              />
              <TextField
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                fullWidth
              />
              <TextField
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                fullWidth
              />
              <TextField
                label="Pincode"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                fullWidth
              />
              <TextField
                label="Google Maps Location Link"
                placeholder="Paste link here (e.g., https://maps.app.goo.gl/...)"
                value={googleMapsLink}
                onChange={(e) => {
                  setGoogleMapsLink(e.target.value);
                  handleResolveGoogleMapsLink(e.target.value);
                }}
                fullWidth
                helperText="Paste a Google Maps link to auto-fill Latitude & Longitude"
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Latitude"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) || 0 })}
                  fullWidth
                  type="number"
                />
                <TextField
                  label="Longitude"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) || 0 })}
                  fullWidth
                  type="number"
                />
              </Stack>
              {MAPBOX_API ? (
                <Box sx={{ height: 200, width: '100%', position: 'relative', borderRadius: 1, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.12)' }}>
                  <Map
                    mapboxAccessToken={MAPBOX_API}
                    initialViewState={{
                      latitude: formData.latitude || 12.9716,
                      longitude: formData.longitude || 77.5946,
                      zoom: 12,
                    }}
                    onClick={(event) => {
                      setFormData({
                        ...formData,
                        latitude: Number(event.lngLat.lat.toFixed(6)),
                        longitude: Number(event.lngLat.lng.toFixed(6)),
                      });
                    }}
                    mapStyle="mapbox://styles/mapbox/streets-v11"
                  >
                    <MapControl />
                    <MapMarker
                      latitude={formData.latitude || 12.9716}
                      longitude={formData.longitude || 77.5946}
                      draggable
                      onDrag={(event) => {
                        setFormData({
                          ...formData,
                          latitude: Number(event.lngLat.lat.toFixed(6)),
                          longitude: Number(event.lngLat.lng.toFixed(6)),
                        });
                      }}
                    />
                  </Map>
                </Box>
              ) : null}
              <TextField
                select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                fullWidth
              >
                {['Retail', 'Food and beverage', 'Service', 'Grocery'].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.inheritCatalogue}
                    onChange={(e) => setFormData({ ...formData, inheritCatalogue: e.checked ? true : e.target.checked })}
                    color="primary"
                  />
                }
                label="Inherit HQ catalogue & products"
              />
              <Typography variant="caption" color="text.secondary">
                * Note: Newly created branches require Admin approval before going live.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading}
              startIcon={loading ? <Iconify icon="line-md:loading-twotone-loop" /> : null}
            >
              Create Branch
            </Button>
          </DialogActions>
        </Dialog>

        <DeleteConfirmationDialog
          open={deleteConfirmOpen}
          deleteHeaderMessage="Delete Branch"
          message="Are you sure you want to delete this sub-branch?"
          alert="This action cannot be undone."
          onCancel={handleCloseDeleteConfirm}
          onConfirm={handleConfirmDelete}
        />
      </Container>
    </>
  );
}
