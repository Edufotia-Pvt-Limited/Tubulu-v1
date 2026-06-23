import { m } from 'framer-motion';
// @mui
import { Theme, SxProps } from '@mui/material/styles';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Badge, { badgeClasses } from '@mui/material/Badge';
// components
import Iconify from 'src/components/iconify';
import { varHover } from 'src/components/animate';
import { useSettingsContext } from 'src/components/settings';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

type Props = {
  sx?: SxProps<Theme>;
};

export default function SettingsButton({ sx }: Props) {
  const { user } = useAuthContext();
  const settings = useSettingsContext();

  const isSuperAdmin = 
    user?.role === 'super_admin' || 
    user?.role === 'SuperAdmin' ||
    user?.integrationName?.trim() === 'Tubulu Master Admin' ||
    ['9999999999', '9844982389', '+919999999999', '+919844982389'].includes(user?.phoneNumber || '');

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <Badge
      color="error"
      variant="dot"
      invisible={!settings.canReset}
      sx={{
        [`& .${badgeClasses.badge}`]: {
          top: 8,
          right: 8,
        },
        ...sx,
      }}
    >
      <Box
        component={m.div}
        animate={{
          rotate: [0, settings.open ? 0 : 360],
        }}
        transition={{
          duration: 12,
          ease: 'linear',
          repeat: Infinity,
        }}
      >
        <IconButton
          component={m.button}
          whileTap="tap"
          whileHover="hover"
          variants={varHover(1.05)}
          aria-label="settings"
          onClick={settings.onToggle}
          sx={{
            width: 40,
            height: 40,
          }}
        >
          <Iconify icon="solar:settings-bold-duotone" width={24} />
        </IconButton>
      </Box>
    </Badge>
  );
}
