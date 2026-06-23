import { useEffect, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import { Avatar, Typography } from '@mui/material';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
import { useAuthContext } from 'src/auth/hooks';
// components
import Scrollbar from 'src/components/scrollbar';
import { usePathname } from 'src/routes/hooks';
import { NavSectionVertical } from 'src/components/nav-section';
import tubulu from 'src/assets/tubulu_logo.png';
//
import { NavTopGroup } from 'src/components/nav-section/vertical/nav-section-top';
import { NavBottomGroup } from 'src/components/nav-section/vertical/nav-section-bottom';
import { IProfileDetails } from 'src/pages/dashboard/user-profile';
import { getProfileDetails } from 'src/utils/ApiActions';
import { NAV } from '../config-layout';
import { useNavData } from './config-navigation';
import { NavToggleButton, NavUpgrade } from '../_common';

// ----------------------------------------------------------------------

type Props = {
  openNav: boolean;
  onCloseNav: VoidFunction;
  data?: any[];
};

export default function NavVertical({ openNav, onCloseNav, data }: Props) {
  const { user } = useAuthContext();

  const pathname = usePathname();

  const lgUp = useResponsive('up', 'lg');

  const navData = data || useNavData(user);

  const [details, setDetails] = useState<IProfileDetails>({} as IProfileDetails);

  async function fetchDetails() {
    const response = await getProfileDetails();
    if (response?.data?.success) {
      setDetails(response?.data?.data);
    }
  }

  useEffect(() => {
    fetchDetails();
  }, [])

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': {
          height: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box
        sx={{
          width: 100,
          height: 80
        }}
      >
        <img alt='logo' src={tubulu} />
      </Box>

      <NavTopGroup user={details} role={user?.role} />

      <NavSectionVertical
        data={navData}
        config={{
          currentRole: user?.role || 'admin',
        }}
      />

      {/* <Box sx={{ flexGrow: 1 }} />

      <NavBottomGroup />

      <NavUpgrade /> */}
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_VERTICAL },
      }}
    >
      <NavToggleButton />

      {lgUp ? (
        <Stack
          sx={{
            height: 1,
            position: 'fixed',
            width: NAV.W_VERTICAL,
            borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          }}
        >
          {renderContent}
        </Stack>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.W_VERTICAL,
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
