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
  Alert,
  Chip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Divider,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import axios from 'src/utils/axios';
import { useSnackbar } from 'src/components/snackbar';
import Label from 'src/components/label';

// ----------------------------------------------------------------------

export default function EnablerSubmissionsPage() {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalSubmitted: 0, totalApproved: 0, totalRejected: 0, totalPending: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // Dialog for re-uploading docs
  const [openReupload, setOpenReupload] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<any | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [reuploadedDocs, setReuploadedDocs] = useState<Array<{ type: string; url: string; fileName: string }>>([]);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/enabler/my-submissions');
      if (response.data.success) {
        setSubmissions(response.data.data);

        // Compute local stats from submissions
        const data = response.data.data;
        const totalSubmitted = data.length;
        const totalApproved = data.filter((s: any) => s.status === 'approved').length;
        const totalRejected = data.filter((s: any) => s.status === 'rejected').length;
        const totalPending = data.filter((s: any) => s.status === 'submitted' || s.status === 'draft').length;

        setStats({ totalSubmitted, totalApproved, totalRejected, totalPending });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load submissions', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleOpenReupload = (item: any) => {
    setSelectedMerchant(item);
    setReuploadedDocs(item.merchant?.documents || []);
    setOpenReupload(true);
  };

  const handleCloseReupload = () => {
    setOpenReupload(false);
    setSelectedMerchant(null);
    setReuploadedDocs([]);
  };

  const handleSimulatedFileUpload = (docType: string, file: File | null) => {
    if (!file) return;

    setUploadingDoc(docType);
    setUploadProgress(15);

    const timer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(async () => {
            const simulatedUrl = `https://tubulu-kyc.s3.amazonaws.com/uploads/${docType}_${Date.now()}_${file.name}`;
            
            try {
              // Call API to upload doc and attach to merchant
              await axios.post('/api/v1/enabler/upload-doc', {
                integrationId: selectedMerchant?.merchant?.id,
                type: docType,
                url: simulatedUrl,
                fileName: file.name
              });

              setReuploadedDocs((prevDocs) => {
                const filtered = prevDocs.filter((d) => d.type !== docType);
                return [...filtered, { type: docType, url: simulatedUrl, fileName: file.name }];
              });

              enqueueSnackbar(`${file.name} attached to application!`, { variant: 'success' });
            } catch (err: any) {
              console.error(err);
              enqueueSnackbar(err.message || 'Doc upload integration error', { variant: 'error' });
            } finally {
              setUploadingDoc(null);
              setUploadProgress(0);
            }
          }, 300);
          return 100;
        }
        return prev + 35;
      });
    }, 200);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'submitted':
        return 'info';
      case 'needs_reupload':
        return 'warning';
      default:
        return 'default';
    }
  };

  const filteredSubmissions = filterStatus === 'all'
    ? submissions
    : submissions.filter((s: any) => {
        if (filterStatus === 'pending') return s.status === 'submitted' || s.status === 'draft';
        return s.status === filterStatus;
      });

  return (
    <>
      <Helmet>
        <title>My Submissions | Tubulu Enabler Portal</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
          <Typography variant="h4">My Submissions Portfolio</Typography>
          <Button variant="contained" href="/dashboard/enabler/onboard" startIcon={<Iconify icon="solar:add-circle-bold" />}>
            New Onboarding
          </Button>
        </Stack>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Total Submitted</Typography>
              <Typography variant="h3" sx={{ mt: 1 }}>{stats.totalSubmitted}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ color: 'success.main' }}>Approved & Active</Typography>
              <Typography variant="h3" sx={{ mt: 1, color: 'success.main' }}>{stats.totalApproved}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ color: 'info.main' }}>Pending Review</Typography>
              <Typography variant="h3" sx={{ mt: 1, color: 'info.main' }}>{stats.totalPending}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ color: 'error.main' }}>Rejected</Typography>
              <Typography variant="h3" sx={{ mt: 1, color: 'error.main' }}>{stats.totalRejected}</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs Filter */}
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={filterStatus}
            onChange={(e, val) => setFilterStatus(val)}
            sx={{ px: 2, bgcolor: 'background.neutral' }}
          >
            <Tab label={`All (${submissions.length})`} value="all" />
            <Tab label={`Pending (${stats.totalPending})`} value="pending" />
            <Tab label={`Approved (${stats.totalApproved})`} value="approved" />
            <Tab label={`Rejected (${stats.totalRejected})`} value="rejected" />
          </Tabs>
        </Card>

        {/* Submissions List */}
        {loading ? (
          <LinearProgress />
        ) : filteredSubmissions.length === 0 ? (
          <Card sx={{ p: 5, textAlign: 'center' }}>
            <Iconify icon="solar:clipboard-remove-bold-duotone" width={60} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No merchant onboarding submissions found</Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {filteredSubmissions.map((item: any) => (
              <Grid item xs={12} md={6} key={item.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardHeader
                    title={item.merchant?.integrationName || 'Unknown Business'}
                    subheader={`Submitted: ${new Date(item.submittedAt || item.createdAt).toLocaleDateString()}`}
                    action={
                      <Label color={getStatusColor(item.status)}>
                        {item.status.toUpperCase()}
                      </Label>
                    }
                  />
                  <Divider sx={{ my: 1 }} />
                  <CardContent sx={{ flexGrow: 1, pt: 1 }}>
                    <Stack spacing={2}>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Vertical</Typography>
                          <Typography variant="body2">{item.merchant?.verticalType}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                          <Typography variant="body2">{item.merchant?.phoneNumber}</Typography>
                        </Grid>
                        <Grid item xs={12} sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">City Scope</Typography>
                          <Typography variant="body2">{item.city?.name || 'N/A'}</Typography>
                        </Grid>
                      </Grid>

                      {item.fieldNotes && (
                        <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary">Field Notes</Typography>
                          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>{item.fieldNotes}</Typography>
                        </Box>
                      )}

                      {item.status === 'rejected' && item.rejectionReason && (
                        <Alert severity="error" sx={{ py: 0.5 }}>
                          <Typography variant="subtitle2">Rejection Reason:</Typography>
                          <Typography variant="body2">{item.rejectionReason}</Typography>
                        </Alert>
                      )}

                      {item.status === 'rejected' && (
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleOpenReupload(item)}
                          startIcon={<Iconify icon="solar:upload-square-bold" />}
                        >
                          Re-upload Documents
                        </Button>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Dialog for Doc Re-upload */}
        <Dialog open={openReupload} onClose={handleCloseReupload} fullWidth maxWidth="sm">
          <DialogTitle>Re-upload Verification Scans</DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              Your submission for <strong>{selectedMerchant?.merchant?.integrationName}</strong> was rejected. Please upload the requested corrections below.
            </Typography>

            <Stack spacing={2}>
              {['GST Certificate', 'PAN Card', 'Aadhaar Card', 'Shop Establishment License'].map((docType) => {
                const doc = reuploadedDocs.find((d) => d.type === docType);
                const isUploading = uploadingDoc === docType;
                return (
                  <Card key={docType} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle2">{docType}</Typography>
                        {doc ? (
                          <Typography variant="caption" sx={{ color: 'success.main' }}>
                            File: {doc.fileName || 'document.pdf'}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.disabled">
                            Missing Scan
                          </Typography>
                        )}
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {isUploading && (
                          <Box sx={{ width: 80 }}>
                            <LinearProgress variant="determinate" value={uploadProgress} />
                          </Box>
                        )}
                        <Button
                          variant="outlined"
                          size="small"
                          component="label"
                          disabled={!!uploadingDoc}
                        >
                          Select File
                          <input
                            type="file"
                            hidden
                            accept="image/*,application/pdf"
                            onChange={(e) =>
                              handleSimulatedFileUpload(docType, e.target.files ? e.target.files[0] : null)
                            }
                          />
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>
                );
              })}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseReupload} color="inherit">
              Cancel
            </Button>
            <Button variant="contained" onClick={handleCloseReupload} color="primary">
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
