import { Helmet } from 'react-helmet-async';
// sections
import CommissionsView from 'src/sections/commissions/view/commissions-view';

// ----------------------------------------------------------------------

export default function CommissionsPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: My Commissions | Tubulu</title>
      </Helmet>

      <CommissionsView />
    </>
  );
}
