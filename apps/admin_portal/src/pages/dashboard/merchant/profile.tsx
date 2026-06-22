import { Helmet } from 'react-helmet-async';
// sections
import MerchantProfileView from 'src/sections/merchant/view/merchant-profile-view';

// ----------------------------------------------------------------------

export default function MerchantProfilePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Business Profile</title>
      </Helmet>

      <MerchantProfileView />
    </>
  );
}
