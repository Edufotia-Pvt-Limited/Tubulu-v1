import { formatDistanceToNowStrict } from 'date-fns';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// types
import { IChatParticipant, IChatMessage } from 'src/types/chat';
// components
import Iconify from 'src/components/iconify';
import { getSessionDetails } from 'src/utils/ApiActions';
import { useEffect, useState } from 'react';
import { useGetMessage } from './hooks';
import ChatMessageType from './chat-message-item-type';
import { Button } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  message: IChatMessage;
  participants: IChatParticipant[];
  onOpenLightbox: (value: string) => void;
};

interface IMessageAction {
  title: string;
  action?: string;
}

export default function ChatMessageItem({ message, participants, onOpenLightbox }: Props) {
  const { user } = useMockedUser();

  const { me, senderDetails, hasImage } = useGetMessage({
    message,
    participants,
    currentUserId: getSessionDetails()?.phoneNumber ?? '',
  });

  const { firstName, avatarUrl } = senderDetails;

  const { body, createdAt } = message;

  const [type, setType] = useState<'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT'>('TEXT');

  const [payload, setPayload] = useState({
    documentUrl: '',
    documentName: '',
    mimeType: '',
  });

  // const [messageActions, setMessageActions] = useState([]);
  const [messageActions, setMessageActions] = useState<IMessageAction[]>([]);


  useEffect(() => {
    if (message?.payload) {
      setType(message?.type);
      // setPayload(message?.payload);
      setPayload({
  documentUrl: message?.payload?.documentUrl ?? '',
  documentName: message?.payload?.documentName ?? '',
  mimeType: message?.payload?.mimeType ?? '',
});
    }
  }, []);

  useEffect(() => {
    if (message?.messageActions) {
      setMessageActions(message?.messageActions);
    }
  }, [])

  const renderInfo = (
    <Typography
      noWrap
      variant="caption"
      sx={{
        mb: 1,
        color: 'text.disabled',
        ...(!me && {
          mr: 'auto',
        }),
      }}
    >
      {!me && `${firstName},`} &nbsp;
      {/* {formatDistanceToNowStrict(new Date(createdAt), {
        addSuffix: true,
      })} */}
    </Typography>
  );

  function renderTimeStamp() {
    const date = new Date(createdAt)?.toLocaleDateString?.('en-US', {
      // year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const time = new Date(createdAt)?.toLocaleTimeString?.('en-US', {
      hour: 'numeric',
      minute: 'numeric',
    });
    return (
      <Typography
        noWrap
        className="message-actions"
        variant="caption"
        sx={{
          pt: 0.5,
          opacity: 10,
          top: '100%',
          ...(me && {
            right: 0,
          }),
          ...(!me && {
            left: 0,
          }),
          display: 'flex',
          position: 'absolute',
        }}
      >
        {date}, {time}
      </Typography>
    );
  }

  const renderBtns = (
    <Stack
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
        minWidth: 120,
        maxWidth: 320,
        flexWrap: "wrap",
      }}
    >
      {messageActions?.map(btn => <Button variant='outlined' color='primary'>{btn?.title}</Button>)}

    </Stack>
  );

  const renderBody = (
    <Stack
      sx={{
        p: 1.5,
        minWidth: 48,
        maxWidth: 320,
        borderRadius: 1,
        typography: 'body2',
        bgcolor: 'background.neutral',
        ...(me && {
          color: 'grey.800',
          bgcolor: 'primary.lighter',
        }),
        ...(hasImage && {
          p: 0,
          bgcolor: 'transparent',
        }),
      }}
    >
      {/* {payload?.documentName ? (
        <>
          <ChatMessageType
            payload={payload}
            type={type}
            onClick={() => onOpenLightbox(payload?.documentUrl)}
          />
          {body !== 'MEDIA' && <span className="mt-2">{body}</span>}
        </>
      ) : (
        body
      )}
    </Stack> */}


 {payload?.documentName ? (
        <>
          <ChatMessageType
            payload={payload}
            type={type}
            onClick={() => onOpenLightbox(payload?.documentUrl)}
          />
          {body !== 'MEDIA' && (
            <span
              className="mt-2"
              // NOTE: body is expected to be sanitized HTML from the conversation service
              dangerouslySetInnerHTML={{ __html: body }}
            />
          )}
        </>
      ) : (
        <span
          // NOTE: body is expected to be sanitized HTML from the conversation service
          dangerouslySetInnerHTML={{ __html: body }}
        />
      )}
    </Stack>


  );

  // const renderActions = (
  //   <Stack
  //     direction="row"
  //     className="message-actions"
  //     sx={{
  //       pt: 0.5,
  //       opacity: 0,
  //       top: '100%',
  //       left: 0,
  //       position: 'absolute',
  //       transition: (theme) =>
  //         theme.transitions.create(['opacity'], {
  //           duration: theme.transitions.duration.shorter,
  //         }),
  //       ...(me && {
  //         left: 'unset',
  //         right: 0,
  //       }),
  //     }}
  //   >
  //     <IconButton size="small">
  //       <Iconify icon="solar:reply-bold" width={16} />
  //     </IconButton>
  //     <IconButton size="small">
  //       <Iconify icon="eva:smiling-face-fill" width={16} />
  //     </IconButton>
  //     <IconButton size="small">
  //       <Iconify icon="solar:trash-bin-trash-bold" width={16} />
  //     </IconButton>
  //   </Stack>
  // );

  return (
    <Stack direction="row" justifyContent={me ? 'flex-end' : 'unset'} sx={{ mb: 5 }}>
      {!me && <Avatar alt={firstName} src={avatarUrl} sx={{ width: 32, height: 32, mr: 2 }} />}

      <Stack alignItems="flex-end">
        {renderInfo}

        <Stack
          direction="row"
          alignItems="center"
          sx={{
            position: 'relative',
            '&:hover': {
              '& .message-actions': {
                opacity: 1,
              },
            },
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {renderBody}
            {renderBtns}
          </div>

          <div style={{ display: 'flex' }}>{renderTimeStamp()}</div>
          {/* {renderActions} */}
        </Stack>
      </Stack>
    </Stack>
  );
}
