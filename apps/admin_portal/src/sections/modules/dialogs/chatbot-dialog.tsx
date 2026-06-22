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

export default function ChatbotDialog({ open, onClose, onRefreshHealth }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  const [sarvamApiKey, setSarvamApiKey] = useState('');
  const [showSarvamKey, setShowSarvamKey] = useState(false);

  const [textProvider, setTextProvider] = useState('gemini');
  const [voiceProvider, setVoiceProvider] = useState('gemini');

  const fetchSettings = useCallback(async () => {
    try {
      setFetching(true);
      const response = await axios.get(endpoints.admin.settings);
      const settings = response.data.data || [];

      const geminiSetting = settings.find((s: any) => s.key === 'GEMINI_API_KEY');
      if (geminiSetting) setGeminiApiKey(geminiSetting.value);

      const sarvamSetting = settings.find((s: any) => s.key === 'SARVAM_API_KEY');
      if (sarvamSetting) setSarvamApiKey(sarvamSetting.value);

      const textSetting = settings.find((s: any) => s.key === 'DEFAULT_TEXT_PROVIDER');
      if (textSetting) setTextProvider(textSetting.value);

      const voiceSetting = settings.find((s: any) => s.key === 'DEFAULT_VOICE_PROVIDER');
      if (voiceSetting) setVoiceProvider(voiceSetting.value);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load Chatbot AI settings', { variant: 'error' });
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
          key: 'GEMINI_API_KEY',
          value: geminiApiKey,
          description: 'Global Gemini API Key for Chatbots and AI'
        }),
        axios.post(endpoints.admin.updateSettings, {
          key: 'SARVAM_API_KEY',
          value: sarvamApiKey,
          description: 'Global Sarvam AI API Key for Voice & Translation'
        }),
        axios.post(endpoints.admin.updateSettings, {
          key: 'DEFAULT_TEXT_PROVIDER',
          value: textProvider,
          description: 'Default text chatbot LLM provider'
        }),
        axios.post(endpoints.admin.updateSettings, {
          key: 'DEFAULT_VOICE_PROVIDER',
          value: voiceProvider,
          description: 'Default voice chatbot LLM provider'
        })
      ]);
      enqueueSnackbar('Chatbot AI settings updated successfully');
      onRefreshHealth();
      onClose();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to update Chatbot settings', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Chatbot & Text AI Configuration</Typography>
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
              Configure the AI model keys and defaults used by the system for generating natural language replies, scoping analysis, and recommendations.
            </Typography>

            <TextField
              fullWidth
              label="Gemini API Key"
              placeholder="Enter your Gemini API key"
              type={showGeminiKey ? 'text' : 'password'}
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowGeminiKey(!showGeminiKey)} edge="end">
                      <Iconify icon={showGeminiKey ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Sarvam AI API Key"
              placeholder="Enter your Sarvam AI API key"
              type={showSarvamKey ? 'text' : 'password'}
              value={sarvamApiKey}
              onChange={(e) => setSarvamApiKey(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowSarvamKey(!showSarvamKey)} edge="end">
                      <Iconify icon={showSarvamKey ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              fullWidth
              label="Default Text AI Provider"
              value={textProvider}
              onChange={(e) => setTextProvider(e.target.value)}
            >
              <MenuItem value="gemini">Gemini 2.5 Flash</MenuItem>
              <MenuItem value="sarvam">Sarvam AI</MenuItem>
            </TextField>

            <TextField
              select
              fullWidth
              label="Default Voice AI Provider"
              value={voiceProvider}
              onChange={(e) => setVoiceProvider(e.target.value)}
            >
              <MenuItem value="gemini">Gemini 2.5 Flash</MenuItem>
              <MenuItem value="sarvam">Sarvam AI</MenuItem>
            </TextField>
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
