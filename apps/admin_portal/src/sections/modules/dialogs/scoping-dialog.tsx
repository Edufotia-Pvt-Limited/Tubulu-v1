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

export default function ScopingDialog({ open, onClose, onRefreshHealth }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [platformName, setPlatformName] = useState('');
  const [commissionRate, setCommissionRate] = useState('');

  const fetchSettings = useCallback(async () => {
    try {
      setFetching(true);
      const response = await axios.get(endpoints.admin.settings);
      const settings = response.data.data || [];

      const nameSetting = settings.find((s: any) => s.key === 'PLATFORM_NAME');
      if (nameSetting) setPlatformName(nameSetting.value);

      const commissionSetting = settings.find((s: any) => s.key === 'COMMISSION_RATE');
      if (commissionSetting) setCommissionRate(commissionSetting.value);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load scoping settings', { variant: 'error' });
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
          key: 'PLATFORM_NAME',
          value: platformName,
          description: 'Global Platform Display Name'
        }),
        axios.post(endpoints.admin.updateSettings, {
          key: 'COMMISSION_RATE',
          value: commissionRate,
          description: 'Global Default System Commission Rate (in %)'
        })
      ]);
      enqueueSnackbar('Scoping & general platform settings updated successfully');
      onRefreshHealth();
      onClose();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to update scoping settings', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Scoping & Platform Settings</Typography>
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
              Configure global platform parameters including display branding, and system-wide default commission structures applicable during regional checkout routing.
            </Typography>

            <TextField
              fullWidth
              label="Platform Display Name"
              placeholder="e.g. Tubulu"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
            />

            <TextField
              fullWidth
              label="Global Default Commission Rate (%)"
              placeholder="e.g. 5.00"
              type="number"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
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
