import { Helmet } from 'react-helmet-async';
// sections
import { AIPlaybooksView } from 'src/sections/ai-playbooks/view';

// ----------------------------------------------------------------------

export default function AIPlaybooksPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: AI Playbooks</title>
      </Helmet>

      <AIPlaybooksView />
    </>
  );
}
