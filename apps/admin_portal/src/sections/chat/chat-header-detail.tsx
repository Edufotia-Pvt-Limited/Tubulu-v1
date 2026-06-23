// @mui
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
// utils
import { fToNow } from 'src/utils/format-time';
// types
import { IChatParticipant } from 'src/types/chat';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  participants: IChatParticipant[];
  isAiActive?: boolean;
  onToggleAi?: (isAiActive: boolean) => void;
};

export default function ChatHeaderDetail({ participants, isAiActive = true, onToggleAi }: Props) {
  const group = participants.length > 1;

  const singleParticipant = participants[0];

  const renderGroup = (
    <AvatarGroup
      max={3}
      sx={{
        [`& .${avatarGroupClasses.avatar}`]: {
          width: 32,
          height: 32,
        },
      }}
    >
      {participants.map((participant) => (
        <Avatar key={participant.id} alt={participant.name} src={participant.avatarUrl} />
      ))}
    </AvatarGroup>
  );

  const renderSingle = (
    <Stack flexGrow={1} direction="row" alignItems="center" spacing={2}>
      <Badge
        // variant={singleParticipant.status}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Avatar src={singleParticipant.avatarUrl} alt={singleParticipant.name} />
      </Badge>

      <ListItemText
        primary={singleParticipant.name}
        // secondary={
        //   singleParticipant.status === 'offline'
        //     ? fToNow(singleParticipant.lastActivity)
        //     : singleParticipant.status
        // }
        secondaryTypographyProps={{
          component: 'span',
          ...(singleParticipant.status !== 'offline' && {
            textTransform: 'capitalize',
          }),
        }}
      />
    </Stack>
  );

  return (
    <>
      {group ? renderGroup : renderSingle}
      <Stack flexGrow={1} />
      {onToggleAi && (
        <FormControlLabel
          control={
            <Switch
              checked={isAiActive}
              onChange={(event) => onToggleAi(event.target.checked)}
              color="primary"
            />
          }
          label={isAiActive ? "AI Assistant Active" : "AI Assistant Paused"}
          sx={{ mr: 2 }}
        />
      )}
      {/* <IconButton>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton> */}
    </>
  );
}
