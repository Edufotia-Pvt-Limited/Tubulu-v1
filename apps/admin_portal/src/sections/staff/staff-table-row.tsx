import { useState, useCallback } from 'react';
import { format } from 'date-fns';
// @mui
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import Drawer from '@mui/material/Drawer';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSnackbar } from 'src/components/snackbar';
// utils
import axios from 'src/utils/axios';

// ----------------------------------------------------------------------

type Props = {
  row: any;
  onDeleteRow: VoidFunction;
  allStaff?: any[];
};

export default function StaffTableRow({ row, onDeleteRow, allStaff = [] }: Props) {
  const { id, integrationName, name, email, phoneNumber, role, createdAt, isActive, lastLoginAt, delegatedToStaffId } = row;
  const { enqueueSnackbar } = useSnackbar();

  const confirm = useBoolean();
  const popover = usePopover();
  
  const [activeStatus, setActiveStatus] = useState(isActive);
  const [openLogs, setOpenLogs] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [openDelegate, setOpenDelegate] = useState(false);
  const [delegateId, setDelegateId] = useState(delegatedToStaffId || '');

  const handleToggleStatus = async () => {
    try {
      const response = await axios.patch(`/api/v1/admin/staff/toggle-account/${id}`);
      setActiveStatus(response.data.data.isActive);
      enqueueSnackbar('Staff status updated!');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to update status', { variant: 'error' });
    }
  };

  const handleFetchLogs = async () => {
    try {
      const response = await axios.get(`/api/v1/admin/staff/activity-log/${id}`);
      setLogs(response.data.data || []);
      setOpenLogs(true);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to fetch activity logs', { variant: 'error' });
    }
  };

  const handleDelegate = async () => {
    try {
      await axios.patch(`/api/v1/admin/staff/delegate/${id}`, { delegateStaffId: delegateId });
      enqueueSnackbar('Staff backup delegated successfully!');
      setOpenDelegate(false);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to delegate backup', { variant: 'error' });
    }
  };

  const displayName = name || integrationName || 'Staff Member';
  const displayEmail = email || phoneNumber || '';

  return (
    <>
      <TableRow hover>
        <TableCell>
          <Typography variant="subtitle2" noWrap>
            {displayName}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {displayEmail}
          </Typography>
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (role === 'manager' && 'primary') ||
              (role === 'cashier' && 'info') ||
              (role === 'support' && 'warning') ||
              (role === 'delivery' && 'success') ||
              'default'
            }
            sx={{ textTransform: 'capitalize' }}
          >
            {role ? role.replace('_', ' ') : 'N/A'}
          </Label>
        </TableCell>

        <TableCell>
          <Switch
            checked={activeStatus}
            color="success"
            onChange={handleToggleStatus}
          />
        </TableCell>

        <TableCell>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {lastLoginAt ? format(new Date(lastLoginAt), 'dd MMM yyyy, hh:mm a') : 'Never'}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {createdAt ? format(new Date(createdAt), 'dd MMM yyyy') : ''}
          </Typography>
        </TableCell>

        <TableCell align="right" sx={{ px: 1 }}>
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
            handleFetchLogs();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:clipboard-list-bold" />
          Activity Log
        </MenuItem>

        <MenuItem
          onClick={() => {
            setOpenDelegate(true);
            popover.onClose();
          }}
        >
          <Iconify icon="solar:user-handshake-bold" />
          Delegate Backup
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
        title="Delete Staff"
        content="Are you sure you want to delete this staff account?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />

      {/* Activity Log Drawer */}
      <Drawer
        anchor="right"
        open={openLogs}
        onClose={() => setOpenLogs(false)}
        PaperProps={{ sx: { width: 360, p: 3 } }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>Activity Log - {displayName}</Typography>
        {logs.length === 0 ? (
          <Typography sx={{ color: 'text.secondary', mt: 4, textAlign: 'center' }}>No actions logged yet</Typography>
        ) : (
          <List>
            {logs.map((log) => (
              <ListItem key={log.id} divider>
                <ListItemText
                  primary={log.action.replace('_', ' ').toUpperCase()}
                  secondary={
                    <>
                      <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
                        {format(new Date(log.createdAt), 'dd MMM yyyy, hh:mm a')}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {JSON.stringify(log.metadata)}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Drawer>

      {/* Delegate Dialog */}
      <Dialog open={openDelegate} onClose={() => setOpenDelegate(false)} fullWidth maxWidth="xs">
        <DialogTitle>Delegate Backup Staff</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Delegate to</InputLabel>
              <Select
                value={delegateId}
                label="Delegate to"
                onChange={(e) => setDelegateId(e.target.value)}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {allStaff
                  .filter((s) => s.id !== id)
                  .map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name || s.integrationName} ({s.role})
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelegate(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleDelegate}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
