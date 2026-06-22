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
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import axios, { endpoints } from 'src/utils/axios';

type Props = {
  open: boolean;
  onClose: () => void;
  onRefreshHealth: () => void;
};

export default function SmsDialog({ open, onClose, onRefreshHealth }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [smsApiKey, setSmsApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [smsApiUrl, setSmsApiUrl] = useState('');

  const fetchSettings = useCallback(async () => {
    try {
      setFetching(true);
      const response = await axios.get(endpoints.admin.settings);
      const settings = response.data.data || [];

      const keySetting = settings.find((s: any) => s.key === 'SMS_API_KEY');
      if (keySetting) setSmsApiKey(keySetting.value);

      const urlSetting = settings.find((s: any) => s.key === 'SMS_API_URL');
      if (urlSetting) setSmsApiUrl(urlSetting.value);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load SMS settings', { variant: 'error' });
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
          key: 'SMS_API_KEY',
          value: smsApiKey,
          description: 'Pinnacle SMS Gateway Access Key'
        }),
        axios.post(endpoints.admin.updateSettings, {
          key: 'SMS_API_URL',
          value: smsApiUrl || 'https://transapi.pinnacle.in/genericapi/QSGenericReceiver',
          description: 'Pinnacle SMS Gateway API Endpoint URL'
        })
      ]);
      enqueueSnackbar('SMS configurations updated successfully');
      onRefreshHealth();
      onClose();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to update SMS settings', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">SMS & Campaigns Configuration</Typography>
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
              Configure credentials and API integration details for the Pinnacle SMS Gateway. This is used for dispatching verification SMSs, orders updates, and campaigns.
            </Typography>

            <TextField
              fullWidth
              label="SMS API Access Key"
              placeholder="Enter Pinnacle SMS API key"
              type={showKey ? 'text' : 'password'}
              value={smsApiKey}
              onChange={(e) => setSmsApiKey(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowKey(!showKey)} edge="end">
                      <Iconify icon={showKey ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="SMS Gateway API URL"
              placeholder="https://transapi.pinnacle.in/genericapi/QSGenericReceiver"
              value={smsApiUrl}
              onChange={(e) => setSmsApiUrl(e.target.value)}
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
