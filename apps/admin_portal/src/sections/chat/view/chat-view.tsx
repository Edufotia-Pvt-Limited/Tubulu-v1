import { useEffect, useState, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// api
import { useGetContacts, useGetConversation, useGetConversations, toggleChatRoomAi } from 'src/api/chat';
// components
import { useSettingsContext } from 'src/components/settings';
// types
import { IChatParticipant } from 'src/types/chat';
import { getSessionDetails } from 'src/utils/ApiActions';
//
import ChatNav from '../chat-nav';
import ChatRoom from '../chat-room';
import ChatMessageList from '../chat-message-list';
import ChatMessageInput from '../chat-message-input';
import ChatHeaderDetail from '../chat-header-detail';


// ----------------------------------------------------------------------

export default function ChatView() {
  const router = useRouter();

  const { user } = useMockedUser();

  const settings = useSettingsContext();

  const searchParams = useSearchParams();

  const selectedConversationId = searchParams.get('id') || '';

  
  const [recipients, setRecipients] = useState<IChatParticipant[]>([]);

  const { contacts } = useGetContacts();


  const { conversations, conversationsLoading } = useGetConversations();


// console.log('conversations', conversations)

  const { conversation, conversationError } = useGetConversation(`${selectedConversationId}`);

  const cleanPhone = (phone: string) => {
    if (!phone) return '';
    const clean = phone.replace(/[^0-9]/g, '');
    return clean.length > 10 ? clean.slice(-10) : clean;
  };

  const participants: IChatParticipant[] =
    conversation?.participants?.filter((participant) => {
      const pId = participant.id || '';
      const mPhone = getSessionDetails()?.phoneNumber || '';
      const uId = user?.id || '';
      return pId !== mPhone && pId !== uId && cleanPhone(pId) !== cleanPhone(mPhone);
    }) ?? [];



  useEffect(() => {
    if (conversationError || !selectedConversationId) {
      router.push(paths.dashboard.chat);
    }
  }, [conversationError, router, selectedConversationId]);

  const handleAddRecipients = useCallback((selected: IChatParticipant[]) => {
    setRecipients(selected);
  }, []);

  const handleToggleAi = useCallback(
    async (isAiActive: boolean) => {
      try {
        await toggleChatRoomAi(selectedConversationId, isAiActive);
      } catch (err) {
        console.error('Failed to toggle AI chatbot:', err);
      }
    },
    [selectedConversationId]
  );

  const details = !!conversation;

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      flexShrink={0}
      sx={{ pr: 1, pl: 2.5, py: 1, minHeight: 72 }}
    >
      <>{details && (
        <ChatHeaderDetail
          participants={participants}
          isAiActive={conversation?.isAiActive}
          onToggleAi={handleToggleAi}
        />
      )}</>
    </Stack>
  );

  const renderNav = (
    <ChatNav
      contacts={contacts}
      conversations={conversations}
      loading={conversationsLoading}
      selectedConversationId={selectedConversationId}
    />
  );




  const renderMessages = (
    <Stack
      sx={{
        width: 1,
        height: 1,
        overflow: 'hidden',
      }}
    >
      <ChatMessageList messages={conversation?.messages} participants={participants} />

      <ChatMessageInput
        recipients={recipients}
        onAddRecipients={handleAddRecipients}
        //
        selectedConversationId={selectedConversationId}
        disabled={!recipients.length && !selectedConversationId}
      />
    </Stack>
  );



  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography
        variant="h4"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        Chat
      </Typography>

      <Stack component={Card} direction="row" sx={{ height: '72vh' }}>
        {renderNav}

        <Stack
          sx={{
            width: 1,
            height: 1,
            overflow: 'hidden',
          }}
        >
          {renderHead}

          <Stack
            direction="row"
            sx={{
              width: 1,
              height: 1,
              overflow: 'hidden',
              borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
            }}
          >
            {renderMessages}

            {details && <ChatRoom conversation={conversation} participants={participants} />}
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
}
