import { m } from 'framer-motion';
// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// auth
import { useAuthContext } from 'src/auth/hooks';
// components
import { varHover } from 'src/components/animate';
import { useSnackbar } from 'src/components/snackbar';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { getProfileDetails } from 'src/utils/ApiActions';
import { useEffect, useState } from 'react';
import { IProfileDetails } from 'src/pages/dashboard/user-profile';
import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

const OPTIONS = [
  // {
  //   label: 'Home',
  //   linkTo: '/',
  // },
  {
    label: 'Profile',
    linkTo: paths.dashboard.user.profile,
  },
  // {
  //   label: 'Settings',
  //   linkTo: paths.dashboard.user.account,
  // },
];

const formatPhoneNumber = (phone?: string) => {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (clean.length >= 10) {
    const last10 = clean.slice(-10);
    return `+91 ${last10.slice(0, 5)} ${last10.slice(5)}`;
  }
  return phone;
};

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const router = useRouter();

  const { user, logout } = useAuthContext();

  const settings = useSettingsContext();

  const [details, setDetails] = useState<IProfileDetails>({} as IProfileDetails);

  async function fetchDetails() {
    try {
      const response = await getProfileDetails();
      if (response?.data?.success) {
        setDetails(response?.data?.data);
      }
    } catch (error) {
      console.error('Failed to fetch profile details', error);
    }
  }

  useEffect(() => {
    fetchDetails();
  }, []);

  const { enqueueSnackbar } = useSnackbar();

  const popover = usePopover();

  const handleLogout = async () => {
    try {
      await logout();
      popover.onClose();
      router.replace('/');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout!', { variant: 'error' });
    }
  };

  const handleClickItem = (path: string) => {
    popover.onClose();
    router.push(path);
  };

  // Get initials from integration name or phone
  const roleLower = user?.role?.toLowerCase() || '';
  const isSuperAdmin = 
    roleLower === 'super_admin' || 
    roleLower === 'ops_admin' ||
    user?.integrationName?.trim() === 'Tubulu Master Admin' ||
    ['9999999999', '9844982389', '+919999999999', '+919844982389'].includes(user?.phoneNumber || '');

  const isRegionalManager = roleLower === 'regional_manager' || roleLower === 'state_manager';
  const isCityManager = roleLower === 'city_manager';
  const isManager = isRegionalManager || isCityManager;

  const isMerchantAdmin =
    roleLower === 'merchant_admin' ||
    roleLower === 'merchantadmin' ||
    roleLower === 'vendor' ||
    roleLower === 'merchant_owner' ||
    roleLower === 'merchant_manager' ||
    roleLower === 'merchant_cashier';

  let displayName = 'User';
  if (isSuperAdmin) {
    displayName = 'Super Admin';
  } else if (isManager) {
    displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (isRegionalManager ? 'Regional Manager' : 'City Manager');
  } else {
    displayName = details?.integrationName || user?.displayName || user?.phoneNumber || 'User';
  }
  
  const initials = isSuperAdmin 
    ? 'SA' 
    : isRegionalManager 
        ? 'RM' 
        : isCityManager 
            ? 'CM' 
            : displayName.charAt(0).toUpperCase();

  const filteredOptions = isMerchantAdmin ? OPTIONS : [];

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={popover.onOpen}
        sx={{
          width: 44,
          height: 44,
          p: '3px',
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          boxShadow: (theme) => `0 0 0 2px ${theme.palette.background.default}, 0 4px 12px 0 ${alpha(theme.palette.common.black, 0.1)}`,
          ...(popover.open && {
            transform: 'scale(1.1)',
          }),
          transition: (theme) => theme.transitions.create('transform'),
        }}
      >
        <Avatar
          src={isSuperAdmin ? undefined : (details?.logo || user?.logo)}
          alt={displayName}
          sx={{
            width: '100%',
            height: '100%',
            fontSize: isSuperAdmin ? 14 : 16,
            fontWeight: 'fontWeightBold',
            color: 'primary.contrastText',
            backgroundColor: 'primary.main',
            border: (theme) => `solid 2px ${theme.palette.background.default}`,
          }}
        >
          {initials}
        </Avatar>
      </IconButton>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 220, p: 0 }}>
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap sx={{ color: 'text.primary', fontWeight: 'fontWeightBold' }}>
            {isSuperAdmin ? 'Platform Administrator' : displayName}
          </Typography>
          <Typography variant="body2" noWrap sx={{ color: 'text.secondary', mt: 0.5 }}>
            {isSuperAdmin ? formatPhoneNumber(user?.phoneNumber) : (user?.role?.replace('_', ' ').toUpperCase() || 'Member')}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {filteredOptions.map((option) => (
            <MenuItem key={option.label} onClick={() => handleClickItem(option.linkTo)} sx={{ borderRadius: 1 }}>
              {option.label}
            </MenuItem>
          ))}

          {isSuperAdmin && (
            <MenuItem
              onClick={() => {
                popover.onClose();
                settings.onToggle();
              }}
              sx={{ borderRadius: 1 }}
            >
              Settings
            </MenuItem>
          )}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={handleLogout}
          sx={{ m: 1, fontWeight: 'fontWeightBold', color: 'error.main', borderRadius: 1 }}
        >
          Logout
        </MenuItem>
      </CustomPopover>
    </>
  );
}
