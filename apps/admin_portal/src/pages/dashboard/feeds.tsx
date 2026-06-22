import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { enqueueSnackbar } from 'notistack';
import { AxiosError } from 'axios';
import DeleteConfirmationModal from 'src/components/customization/modal/delete-confirmation-modal';
import ProductPageSkeleton from 'src/components/catalogue/PageSkeleton';
import {
  getFeeds,
  createFeed,
  deleteFeed,
  getAllCatalogues,
  searchProductsApi,
} from 'src/utils/ApiActions';

export interface FeedPost {
  id: string;
  title: string;
  description: string;
  mediaUrl?: string;
  actionProductId?: string;
  startsAt?: string;
  expiresAt?: string;
  status: 'active' | 'scheduled' | 'expired';
  linkedProduct?: {
    id: string;
    name: string;
    price: number;
    imageUrls?: string[];
  };
}

export default function FeedsPage() {
  const [feeds, setFeeds] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [startsAt, setStartsAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [catalogues, setCatalogues] = useState<any[]>([]);
  const [selectedCatalogueId, setSelectedCatalogueId] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchFeeds = async () => {
    setLoading(true);
    try {
      const response = await getFeeds();
      if (response?.data?.data) {
        setFeeds(response.data.data);
      } else if (Array.isArray(response?.data)) {
        setFeeds(response.data);
      }
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      enqueueSnackbar(axiosErr.response?.data?.message || 'Failed to fetch feeds', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadCatalogues = async () => {
    try {
      const response = await getAllCatalogues();
      if (response?.catalogues) {
        setCatalogues(response.catalogues);
      } else if (response?.data?.catalogues) {
        setCatalogues(response.data.catalogues);
      } else if (Array.isArray(response)) {
        setCatalogues(response);
      }
    } catch (err) {
      console.error('Failed to load catalogues', err);
    }
  };

  const loadProducts = async (catalogueId: string) => {
    try {
      const response = await searchProductsApi(catalogueId, '', 1, 100);
      const rawData = response?.data?.data || response?.data;
      if (rawData?.products) {
        setProducts(rawData.products);
      } else if (Array.isArray(rawData)) {
        setProducts(rawData);
      } else if (Array.isArray(response?.data)) {
        setProducts(response.data);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  useEffect(() => {
    fetchFeeds();
    loadCatalogues();
  }, []);

  useEffect(() => {
    if (selectedCatalogueId) {
      loadProducts(selectedCatalogueId);
    } else {
      setProducts([]);
      setSelectedProductId('');
    }
  }, [selectedCatalogueId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      enqueueSnackbar('Headline and description are required', { variant: 'warning' });
      return;
    }

    if (startsAt && expiresAt && new Date(expiresAt) <= new Date(startsAt)) {
      enqueueSnackbar('Expiration time must be after start time', { variant: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        title,
        description,
        actionProductId: selectedProductId || null,
        startsAt: startsAt ? new Date(startsAt).toISOString() : null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      };

      if (mediaPreview) {
        payload.mediaUrl = mediaPreview; // base64 string
      }

      await createFeed(payload);
      enqueueSnackbar('Moment posted successfully!', { variant: 'success' });
      setCreateOpen(false);
      resetForm();
      fetchFeeds();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      enqueueSnackbar(axiosErr.response?.data?.message || 'Failed to create feed', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setMediaFile(null);
    setMediaPreview(null);
    setStartsAt('');
    setExpiresAt('');
    setSelectedCatalogueId('');
    setSelectedProductId('');
  };

  const handleOpenDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteFeed(deleteId);
      enqueueSnackbar('Moment deleted successfully', { variant: 'success' });
      fetchFeeds();
    } catch (err) {
      enqueueSnackbar('Failed to delete moment', { variant: 'error' });
    } finally {
      setDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      return date.toLocaleString();
    } catch (_) {
      return isoString;
    }
  };

  const getStatusColor = (status: 'active' | 'scheduled' | 'expired') => {
    switch (status) {
      case 'scheduled':
        return 'info';
      case 'expired':
        return 'default';
      default:
        return 'success';
    }
  };

  const getFullImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    // On staging, serve from backend public path
    return `http://34.135.72.28:3008${url}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Store Feed & Moments
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setCreateOpen(true)}
        >
          Add Moment
        </Button>
      </Stack>

      {loading ? (
        <ProductPageSkeleton />
      ) : feeds.length === 0 ? (
        <Card sx={{ p: 5, textAlign: 'center', color: 'text.secondary' }}>
          <Iconify icon="solar:campaign-bold-duotone" sx={{ fontSize: 64, mb: 2, color: 'text.disabled' }} />
          <Typography variant="h6" gutterBottom>
            No Moments Posted Yet
          </Typography>
          <Typography variant="body2" mb={3}>
            Share updates, flash campaigns, or celebrity guest visits with your customers!
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setCreateOpen(true)}
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Create Your First Moment
          </Button>
        </Card>
      ) : (
        <TableContainer component={Card} sx={{ borderRadius: 1.5 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Media</TableCell>
                <TableCell>Title & Description</TableCell>
                <TableCell>Linked Product</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>Expiration</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feeds.map((feed) => (
                <TableRow key={feed.id}>
                  <TableCell>
                    {feed.mediaUrl ? (
                      <Avatar
                        src={getFullImageUrl(feed.mediaUrl)}
                        variant="rounded"
                        sx={{ width: 64, height: 64 }}
                      />
                    ) : (
                      <Avatar variant="rounded" sx={{ width: 64, height: 64, bgcolor: 'action.selected' }}>
                        <Iconify icon="solar:gallery-bold" />
                      </Avatar>
                    )}
                  </TableCell>
                  <TableCell sx={{ maxW: 300 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      {feed.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 250 }}>
                      {feed.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {feed.linkedProduct ? (
                      <Chip
                        icon={<Iconify icon="solar:link-bold" />}
                        label={`${feed.linkedProduct.name} (₹${feed.linkedProduct.price})`}
                        variant="outlined"
                        size="small"
                        color="warning"
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{feed.startsAt ? formatDate(feed.startsAt) : 'Immediate'}</TableCell>
                  <TableCell>{feed.expiresAt ? formatDate(feed.expiresAt) : 'Never'}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={feed.status.toUpperCase()}
                      color={getStatusColor(feed.status)}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Delete Moment">
                      <IconButton color="error" onClick={() => handleOpenDelete(feed.id)}>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Modal */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateFeed}>
          <DialogTitle sx={{ fontWeight: 'bold' }}>Post New Moment / Vibe</DialogTitle>
          <Divider />
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Headline / Title *"
                placeholder="e.g. Special Weekend Offer!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Description *"
                placeholder="Details of the announcement or campaign..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={3}
                fullWidth
                required
              />

              {/* Image picker */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                  Moment Image (Optional)
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button variant="outlined" component="label" startIcon={<Iconify icon="solar:upload-bold" />}>
                    Upload Image
                    <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                  </Button>
                  {mediaPreview && (
                    <Box sx={{ position: 'relative' }}>
                      <Avatar src={mediaPreview} variant="rounded" sx={{ width: 80, height: 80 }} />
                      <IconButton
                        size="small"
                        onClick={() => {
                          setMediaFile(null);
                          setMediaPreview(null);
                        }}
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          bgcolor: 'error.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'error.dark' },
                        }}
                      >
                        <Iconify icon="mingcute:close-line" width={12} height={12} />
                      </IconButton>
                    </Box>
                  )}
                </Stack>
              </Box>

              {/* Linked Product */}
              <Stack direction="row" spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Select Catalogue</InputLabel>
                  <Select
                    value={selectedCatalogueId}
                    label="Select Catalogue"
                    onChange={(e) => setSelectedCatalogueId(e.target.value)}
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {catalogues.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedCatalogueId && (
                  <FormControl fullWidth>
                    <InputLabel>Link Product</InputLabel>
                    <Select
                      value={selectedProductId}
                      label="Link Product"
                      onChange={(e) => setSelectedProductId(e.target.value)}
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      {products.map((prod) => (
                        <MenuItem key={prod.id} value={prod.id}>
                          {prod.name} (₹{prod.price})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Stack>

              <Divider />
              <Typography variant="subtitle2" color="warning.main" fontWeight="bold">
                Scheduling Settings (Optional)
              </Typography>

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Start Publication Time"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="Expiration Time"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>
            </Stack>
          </DialogContent>
          <Divider />
          <DialogActions>
            <Button onClick={() => setCreateOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={submitting}>
              {submitting ? 'Posting...' : 'Post Moment'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <DeleteConfirmationModal
        open={deleteOpen}
        deleteHeaderMessage="Delete Feed Post"
        message="Are you sure you want to delete this moment? It will disappear from customer feeds immediately."
        alert="This action cannot be undone."
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}
