import { Helmet } from 'react-helmet-async';
// sections
import { SuperAdminSettingsView } from 'src/sections/super-admin-settings/view';

// ----------------------------------------------------------------------

export default function SuperAdminSettingsPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: System Settings</title>
      </Helmet>

      <SuperAdminSettingsView />
    </>
  );
}
