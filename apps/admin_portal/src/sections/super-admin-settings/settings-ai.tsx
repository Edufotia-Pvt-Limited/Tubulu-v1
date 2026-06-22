import { useState, useEffect, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CardHeader from '@mui/material/CardHeader';
import InputAdornment from '@mui/material/InputAdornment';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export default function SettingsAI() {
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  const [textProvider, setTextProvider] = useState('gemini');
  const [voiceProvider, setVoiceProvider] = useState('gemini');

  const fetchKey = useCallback(async () => {
    try {
      const response = await axios.get(endpoints.admin.settings);
      const settings = response.data.data;
      const keySetting = settings.find((s: any) => s.key === 'SARVAM_API_KEY');
      if (keySetting) {
        setApiKey(keySetting.value);
      }
      const geminiSetting = settings.find((s: any) => s.key === 'GEMINI_API_KEY');
      if (geminiSetting) {
        setGeminiApiKey(geminiSetting.value);
      }
      const textSetting = settings.find((s: any) => s.key === 'DEFAULT_TEXT_PROVIDER');
      if (textSetting) {
        setTextProvider(textSetting.value);
      }
      const voiceSetting = settings.find((s: any) => s.key === 'DEFAULT_VOICE_PROVIDER');
      if (voiceSetting) {
        setVoiceProvider(voiceSetting.value);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchKey();
  }, [fetchKey]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await Promise.all([
        axios.post(endpoints.admin.updateSettings, {
          key: 'SARVAM_API_KEY',
          value: apiKey,
          description: 'Global Sarvam AI API Key for Vendor Chatbots'
        }),
        axios.post(endpoints.admin.updateSettings, {
          key: 'GEMINI_API_KEY',
          value: geminiApiKey,
          description: 'Global Gemini API Key for AI Features'
        }),
        axios.post(endpoints.admin.updateSettings, {
          key: 'DEFAULT_TEXT_PROVIDER',
          value: textProvider,
          description: 'Default AI provider for Text/Chat features'
        }),
        axios.post(endpoints.admin.updateSettings, {
          key: 'DEFAULT_VOICE_PROVIDER',
          value: voiceProvider,
          description: 'Default AI provider for Voice/Speech features'
        })
      ]);
      enqueueSnackbar('AI settings updated successfully');
    } catch (error) {
      enqueueSnackbar('Failed to update AI settings', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader 
        title="Global AI Provider Settings" 
        subheader="Configure the API keys used for all vendor chatbots and AI features on the platform."
      />

      <Stack spacing={3} sx={{ p: 3 }}>
        <TextField
          fullWidth
          label="Sarvam AI API Key"
          placeholder="Enter your Sarvam AI API key"
          type={showKey ? 'text' : 'password'}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button onClick={() => setShowKey(!showKey)} sx={{ minWidth: 0, p: 1 }}>
                  <Iconify icon={showKey ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </Button>
              </InputAdornment>
            ),
          }}
        />

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
                <Button onClick={() => setShowGeminiKey(!showGeminiKey)} sx={{ minWidth: 0, p: 1 }}>
                  <Iconify icon={showGeminiKey ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </Button>
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

        <Stack direction="row" justifyContent="flex-end">
          <Button variant="contained" disabled={loading} onClick={handleSave}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
