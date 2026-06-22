import { useState, useEffect, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Unstable_Grid2';
// components
import { useSnackbar } from 'src/components/snackbar';
import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export default function SettingsGeneral() {
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [platformName, setPlatformName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [commissionRate, setCommissionRate] = useState('');

  const fetchSettings = useCallback(async () => {
    try {
      const response = await axios.get(endpoints.admin.settings);
      const settings = response.data.data;

      const nameSetting = settings.find((s: any) => s.key === 'PLATFORM_NAME');
      if (nameSetting) setPlatformName(nameSetting.value);

      const emailSetting = settings.find((s: any) => s.key === 'SUPPORT_EMAIL');
      if (emailSetting) setSupportEmail(emailSetting.value);

      const phoneSetting = settings.find((s: any) => s.key === 'SUPPORT_PHONE');
      if (phoneSetting) setSupportPhone(phoneSetting.value);

      const commissionSetting = settings.find((s: any) => s.key === 'COMMISSION_RATE');
      if (commissionSetting) setCommissionRate(commissionSetting.value);
    } catch (error) {
      console.error('Failed to fetch general system settings:', error);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await Promise.all([
        axios.post(endpoints.admin.updateSettings, {
          key: 'PLATFORM_NAME',
          value: platformName,
          description: 'Global Platform Display Name',
        }),
        axios.post(endpoints.admin.updateSettings, {
          key: 'SUPPORT_EMAIL',
          value: supportEmail,
          description: 'Global Platform Support Contact Email Address',
        }),
        axios.post(endpoints.admin.updateSettings, {
          key: 'SUPPORT_PHONE',
          value: supportPhone,
          description: 'Global Platform Support Contact Phone Number',
        }),
        axios.post(endpoints.admin.updateSettings, {
          key: 'COMMISSION_RATE',
          value: commissionRate,
          description: 'Global Default System Commission Rate (in %)',
        }),
      ]);
      enqueueSnackbar('General platform configurations updated successfully');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to update system settings', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid xs={12} md={8}>
        <Card sx={{ p: 3 }}>
          <CardHeader
            title="Global Platform Settings"
            subheader="Configure general settings, contact channels, and global transaction baseline rates for the platform."
            sx={{ mb: 3, p: 0 }}
          />

          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Platform Display Name"
              placeholder="e.g. Tubulu"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
            />

            <TextField
              fullWidth
              label="Platform Support Email"
              placeholder="e.g. support@tubulu.com"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
            />

            <TextField
              fullWidth
              label="Platform Support Phone"
              placeholder="e.g. +91 99999 99999"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
            />

            <TextField
              fullWidth
              label="Global Default Commission Rate (%)"
              placeholder="e.g. 5.00"
              type="number"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
            />

            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" disabled={loading} onClick={handleSave}>
                {loading ? 'Saving Settings...' : 'Save Settings'}
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
}
