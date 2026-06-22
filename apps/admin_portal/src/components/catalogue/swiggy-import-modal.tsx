import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Box,
  CircularProgress,
} from '@mui/material';
import { axios } from 'src/utils/axios';
import { useSnackbar } from 'src/components/snackbar';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  catalogueId: string;
  onSuccess: VoidFunction;
};

export default function SwiggyImportModal({ open, onClose, catalogueId, onSuccess }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');

  const handleImport = async () => {
    if (!url || !url.includes('swiggy.com')) {
      enqueueSnackbar('Please enter a valid Swiggy restaurant URL', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`/api/v1/products/swiggy-import/${catalogueId}`, { swiggyUrl: url });
      
      enqueueSnackbar(response.data.message || 'Import successful!', { variant: 'success' });
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.response?.data?.message || 'Failed to import from Swiggy', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Import from Swiggy</DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
          Paste your Swiggy restaurant menu URL below to automatically import your items.
        </Typography>

        <TextField
          fullWidth
          label="Swiggy URL"
          placeholder="https://www.swiggy.com/restaurants/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          autoFocus
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button
          onClick={handleImport}
          variant="contained"
          color="warning"
          disabled={!url || loading}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
        >
          Import Menu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
