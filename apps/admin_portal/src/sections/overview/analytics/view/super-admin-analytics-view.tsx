import { useState, useEffect } from 'react';
// @mui
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// auth
import { useAuthContext } from 'src/auth/hooks';
// components
import { useSettingsContext } from 'src/components/settings';
import LoadingScreen from 'src/components/loading-screen/loading-screen';
// sections
import AnalyticsWidgetSummary from '../analytics-widget-summary';
import AnalyticsCurrentVisits from '../analytics-current-visits';
import AnalyticsWebsiteVisits from '../analytics-website-visits';

// ----------------------------------------------------------------------

interface Stats {
  totalRegionalManagers?: number;
  totalCityManagers?: number;
  totalVendors?: number;
  activeStores: number;
  totalProducts: number;
  totalOrders: number;
  totalConversations?: number;
  categoryDistribution: { category: string; count: number }[];
  monthlyGrowth?: { month: string; count: string | number }[];
}

export default function SuperAdminAnalyticsView() {
  const { user } = useAuthContext();
  const settings = useSettingsContext();

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const roleLower = user?.role?.toLowerCase() || '';
  const isSuperAdmin = roleLower === 'super_admin' || roleLower === 'ops_admin';
  const isRegionalManager = roleLower === 'regional_manager' || roleLower === 'state_manager';
  const isCityManager = roleLower === 'city_manager';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { getScopedAdminStats } = await import('src/utils/ApiActions');
        const response = await getScopedAdminStats();
        setStats(response.data.data);
      } catch (error) {
        console.error('Failed to fetch platform stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return <LoadingScreen />;
  }

  // Cards setup
  let firstCardTitle = 'Total Regional Managers';
  let firstCardTotal = stats.totalRegionalManagers || 0;
  if (isRegionalManager) {
    firstCardTitle = 'Total City Managers';
    firstCardTotal = stats.totalCityManagers || 0;
  } else if (isCityManager) {
    firstCardTitle = 'Total Vendors';
    firstCardTotal = stats.totalVendors || 0;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        {isSuperAdmin ? 'Platform Overview' : isRegionalManager ? 'Regional Scope Analytics' : 'City Scope Analytics'}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={isSuperAdmin ? 3 : 4} key="role-widget">
          <AnalyticsWidgetSummary
            title={firstCardTitle}
            total={firstCardTotal}
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
          />
        </Grid>

        <Grid item xs={12} sm={isSuperAdmin ? 3 : 4} key="stores-widget">
          <AnalyticsWidgetSummary
            title="Active Stores"
            total={stats.activeStores}
            color="info"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
          />
        </Grid>

        <Grid item xs={12} sm={isSuperAdmin ? 3 : 4} key="orders-widget">
          <AnalyticsWidgetSummary
            title="Total Orders"
            total={stats.totalOrders}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
          />
        </Grid>

        {isSuperAdmin ? (
          <Grid item xs={12} sm={3} key="conversations-widget">
            <AnalyticsWidgetSummary
              title="Active Conversations"
              total={stats.totalConversations || 0}
              color="success"
              icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
            />
          </Grid>
        ) : null}

        <Grid item xs={12} md={6} lg={4} key="categories-chart">
          <AnalyticsCurrentVisits
            title="Merchant Categories"
            chart={{
              series: (stats.categoryDistribution || [])
                .filter((item) => item.category != null)
                .map((item) => ({
                  label: item.category || 'Uncategorized',
                  value: parseInt(item.count.toString(), 10),
                })),
            }}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={8} key="growth-chart">
          <AnalyticsWebsiteVisits
            title="Onboarding Growth"
            subheader=""
            chart={{
              labels: (stats.monthlyGrowth || []).map(item => 
                new Date(item.month).toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' })
              ),
              series: [
                {
                  name: 'New Stores',
                  type: 'column',
                  fill: 'solid',
                  data: (stats.monthlyGrowth || []).map(item => parseInt(String(item.count), 10)),
                },
                {
                  name: 'Total Merchants',
                  type: 'area',
                  fill: 'gradient',
                  data: (stats.monthlyGrowth || []).reduce((acc: number[], item, index) => {
                    const currentVal = parseInt(String(item.count), 10);
                    const prevVal = index > 0 ? acc[index - 1] : 0;
                    acc.push(prevVal + currentVal);
                    return acc;
                  }, []),
                },
              ],
              options: {
                tooltip: {
                  y: {
                    formatter: (value: number) => `${value.toFixed(0)} Stores`,
                  },
                },
              },
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
