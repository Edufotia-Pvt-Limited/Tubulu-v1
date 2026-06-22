import { useMemo } from 'react';
import keyBy from 'lodash/keyBy';
import useSWR, { mutate } from 'swr';
// utils
import axios, { endpoints, fetcher } from 'src/utils/axios';
// types
import {
  IChatMessage,
  IChatParticipant,
  IChatConversations,
  IChatConversation,
} from 'src/types/chat';
import { baseUrl, serverCallWithToken } from 'src/utils/ApiActions';

// ----------------------------------------------------------------------

const options = {
  revalidateIfStale: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export function useGetContacts() {
 
  const URL = `${baseUrl}/chatRoom/dashboard/all/contacts` 
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, options);

console.log('get contact called')

  const memoizedValue = useMemo(
    () => ({
      contacts: (data?.contacts as IChatParticipant[]) || [],
      contactsLoading: isLoading,
      contactsError: error,
      contactsValidating: isValidating,
      contactsEmpty: !isLoading && !data?.contacts.length,
    }),
    [data?.contacts, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetConversations() {
  // const URL = [endpoints.chatConversation, { params: { endpoint: 'conversations' } }];

  const URL = `${baseUrl}/chatRoom/dashboard/all/chatRooms?endpoint=conversations` 
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {...options, refreshInterval: 5000});

console.log('get all chat room called')

  const memoizedValue = useMemo(() => {
    const byId = keyBy(data?.conversations, 'id') || {};
    const allIds = Object.keys(byId) || [];

    return {
      conversations: {
        byId,
        allIds,
      } as IChatConversations,
      conversationsLoading: isLoading,
      conversationsError: error,
      conversationsValidating: isValidating,
      conversationsEmpty: !isLoading && !allIds.length,
    };
  }, [data?.conversations, error, isLoading, isValidating]);

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetConversation(conversationId: string) {
   

  const URL = conversationId
    ? `${baseUrl}/chatRoom/dashboard/all/chatMessages/${conversationId}`
    : null; 


console.log('get single chat room  meesage called')

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {...options, refreshInterval: 5000});

  const memoizedValue = useMemo(
    () => ({
      conversation: data?.conversation as IChatConversation,
      conversationLoading: isLoading,
      conversationError: error,
      conversationValidating: isValidating,
    }),
    [data?.conversation, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export async function sendMessage(conversationId: string, messageData: IChatMessage) {
  // const CONVERSATIONS_URL = [endpoints.chat, { params: { endpoint: 'conversations' } }];
  const CONVERSATIONS_URL = `${baseUrl}/chatRoom/dashboard/all/chatRooms?endpoint=conversations` 
  const CONVERSATION_URL = `${baseUrl}/chatRoom/dashboard/all/chatMessages/${conversationId}` 

  // const CONVERSATION_URL = [
  // endpoints.chat,
  // {
  //     params: { conversationId, endpoint: 'conversation' },
  // },
  // ];

    /**
   * Work on server
   */
  // const data = { conversationId, messageData };
  // await axios.put(endpoints.chat, data);

  const SEND_MSG_URL = `${baseUrl}/chatMessage/integrationSendDashboard?conversationId=${conversationId}` 

  await serverCallWithToken({
    url: SEND_MSG_URL,
    data: { ...messageData },
    method: 'PUT',
})
mutate(CONVERSATION_URL);
mutate(CONVERSATIONS_URL);


  /**
   * Work in local
   */
  mutate(
  CONVERSATION_URL,
  (currentData: any) => {
    if(currentData){
  const { conversation: currentConversation } = currentData;

  const conversation = {
  ...currentConversation,
  messages: [...currentConversation.messages, messageData],
  };

  return {
  conversation,
  };
} 
  return {};
 
  },
  false
  );

  /**
   * Work in local
   */
  mutate(
  CONVERSATIONS_URL,
  (currentData: any) => {
  const { conversations: currentConversations } = currentData;

  const conversations: IChatConversation[] = currentConversations.map(
  (conversation: IChatConversation) =>
  conversation.id === conversationId
  ? {
  ...conversation,
  messages: [...conversation.messages, messageData],
  }
            : conversation
  );

  return {
  conversations,
  };
  },
  false
  );
}

// ----------------------------------------------------------------------

export async function createConversation(conversationData: IChatConversation) {
  const URL = [endpoints.chat, { params: { endpoint: 'conversations' } }];

  /**
   * Work on server
   */
  const data = { conversationData };
  const res = await axios.post(endpoints.chat, data);

  /**
   * Work in local
   */
  mutate(
    URL,
    (currentData: any) => {
      const conversations: IChatConversation[] = [...currentData.conversations, conversationData];
      return {
        ...currentData,
        conversations,
      };
    },
    false
  );

  return res.data;
}

// ----------------------------------------------------------------------

// export async function clickConversation(conversationId: string) {
//   const URL = `${baseUrl}/chatRoom/dashboard/all/chatRooms`;

//   /**
//    * Work on server
//    */
//   // await axios.get(URL, { params: { conversationId, endpoint: 'mark-as-seen' } });

//   /**
//    * Work in local
//    */
//   mutate(
//     [
//       URL,
//       {
//         params: { endpoint: 'conversations' },
//       },
//     ],
//     (currentData: any) => {
//       const conversations: IChatConversations = currentData.conversations.map(
//         (conversation: IChatConversation) =>
//           conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation
//       );

//       return {
//         ...currentData,
//         conversations,
//       };
//     },
//     false
//   );
// }


export async function clickConversation(conversationId: string) {
  const CONVERSATIONS_URL =
    `${baseUrl}/chatRoom/dashboard/all/chatRooms?endpoint=conversations`;



console.log('clickConversation called')

  mutate(
    CONVERSATIONS_URL,
    (currentData?: { conversations?: IChatConversation[] }) => {
      if (!currentData?.conversations) return currentData;

      return {
        ...currentData,
        conversations: currentData.conversations.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, unreadCount: 0 }
            : conversation
        ),
      };
    },
    false
  );
}

export async function toggleChatRoomAi(conversationId: string, isAiActive: boolean) {
  const CONVERSATION_URL = `${baseUrl}/chatRoom/dashboard/all/chatMessages/${conversationId}`;
  const CONVERSATIONS_URL = `${baseUrl}/chatRoom/dashboard/all/chatRooms?endpoint=conversations`;
  const TOGGLE_URL = `${baseUrl}/chatRoom/dashboard/chatRoom/${conversationId}/toggle-ai`;

  await serverCallWithToken({
    url: TOGGLE_URL,
    data: { isAiActive },
    method: 'PUT',
  });

  mutate(CONVERSATION_URL);
  mutate(CONVERSATIONS_URL);
}

