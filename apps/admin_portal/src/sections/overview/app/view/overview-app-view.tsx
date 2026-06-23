/* eslint-disable import/no-cycle */
import React, { useState, useEffect } from 'react';
// @mui

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { Select, MenuItem, FormControl, InputLabel, Typography, Stack } from '@mui/material';
// hooks
import { useAuthContext } from 'src/auth/hooks';
// components
import { useSettingsContext } from 'src/components/settings';
// assets
import { SeoIllustration } from 'src/assets/illustrations';
// images
import Users from "src/assets/Active-users.png";
import Campaign from "src/assets/Total-campaign.png";
import Conversations from "src/assets/Total-conversations.png";
//
import { getDashboardData, getProfileDetails, getSuperAdminStats } from 'src/utils/ApiActions';
import axios from 'src/utils/axios';
import { format, subDays } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Iconify from 'src/components/iconify';
import AppWelcome from '../app-welcome';
import AppAreaInstalled from '../app-area-installed';
import AppWidgetSummary from '../app-widget-summary';
import AppCurrentDownload from '../app-current-download';
import { IProfileDetails } from 'src/pages/dashboard/user-profile';
// ----------------------------------------------------------------------

interface IDashboardDetails {
  totalProducts: number;
  activeOrders: number;
  totalSales: number;
  graphData: IGraphData[];
}

interface ISuperAdminStats {
  totalMerchants?: number;
  totalRegionalManagers?: number;
  totalCityManagers?: number;
  totalVendors?: number;
  activeStores: number;
  totalProducts: number;
  totalOrders: number;
  totalConversations?: number;
  categoryDistribution: { category: string; count: string }[];
  monthlyGrowth: { month: string; count: number }[];
}

export interface IGraphData {
  date: string;
  value: number;
}

