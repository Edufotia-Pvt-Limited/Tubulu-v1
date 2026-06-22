import { Helmet } from 'react-helmet-async';
// sections
import AIBotView from 'src/sections/ai-bot/view/ai-bot-view';

// ----------------------------------------------------------------------

export default function AIBotPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: AI Bot Settings</title>
      </Helmet>

      <AIBotView />
    </>
  );
}
