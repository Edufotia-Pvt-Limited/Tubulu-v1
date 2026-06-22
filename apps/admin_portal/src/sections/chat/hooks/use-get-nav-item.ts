// types
import { IChatConversation } from 'src/types/chat';
import { getSessionDetails } from 'src/utils/ApiActions';

// ----------------------------------------------------------------------

type Props = {
  currentUserId: string;
  conversation: IChatConversation;
};

export default function useGetNavItem({ currentUserId, conversation }: Props) {
  const { messages, participants } = conversation;

  const cleanPhone = (phone: string) => {
    if (!phone) return '';
    const clean = phone.replace(/[^0-9]/g, '');
    return clean.length > 10 ? clean.slice(-10) : clean;
  };

  const participantsInConversation = participants.filter(
    (participant) => {
      const pId = participant.id || '';
      const cId = currentUserId || '';
      return pId !== cId && cleanPhone(pId) !== cleanPhone(cId);
    }
  );

  const lastMessage = messages[messages.length - 1];

  const group = participantsInConversation.length > 1;

  const displayName = participantsInConversation.map((participant) => participant.name).join(', ');

  const hasOnlineInGroup = group
    ? participantsInConversation.map((item) => item.status).includes('online')
    : false;

  let displayText = '';

  if (lastMessage) {
    const sender = lastMessage.senderId === getSessionDetails()?.phoneNumber ? 'You: ' : '';

    const message = lastMessage.contentType === 'image' ? 'Sent a photo' : lastMessage.body || '';

    // displayText = `${sender}${message}`;

const fullText = `${sender}${message}`;

    // Limit preview length to keep chat nav UI tidy
    const MAX_PREVIEW_LENGTH = 25;
    displayText =
      fullText.length > MAX_PREVIEW_LENGTH
        ? `${fullText.slice(0, MAX_PREVIEW_LENGTH - 3)}...`
        : fullText;




  }

  return {
    group,
    displayName,
    displayText,
    participants: participantsInConversation,
    lastActivity: lastMessage.createdAt,
    hasOnlineInGroup,
  };
}
