import { Helmet } from 'react-helmet-async';
// auth
import { useAuthContext } from 'src/auth/hooks';
// sections
import { OverviewAnalyticsView } from 'src/sections/overview/analytics/view';
import SuperAdminAnalyticsView from 'src/sections/overview/analytics/view/super-admin-analytics-view';

// ----------------------------------------------------------------------

export default function OverviewAnalyticsPage() {
  const { user } = useAuthContext();

  const roleLower = user?.role?.toLowerCase() || '';
  const isSuperAdmin = roleLower === 'super_admin' || roleLower === 'ops_admin';
  const isRegionalManager = roleLower === 'regional_manager' || roleLower === 'state_manager';
  const isCityManager = roleLower === 'city_manager';
  const isAdminOrManager = isSuperAdmin || isRegionalManager || isCityManager;

  return (
    <>
      <Helmet>
        <title> Dashboard: Analytics</title>
      </Helmet>

      {isAdminOrManager ? <SuperAdminAnalyticsView /> : <OverviewAnalyticsView />}
    </>
  );
}
