// @mui
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import { useState, useEffect, useCallback } from 'react';
// theme
import { bgBlur } from 'src/theme/css';
// hooks
import { useOffSetTop } from 'src/hooks/use-off-set-top';
import { useResponsive } from 'src/hooks/use-responsive';
// components
import Logo from 'src/components/logo';
import SvgColor from 'src/components/svg-color';
import { useSettingsContext } from 'src/components/settings';
//
import { HEADER, NAV } from '../config-layout';
import {
  Searchbar,
  AccountPopover,
  SettingsButton,
  LanguagePopover,
  ContactsPopover,
  NotificationsPopover,
} from '../_common';
import { axios, endpoints } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';
import { useSnackbar } from 'src/components/snackbar';
import { getProfileDetails } from 'src/utils/ApiActions';

// ----------------------------------------------------------------------

type Props = {
  onOpenNav?: VoidFunction;
};

export default function Header({ onOpenNav }: Props) {
  const theme = useTheme();

  const settings = useSettingsContext();

  const isNavHorizontal = settings.themeLayout === 'horizontal';

  const isNavMini = settings.themeLayout === 'mini';

  const lgUp = useResponsive('up', 'lg');

  const offset = useOffSetTop(HEADER.H_DESKTOP);

  const offsetTop = offset && !isNavHorizontal;

  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [isStoreActive, setIsStoreActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const roleLower = user?.role?.toLowerCase() || '';
  const isAdminOrManager = 
    roleLower === 'super_admin' || 
    roleLower === 'ops_admin' ||
    roleLower === 'ops_manager' ||
    roleLower === 'regional_manager' || 
    roleLower === 'state_manager' || 
    roleLower === 'city_manager' || 
    user?.integrationName?.trim() === 'Tubulu Master Admin' ||
    ['9999999999', '9844982389', '+919999999999', '+919844982389'].includes(user?.phoneNumber || '');

  const fetchStoreStatus = useCallback(async () => {
    try {
      const response = await getProfileDetails();
      if (response?.data?.success) {
        setIsStoreActive(response.data.data.isActive ?? true);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (!isAdminOrManager) {
      fetchStoreStatus();
    }
  }, [isAdminOrManager, fetchStoreStatus]);

  const handleToggleStatus = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    try {
      setLoading(true);
      await axios.patch('/api/v1/integrations/toggle-status', { isActive: newValue });
      setIsStoreActive(newValue);
      enqueueSnackbar(`Store is now ${newValue ? 'Online' : 'Offline'}`, {
        variant: newValue ? 'success' : 'warning',
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to update store status', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (
    <>
      {lgUp && isNavHorizontal && <Logo sx={{ mr: 2.5 }} />}

      {!lgUp && (
        <IconButton onClick={onOpenNav}>
          <SvgColor src="/assets/icons/navbar/ic_menu_item.svg" />
        </IconButton>
      )}

      <Searchbar />

      <Stack
        flexGrow={1}
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={{ xs: 0.5, sm: 1 }}
      >
        {!isAdminOrManager && (
          <FormControlLabel
            control={
              <Switch
                checked={isStoreActive}
                onChange={handleToggleStatus}
                disabled={loading}
                color="success"
              />
            }
            label={
              <Typography variant="subtitle2" sx={{ color: isStoreActive ? 'success.main' : 'text.disabled' }}>
                {isStoreActive ? 'Store Online' : 'Store Offline'}
              </Typography>
            }
            sx={{ mr: 2 }}
          />
        )}
        {/* <LanguagePopover /> */}

        {/* <NotificationsPopover /> */}

        {/* <ContactsPopover /> */}

        {/* <SettingsButton /> */}

        <AccountPopover />
      </Stack>
    </>
  );

  return (
    <AppBar
      sx={{
        height: HEADER.H_MOBILE,
        zIndex: theme.zIndex.appBar + 1,
        ...bgBlur({
          color: theme.palette.background.default,
        }),
        transition: theme.transitions.create(['height'], {
          duration: theme.transitions.duration.shorter,
        }),
        ...(lgUp && {
          width: `calc(100% - ${NAV.W_VERTICAL + 1}px)`,
          height: HEADER.H_DESKTOP,
          ...(offsetTop && {
            height: HEADER.H_DESKTOP_OFFSET,
          }),
          ...(isNavHorizontal && {
            width: 1,
            bgcolor: 'background.default',
            height: HEADER.H_DESKTOP_OFFSET,
            borderBottom: `dashed 1px ${theme.palette.divider}`,
          }),
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_MINI + 1}px)`,
          }),
        }),
      }}
    >
      <Toolbar
        sx={{
          height: 1,
          px: { lg: 5 },
        }}
      >
        {renderContent}
      </Toolbar>
    </AppBar>
  );
}