export default function OverviewAppView() {
  const { user } = useAuthContext();
  const roleLower = user?.role?.toLowerCase() || '';
  const isSuperAdmin = 
    roleLower === 'super_admin' || 
    roleLower === 'ops_admin' ||
    user?.phoneNumber === '9999999999' ||
    user?.phoneNumber === '9844982389';
  const isRegionalManager = roleLower === 'regional_manager' || roleLower === 'state_manager';
  const isCityManager = roleLower === 'city_manager';
  const isOpsManager = roleLower === 'ops_manager';
  const isEnabler = roleLower === 'enabler';
  const isAdminOrManager = isSuperAdmin || isRegionalManager || isCityManager;

  const settings = useSettingsContext();

  const [details, setDetails] = useState<IDashboardDetails>({} as IDashboardDetails);
  const [adminStats, setAdminStats] = useState<ISuperAdminStats | null>(null);
  const [profileDetails, setProfileDetails] = useState<IProfileDetails>();
  const [duration, setDuration] = useState<string>('all');
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const uniqueCategories = React.useMemo(() => {
    const categories = supportTickets.map(ticket => ticket.category || 'General');
    return Array.from(new Set(categories));
  }, [supportTickets]);

  const filteredTickets = React.useMemo(() => {
    let result = supportTickets;

    if (startDate || endDate) {
      const start = startDate ? new Date(startDate).setHours(0,0,0,0) : null;
      const end = endDate ? new Date(endDate).setHours(23,59,59,999) : null;
      
      result = result.filter(ticket => {
        if (!ticket.createdAt) return false;
        const ticketTime = new Date(ticket.createdAt).getTime();
        if (start && ticketTime < start) return false;
        if (end && ticketTime > end) return false;
        return true;
      });
    }

    if (filterStatus !== 'all') {
      result = result.filter(ticket => ticket.status === filterStatus);
    }

    if (filterPriority !== 'all') {
      result = result.filter(ticket => ticket.priority === filterPriority);
    }

    if (filterCategory !== 'all') {
      result = result.filter(ticket => (ticket.category || 'General') === filterCategory);
    }

    return result;
  }, [supportTickets, startDate, endDate, filterStatus, filterPriority, filterCategory]);

  async function getAllDashboardData() {
    if (isAdminOrManager) {
      const { getScopedAdminStats } = await import('src/utils/ApiActions');
      const response: any = await getScopedAdminStats();
      if (response?.data?.success) {
        setAdminStats(response?.data?.data);
      }
    } else if (!isOpsManager) {
      const response: any = await getDashboardData(duration);
      if (response?.data?.success) {
        setDetails(response?.data?.data);
      }
    }
  }

  async function fetchProfileDetails() {
    const response: any = await getProfileDetails();
    if (response?.data?.success) {
      setProfileDetails(response?.data?.data);
    }
  }

  useEffect(() => {
    getAllDashboardData();
  }, [isAdminOrManager, duration, isOpsManager]);

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  useEffect(() => {
    async function fetchSupportTickets() {
      if (isOpsManager) {
        try {
          const response = await axios.get('/api/v1/support/admin/tickets');
          if (response?.data?.success) {
            setSupportTickets(response.data.data || []);
          }
        } catch (error) {
          console.error('Failed to fetch support tickets for dashboard:', error);
        }
      }
    }
    fetchSupportTickets();
  }, [isOpsManager]);

  const ticketTrends = React.useMemo(() => {
    const dailyCounts: { [key: string]: number } = {};
    
    const start = startDate || subDays(new Date(), 6);
    const end = endDate || new Date();
    
    const normalizedStart = new Date(start);
    normalizedStart.setHours(0, 0, 0, 0);
    const normalizedEnd = new Date(end);
    normalizedEnd.setHours(23, 59, 59, 999);
    
    const diffTime = Math.abs(normalizedEnd.getTime() - normalizedStart.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < diffDays; i++) {
      const dateStr = format(subDays(normalizedEnd, i), 'yyyy-MM-dd');
      dailyCounts[dateStr] = 0;
    }

    filteredTickets.forEach(ticket => {
      if (ticket.createdAt) {
        const ticketDate = format(new Date(ticket.createdAt), 'yyyy-MM-dd');
        if (dailyCounts[ticketDate] !== undefined) {
          dailyCounts[ticketDate] += 1;
        }
      }
    });

    return Object.keys(dailyCounts)
      .sort()
      .map(date => ({
        date: date,
        value: dailyCounts[date]
      }));
  }, [filteredTickets, startDate, endDate]);

  if (!user) {
    return null;
  }

  // Determine welcome string
  let roleTitle = profileDetails?.integrationName ?? 'User';
  if (isSuperAdmin) roleTitle = 'Platform Administrator';
  else if (isRegionalManager) roleTitle = 'Regional Manager';
  else if (isCityManager) roleTitle = 'City Manager';
  else if (isOpsManager) roleTitle = 'Ops Manager';
  else if (isEnabler) roleTitle = `${profileDetails?.integrationName || 'Enabler'} (Field Executive)`;

  // Card 1 Config
  let card1Title = 'Total Merchants';
  let card1Value = adminStats?.totalMerchants ?? 0;
  if (isSuperAdmin) {
    card1Title = 'Total Regional Managers';
    card1Value = adminStats?.totalRegionalManagers ?? 0;
  } else if (isRegionalManager) {
    card1Title = 'Total City Managers';
    card1Value = adminStats?.totalCityManagers ?? 0;
  } else if (isCityManager) {
    card1Title = 'Total Vendors';
    card1Value = adminStats?.totalVendors ?? 0;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <AppWelcome
            title={`Welcome back 👋 \n ${roleTitle}`}
            description={
              isOpsManager 
                ? "Manage and resolve customer complaints and operations support tickets." 
                : isEnabler 
                  ? "Onboard new merchants, submit KYC documents, capture GPS coordinates, and track your onboarding approvals."
                  : isAdminOrManager 
                    ? "Here's what's happening across your platform today." 
                    : "Manage your store conversations and campaigns."
            }
            img={<SeoIllustration />}
            action={
              isOpsManager ? (
                <Button variant="contained" color="primary" href="/dashboard/support/tickets">
                  View Support Tickets
                </Button>
              ) : isEnabler ? (
                <Stack direction="row" spacing={1.5}>
                  <Button variant="contained" color="primary" href="/dashboard/enabler/onboard">
                    Onboard a Merchant
                  </Button>
                  <Button variant="outlined" color="primary" href="/dashboard/enabler/submissions">
                    View My Submissions
                  </Button>
                </Stack>
              ) : isSuperAdmin ? undefined : (
                <Button variant="contained" color="primary" href={isAdminOrManager ? '/dashboard/merchants' : '/dashboard/chat'}>
                  {isAdminOrManager ? 'View All Merchants' : 'Go Now'}
                </Button>
              )
            }
          />
        </Grid>

        {!isAdminOrManager && !isOpsManager && !isEnabler && (
          <Grid item xs={12} display="flex" justifyContent="flex-end">
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
          </Grid>
        )}

        {isOpsManager && (
          <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2} alignItems="center" flexWrap="wrap" sx={{ mb: 2 }}>
            <DatePicker
              label="Start date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
              sx={{ maxWidth: 180 }}
            />
            <DatePicker
              label="End date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
              sx={{ maxWidth: 180 }}
            />
            <FormControl size="small" sx={{ minWidth: 140, maxWidth: 180, width: 1 }}>
              <InputLabel id="filter-status-label">Status</InputLabel>
              <Select
                labelId="filter-status-label"
                id="filter-status"
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140, maxWidth: 180, width: 1 }}>
              <InputLabel id="filter-priority-label">Priority</InputLabel>
              <Select
                labelId="filter-priority-label"
                id="filter-priority"
                value={filterPriority}
                label="Priority"
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140, maxWidth: 180, width: 1 }}>
              <InputLabel id="filter-category-label">Category</InputLabel>
              <Select
                labelId="filter-category-label"
                id="filter-category"
                value={filterCategory}
                label="Category"
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {uniqueCategories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {(startDate || endDate || filterStatus !== 'all' || filterPriority !== 'all' || filterCategory !== 'all') && (
              <Button
                color="error"
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                  setFilterStatus('all');
                  setFilterPriority('all');
                  setFilterCategory('all');
                }}
                startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              >
                Clear
              </Button>
            )}
          </Grid>
        )}

        {isEnabler ? (
          <>
            <Grid item xs={12} md={3}>
              <AppWidgetSummary
                title="Total Submissions"
                total={profileDetails?.enablerStats?.totalSubmitted ?? 0}
                imageSRC={Conversations}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <AppWidgetSummary
                title="Approved Onboardings"
                total={profileDetails?.enablerStats?.totalApproved ?? 0}
                imageSRC={Users}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <AppWidgetSummary
                title="Rejected Submissions"
                total={profileDetails?.enablerStats?.totalRejected ?? 0}
                imageSRC={Campaign}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <AppWidgetSummary
                title="Pending Verification"
                total={
                  Math.max(
                    0,
                    (profileDetails?.enablerStats?.totalSubmitted ?? 0) -
                    (profileDetails?.enablerStats?.totalApproved ?? 0) -
                    (profileDetails?.enablerStats?.totalRejected ?? 0)
                  )
                }
                imageSRC={Users}
              />
            </Grid>
          </>
        ) : isOpsManager ? (
          <>
            {/* Product Complaints Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Product Complaints
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <AppWidgetSummary
                title="Total Product Complaints"
                total={filteredTickets.filter((t: any) => t.orderId !== null).length}
                imageSRC={Conversations}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <AppWidgetSummary
                title="Active Complaints"
                total={filteredTickets.filter((t: any) => t.orderId !== null && (t.status === 'open' || t.status === 'in_progress')).length}
                imageSRC={Campaign}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <AppWidgetSummary
                title="Total Resolved Tickets"
                total={filteredTickets.filter((t: any) => t.orderId !== null && (t.status === 'resolved' || t.status === 'closed')).length}
                imageSRC={Users}
              />
            </Grid>

            {/* Ops Tickets Section */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Operations Tickets
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <AppWidgetSummary
                title="Total Ops Tickets"
                total={filteredTickets.filter((t: any) => t.orderId === null).length}
                imageSRC={Conversations}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <AppWidgetSummary
                title="Active Complaints"
                total={filteredTickets.filter((t: any) => t.orderId === null && (t.status === 'open' || t.status === 'in_progress')).length}
                imageSRC={Campaign}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <AppWidgetSummary
                title="Total Resolved Tickets"
                total={filteredTickets.filter((t: any) => t.orderId === null && (t.status === 'resolved' || t.status === 'closed')).length}
                imageSRC={Users}
              />
            </Grid>

            <Grid item xs={12}>
              <AppAreaInstalled
                title={startDate || endDate ? "Ticket Trends (Filtered Range)" : "Ticket Trends (Last 7 Days)"}
                data={ticketTrends}
              />
            </Grid>
          </>
        ) : isAdminOrManager ? (
          <>
            <Grid item xs={12} md={3}>
              <AppWidgetSummary
                title={card1Title}
                total={card1Value}
                imageSRC={Users}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <AppWidgetSummary
                title="Active Stores"
                total={adminStats?.activeStores ?? 0}
                imageSRC={Campaign}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <AppWidgetSummary
                title="Global Products"
                total={adminStats?.totalProducts ?? 0}
                imageSRC={Conversations}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <AppWidgetSummary
                title="Total Orders"
                total={adminStats?.totalOrders ?? 0}
                imageSRC={Users}
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <AppAreaInstalled
                title={
                  isSuperAdmin 
                    ? "Merchant Onboarding Growth" 
                    : isRegionalManager 
                      ? "Store Growth in State" 
                      : "Store Growth in City"
                }
                data={adminStats?.monthlyGrowth?.map(g => ({ date: g.month, value: g.count })) || []}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <AppCurrentDownload
                title="Merchant Categories"
                chart={{
                  series: adminStats?.categoryDistribution?.map(c => ({
                    label: c.category || 'Other',
                    value: parseInt(c.count)
                  })) || []
                }}
              />
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} md={4}>
              <AppWidgetSummary
                title="Total Products"
                total={details?.totalProducts ?? 0}
                imageSRC={Conversations}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <AppWidgetSummary
                title="Active Orders"
                total={details?.activeOrders ?? 0}
                imageSRC={Campaign}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <AppWidgetSummary
                title="Total Revenue"
                total={details?.totalSales ?? 0}
                imageSRC={Users}
              />
            </Grid>

            <Grid item xs={12}>
              <AppAreaInstalled
                title="Order Trends (Last 7 Days)"
                data={details?.graphData || []}
              />
            </Grid>
          </>
        )}
      </Grid>
    </Container>
  );
}
