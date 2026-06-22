import { Helmet } from 'react-helmet-async';
// sections
import MerchantsListView from 'src/sections/merchants/view/merchants-list-view';

// ----------------------------------------------------------------------

export default function MerchantsListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Merchant Management</title>
      </Helmet>

      <MerchantsListView />
    </>
  );
}
