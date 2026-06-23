// @mui
import Box from '@mui/material/Box';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
// components
import { useSettingsContext } from 'src/components/settings';
//
import Main from './main';
import Header from './header';
import NavMini from './nav-mini';
import NavVertical from './nav-vertical';
import NavHorizontal from './nav-horizontal';
import { useAuthContext } from 'src/auth/hooks';
import { AuthGuard } from 'src/auth/guard';
import { ApprovalGuard } from 'src/auth/guard/approval-guard';
import { useNavData } from './config-navigation';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  const { user } = useAuthContext();

  const settings = useSettingsContext();

  const lgUp = useResponsive('up', 'lg');

  const nav = useBoolean();

  const isHorizontal = settings.themeLayout === 'horizontal';

  const isMini = settings.themeLayout === 'mini';

  const navConfig = useNavData(user);

  const renderNavMini = <NavMini data={navConfig} />;

  const renderHorizontal = <NavHorizontal data={navConfig} />;

  const renderNavVertical = <NavVertical openNav={nav.value} onCloseNav={nav.onFalse} data={navConfig} />;

  if (isHorizontal) {
    return (
      <AuthGuard>
        <ApprovalGuard>
          <Header onOpenNav={nav.onTrue} />

          {lgUp ? renderHorizontal : renderNavVertical}

          <Main>{children}</Main>
        </ApprovalGuard>
      </AuthGuard>
    );
  }

  if (isMini) {
    return (
      <AuthGuard>
        <ApprovalGuard>
          <Header onOpenNav={nav.onTrue} />

          <Box
            sx={{
              minHeight: 1,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
            }}
          >
            {lgUp ? renderNavMini : renderNavVertical}

            <Main>{children}</Main>
          </Box>
        </ApprovalGuard>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <ApprovalGuard>
        <Header onOpenNav={nav.onTrue} />

        <Box
          sx={{
            minHeight: 1,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          {renderNavVertical}

          <Main>{children}</Main>
        </Box>
      </ApprovalGuard>
    </AuthGuard>
  );
}
