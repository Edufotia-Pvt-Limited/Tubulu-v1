/* eslint-disable react/jsx-no-bind */
import { sub } from 'date-fns';
import { useRef, useState, useCallback, useMemo, useEffect, KeyboardEventHandler } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// utils
import uuidv4 from 'src/utils/uuidv4';
// api
import { sendMessage, createConversation } from 'src/api/chat';
// components
import Iconify from 'src/components/iconify';
import { IoMdSend } from "react-icons/io";
// types
import { IChatParticipant } from 'src/types/chat';
import { getSessionDetails } from 'src/utils/ApiActions';
import { Button } from '@mui/material';
import { getMessageTypeFromMimeTypeV2 } from 'src/utils/helper';

// ----------------------------------------------------------------------

type Props = {
  recipients: IChatParticipant[];
  onAddRecipients: (recipients: IChatParticipant[]) => void;
  //
  disabled: boolean;
  selectedConversationId: string;
};

interface IFileUploads {
  file?: string;
  documentName: string;
  mimeType: string;
}

export default function ChatMessageInput({
  recipients,
  onAddRecipients,
  //
  disabled,
  selectedConversationId,
}: Props) {
  const router = useRouter();

  const { user } = useMockedUser();

  const fileRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState('');
  const [isDisabled, setDisabled] = useState<boolean>(false);
  const [fileDetails, setFileDetails] = useState<IFileUploads | undefined>(undefined);
  const [mediaType, setMediaType] = useState<"TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT">("TEXT");

  useEffect(() => {
    if (!!fileDetails?.file) {
      handleMediaSend();
    }
  }, [fileDetails])

  const myContact = useMemo(
    () => ({
      id: user.id,
      role: user.role,
      email: user.email,
      address: user.address,
      name: user.displayName,
      lastActivity: new Date(),
      avatarUrl: user.photoURL,
      phoneNumber: user.phoneNumber,
      status: 'online' as 'online' | 'offline' | 'alway' | 'busy',
    }),
    [user]
  );

  const messageData = useMemo(
    () => ({
      id: uuidv4(),
      attachments: [],
      body: message,
      contentType: 'text',
      createdAt: sub(new Date(), { minutes: 1 }),
      senderId: getSessionDetails()?.phoneNumber ?? '',
          type: mediaType, // <-- FIX

    }),
    [message]
  );

  const conversationData = useMemo(
    () => ({
      id: uuidv4(),
      messages: [messageData],
      participants: [...recipients, myContact],
      type: recipients.length > 1 ? 'GROUP' : 'ONE_TO_ONE',
      unreadCount: 0,
    }),
    [messageData, myContact, recipients]
  );

  const handleAttach = useCallback(() => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  }, []);

  function handleFileUpload(e: any) {
    const file = e.target.files[0];
    const reader: any = new FileReader();
    const _mediaType = getMessageTypeFromMimeTypeV2(file?.type);
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      setFileDetails(
        {
          mimeType: file.type,
          documentName: file.name,
          file: base64String
        }
      )
      setMediaType(_mediaType);
    };
  }

  function handleReceiptUpload(e: any) {
    const file = e.target.files[0];
    const reader: any = new FileReader();
    const _mediaType = getMessageTypeFromMimeTypeV2(file?.type);
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      setFileDetails(
        {
          mimeType: file.type,
          documentName: file.name,
          file: base64String
        }
      );
      setMediaType(_mediaType);
      setMessage('Here is your custom receipt.');
    };
  }

  const handleChangeMessage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  }, []);

  function handleSendMessage() {
    setDisabled(true);
    handleSend();
  }

  async function handleSend() {
    setDisabled(true);
    try {
      if (message) {
        if (selectedConversationId) {
          await sendMessage(selectedConversationId, { ...messageData, payload: fileDetails, type: mediaType });
        } else {
          const res = await createConversation(conversationData);

          router.push(`${paths.dashboard.chat}?id=${res.conversation.id}`);

          onAddRecipients([]);
        }
      }
      setMessage('');
      setDisabled(false);
      setFileDetails({} as IFileUploads);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleMediaSend() {
    try {
      if (selectedConversationId) {
        await sendMessage(selectedConversationId, { ...messageData, body: !!messageData.body ? messageData.body : 'MEDIA', payload: fileDetails, type: mediaType })
      }
      setFileDetails(undefined);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <InputBase
        value={message}
        onKeyUp={(event: React.KeyboardEvent<HTMLInputElement>) => { (event?.key === 'Enter') && !isDisabled && handleSendMessage() }}
        onChange={handleChangeMessage}
        placeholder="Type a message"
        disabled={disabled}
        // startAdornment={
        //   <IconButton>
        //     <Iconify icon="eva:smiling-face-fill" />
        //   </IconButton>
        // }
        endAdornment={
          <Stack direction="row" sx={{ flexShrink: 0, display: "flex", alignItems: 'center' }}>
            {/* <IconButton onClick={handleAttach}>
              <Iconify icon="solar:gallery-add-bold" />
            </IconButton> */}
            <IconButton component="label" title="Upload Receipt">
              <Iconify icon="eva:camera-fill" />
              <input type="file" accept="image/*" capture="environment" onChange={handleReceiptUpload} style={{ display: 'none' }} />
            </IconButton>
            <IconButton component="label" >
              <Iconify icon="eva:attach-2-fill" />
              <input type="file" onChange={handleFileUpload} ref={fileRef} style={{ display: 'none' }} />
            </IconButton>
            {message.length > 0 && <Button
              variant='contained'
              color='primary'
              disabled={isDisabled}
              style={{ minWidth: '10%' }}
              onClick={handleSend}
            >
              <IoMdSend size={16} />
            </Button>}
            {/* <IconButton>
              <Iconify icon="solar:microphone-bold" />
            </IconButton> */}
          </Stack>
        }
        sx={{
          px: 1,
          height: 56,
          flexShrink: 0,
          borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
        }}
      />

    </>
  );
}
