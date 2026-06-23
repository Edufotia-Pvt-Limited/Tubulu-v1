import { Helmet } from 'react-helmet-async';
// sections
import MerchantOnboardForm from 'src/sections/merchants/merchant-onboard-form';

// ----------------------------------------------------------------------

export default function MerchantOnboardPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Merchant Onboarding</title>
      </Helmet>

      <MerchantOnboardForm />
    </>
  );
}
