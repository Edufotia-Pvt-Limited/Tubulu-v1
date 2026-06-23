import { Helmet } from 'react-helmet-async';
// sections
import { SuperAdminIntegrationsView } from 'src/sections/superadmin/view';

// ----------------------------------------------------------------------

export default function SuperAdminIntegrationsPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Business Management</title>
      </Helmet>

      <SuperAdminIntegrationsView />
    </>
  );
}
