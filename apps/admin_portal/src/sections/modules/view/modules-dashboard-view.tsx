import { useState, useEffect, useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, useTheme } from '@mui/material/styles';

// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';

// axios
import axios, { endpoints } from 'src/utils/axios';

// components
import ModuleCard, { ModuleCardData } from '../module-card';

// dialogs
import ChatbotDialog from '../dialogs/chatbot-dialog';
import VoiceDialog from '../dialogs/voice-dialog';
import SmsDialog from '../dialogs/sms-dialog';
import ScopingDialog from '../dialogs/scoping-dialog';
import SupportDialog from '../dialogs/support-dialog';
import MerchantDialog from '../dialogs/merchant-dialog';

// ----------------------------------------------------------------------

type ActiveDialog = 'chatbot' | 'voice' | 'sms' | 'scoping' | 'support' | 'merchant' | null;

export default function ModulesDashboardView() {
  const theme = useTheme();
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);

  // Health data states
  const [healthData, setHealthData] = useState<Record<string, { status: 'healthy' | 'warning' | 'unhealthy'; message: string }>>({
    chatbot: { status: 'unhealthy', message: 'Not checked yet' },
    voice_gateway: { status: 'unhealthy', message: 'Not checked yet' },
    sms_campaigns: { status: 'unhealthy', message: 'Not checked yet' },
    scoping: { status: 'unhealthy', message: 'Not checked yet' },
    support_tickets: { status: 'unhealthy', message: 'Not checked yet' },
    merchant_profile: { status: 'unhealthy', message: 'Not checked yet' },
  });

  const fetchHealthDiagnostics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(endpoints.admin.modulesHealth);
      if (response.data?.success && response.data?.data) {
        setHealthData(response.data.data);
        setLastRefreshed(new Date());
      } else {
        enqueueSnackbar('Invalid health data received', { variant: 'error' });
      }
    } catch (error) {
      console.error('Failed to query modules health:', error);
      enqueueSnackbar('Failed to run diagnostics check', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchHealthDiagnostics();
  }, [fetchHealthDiagnostics]);

  const modulesList: ModuleCardData[] = [
    {
      id: 'chatbot',
      title: 'Chatbot AI & LLMs',
      description: 'Orchestrates generative NLP/LLM chatbot agents, matching playbook rules, and providing intelligent customer replies.',
      icon: 'solar:cpu-bolt-bold-duotone',
      iconColor: theme.palette.info.main,
      status: healthData.chatbot?.status || 'unhealthy',
      message: healthData.chatbot?.message || '',
    },
    {
      id: 'voice_gateway',
      title: 'Voice-AI Gateway',
      description: 'CTI telephone integrations via Asterisk WebSocket connections, allowing autonomous call routing and speech processing.',
      icon: 'solar:phone-calling-bold-duotone',
      iconColor: theme.palette.secondary.main,
      status: healthData.voice_gateway?.status || 'unhealthy',
      message: healthData.voice_gateway?.message || '',
    },
    {
      id: 'sms_campaigns',
      title: 'SMS & Campaigns',
      description: 'Direct-to-customer dispatch of transactional order notifications, OTPs, and promotional campaigns via Pinnacle SMS Gateway.',
      icon: 'solar:letter-bold-duotone',
      iconColor: theme.palette.warning.main,
      status: healthData.sms_campaigns?.status || 'unhealthy',
      message: healthData.sms_campaigns?.message || '',
    },
    {
      id: 'scoping',
      title: 'Scoping & Regions',
      description: 'Validates merchant coordinates, servicing areas, and commission settlements scoped under localized geographical regions.',
      icon: 'solar:map-draw-bold-duotone',
      iconColor: theme.palette.success.main,
      status: healthData.scoping?.status || 'unhealthy',
      message: healthData.scoping?.message || '',
    },
    {
      id: 'support_tickets',
      title: 'Support Tickets Desk',
      description: 'Customer operations ticketing workspace, supporting incident reporting, agent assignments, and status updates.',
      icon: 'solar:ticket-bold-duotone',
      iconColor: theme.palette.error.main,
      status: healthData.support_tickets?.status || 'unhealthy',
      message: healthData.support_tickets?.message || '',
    },
    {
      id: 'merchant_profile',
      title: 'Merchant Catalogs',
      description: 'Monitors storefront integrations, catalog data integrity, custom styling settings, and GCP cloud asset storage.',
      icon: 'solar:shop-bold-duotone',
      iconColor: theme.palette.primary.main,
      status: healthData.merchant_profile?.status || 'unhealthy',
      message: healthData.merchant_profile?.message || '',
    },
  ];

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 5, gap: 2 }}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Application Modules & Health Status
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Real-time diagnostic health check and module control workspace for platform domains.
          </Typography>
        </Box>

        <Stack direction="row" alignItems="center" spacing={1.5}>
          {lastRefreshed && (
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Last checked: {lastRefreshed.toLocaleTimeString()}
            </Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            startIcon={
              loading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <Iconify icon="solar:restart-bold" />
              )
            }
            onClick={fetchHealthDiagnostics}
            disabled={loading}
          >
            Refresh Diagnostics
          </Button>
        </Stack>
      </Stack>

      {loading && !lastRefreshed ? (
        <Stack alignItems="center" justifyContent="center" sx={{ height: 350 }}>
          <CircularProgress size={48} />
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Running diagnostics and checking endpoints...
          </Typography>
        </Stack>
      ) : (
        <Grid container spacing={3}>
          {modulesList.map((module) => (
            <Grid key={module.id} xs={12} sm={6} md={4}>
              <ModuleCard
                module={module}
                onConfigure={() => setActiveDialog(module.id as ActiveDialog)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Configuration Dialog Modals */}
      <ChatbotDialog
        open={activeDialog === 'chatbot'}
        onClose={() => setActiveDialog(null)}
        onRefreshHealth={fetchHealthDiagnostics}
      />

      <VoiceDialog
        open={activeDialog === 'voice'}
        onClose={() => setActiveDialog(null)}
        onRefreshHealth={fetchHealthDiagnostics}
      />

      <SmsDialog
        open={activeDialog === 'sms'}
        onClose={() => setActiveDialog(null)}
        onRefreshHealth={fetchHealthDiagnostics}
      />

      <ScopingDialog
        open={activeDialog === 'scoping'}
        onClose={() => setActiveDialog(null)}
        onRefreshHealth={fetchHealthDiagnostics}
      />

      <SupportDialog
        open={activeDialog === 'support'}
        onClose={() => setActiveDialog(null)}
        onRefreshHealth={fetchHealthDiagnostics}
      />

      <MerchantDialog
        open={activeDialog === 'merchant'}
        onClose={() => setActiveDialog(null)}
        onRefreshHealth={fetchHealthDiagnostics}
      />
    </Container>
  );
}
