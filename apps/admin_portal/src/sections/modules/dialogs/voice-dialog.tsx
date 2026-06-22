import { useState, useEffect, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
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

export default function VoiceDialog({ open, onClose, onRefreshHealth }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [voiceProvider, setVoiceProvider] = useState('gemini');
  const [voiceGatewayPort, setVoiceGatewayPort] = useState('8080');
  const [voiceGatewayUrl, setVoiceGatewayUrl] = useState('http://localhost:8080/health');

  const fetchSettings = useCallback(async () => {
    try {
      setFetching(true);
      const response = await axios.get(endpoints.admin.settings);
      const settings = response.data.data || [];

      const voiceSetting = settings.find((s: any) => s.key === 'DEFAULT_VOICE_PROVIDER');
      if (voiceSetting) setVoiceProvider(voiceSetting.value);

      const portSetting = settings.find((s: any) => s.key === 'VOICE_GATEWAY_PORT');
      if (portSetting) setVoiceGatewayPort(portSetting.value);

      const urlSetting = settings.find((s: any) => s.key === 'VOICE_GATEWAY_URL');
      if (urlSetting) setVoiceGatewayUrl(urlSetting.value);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load Voice Gateway settings', { variant: 'error' });
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
          key: 'DEFAULT_VOICE_PROVIDER',
          value: voiceProvider,
          description: 'Default voice chatbot LLM provider'
        }),
        axios.post(endpoints.admin.updateSettings, {
          key: 'VOICE_GATEWAY_PORT',
          value: voiceGatewayPort,
          description: 'Asterisk/Gateway connection port'
        }),
        axios.post(endpoints.admin.updateSettings, {
          key: 'VOICE_GATEWAY_URL',
          value: voiceGatewayUrl,
          description: 'Voice Gateway health status endpoint URL'
        })
      ]);
      enqueueSnackbar('Voice Gateway settings updated successfully');
      onRefreshHealth();
      onClose();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to update Voice settings', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Voice Gateway Configuration</Typography>
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
              Configure parameters for the Asterisk CTI Voice-AI interface, including the health monitoring URL and primary speech Synthesis/LLM provider.
            </Typography>

            <TextField
              select
              fullWidth
              label="Primary Voice AI Provider"
              value={voiceProvider}
              onChange={(e) => setVoiceProvider(e.target.value)}
            >
              <MenuItem value="gemini">Gemini 2.5 Flash</MenuItem>
              <MenuItem value="sarvam">Sarvam AI</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Voice Gateway Port"
              placeholder="e.g. 8080"
              value={voiceGatewayPort}
              onChange={(e) => setVoiceGatewayPort(e.target.value)}
            />

            <TextField
              fullWidth
              label="Voice Gateway Health URL"
              placeholder="http://localhost:8080/health"
              value={voiceGatewayUrl}
              onChange={(e) => setVoiceGatewayUrl(e.target.value)}
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
