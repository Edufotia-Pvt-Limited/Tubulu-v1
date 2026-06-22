// ----------------------------------------------------------------------

export type IChatAttachment = {
  name: string;
  size: number;
  type: string;
  path: string;
  preview: string;
  createdAt: Date;
  modifiedAt: Date;
};

export type IChatMessage = {
  id: string;
  body: string;
  createdAt: Date;
  senderId: string;
  contentType: string;
  attachments: IChatAttachment[];
  type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT";
  payload?: {
    documentUrl?: string;
    documentName: string;
    mimeType: string;
    file?: string;
  },
  messageActions?: [];
};

export type IChatParticipant = {
  id: string;
  name: string;
  role: string;
  email: string;
  address: string;
  avatarUrl: string;
  phoneNumber: string;
  lastActivity: Date;
  status: 'online' | 'offline' | 'alway' | 'busy';
};

export type IChatConversation = {
  id: string;
  type: string;
  unreadCount: number;
  isAiActive?: boolean;
  messages: IChatMessage[];
  participants: IChatParticipant[];
};

export type IChatConversations = {
  byId: Record<string, IChatConversation>;
  allIds: string[];
};
