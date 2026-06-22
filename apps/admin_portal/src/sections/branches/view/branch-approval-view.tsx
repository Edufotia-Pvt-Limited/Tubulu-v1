import { useState, useCallback, useEffect } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
// routes
import { paths } from 'src/routes/paths';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSnackbar } from 'src/components/snackbar';
// utils
import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export default function BranchApprovalView() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingBranches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(endpoints.admin.pendingBranches);
      if (response?.data?.success) {
        setTableData(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch pending branches:', error);
      enqueueSnackbar('Failed to load pending branches', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchPendingBranches();
  }, [fetchPendingBranches]);

  const handleApprove = async (id: string) => {
    try {
      const response = await axios.patch(endpoints.admin.approveBranch(id), { isApproved: true });
      if (response?.data?.success) {
        enqueueSnackbar('Branch approved successfully', { variant: 'success' });
        fetchPendingBranches();
      }
    } catch (error: any) {
      console.error('Failed to approve branch:', error);
      enqueueSnackbar(error?.message || 'Failed to approve branch', { variant: 'error' });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await axios.patch(endpoints.admin.approveBranch(id), { isApproved: false });
      if (response?.data?.success) {
        enqueueSnackbar('Branch rejected successfully', { variant: 'success' });
        fetchPendingBranches();
      }
    } catch (error: any) {
      console.error('Failed to reject branch:', error);
      enqueueSnackbar(error?.message || 'Failed to reject branch', { variant: 'error' });
    }
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Branch Approvals"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Branch Approvals' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <TableContainer component={Paper} sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Branch Name</TableCell>
                  <TableCell>Parent / HQ Brand</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                      <Typography variant="body2" color="text.secondary">Loading pending branches...</Typography>
                    </TableCell>
                  </TableRow>
                ) : tableData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                      <Typography variant="body2" color="text.secondary">No pending branches found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  tableData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell sx={{ fontWeight: 'bold' }}>{row.integrationName}</TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar alt={row.parent?.integrationName} src={row.parent?.logo} sx={{ width: 36, height: 36 }} />
                          <Typography variant="subtitle2">{row.parent?.integrationName || 'N/A'}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {[row.addressLine, row.city, row.state].filter(Boolean).join(', ') || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleApprove(row.id)}
                            startIcon={<Iconify icon="solar:check-read-linear" />}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleReject(row.id)}
                            startIcon={<Iconify icon="solar:close-circle-linear" />}
                          >
                            Reject
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
      </Card>
    </Container>
  );
}
