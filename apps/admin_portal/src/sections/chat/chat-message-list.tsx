// @mui
import Box from '@mui/material/Box';
// types
import { IChatParticipant, IChatMessage } from 'src/types/chat';
// components
import Scrollbar from 'src/components/scrollbar';
import Lightbox, { useLightBox } from 'src/components/lightbox';
//
import { useMessagesScroll } from './hooks';
import ChatMessageItem from './chat-message-item';

// ----------------------------------------------------------------------

type Props = {
  messages: IChatMessage[];
  participants: IChatParticipant[];

};

// interface SlideImage {
//   src: string;   // required
// }


export default function ChatMessageList({ messages = [], participants }: Props) {
  const { messagesEndRef } = useMessagesScroll(messages);

  // const slides = messages
  //   .filter((message) => message?.type === 'IMAGE')
  //   .map((message) => ({ src: message?.payload?.documentUrl }));
  const slides = messages
  .filter((m) => m.type === 'IMAGE' && m.payload?.documentUrl)
  .map((m) => ({ src: m.payload!.documentUrl! }));

  const lightbox = (slides) && useLightBox(slides);

  return (
    <>
      <Scrollbar ref={messagesEndRef} sx={{ px: 3, py: 5, height: 1 }}>
        <Box>
          {messages.map((message) => (
            <ChatMessageItem
              key={message.id}
              message={message}
              participants={participants}
              // onOpenLightbox={() => lightbox.onOpen(message?.payload?.documentUrl)}
              onOpenLightbox={() => {
  if (message?.payload?.documentUrl) {
    lightbox.onOpen(message.payload.documentUrl);
  }
}}
            />
          ))}
        </Box>
      </Scrollbar>

      <Lightbox
        index={lightbox.selected}
        slides={slides}
        open={lightbox.open}
        close={lightbox.onClose}
      />
    </>
  );
}
