import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Typography,
  Container,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  IconButton,
  Divider,
  Alert,
  Paper,
  Chip,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import axios from 'src/utils/axios';
import { useSnackbar } from 'src/components/snackbar';
import Label from 'src/components/label';

// ----------------------------------------------------------------------

export default function ManageEnablersPage() {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  // Enablers lists states
  const [enablers, setEnablers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Submissions drill-down states
  const [selectedEnabler, setSelectedEnabler] = useState<any | null>(null);
  const [enablerSubmissions, setEnablerSubmissions] = useState<any[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [openSubmissionsDialog, setOpenSubmissionsDialog] = useState(false);

  // Creation dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });

  // Review states
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Edit states
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editUser, setEditUser] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });

  const handleOpenEdit = (enabler: any) => {
    setEditUser({
      id: enabler.id,
      firstName: enabler.firstName,
      lastName: enabler.lastName || '',
      email: enabler.email || '',
      phoneNumber: enabler.phoneNumber,
      password: '',
    });
    setOpenEditDialog(true);
  };

  const handleEditEnabler = async () => {
    if (!editUser.firstName) {
      enqueueSnackbar('First Name is required', { variant: 'warning' });
      return;
    }

    if (editUser.password && !/^\d{4}$/.test(editUser.password)) {
      enqueueSnackbar('Enabler Login PIN must be exactly 4 digits', { variant: 'warning' });
      return;
    }

    setEditLoading(true);
    try {
      const payload: any = {
        id: editUser.id,
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        email: editUser.email,
        phoneNumber: editUser.phoneNumber,
        role: 'enabler',
      };
      if (editUser.password) {
        payload.password = editUser.password;
      }

      const response = await axios.post('/api/v1/admin/users/update', payload);

      if (response.data.success) {
        enqueueSnackbar('Enabler account updated successfully!', { variant: 'success' });
        setOpenEditDialog(false);
        fetchEnablers();
      }
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(error.message || 'Failed to update enabler', { variant: 'error' });
    } finally {
      setEditLoading(false);
    }
  };

  const fetchEnablers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/enabler/city/enablers');
      if (response.data.success) {
        setEnablers(response.data.data);
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load city enablers', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchEnablers();
  }, [fetchEnablers]);

  // Create Enabler user account
  const handleCreateEnabler = async () => {
    if (!newUser.firstName || !newUser.phoneNumber || !newUser.password) {
      enqueueSnackbar('Please fill all required fields', { variant: 'warning' });
      return;
    }

    if (!/^\d{4}$/.test(newUser.password)) {
      enqueueSnackbar('Enabler Login PIN must be exactly 4 digits', { variant: 'warning' });
      return;
    }

    setCreateLoading(true);
    try {
      const response = await axios.post('/api/v1/admin/users/create', {
        ...newUser,
        role: 'enabler',
      });

      if (response.data.success) {
        enqueueSnackbar('Enabler created successfully!', { variant: 'success' });
        setOpenCreateDialog(false);
        setNewUser({ firstName: '', lastName: '', email: '', phoneNumber: '', password: '' });
        fetchEnablers();
      }
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(error.message || 'Failed to create enabler', { variant: 'error' });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteEnabler = async (id: string) => {
    try {
      const response = await axios.delete(`/api/v1/admin/users/delete/${id}`);
      if (response.data.success) {
        enqueueSnackbar('Enabler deleted successfully!', { variant: 'success' });
        fetchEnablers();
      }
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(error.message || 'Failed to delete enabler', { variant: 'error' });
    }
  };

  // Drill down submissions
  const handleViewSubmissions = async (enabler: any) => {
    setSelectedEnabler(enabler);
    setOpenSubmissionsDialog(true);
    setSubsLoading(true);
    try {
      // Get all submissions of this enabler
      const response = await axios.get('/api/v1/enabler/my-submissions'); // Controller handles fetching enabler specific submissions in normal route, or we can fetch a full filtered list.
      // Wait, getMySubmissions returns enabler specific. In our backend Controller, we can allow City Managers to view list by adding a filter.
      // Let's check how getMySubmissions is implemented in Enabler.controller.js. It only filters by req.user.id.
      // Since City Manager wants to view this particular enabler's submissions, we can filter locally or write a small search.
      // Wait, in Enabler.controller.js getMySubmissions does enablerId: req.user.id.
      // Wait! Let's see. If the city manager gets submissions, we can query submissions for all enablers in their city.
      // Wait, we didn't add an endpoint to get all city submissions in Enabler.controller.js.
      // But wait! `EnablerOnboarding.findAll({ where: { cityId } })`! We can call that or query it if we write the code.
      // Let's check what we did. We did not write an endpoint for "get all submissions for City Manager", but wait,
      // let's look at `Enabler.controller.js`. We only wrote `getMySubmissions` and `getCityEnablers`.
      // Let's modify `Enabler.controller.js` to allow a city manager to filter by enablerId in `getMySubmissions` or create a new endpoint, OR make `getMySubmissions` check if req.user is city manager and allow passing `enablerId` in query.
      // Yes! That is extremely clever. If role is city_manager, allow `req.query.enablerId`.
      // Let's view `Enabler.controller.js` line 74:
      // ```js
      // async function getMySubmissions(req, res, next) {
      //   const user = req.user;
      //   const where = { enablerId: user.id }
      // ```
      // We can easily replace that to support city_manager filtering.
      // Let's check what submissions are returned.
      // Let's fetch the submissions list by hitting `/api/v1/enabler/my-submissions?enablerId=...` which will work perfectly if we update it.
      const res = await axios.get(`/api/v1/enabler/my-submissions`, {
        params: { enablerId: enabler.id }
      });
      if (res.data.success) {
        setEnablerSubmissions(res.data.data);
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to fetch enabler submissions', { variant: 'error' });
    } finally {
      setSubsLoading(false);
    }
  };

  // Review workflow: Approve
  const handleApprove = async (submissionId: string) => {
    reviewLoadingSubmit(submissionId, 'approve');
  };

  // Review workflow: Reject dialog
  const handleOpenReject = (submissionId: string) => {
    setSelectedSubmissionId(submissionId);
    setOpenRejectDialog(true);
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      enqueueSnackbar('Rejection reason is required', { variant: 'warning' });
      return;
    }
    if (selectedSubmissionId) {
      reviewLoadingSubmit(selectedSubmissionId, 'reject', rejectionReason);
    }
  };

  const reviewLoadingSubmit = async (submissionId: string, action: 'approve' | 'reject', reason?: string) => {
    setReviewLoading(true);
    try {
      const response = await axios.post('/api/v1/enabler/review', {
        submissionId,
        action,
        rejectionReason: reason,
      });

      if (response.data.success) {
        enqueueSnackbar(`Submission ${action}d successfully!`, { variant: 'success' });
        setOpenRejectDialog(false);
        setRejectionReason('');
        setSelectedSubmissionId(null);
        // Refresh enabler submissions list
        if (selectedEnabler) {
          handleViewSubmissions(selectedEnabler);
        }
        fetchEnablers(); // Refresh stats on main list
      }
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(error.message || 'Review submission failed', { variant: 'error' });
    } finally {
      setReviewLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'submitted':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Helmet>
        <title>Manage Enablers | City Manager Portal</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
          <Typography variant="h4">City Enablers Management</Typography>
          <Button
            variant="contained"
            onClick={() => setOpenCreateDialog(true)}
            startIcon={<Iconify icon="solar:user-plus-bold" />}
          >
            Create Enabler Account
          </Button>
        </Stack>

        {/* Enablers Table */}
        <Card>
          <CardHeader title="Field Executive Enablers" subheader="Onboarding executives assigned to your city scope" />
          <Divider />
          {loading ? (
            <LinearProgress />
          ) : enablers.length === 0 ? (
            <CardContent sx={{ p: 5, textAlign: 'center' }}>
              <Iconify icon="solar:users-group-rounded-bold-duotone" width={60} sx={{ color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">No enablers found for your city</Typography>
            </CardContent>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell align="center">Total Submitted</TableCell>
                    <TableCell align="center">Approved</TableCell>
                    <TableCell align="center">Rejected</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {enablers.map((row) => {
                    const stats = row.enablerStats || { totalSubmitted: 0, totalApproved: 0, totalRejected: 0 };
                    return (
                      <TableRow key={row.id} hover>
                        <TableCell>{`${row.firstName} ${row.lastName || ''}`}</TableCell>
                        <TableCell>{row.email || 'N/A'}</TableCell>
                        <TableCell>{row.phoneNumber}</TableCell>
                        <TableCell align="center"><strong>{stats.totalSubmitted}</strong></TableCell>
                        <TableCell align="center" sx={{ color: 'success.main' }}>{stats.totalApproved}</TableCell>
                        <TableCell align="center" sx={{ color: 'error.main' }}>{stats.totalRejected}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleViewSubmissions(row)}
                              startIcon={<Iconify icon="solar:eye-bold" />}
                            >
                              View Submissions
                            </Button>
                            <Button
                              size="small"
                              color="secondary"
                              variant="contained"
                              onClick={() => handleOpenEdit(row)}
                              startIcon={<Iconify icon="solar:pen-bold" />}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              variant="contained"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this enabler?')) {
                                  handleDeleteEnabler(row.id);
                                }
                              }}
                              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>

        {/* Create Enabler Dialog */}
        <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} fullWidth maxWidth="xs">
          <DialogTitle>Create Enabler Account</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                label="First Name"
                required
                fullWidth
                value={newUser.firstName}
                onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
              />
              <TextField
                label="Last Name"
                fullWidth
                value={newUser.lastName}
                onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
              />
              <TextField
                label="Phone Number (10 digits)"
                required
                fullWidth
                placeholder="e.g. 9876543210"
                value={newUser.phoneNumber}
                onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
              />
              <TextField
                label="Email (Optional)"
                fullWidth
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
              <TextField
                label="Login PIN / Password"
                required
                fullWidth
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateDialog(false)} color="inherit">
              Cancel
            </Button>
            <LoadingButton variant="contained" onClick={handleCreateEnabler} loading={createLoading}>
              Create Account
            </LoadingButton>
          </DialogActions>
        </Dialog>

        {/* Edit Enabler Dialog */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="xs">
          <DialogTitle>Edit Enabler Account</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                label="First Name"
                required
                fullWidth
                value={editUser.firstName}
                onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
              />
              <TextField
                label="Last Name"
                fullWidth
                value={editUser.lastName}
                onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
              />
              <TextField
                label="Phone Number"
                required
                fullWidth
                disabled
                value={editUser.phoneNumber}
              />
              <TextField
                label="Email"
                fullWidth
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              />
              <TextField
                label="PIN / Password"
                fullWidth
                type="password"
                placeholder="Leave blank to keep current password"
                value={editUser.password}
                onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)} color="inherit">
              Cancel
            </Button>
            <LoadingButton variant="contained" onClick={handleEditEnabler} loading={editLoading}>
              Save Changes
            </LoadingButton>
          </DialogActions>
        </Dialog>

        {/* View Submissions Dialog */}
        <Dialog open={openSubmissionsDialog} onClose={() => setOpenSubmissionsDialog(false)} fullWidth maxWidth="md">
          <DialogTitle>
            Submissions by {selectedEnabler?.firstName} {selectedEnabler?.lastName}
          </DialogTitle>
          <DialogContent dividers>
            {subsLoading ? (
              <LinearProgress />
            ) : enablerSubmissions.length === 0 ? (
              <Box sx={{ p: 5, textAlign: 'center' }}>
                <Typography color="text.secondary">No merchant submissions found for this enabler.</Typography>
              </Box>
            ) : (
              <Stack spacing={3}>
                {enablerSubmissions.map((sub) => (
                  <Paper key={sub.id} variant="outlined" sx={{ p: 3, bgcolor: 'background.neutral' }}>
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6">{sub.merchant?.integrationName}</Typography>
                        <Label color={getStatusColor(sub.status)}>{sub.status.toUpperCase()}</Label>
                      </Stack>
                      <Divider />
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary">Vertical</Typography>
                          <Typography variant="body2">{sub.merchant?.verticalType}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary">Phone</Typography>
                          <Typography variant="body2">{sub.merchant?.phoneNumber}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary">Location coordinates</Typography>
                          <Typography variant="body2">
                            {sub.gpsLatitude && sub.gpsLongitude ? `${sub.gpsLatitude}, ${sub.gpsLongitude}` : 'N/A'}
                          </Typography>
                        </Grid>
                      </Grid>

                      {sub.fieldNotes && (
                        <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">Executive's Notes</Typography>
                          <Typography variant="body2">{sub.fieldNotes}</Typography>
                        </Box>
                      )}

                      {/* Documents Section */}
                      {sub.merchant?.documents && sub.merchant.documents.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>Submitted Documents</Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {sub.merchant.documents.map((doc: any, idx: number) => (
                              <Chip
                                key={idx}
                                label={doc.fileName || doc.type}
                                size="small"
                                icon={<Iconify icon="solar:document-bold" />}
                                onClick={() => window.open(doc.url, '_blank')}
                                clickable
                              />
                            ))}
                          </Stack>
                        </Box>
                      )}

                      {/* UPI Info */}
                      {sub.merchant?.upi && (
                        <Box>
                          <Typography variant="subtitle2">UPI Settings</Typography>
                          <Typography variant="body2">
                            <strong>UPI ID:</strong> {sub.merchant.upi.vpa || 'N/A'} (Name: {sub.merchant.upi.merchantName})
                          </Typography>
                        </Box>
                      )}

                      {sub.status === 'submitted' && (
                        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 1 }}>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleOpenReject(sub.id)}
                            startIcon={<Iconify icon="solar:close-square-bold" />}
                          >
                            Reject
                          </Button>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleApprove(sub.id)}
                            startIcon={<Iconify icon="solar:check-square-bold" />}
                          >
                            Approve & Activate
                          </Button>
                        </Stack>
                      )}

                      {sub.status === 'rejected' && sub.rejectionReason && (
                        <Alert severity="error">
                          <strong>Rejection Reason:</strong> {sub.rejectionReason}
                        </Alert>
                      )}
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSubmissionsDialog(false)} color="inherit">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} fullWidth maxWidth="xs">
          <DialogTitle>Reject Submission</DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Please specify the reasons for rejecting this merchant onboarding submission. This will be visible to the executive.
            </Typography>
            <TextField
              label="Rejection Reason"
              required
              fullWidth
              multiline
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRejectDialog(false)} color="inherit">
              Cancel
            </Button>
            <Button variant="contained" onClick={handleReject} color="error">
              Submit Rejection
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
