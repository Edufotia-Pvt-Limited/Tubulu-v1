import { Helmet } from 'react-helmet-async';
// sections
import StaffListView from 'src/sections/staff/view/staff-list-view';

// ----------------------------------------------------------------------

export default function StaffListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Staff Management</title>
      </Helmet>

      <StaffListView />
    </>
  );
}
