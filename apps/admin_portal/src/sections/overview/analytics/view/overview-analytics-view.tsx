import React, { useState, useEffect } from 'react';
// @mui
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
// hooks
import { useAuthContext } from 'src/auth/hooks';
// components
import { useSettingsContext } from 'src/components/settings';
//
import { getDashboardData } from 'src/utils/ApiActions';
import AnalyticsWidgetSummary from '../analytics-widget-summary';
import AnalyticsWebsiteVisits from '../analytics-website-visits';

// ----------------------------------------------------------------------

const durationLabels: Record<string, string> = {
  all: 'All Time',
  today: 'Today',
  week: 'Last 7 Days',
  month: 'Last 30 Days',
  year: 'Last Year',
};

export default function OverviewAnalyticsView() {
  const settings = useSettingsContext();
  const { user } = useAuthContext();
  const [stats, setStats] = useState<any>(null);
  const [duration, setDuration] = useState<string>('all');

  useEffect(() => {
    async function fetchStats() {
      const res: any = await getDashboardData(duration);
      if (res?.data?.success) {
        setStats(res.data.data);
      }
    }
    fetchStats();
  }, [duration]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: { xs: 3, md: 5 },
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h4">
          Analytics Overview
        </Typography>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="duration-select-label">Duration</InputLabel>
          <Select
            labelId="duration-select-label"
            id="duration-select"
            value={duration}
            label="Duration"
            onChange={(e) => setDuration(e.target.value as string)}
          >
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="week">Last 7 Days</MenuItem>
            <MenuItem value="month">Last 30 Days</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={4}>
          <AnalyticsWidgetSummary
            title="Total Products"
            total={stats?.totalProducts ?? 0}
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <AnalyticsWidgetSummary
            title="Active Orders"
            total={stats?.activeOrders ?? 0}
            color="info"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <AnalyticsWidgetSummary
            title="Total Revenue"
            total={stats?.totalSales ?? 0}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
          />
        </Grid>

        <Grid xs={12}>
          <AnalyticsWebsiteVisits
            title={`Order Trends (${durationLabels[duration]})`}
            subheader="Based on daily order volume"
            chart={{
              labels: stats?.graphData?.map((g: any) => {
                const date = new Date(g.date);
                return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
              }) || [],
              series: [
                {
                  name: 'Orders',
                  type: 'column',
                  fill: 'solid',
                  data: stats?.graphData?.map((g: any) => g.value) || [],
                }
              ],
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
