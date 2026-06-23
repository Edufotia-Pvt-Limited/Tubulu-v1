import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
// utils
import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

interface DashboardStats {
  totalSales: number;
  activeOrders: number;
  totalOrders: number;
  totalProducts: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(color, 0.12),
              color,
            }}
          >
            {icon}
          </Box>
        </Stack>
        <Typography variant="h4" fontWeight="bold">
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="success.main">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------

export default function MerchantDashboardView() {
  const settings = useSettingsContext();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get(endpoints.dashboardStats);
        setStats(res.data?.data || null);
      } catch (err: any) {
        setError('Failed to load dashboard stats');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !stats) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Typography color="error">{error || 'No data available'}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Merchant Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Sales"
            value={`₹${stats.totalSales.toLocaleString('en-IN')}`}
            icon={<Iconify icon="solar:wallet-bold" width={24} />}
            color="#2065D1"
            subtitle="Paid orders only"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Active Orders"
            value={stats.activeOrders}
            icon={<Iconify icon="solar:bag-bold" width={24} />}
            color="#FF6C40"
            subtitle="Awaiting fulfilment"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<Iconify icon="solar:document-bold" width={24} />}
            color="#FFB300"
            subtitle="All time orders"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon={<Iconify icon="solar:box-bold" width={24} />}
            color="#00AB55"
            subtitle="In your catalogue"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Store Status"
            value="Online"
            icon={<Iconify icon="solar:users-group-rounded-bold" width={24} />}
            color="#7635dc"
            subtitle="Accepting orders"
          />
        </Grid>
      </Grid>
    </Container>
  );
}
