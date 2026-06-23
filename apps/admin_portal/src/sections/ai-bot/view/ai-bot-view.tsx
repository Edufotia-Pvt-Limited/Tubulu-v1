import { useState, useEffect, useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import LoadingButton from '@mui/lab/LoadingButton';
import Switch from '@mui/material/Switch';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { useSnackbar } from 'src/components/snackbar';
import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

type FAQItem = {
  question: string;
  answer: string;
};

export default function AIBotView() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [isActive, setIsActive] = useState(false);
  const [masterPrompt, setMasterPrompt] = useState('');
  const [catalogScoped, setCatalogScoped] = useState(true);
  const [faqContext, setFaqContext] = useState<FAQItem[]>([]);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(endpoints.ai.config);
      const { data } = response.data;
      if (data) {
        setIsActive(data.isActive);
        setMasterPrompt(data.masterPrompt || '');
        setCatalogScoped(data.catalogScoped);
        setFaqContext(data.faqContext || []);
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to fetch AI configuration', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.post(endpoints.ai.config, {
        isActive,
        masterPrompt,
        catalogScoped,
        faqContext,
      });
      enqueueSnackbar('AI configuration saved successfully!');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to save configuration', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddFaq = () => {
    setFaqContext([...faqContext, { question: '', answer: '' }]);
  };

  const handleRemoveFaq = (index: number) => {
    const newFaq = [...faqContext];
    newFaq.splice(index, 1);
    setFaqContext(newFaq);
  };

  const handleFaqChange = (index: number, field: keyof FAQItem, value: string) => {
    const newFaq = [...faqContext];
    newFaq[index][field] = value;
    setFaqContext(newFaq);
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
        <Stack spacing={1}>
          <Typography variant="h4">AI Bot Intelligence</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Configure your vendor AI assistant's brain, personality, and knowledge base.
          </Typography>
        </Stack>

        <LoadingButton
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="solar:diskette-bold" />}
          onClick={handleSave}
          loading={saving}
          size="large"
        >
          Save Changes
        </LoadingButton>
      </Stack>

      <Stack spacing={3}>
        <Card>
          <CardHeader 
            title="General Settings" 
            subheader="Core activation and scoping rules for your chatbot"
            action={
              <FormControlLabel
                control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} color="success" />}
                label={isActive ? "Bot Active" : "Bot Offline"}
                labelPlacement="start"
              />
            }
          />
          <Stack spacing={3} sx={{ p: 3 }}>
            <FormControlLabel
              control={<Switch checked={catalogScoped} onChange={(e) => setCatalogScoped(e.target.checked)} />}
              label="Catalogue Scoping (Highly Recommended)"
            />
            <Typography variant="caption" sx={{ color: 'text.disabled', mt: -2 }}>
              When enabled, the AI will strictly answer questions based on your product catalogue. This prevents hallucinations and off-topic conversations.
            </Typography>
          </Stack>
        </Card>

        <Card>
          <CardHeader 
            title="The Brain (Personality)" 
            subheader="Define how your bot should interact with customers"
          />
          <Stack spacing={3} sx={{ p: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="System Instructions"
              placeholder="e.g. You are a professional and friendly assistant for 'Green Grocers'. You specialize in organic produce and always recommend seasonal fruits."
              value={masterPrompt}
              onChange={(e) => setMasterPrompt(e.target.value)}
              helperText="This prompt defines the core identity and rules for the AI."
            />
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
