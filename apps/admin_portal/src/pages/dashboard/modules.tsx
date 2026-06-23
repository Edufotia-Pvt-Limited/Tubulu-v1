import { Helmet } from 'react-helmet-async';
// sections
import ModulesDashboardView from 'src/sections/modules/view/modules-dashboard-view';

// ----------------------------------------------------------------------

export default function ModulesPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: App Modules</title>
      </Helmet>

      <ModulesDashboardView />
    </>
  );
}
