import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Divider,
  CircularProgress, Chip, Tab, Tabs, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
  IconButton, Tooltip,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { axios } from 'src/utils/axios';
import { BiEdit, BiBlock, BiCheckCircle } from 'react-icons/bi';

const statusColor = (status: string, isSuspended?: boolean) => {
  if (isSuspended) return { bgcolor: '#fee2e2', color: '#991b1b', label: '🔴 Suspended' };
  if (status === 'ACTIVE') return { bgcolor: '#dcfce7', color: '#166534', label: '🟢 Active' };
  if (status === 'EXPIRED') return { bgcolor: '#fee2e2', color: '#991b1b', label: '🔴 Expired' };
  return { bgcolor: '#fef3c7', color: '#92400e', label: '🟡 Pending' };
};

const daysLeftColor = (days: number) => {
  if (days <= 0) return '#ef4444';
  if (days <= 7) return '#f59e0b';
  return '#10b981';
};

export default function SuperAdminBilling() {
  const [activeTab, setActiveTab] = useState(0);
  const [plans, setPlans] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [tokenPrice, setTokenPrice] = useState('500');
  const [isLoading, setIsLoading] = useState(true);

  // Plan form
  const [newPlan, setNewPlan] = useState({ name: '', description: '', price: '', durationInDays: '' });
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);

  // Edit plan modal
  const [editPlan, setEditPlan] = useState<any>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Assign plan modal
  const [assignModal, setAssignModal] = useState<{ open: boolean; integrationId: string; merchantName: string }>({
    open: false, integrationId: '', merchantName: '',
  });
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const results = await Promise.all([
        axios.get('/api/v1/billing/plans'),
        axios.get('/api/v1/billing/subscriptions'),
        axios.get('/api/v1/billing/wallets'),
        axios.get('/api/v1/billing/token-price'),
      ]);
      const plansRes = results[0];
      const subsRes = results[1];
      const walletsRes = results[2];
      const priceRes = results[3];
      setPlans(plansRes.data?.data || []);
      setSubscriptions(subsRes.data?.data || []);
      setWallets(walletsRes.data?.data || []);
      setTokenPrice(String(priceRes.data?.data?.pricePer100k || 500));
    } catch (err) {
      enqueueSnackbar('Failed to load billing data', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreatePlan = async () => {
    if (!newPlan.name || !newPlan.price || !newPlan.durationInDays) return;
    try {
      setIsCreatingPlan(true);
      await axios.post('/api/v1/billing/plans', {
        name: newPlan.name,
        description: newPlan.description,
        price: parseFloat(newPlan.price),
        durationInDays: parseInt(newPlan.durationInDays, 10),
      });
      enqueueSnackbar('Plan created!', { variant: 'success' });
      setNewPlan({ name: '', description: '', price: '', durationInDays: '' });
      fetchAll();
    } catch { enqueueSnackbar('Failed to create plan', { variant: 'error' }); }
    finally { setIsCreatingPlan(false); }
  };

  const handleEditSave = async () => {
    try {
      setIsSavingEdit(true);
      await axios.put(`/api/v1/billing/plans/${editPlan.id}`, {
        name: editPlan.name,
        description: editPlan.description,
        price: parseFloat(editPlan.price),
        durationInDays: parseInt(editPlan.durationDays, 10),
      });
      enqueueSnackbar('Plan updated!', { variant: 'success' });
      setEditPlan(null);
      fetchAll();
    } catch { enqueueSnackbar('Failed to update plan', { variant: 'error' }); }
    finally { setIsSavingEdit(false); }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await axios.patch(`/api/v1/billing/plans/${id}/deactivate`);
      enqueueSnackbar('Plan deactivated', { variant: 'success' });
      fetchAll();
    } catch { enqueueSnackbar('Failed to deactivate', { variant: 'error' }); }
  };

  const handleUpdatePrice = async () => {
    try {
      setIsUpdatingPrice(true);
      await axios.post('/api/v1/billing/token-price', { pricePer100k: parseFloat(tokenPrice) });
      enqueueSnackbar('Token price updated!', { variant: 'success' });
    } catch { enqueueSnackbar('Failed to update price', { variant: 'error' }); }
    finally { setIsUpdatingPrice(false); }
  };

  const handleAssignPlan = async () => {
    if (!selectedPlanId) return;
    try {
      setIsAssigning(true);
      await axios.post('/api/v1/billing/subscriptions/assign', {
        integrationId: assignModal.integrationId,
        planId: selectedPlanId,
      });
      enqueueSnackbar('Plan assigned! Merchant un-suspended.', { variant: 'success' });
      setAssignModal({ open: false, integrationId: '', merchantName: '' });
      setSelectedPlanId('');
      fetchAll();
    } catch { enqueueSnackbar('Failed to assign plan', { variant: 'error' }); }
    finally { setIsAssigning(false); }
  };

  const handleExpire = async (subId: string) => {
    try {
      await axios.patch(`/api/v1/billing/subscriptions/expire/${subId}`);
      enqueueSnackbar('Subscription expired & merchant suspended', { variant: 'warning' });
      fetchAll();
    } catch { enqueueSnackbar('Failed to expire subscription', { variant: 'error' }); }
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, pb: 6 }}>
      <Typography fontSize={24} fontWeight={800} mb={0.5}>Billing & Plans</Typography>
      <Typography fontSize={14} color="text.secondary" mb={3}>
        Manage subscription plans, assign merchants, and configure token pricing.
      </Typography>

      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Subscription Plans" />
        <Tab label={`Merchant Subscriptions (${subscriptions.length})`} />
        <Tab label="Wallet Overview" />
      </Tabs>

      {/* ── TAB 0: PLANS ─────────────────────────────────────────────── */}
      {activeTab === 0 && (
        <Box>
          {/* Token Pricing */}
          <Card sx={{ mb: 4, borderRadius: 3, border: '1px solid #e5e7eb' }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography fontSize={17} fontWeight={700} mb={2}>Global AI Token Pricing</Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                  label="Price per 100,000 Tokens (₹)" type="number"
                  value={tokenPrice} onChange={(e) => setTokenPrice(e.target.value)}
                  sx={{ width: 280 }}
                  helperText={`Merchant pays ₹${tokenPrice || 0} → gets 100,000 tokens`}
                />
                <Button variant="contained" onClick={handleUpdatePrice} disabled={isUpdatingPrice} sx={{ height: 48 }}>
                  {isUpdatingPrice ? 'Updating...' : 'Update Price'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Create Plan */}
          <Card sx={{ mb: 4, borderRadius: 3, border: '1px solid #e5e7eb' }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography fontSize={17} fontWeight={700} mb={2}>Create New Plan</Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
                <TextField label="Plan Name *" value={newPlan.name} onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })} />
                <TextField label="Price (₹) *" type="number" value={newPlan.price} onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })} />
                <TextField label="Duration (Days) *" type="number" value={newPlan.durationInDays} onChange={(e) => setNewPlan({ ...newPlan, durationInDays: e.target.value })}
                  helperText="e.g. 30 = 1 month, 90 = 3 months, 365 = 1 year" />
                <TextField label="Description" value={newPlan.description} onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })} />
              </Box>
              <Button variant="contained" color="success" onClick={handleCreatePlan} disabled={isCreatingPlan}>
                {isCreatingPlan ? 'Creating...' : 'Create Plan'}
              </Button>
            </CardContent>
          </Card>

          {/* Plans Table */}
          <Card sx={{ borderRadius: 3, border: '1px solid #e5e7eb' }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography fontSize={17} fontWeight={700} mb={2}>Active Plans</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Plan Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {plans.map((plan) => (
                      <TableRow key={plan.id} hover>
                        <TableCell>{plan.name}</TableCell>
                        <TableCell>₹{plan.price}</TableCell>
                        <TableCell>{plan.durationDays} days</TableCell>
                        <TableCell>
                          <Chip
                            label={plan.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            sx={{ bgcolor: plan.isActive ? '#dcfce7' : '#f3f4f6', color: plan.isActive ? '#166534' : '#6b7280', fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit Plan">
                              <IconButton size="small" onClick={() => setEditPlan({ ...plan })}>
                                <BiEdit />
                              </IconButton>
                            </Tooltip>
                            {plan.isActive && (
                              <Tooltip title="Deactivate">
                                <IconButton size="small" color="error" onClick={() => handleDeactivate(plan.id)}>
                                  <BiBlock />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                    {plans.length === 0 && (
                      <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>No plans created yet.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* ── TAB 1: MERCHANT SUBSCRIPTIONS ────────────────────────────── */}
      {activeTab === 1 && (
        <Card sx={{ borderRadius: 3, border: '1px solid #e5e7eb' }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Typography fontSize={17} fontWeight={700} mb={2}>All Merchant Subscriptions</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Merchant</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Plan</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Valid Until</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Days Left</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subscriptions.map((sub) => {
                    const s = statusColor(sub.status, sub.isSuspended);
                    const isExpiring = sub.daysLeft <= 7 && sub.daysLeft > 0 && sub.status === 'ACTIVE';
                    return (
                      <TableRow key={sub.id} hover>
                        <TableCell>
                          <Typography fontSize={13} fontWeight={600}>{sub.merchantName}</Typography>
                          <Typography fontSize={12} color="text.secondary">{sub.merchantPhone}</Typography>
                        </TableCell>
                        <TableCell>{sub.planName}</TableCell>
                        <TableCell>
                          <Chip label={isExpiring ? '🟡 Expiring Soon' : s.label} size="small"
                            sx={{ bgcolor: isExpiring ? '#fef3c7' : s.bgcolor, color: isExpiring ? '#92400e' : s.color, fontWeight: 600 }} />
                        </TableCell>
                        <TableCell sx={{ fontSize: 13 }}>
                          {sub.validUntil ? new Date(sub.validUntil).toLocaleDateString('en-IN') : '—'}
                        </TableCell>
                        <TableCell>
                          <Typography fontSize={13} fontWeight={700} color={daysLeftColor(sub.daysLeft)}>
                            {sub.daysLeft > 0 ? `${sub.daysLeft}d` : 'Expired'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button size="small" variant="outlined" onClick={() => {
                              setAssignModal({ open: true, integrationId: sub.integrationId, merchantName: sub.merchantName });
                            }}>
                              {sub.status === 'EXPIRED' || sub.isSuspended ? 'Renew' : 'Reassign'}
                            </Button>
                            {sub.status === 'ACTIVE' && (
                              <Button size="small" variant="outlined" color="error" onClick={() => handleExpire(sub.id)}>
                                Expire
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {subscriptions.length === 0 && (
                    <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No subscriptions found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* ── TAB 2: WALLET OVERVIEW ───────────────────────────────────── */}
      {activeTab === 2 && (
        <Card sx={{ borderRadius: 3, border: '1px solid #e5e7eb' }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Typography fontSize={17} fontWeight={700} mb={1}>Merchant Wallet Overview</Typography>
            <Typography fontSize={13} color="text.secondary" mb={2}>Sorted by lowest token balance first. Red = below 1,000 tokens.</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Merchant</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Token Balance</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Delivery Balance</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Suspended</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {wallets.map((w) => (
                    <TableRow key={w.id} hover>
                      <TableCell>
                        <Typography fontSize={13} fontWeight={600}>{w.integration?.integrationName || '—'}</Typography>
                        <Typography fontSize={12} color="text.secondary">{w.integration?.phoneNumber}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontSize={13} fontWeight={700} color={w.tokenBalance < 1000 ? '#ef4444' : '#10b981'}>
                          {w.tokenBalance?.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>₹{parseFloat(w.deliveryCashBalance || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip label={w.integration?.isSuspended ? 'Yes' : 'No'} size="small"
                          sx={{ bgcolor: w.integration?.isSuspended ? '#fee2e2' : '#dcfce7', color: w.integration?.isSuspended ? '#991b1b' : '#166534', fontWeight: 600 }} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {wallets.length === 0 && (
                    <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>No wallets found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* ── EDIT PLAN MODAL ─────────────────────────────────────────── */}
      <Dialog open={!!editPlan} onClose={() => setEditPlan(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Plan</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Plan Name" value={editPlan?.name || ''} onChange={(e) => setEditPlan({ ...editPlan, name: e.target.value })} />
          <TextField label="Price (₹)" type="number" value={editPlan?.price || ''} onChange={(e) => setEditPlan({ ...editPlan, price: e.target.value })} />
          <TextField label="Duration (Days)" type="number" value={editPlan?.durationDays || ''} onChange={(e) => setEditPlan({ ...editPlan, durationDays: e.target.value })} />
          <TextField label="Description" value={editPlan?.description || ''} onChange={(e) => setEditPlan({ ...editPlan, description: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setEditPlan(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave} disabled={isSavingEdit}>{isSavingEdit ? 'Saving...' : 'Save Changes'}</Button>
        </DialogActions>
      </Dialog>

      {/* ── ASSIGN PLAN MODAL ───────────────────────────────────────── */}
      <Dialog open={assignModal.open} onClose={() => setAssignModal({ ...assignModal, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>Assign / Renew Plan — {assignModal.merchantName}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <FormControl fullWidth>
            <InputLabel>Select Plan</InputLabel>
            <Select value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value)} label="Select Plan">
              {plans.filter((p) => p.isActive).map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name} — ₹{p.price} / {p.durationDays} days
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography fontSize={13} color="text.secondary" mt={2}>
            This will expire any current active subscription and assign the selected plan from today.
            If the merchant is suspended, they will be automatically un-suspended.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setAssignModal({ ...assignModal, open: false })}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleAssignPlan} disabled={isAssigning || !selectedPlanId}>
            {isAssigning ? 'Assigning...' : 'Assign Plan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
