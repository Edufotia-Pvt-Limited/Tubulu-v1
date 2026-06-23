
// @mui
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
//
import { IMerchantItem } from 'src/types/merchant';

const CATEGORY_MAP: Record<string, string> = {
  FB: 'Food & Beverage',
  GROCERY: 'Grocery',
  Electronics: 'Electronics',
  Retail: 'Retail',
  Services: 'Services',
  'Govt Sector': 'Govt Sector',
  General: 'General Store',
};

// ----------------------------------------------------------------------

type Props = {
  row: IMerchantItem;
  onViewRow: VoidFunction;
  onEditRow: VoidFunction;
  onApproveRow: VoidFunction;
  onSuspendRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function MerchantTableRow({
  row,
  onViewRow,
  onEditRow,
  onApproveRow,
  onSuspendRow,
  onDeleteRow,
}: Props) {
  const { 
    integrationName, phoneNumber, category, city, isApproved, isActive, 
    trustScore, isGstVerified, isPanVerified, isAadharVerified, parent, parentId,
    isSuspended, city_detail, state_detail, state
  } = row;

  const confirm = useBoolean();
  const popover = usePopover();
  const router = useRouter();

  const safeIntegrationName = integrationName || 'Unknown Merchant';

  return (
    <>
      <TableRow hover>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar alt={safeIntegrationName} sx={{ mr: 2 }}>
            {safeIntegrationName.charAt(0).toUpperCase()}
          </Avatar>

          <ListItemText
            primary={
              <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Box component="span">{safeIntegrationName}</Box>
                {parentId && (
                  <Label 
                    variant="filled" 
                    color={parent?.role === 'regional_partner' ? 'info' : 'secondary'} 
                    sx={{ height: 20, fontSize: 10, px: 0.8, flexShrink: 0 }}
                  >
                    {parent?.role === 'regional_partner' ? 'PARTNER' : 'BRANCH'}
                  </Label>
                )}
              </Stack>
            }
            secondary={
              <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {parentId ? (
                  <>
                    <Iconify 
                        icon={parent?.role === 'regional_partner' ? "solar:shield-user-bold" : "solar:branching-paths-bold"} 
                        width={14} 
                    />
                    {parent?.role === 'regional_partner' ? `Managed by ${parent?.integrationName}` : `Part of ${parent?.integrationName || 'Head Office'}`}
                  </>
                ) : (
                  city || 'No Address'
                )}
              </Box>
            }
            primaryTypographyProps={{ variant: 'subtitle2' }}
            secondaryTypographyProps={{ variant: 'caption', color: parentId ? 'secondary.main' : 'text.disabled', fontWeight: parentId ? 'bold' : 'normal' }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {phoneNumber?.replace(/[^0-9]/g, '').slice(-10).replace(/(\d{5})(\d{5})/, '+91 $1 $2')}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
            <Label variant="soft" color="info">
                {CATEGORY_MAP[category] || category || 'Uncategorized'}
            </Label>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Label variant="soft" color={parentId ? 'secondary' : 'success'}>
            {parentId ? 'Branch' : 'Brand HQ'}
          </Label>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {city_detail?.name && state_detail?.name
            ? `${city_detail.name} / ${state_detail.name}`
            : `${city || ''} / ${state || ''}`}
        </TableCell>

        <TableCell align="center">
            <Label
                variant="soft"
                color={(isActive && 'success') || 'default'}
            >
                {isActive ? 'Online' : 'Offline'}
            </Label>
        </TableCell>

        <TableCell>
          <Stack spacing={0.5} direction="row" alignItems="center">
            <Label
              variant="soft"
              color={(isApproved && 'success') || 'warning'}
            >
              {isApproved ? 'Approved' : 'Pending'}
            </Label>
            {isSuspended && (
              <Label variant="filled" color="error">
                Suspended
              </Label>
            )}
          </Stack>
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title={isSuspended ? "Unsuspend Account" : "Suspend Account"} placement="top" arrow>
            <IconButton color={isSuspended ? 'success' : 'warning'} onClick={onSuspendRow}>
                <Iconify icon={isSuspended ? 'solar:play-circle-bold' : 'solar:pause-circle-bold'} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Quick Approval" placement="top" arrow>
            <IconButton color={isApproved ? 'error' : 'success'} onClick={onApproveRow}>
                <Iconify icon={isApproved ? 'solar:close-circle-bold' : 'solar:check-read-linear'} />
            </IconButton>
          </Tooltip>

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View Details
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit Details
        </MenuItem>



        <MenuItem
          onClick={() => {
            onApproveRow();
            popover.onClose();
          }}
          sx={{ color: isApproved ? 'error.main' : 'success.main' }}
        >
          <Iconify icon={isApproved ? 'solar:close-circle-bold' : 'solar:check-read-linear'} />
          {isApproved ? 'Revoke' : 'Approve'}
        </MenuItem>

        <MenuItem
          onClick={() => {
            onSuspendRow();
            popover.onClose();
          }}
          sx={{ color: isSuspended ? 'success.main' : 'warning.main' }}
        >
          <Iconify icon={isSuspended ? 'solar:play-circle-bold' : 'solar:pause-circle-bold'} />
          {isSuspended ? 'Unsuspend' : 'Suspend'}
        </MenuItem>

        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete Vendor"
        content="Are you sure you want to permanently delete this vendor? This action cannot be undone."
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}
