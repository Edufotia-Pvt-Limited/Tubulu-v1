import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

type ModuleStatus = 'healthy' | 'warning' | 'unhealthy';

export type ModuleCardData = {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  status: ModuleStatus;
  message: string;
};

type Props = {
  module: ModuleCardData;
  onConfigure: () => void;
};

export default function ModuleCard({ module, onConfigure }: Props) {
  const theme = useTheme();
  const { title, description, icon, iconColor, status, message } = module;

  const getStatusColor = (): 'success' | 'warning' | 'error' => {
    if (status === 'healthy') return 'success';
    if (status === 'warning') return 'warning';
    return 'error';
  };

  const getStatusLabel = () => {
    if (status === 'healthy') return 'Healthy';
    if (status === 'warning') return 'Config Warning';
    return 'Offline';
  };

  return (
    <Card
      sx={{
        p: 3.5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 2,
        boxShadow: (t) => t.customShadows.card,
        border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
        transition: theme.transitions.create(['transform', 'box-shadow', 'border-color'], {
          duration: theme.transitions.duration.shorter,
        }),
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: alpha(iconColor, 0.4),
          boxShadow: (t) => `-4px 12px 24px 0px ${alpha(iconColor, 0.12)}`,
        },
      }}
    >
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '12px',
              color: iconColor,
              backgroundColor: alpha(iconColor, 0.08),
            }}
          >
            <Iconify icon={icon} width={28} />
          </Box>

          <Label color={getStatusColor()} variant="soft">
            {getStatusLabel()}
          </Label>
        </Stack>

        <Typography variant="h5" sx={{ mb: 1 }}>
          {title}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, minHeight: 40 }}>
          {description}
        </Typography>
      </Box>

      <Box>
        <Tooltip title={message || 'No additional diagnostic details.'} arrow placement="top">
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              p: 1.5,
              mb: 3,
              borderRadius: 1,
              backgroundColor: (t) => alpha(
                status === 'healthy'
                  ? t.palette.success.main
                  : status === 'warning'
                  ? t.palette.warning.main
                  : t.palette.error.main,
                0.04
              ),
              border: (t) => `1px dashed ${alpha(
                status === 'healthy'
                  ? t.palette.success.main
                  : status === 'warning'
                  ? t.palette.warning.main
                  : t.palette.error.main,
                0.15
              )}`,
              cursor: 'pointer',
            }}
          >
            <Iconify
              icon={
                status === 'healthy'
                  ? 'solar:check-circle-bold'
                  : status === 'warning'
                  ? 'solar:danger-bold'
                  : 'solar:close-circle-bold'
              }
              sx={{
                color: (t) =>
                  status === 'healthy'
                    ? 'success.main'
                    : status === 'warning'
                    ? 'warning.main'
                    : 'error.main',
              }}
              width={20}
            />
            <Typography
              variant="caption"
              noWrap
              sx={{
                color: (t) =>
                  status === 'healthy'
                    ? 'success.darker'
                    : status === 'warning'
                    ? 'warning.darker'
                    : 'error.darker',
                fontWeight: 600,
                flexGrow: 1,
              }}
            >
              {message || 'Checking diagnostics...'}
            </Typography>
            <Iconify icon="solar:info-circle-outline" width={16} sx={{ opacity: 0.6 }} />
          </Stack>
        </Tooltip>

        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          onClick={onConfigure}
          startIcon={<Iconify icon="solar:settings-bold" />}
          sx={{
            fontWeight: 600,
            '&:hover': {
              borderColor: iconColor,
              backgroundColor: alpha(iconColor, 0.04),
              color: iconColor,
            },
          }}
        >
          Configure Module
        </Button>
      </Box>
    </Card>
  );
}
