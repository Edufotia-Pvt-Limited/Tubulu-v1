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

export default function SupportDialog({ open, onClose, onRefreshHealth }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');

  const fetchSettings = useCallback(async () => {
    try {
      setFetching(true);
      const response = await axios.get(endpoints.admin.settings);
      const settings = response.data.data || [];

      const emailSetting = settings.find((s: any) => s.key === 'SUPPORT_EMAIL');
      if (emailSetting) setSupportEmail(emailSetting.value);

      const phoneSetting = settings.find((s: any) => s.key === 'SUPPORT_PHONE');
      if (phoneSetting) setSupportPhone(phoneSetting.value);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load support settings', { variant: 'error' });
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
          key: 'SUPPORT_EMAIL',
          value: supportEmail,
          description: 'Global Support Contact Email'
        }),
        axios.post(endpoints.admin.updateSettings, {
          key: 'SUPPORT_PHONE',
          value: supportPhone,
          description: 'Global Support Contact Phone'
        })
      ]);
      enqueueSnackbar('Support ticketing contacts updated successfully');
      onRefreshHealth();
      onClose();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to update support settings', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Support Tickets Desk Configuration</Typography>
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
              Configure the primary contact details that will be shared with customers when submitting support tickets or encountering issues.
            </Typography>

            <TextField
              fullWidth
              label="Support Email"
              placeholder="e.g. support@tubulu.com"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
            />

            <TextField
              fullWidth
              label="Support Phone"
              placeholder="e.g. +91 99999 99999"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
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
