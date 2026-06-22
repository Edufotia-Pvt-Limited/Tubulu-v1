import { Helmet } from 'react-helmet-async';
import SupportTicketsView from 'src/sections/support/view/support-tickets-view';

export default function SupportTicketsPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Support Tickets</title>
      </Helmet>

      <SupportTicketsView />
    </>
  );
}
