import { useState, useCallback } from 'react';
// auth
import { useAuthContext } from 'src/auth/hooks';
// @mui
import Container from '@mui/material/Container';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
// sections
import SettingsGeneral from '../settings-general';
import SettingsTheme from '../settings-theme';
import SettingsDateTime from '../settings-date-time';
import SettingsAI from '../settings-ai';
import SettingsCityBackground from '../settings-city-background';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'general',
    label: 'General',
    icon: <Iconify icon="solar:user-id-bold" width={24} />,
  },
  {
    value: 'themes',
    label: 'Themes',
    icon: <Iconify icon="solar:pallete-2-bold" width={24} />,
  },
  {
    value: 'datetime',
    label: 'Date and Time Control',
    icon: <Iconify icon="solar:clock-circle-bold" width={24} />,
  },
  {
    value: 'ai',
    label: 'AI Configuration',
    icon: <Iconify icon="solar:cpu-bolt-bold" width={24} />,
  },
  {
    value: 'city_background',
    label: 'City Background',
    icon: <Iconify icon="solar:camera-bold" width={24} />,
  },
];

// ----------------------------------------------------------------------

export default function SuperAdminSettingsView() {
  const { user } = useAuthContext();
  const settings = useSettingsContext();
  const roleLower = user?.role?.toLowerCase() || '';

  const filteredTabs = TABS.filter((tab) => {
    if (roleLower === 'super_admin' || roleLower === 'ops_admin') {
      return tab.value === 'general' || tab.value === 'themes' || tab.value === 'datetime';
    }
    if (roleLower === 'regional_manager' || roleLower === 'state_manager') {
      return tab.value === 'themes';
    }
    if (roleLower === 'city_manager') {
      return tab.value === 'themes' || tab.value === 'city_background';
    }
    return false;
  });

  const [currentTab, setCurrentTab] = useState(filteredTabs[0]?.value || 'themes');

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  let title = 'System Settings';
  if (roleLower === 'super_admin') title = 'Super Admin Settings';
  else if (roleLower === 'regional_manager' || roleLower === 'state_manager') title = 'Regional Manager Settings';
  else if (roleLower === 'city_manager') title = 'City Manager Settings';

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <Stack spacing={1} sx={{ mb: 5 }}>
        <Typography variant="h4">{title}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Manage baseline platform configurations and user account profile preferences.
        </Typography>
      </Stack>

      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        {filteredTabs.map((tab) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
        ))}
      </Tabs>

      {currentTab === 'general' && <SettingsGeneral />}

      {currentTab === 'themes' && <SettingsTheme />}

      {currentTab === 'datetime' && <SettingsDateTime />}

      {currentTab === 'ai' && <SettingsAI />}

      {currentTab === 'city_background' && <SettingsCityBackground />}
    </Container>
  );
}
