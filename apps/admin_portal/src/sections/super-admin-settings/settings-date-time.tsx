import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFSwitch } from 'src/components/hook-form';
import MenuItem from '@mui/material/MenuItem';

// ----------------------------------------------------------------------

const TIMEZONE_OPTIONS = [
  { label: '(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi', value: 'Asia/Kolkata' },
  { label: '(GMT+00:00) Coordinated Universal Time', value: 'UTC' },
  { label: '(GMT-05:00) Eastern Time (US & Canada)', value: 'America/New_York' },
  { label: '(GMT+08:00) Beijing, Hong Kong, Singapore', value: 'Asia/Singapore' },
];

const DATE_FORMATS = [
  { label: 'DD/MM/YYYY (e.g. 31/12/2023)', value: 'DD/MM/YYYY' },
  { label: 'MM/DD/YYYY (e.g. 12/31/2023)', value: 'MM/DD/YYYY' },
  { label: 'YYYY-MM-DD (e.g. 2023-12-31)', value: 'YYYY-MM-DD' },
];

export default function SettingsDateTime() {
  const { enqueueSnackbar } = useSnackbar();

  const SettingsSchema = Yup.object().shape({
    timezone: Yup.string().required('Timezone is required'),
    dateFormat: Yup.string().required('Date format is required'),
    use24HourTime: Yup.boolean(),
  });

  const defaultValues = {
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    use24HourTime: true,
  };

  const methods = useForm({
    resolver: yupResolver(SettingsSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Simulating API response delay
      await new Promise((resolve) => setTimeout(resolve, 600));
      console.info('DATE TIME SETTINGS UPDATE:', data);
      enqueueSnackbar('Regional settings successfully updated!');
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Card sx={{ p: 4 }}>
            <Stack spacing={3}>
              <RHFSelect name="timezone" label="Standard Timezone" helperText="System-wide fallback for displayed transaction timestamps.">
                {TIMEZONE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFSelect name="dateFormat" label="Date Format Preference">
                {DATE_FORMATS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFSwitch
                name="use24HourTime"
                label="Enable 24-Hour Format"
                labelPlacement="start"
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />

              <Stack alignItems="flex-end">
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  Save Settings
                </LoadingButton>
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
