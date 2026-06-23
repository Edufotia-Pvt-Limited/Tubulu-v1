import { useState, useEffect, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import axios, { endpoints } from 'src/utils/axios';

type Props = {
  open: boolean;
  onClose: () => void;
  onRefreshHealth: () => void;
};

export default function MerchantDialog({ open, onClose, onRefreshHealth }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [gcpProjectId, setGcpProjectId] = useState('');
  const [gcpBucket, setGcpBucket] = useState('');
  const [gcpStorageKey, setGcpStorageKey] = useState('');

  const fetchSettings = useCallback(async () => {
    try {
      setFetching(true);
      const response = await axios.get(endpoints.admin.settings);
      const settings = response.data.data || [];

      const projectSetting = settings.find((s: any) => s.key === 'GCP_PROJECT_ID');
      if (projectSetting) setGcpProjectId(projectSetting.value);

      const bucketSetting = settings.find((s: any) => s.key === 'GCP_BUCKET_NAME');
      if (bucketSetting) setGcpBucket(bucketSetting.value);

      const keySetting = settings.find((s: any) => s.key === 'GCP_STORAGE_KEY');
      if (keySetting) setGcpStorageKey(keySetting.value);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load merchant settings', { variant: 'error' });
    } finally {
      setFetching(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (open) {
      fetchSettings();
    }
  }, [open, fetchSettings]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await Promise.all([
        axios.post(endpoints.admin.updateSettings, {
          key: 'GCP_PROJECT_ID',
          value: gcpProjectId,
          description: 'GCP Project ID for Cloud Storage'
        }),
        axios.post(endpoints.admin.updateSettings, {
          key: 'GCP_BUCKET_NAME',
          value: gcpBucket,
          description: 'GCP Storage Bucket Name for upload assets'
        }),
        axios.post(endpoints.admin.updateSettings, {
          key: 'GCP_STORAGE_KEY',
          value: gcpStorageKey,
          description: 'GCP Credentials JSON service key (base64 or direct)'
        })
      ]);
      enqueueSnackbar('Merchant assets configurations updated successfully');
      onRefreshHealth();
      onClose();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to update merchant settings', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Merchant Catalogs & Storage Settings</Typography>
        <IconButton onClick={onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {fetching ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 5 }}>
            <CircularProgress />
          </Stack>
        ) : (
          <Stack spacing={3}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Configure parameters for GCP Cloud Storage to store uploaded products pictures, invoices, and catalog files.
            </Typography>

            <TextField
              fullWidth
              label="GCP Project ID"
              placeholder="e.g. tubulu-production"
              value={gcpProjectId}
              onChange={(e) => setGcpProjectId(e.target.value)}
            />

            <TextField
              fullWidth
              label="GCP Storage Bucket Name"
              placeholder="e.g. tubulu-assets-bucket"
              value={gcpBucket}
              onChange={(e) => setGcpBucket(e.target.value)}
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="GCP Storage Service Key JSON"
              placeholder="Paste JSON credentials"
              value={gcpStorageKey}
              onChange={(e) => setGcpStorageKey(e.target.value)}
            />
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" disabled={loading || fetching} onClick={handleSave}>
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
