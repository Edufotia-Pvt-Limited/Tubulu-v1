import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  createSvgIcon,
  Alert,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { addGroupIntegration, editGroupIntegration, getAllGroupsIntegration, deleteGroupIntegration } from 'src/utils/ApiActions';

const PlusIcon = createSvgIcon(
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>,
  'Plus'
);

export function ManagePhoneBookGroups(): JSX.Element {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groups, setGroups] = useState<any[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [group, setGroup] = useState<any>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const [errorState, setErrorState] = useState<any>({});
  const [alertDetails, setAlertDetails] = useState<any>({});

  const handleClose = () => {
    setOpen(false);
    setGroupName('');
    setErrorState({});
    setIsEdit(false);
    setGroup({});
  };

  async function fetchAllGroups() {
    const response = await getAllGroupsIntegration();
    if (response?.data?.success) {
      setGroups(response.data.data);
    }
  }

  useEffect(() => {
    fetchAllGroups();
  }, []);

  function checkValidation() {
    let valid = true;
    const errorData: any = {};
    const exists = groups.findIndex(
      (item: any) => item.groupName.toLowerCase() === groupName.toLowerCase()
    );

    if (!groupName.trim()) {
      valid = false;
      errorData.groupName = 'Please enter valid group name.';
    } else if (!isEdit && exists > -1) {
      valid = false;
      errorData.groupName = 'Duplicate group name not allowed.';
    }

    setErrorState(errorData);
    return valid;
  }

  async function handleAddGroupSubmit() {
    if (!checkValidation()) return;

    await addGroupIntegration({ groupName });
    setAlertDetails({ isSuccess: true, msg: 'Group added successfully' });
    handleClose();
    fetchAllGroups();
  }

  async function handleEditGroupSubmit() {
    if (!checkValidation()) return;

    await editGroupIntegration({ groupName }, group._id);
    setAlertDetails({ isSuccess: true, msg: 'Group updated successfully' });
    handleClose();
    fetchAllGroups();
  }

  const handleEdit = (row: any) => {
    setOpen(true);
    setIsEdit(true);
    setGroupName(row.groupName);
    setGroup(row);
  };

  const handleDeleteClick = (row: any) => {
    setSelectedGroup(row);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    await deleteGroupIntegration(selectedGroup._id);
    setAlertDetails({ isSuccess: true, msg: 'Group deleted successfully' });
    setDeleteDialogOpen(false);
    setSelectedGroup(null);
    fetchAllGroups();
  };

  return (
    <div>
      <Typography fontSize={24} fontWeight={700}>Phonebook - Manage Groups</Typography>

      <div style={{ textAlign: 'end' }}>
        <Button
          onClick={() => setOpen(true)}
          variant="contained"
          style={{ background: '#36F', color: '#FFF' }}
          startIcon={<PlusIcon />}
        >
          Create Group
        </Button>
      </div>

      <TableContainer component={Paper} style={{ marginTop: 40 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Group Name</TableCell>
              <TableCell align="center">Date Created</TableCell>
              <TableCell align="center">Date Updated</TableCell>
              <TableCell align="center" />
            </TableRow>
          </TableHead>

          <TableBody>
            {groups.map((row: any) => (
              <TableRow key={row._id}>
                <TableCell>{row.groupName}</TableCell>
                <TableCell align="center">
                  {new Date(row.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell align="center">
                  {new Date(row.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell align="center">
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    {/* Edit */}
                    <svg width="20" height="20" viewBox="0 0 24 24" onClick={() => handleEdit(row)}>
                      <path fill="#637381" d="M18 2L15.6 4.4 19.6 8.4 22 6zM14.1 5.9 3 17v4h4L18.1 9.9z" />
                    </svg>

                    {/* Delete */}
                    <svg width="20" height="20" viewBox="0 0 24 24" onClick={() => handleDeleteClick(row)}>
                      <path fill="#FF5630" d="M9 3v1H4v2h16V4h-5V3H9zm1 6v9h2V9zm4 0v9h2V9zM6 9v9h2V9H6z" />
                    </svg>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>{isEdit ? 'Edit Group' : 'Create Group'}</DialogTitle>
        <DialogContent style={{paddingTop:"10px"}}>
          <Grid container>
            <TextField
              fullWidth
              label="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              error={!!errorState.groupName}
              helperText={errorState.groupName}
            />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} style={{ background: '#FF5630', color: '#FFF' }}>
            Cancel
          </Button>
          <Button
            onClick={isEdit ? handleEditGroupSubmit : handleAddGroupSubmit}
            style={{ background: '#36F', color: '#FFF' }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Group</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{selectedGroup?.groupName}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} style={{ background: '#FF5630', color: '#FFF' }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {alertDetails?.msg && (
        <Alert
          severity={alertDetails.isSuccess ? 'success' : 'error'}
          onClose={() => setAlertDetails({})}
          style={{ position: 'fixed', top: 10, right: 10 }}
        >
          {alertDetails.msg}
        </Alert>
      )}
    </div>
  );
}
