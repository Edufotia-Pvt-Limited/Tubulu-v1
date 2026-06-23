import { useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
// components
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
import { useSnackbar } from 'src/components/snackbar';
// utils
import axios from 'src/utils/axios';
// types
// types
import { IMerchantItem } from 'src/types/merchant';
// auth
import { useAuthContext } from 'src/auth/hooks';
//

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  merchant: IMerchantItem | null;
  onApprove: (id: string, isApproved: boolean) => void;
  onSuspend?: (id: string, isSuspended: boolean) => void;
  onRefresh?: VoidFunction;
};

export default function MerchantDetailsDrawer({
  open,
  onClose,
  merchant,
  onApprove,
  onSuspend,
  onRefresh,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const canManageVoiceAI = user?.role === 'super_admin' || user?.role === 'regional_manager';

  const [kycLoading, setKycLoading] = useState(false);

  if (!merchant) return null;

  const trustScore = merchant.trustScore || 0;
  const trustColor = trustScore >= 80 ? 'success' : trustScore >= 50 ? 'warning' : 'error';

  const handleRunKYC = async () => {
    try {
      setKycLoading(true);
      const res = await axios.post(`/api/v1/admin/integration/${merchant.id}/kyc`);
      const { trustScore: newScore, isApproved } = res.data.data;
      enqueueSnackbar(
        `KYC complete — Trust Score: ${newScore}%${isApproved ? ' · Auto-Approved! ✅' : ''}`,
        { variant: isApproved ? 'success' : 'info' }
      );
      onRefresh?.();
    } catch (err: any) {
      enqueueSnackbar(err.message || 'KYC failed', { variant: 'error' });
    } finally {
      setKycLoading(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 420, p: 3 } }}
    >
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6">{merchant.integrationName}</Typography>
              {merchant.isSuspended && (
                <Label color="error" variant="filled">
                  Suspended
                </Label>
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary">Merchant Verification</Typography>
          </Box>
          <IconButton onClick={onClose}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>

        <Divider />

        {/* 🛡️ Trust Score Card */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Trust Score</Typography>
            <Label variant="soft" color={trustColor}>{trustScore}%</Label>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={trustScore}
            color={trustColor}
            sx={{ borderRadius: 1, height: 8 }}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
            <Tooltip title="GST Verified">
              <Label variant="soft" color={merchant.isGstVerified ? 'success' : 'default'} sx={{ cursor: 'default' }}>
                <Iconify icon={merchant.isGstVerified ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} sx={{ mr: 0.5 }} />
                GST
              </Label>
            </Tooltip>
            <Tooltip title="PAN Verified">
              <Label variant="soft" color={merchant.isPanVerified ? 'success' : 'default'} sx={{ cursor: 'default' }}>
                <Iconify icon={merchant.isPanVerified ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} sx={{ mr: 0.5 }} />
                PAN
              </Label>
            </Tooltip>
            <Tooltip title="Aadhaar Verified">
              <Label variant="soft" color={merchant.isAadharVerified ? 'success' : 'default'} sx={{ cursor: 'default' }}>
                <Iconify icon={merchant.isAadharVerified ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} sx={{ mr: 0.5 }} />
                Aadhaar
              </Label>
            </Tooltip>
          </Stack>
        </Paper>

         <Stack spacing={2}>
          <Typography variant="subtitle2">Store Details</Typography>
          <Stack spacing={1.5}>
            <DetailItem label="Phone" value={merchant.phoneNumber} />
            {canManageVoiceAI && (
              <DetailItem label="PSTN DID Number" value={merchant.pstnDID || 'None'} />
            )}
            <DetailItem label="Category" value={merchant.category} />
            <DetailItem label="Status" value={merchant.isSuspended ? 'Suspended' : (merchant.isApproved ? 'Approved' : 'Pending Verification')} />
            <DetailItem label="Joined" value={new Date(merchant.createdAt).toLocaleDateString()} />
            <DetailItem label="Location" value={`${merchant.city || ''}, ${merchant.state || ''}`} />
          </Stack>
        </Stack>

        <Stack spacing={2}>
          <Typography variant="subtitle2">Delivery Settings</Typography>
          <Stack spacing={1.5}>
            {merchant.pidge?.enabled ? (
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Pidge Integration</Typography>
                <Label color="success" variant="soft">
                  Connected ({merchant.pidge.environment === 'production' ? 'Production' : 'Sandbox'})
                </Label>
              </Stack>
            ) : (
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Pidge Integration</Typography>
                <Label color="default" variant="soft">Not Configured</Label>
              </Stack>
            )}
            {merchant.pidge?.enabled ? (
              <DetailItem label="Delivery Fee" value="Live Pidge Quote" />
            ) : (
              <DetailItem label="Delivery Fee" value={`₹${merchant.deliveryFee ?? '0.00'}`} />
            )}
            <DetailItem label="Min Order Value" value={`₹${merchant.minimumOrderValue ?? '0.00'}`} />
            <DetailItem label="Est. Delivery Time" value={`${merchant.estimatedDeliveryTime ?? '30'} mins`} />
          </Stack>
        </Stack>

        <Stack spacing={2}>
          <Typography variant="subtitle2">KYC Information</Typography>
          <Stack spacing={1.5}>
            <DetailItem label="GST No" value={merchant.gstNumber || 'N/A'} />
            <DetailItem label="PAN No" value={merchant.panNumber || 'N/A'} />
            <DetailItem label="Aadhaar No" value={merchant.aadharNumber || 'N/A'} />
          </Stack>
        </Stack>

        <Stack spacing={2}>
          <Typography variant="subtitle2">Documents</Typography>
          {merchant.documents && merchant.documents.length > 0 ? (
            <Stack spacing={1}>
              {merchant.documents.map((doc, idx) => (
                <Paper key={idx} variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, mr: 1 }}>
                    <Iconify 
                      icon={doc.url ? 'solar:file-check-bold' : (doc.fileName?.toLowerCase().endsWith('.pdf') ? 'solar:file-text-bold' : 'solar:gallery-bold')} 
                      color="primary.main" 
                      sx={{ flexShrink: 0 }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" fontWeight="bold" display="block" noWrap>{doc.type}</Typography>
                      {doc.fileName && (
                        <Typography variant="caption" color="text.secondary" display="block" noWrap sx={{ fontSize: '0.65rem' }}>
                          {doc.fileName}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                    <Link href={doc.url} target="_blank" rel="noopener">
                      <Button size="small" variant="soft">View</Button>
                    </Link>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = doc.url;
                        link.setAttribute('download', doc.fileName || `${doc.type}_doc`);
                        link.setAttribute('target', '_blank');
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <Iconify icon="solar:download-bold" />
                    </IconButton>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">No documents uploaded.</Typography>
          )}
        </Stack>

        <Stack spacing={1.5} sx={{ mt: 'auto', pt: 3 }}>
          {/* 🛡️ Re-run KYC Button */}
          <Button
            fullWidth
            variant="outlined"
            color="info"
            size="medium"
            disabled={kycLoading}
            startIcon={<Iconify icon="solar:shield-check-bold" />}
            onClick={handleRunKYC}
          >
            {kycLoading ? 'Running KYC...' : 'Re-run KYC Pipeline'}
          </Button>



          {onSuspend && (
            <Button
              fullWidth
              variant={merchant.isSuspended ? "contained" : "outlined"}
              color="warning"
              size="large"
              startIcon={<Iconify icon={merchant.isSuspended ? "solar:play-circle-bold" : "solar:pause-circle-bold"} />}
              onClick={() => {
                onSuspend(merchant.id, !merchant.isSuspended);
              }}
            >
              {merchant.isSuspended ? 'Unsuspend Vendor' : 'Suspend Vendor'}
            </Button>
          )}

          {!merchant.isApproved ? (
            <Button
              fullWidth
              variant="contained"
              color="success"
              size="large"
              startIcon={<Iconify icon="solar:check-read-linear" />}
              onClick={() => onApprove(merchant.id, true)}
            >
              Approve Merchant
            </Button>
          ) : (
            <Button
              fullWidth
              variant="outlined"
              color="error"
              size="large"
              startIcon={<Iconify icon="solar:close-circle-bold" />}
              onClick={() => onApprove(merchant.id, false)}
            >
              Revoke Approval
            </Button>
          )}
        </Stack>
      </Stack>


    </Drawer>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="caption" fontWeight="bold">{value}</Typography>
    </Stack>
  );
}
