import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Stack,
  Typography,
  CircularProgress,
  Box,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { useAuthContext } from 'src/auth/hooks';
import { useSnackbar } from 'src/components/snackbar';
import { getStates, updateState } from 'src/utils/ApiActions';

interface Props {
  open: boolean;
  onClose: VoidFunction;
}

export default function StateAIConfigDialog({ open, onClose }: Props) {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [states, setStates] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState<any>(null);
  const [sarvamKey, setSarvamKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [geminiBackupKey, setGeminiBackupKey] = useState('');
  const [voiceProvider, setVoiceProvider] = useState('sarvam');
  const [chatProvider, setChatProvider] = useState('gemini');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = user?.role?.toLowerCase() === 'super_admin' || user?.role?.toLowerCase() === 'superadmin';
  const isRegionalManager = user?.role?.toLowerCase() === 'regional_manager' || user?.role?.toLowerCase() === 'state_manager' || user?.role?.toLowerCase() === 'state_admin';
  const userScopedStateId = user?.scopedStateId || user?.stateId;

  useEffect(() => {
    if (open) {
      loadStates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const loadStates = async () => {
    try {
      setLoading(true);
      const res = await getStates();
      if (res.success) {
        const activeStates = res.data || [];
        setStates(activeStates);

        if (isRegionalManager) {
          const matched = activeStates.find((s: any) => 
            (userScopedStateId && s.id === userScopedStateId) ||
            (user?.state && s.name.toLowerCase() === user.state.toLowerCase())
          );
          if (matched) {
            setSelectedState(matched);
            setSarvamKey(matched.sarvamApiKey || '');
            setGeminiKey(matched.geminiApiKey || '');
            setGeminiBackupKey(matched.geminiBackupApiKey || '');
            setVoiceProvider(matched.voiceProvider || 'sarvam');
            setChatProvider(matched.chatProvider || 'gemini');
          }
        }
      }
    } catch (err: any) {
      enqueueSnackbar(err.message || 'Failed to load states', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = (event: any, newValue: any) => {
    setSelectedState(newValue);
    if (newValue) {
      setSarvamKey(newValue.sarvamApiKey || '');
      setGeminiKey(newValue.geminiApiKey || '');
      setGeminiBackupKey(newValue.geminiBackupApiKey || '');
      setVoiceProvider(newValue.voiceProvider || 'sarvam');
      setChatProvider(newValue.chatProvider || 'gemini');
    } else {
      setSarvamKey('');
      setGeminiKey('');
      setGeminiBackupKey('');
      setVoiceProvider('sarvam');
      setChatProvider('gemini');
    }
  };

  const detectProvider = (key: string) => {
    if (!key) return null;
    const trimmed = key.trim();
    if (trimmed.startsWith('sk-ant-')) return 'anthropic';
    if (trimmed.startsWith('gsk_')) return 'groq';
    if (trimmed.startsWith('sk-or-v1-')) return 'openrouter';
    if (trimmed.startsWith('sk-')) return 'openai';
    if (trimmed.startsWith('AIzaSy')) return 'gemini';
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) return 'sarvam';
    return null;
  };

  const handleSave = async () => {
    if (!selectedState) return;

    try {
      setSubmitting(true);
      
      const detectedVoice = detectProvider(sarvamKey);
      const detectedChat = detectProvider(geminiKey);

      const payload: any = {
        voiceProvider: detectedVoice || voiceProvider || 'sarvam',
        chatProvider: detectedChat || chatProvider || 'gemini',
      };
      
      // Sanitisation: If the key starts with '••••••••', it means they did not edit the existing masked key
      if (sarvamKey !== undefined) {
        if (sarvamKey === '') {
          payload.sarvamApiKey = null;
        } else if (!sarvamKey.startsWith('••••••••')) {
          payload.sarvamApiKey = sarvamKey;
        }
      }

      if (geminiKey !== undefined) {
        if (geminiKey === '') {
          payload.geminiApiKey = null;
        } else if (!geminiKey.startsWith('••••••••')) {
          payload.geminiApiKey = geminiKey;
        }
      }

      if (geminiBackupKey !== undefined) {
        if (geminiBackupKey === '') {
          payload.geminiBackupApiKey = null;
        } else if (!geminiBackupKey.startsWith('••••••••')) {
          payload.geminiBackupApiKey = geminiBackupKey;
        }
      }

      const res = await updateState(selectedState.id, payload);
      if (res.success) {
        enqueueSnackbar('State AI Keys updated successfully');
        onClose();
      }
    } catch (err: any) {
      enqueueSnackbar(err.message || 'Failed to update keys', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>State AI Configuration</DialogTitle>
      
      <DialogContent dividers sx={{ py: 3 }}>
        {loading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 5 }}>
            <CircularProgress />
          </Stack>
        ) : (
          <Stack spacing={3}>
            {isSuperAdmin ? (
              <Autocomplete
                options={states}
                getOptionLabel={(option) => option.name || ''}
                value={selectedState}
                onChange={handleStateChange}
                renderInput={(params) => <TextField {...params} label="Select State" />}
              />
            ) : (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Configure keys for state:
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                  {selectedState ? selectedState.name : (user?.state || 'Assigned State')}
                </Typography>
              </Box>
            )}

            {(selectedState || isRegionalManager) && (
              <>
                <TextField
                  fullWidth
                  type="password"
                  label="Voice AI"
                  placeholder={sarvamKey ? '••••••••' : 'Enter Voice AI Key'}
                  value={sarvamKey}
                  onChange={(e) => setSarvamKey(e.target.value)}
                  helperText="Voice commerce STT and TTS API key"
                />

                <TextField
                  fullWidth
                  type="password"
                  label="Text AI (Primary)"
                  placeholder={geminiKey ? '••••••••' : 'Enter Primary Text AI Key'}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  helperText="Primary store chatbot API key"
                />

                <TextField
                  fullWidth
                  type="password"
                  label="Text AI (Backup)"
                  placeholder={geminiBackupKey ? '••••••••' : 'Enter Backup Text AI Key'}
                  value={geminiBackupKey}
                  onChange={(e) => setGeminiBackupKey(e.target.value)}
                  helperText="Used automatically if the primary key fails or expires"
                />
              </>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={!selectedState || submitting}
        >
          Save Keys
        </Button>
      </DialogActions>
    </Dialog>
  );
}
