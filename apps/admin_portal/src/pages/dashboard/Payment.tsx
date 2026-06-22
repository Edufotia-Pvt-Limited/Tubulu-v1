import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  TextField,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { BiCreditCard, BiQrScan, BiShow, BiHide, BiKey } from 'react-icons/bi';
import { MdLinkOff } from 'react-icons/md';
import {
  connectRazorpay,
  getPaymentDetails,
  revokeRazorpayIntegration,
  updateUPIDetails,
  disconnectUPI,
  updateManualRazorpay,
  disconnectManualRazorpay,
} from 'src/utils/ApiActions';
import RevokeRazorpayConfirmation from 'src/components/payment-setting/revoke-razorpay-confirmation';
import { axios } from 'src/utils/axios';

type Props = {}

const Payment = (props: Props) => {
  // ── OAuth Razorpay ──────────────────────────────────────────
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isDisconnectModalOpen, setIsDissconnectModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // ── Manual Razorpay (vendor's own keys) ────────────────────
  const [manualKeyId, setManualKeyId] = useState('');
  const [manualKeySecret, setManualKeySecret] = useState('');
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [isManualSaving, setIsManualSaving] = useState(false);
  const [isManualDisconnecting, setIsManualDisconnecting] = useState(false);
  const [isManualDisconnectModalOpen, setIsManualDisconnectModalOpen] = useState(false);

  // ── UPI ────────────────────────────────────────────────────
  const [isUpiUpdating, setIsUpiUpdating] = useState(false);
  const [isUpiDisconnecting, setIsUpiDisconnecting] = useState(false);
  const [vpa, setVpa] = useState('');
  const [merchantName, setMerchantName] = useState('');

  // ── Delivery ───────────────────────────────────────────────
  const [deliveryFee, setDeliveryFee] = useState<string | number>('0');
  const [minimumOrderValue, setMinimumOrderValue] = useState<string | number>('0');
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<string | number>('30');
  const [isDeliveryUpdating, setIsDeliveryUpdating] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  const [mySubscription, setMySubscription] = useState<any>(null);
  const [isWalletRecharging, setIsWalletRecharging] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const [searchParams] = useSearchParams();
  const status = searchParams.get('razorpay');

  const [integration, setIntegration] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchIntegrationStatus = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await getPaymentDetails();
      setIntegration(res.data);
      if (res.data?.upi) {
        setVpa(res.data.upi.vpa || '');
        setMerchantName(res.data.upi.merchantName || '');
      }
      if (res.data?.razorpay?.method === 'manual' && res.data.razorpay.connected) {
        // Pre-fill Key ID (masked display); never pre-fill secret for security
        setManualKeyId(res.data.razorpay.keyId || '');
        setManualKeySecret('');
      }
      if (res.data) {
        setDeliveryFee(res.data.deliveryFee !== undefined && res.data.deliveryFee !== null ? String(res.data.deliveryFee) : '0');
        setMinimumOrderValue(res.data.minimumOrderValue !== undefined && res.data.minimumOrderValue !== null ? String(res.data.minimumOrderValue) : '0');
        setEstimatedDeliveryTime(res.data.estimatedDeliveryTime !== undefined && res.data.estimatedDeliveryTime !== null ? String(res.data.estimatedDeliveryTime) : '30');
      }

      const walletRes = await axios.get('/api/v1/billing/wallet');
      if (walletRes.data?.data) setWallet(walletRes.data.data);

      const plansRes = await axios.get('/api/v1/billing/plans');
      if (plansRes.data?.data) setSubscriptionPlans(plansRes.data.data);

      const subRes = await axios.get('/api/v1/billing/subscriptions/me');
      if (subRes.data?.data) setMySubscription(subRes.data.data);
      else setMySubscription(null);

    } catch (error: any) {
      console.error("Connection error:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrationStatus(true);
    if (status === 'connected') {
      enqueueSnackbar('Razorpay connected successfully!', { variant: 'success' });
    }
  }, []);

  // ── Handlers: OAuth Razorpay ───────────────────────────────
  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const response = await connectRazorpay();
      if (response?.data?.redirectUrl) {
        window.location.href = response.data.redirectUrl;
      }
    } catch (error: any) {
      console.error("Connection error:", error);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true);
      await revokeRazorpayIntegration();
      enqueueSnackbar('Razorpay disconnected successfully', { variant: 'success' });
      diconnectModalClose();
      fetchIntegrationStatus();
    } catch (err) {
      enqueueSnackbar('Failed to disconnect Razorpay', { variant: 'error' });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const diconnectModalOpen = () => setIsDissconnectModalOpen(true);
  const diconnectModalClose = () => setIsDissconnectModalOpen(false);

  // ── Handlers: Manual Razorpay keys ────────────────────────
  const handleManualSave = async () => {
    if (!manualKeyId.trim()) {
      enqueueSnackbar('Razorpay Key ID is required', { variant: 'warning' });
      return;
    }
    if (!manualKeySecret.trim()) {
      enqueueSnackbar('Razorpay Key Secret is required', { variant: 'warning' });
      return;
    }
    if (!manualKeyId.startsWith('rzp_')) {
      enqueueSnackbar('Key ID should start with rzp_live_ or rzp_test_', { variant: 'warning' });
      return;
    }
    try {
      setIsManualSaving(true);
      await updateManualRazorpay(manualKeyId.trim(), manualKeySecret.trim());
      enqueueSnackbar('Razorpay keys saved successfully', { variant: 'success' });
      setManualKeySecret('');
      await fetchIntegrationStatus();
    } catch (err) {
      enqueueSnackbar('Failed to save Razorpay keys', { variant: 'error' });
    } finally {
      setIsManualSaving(false);
    }
  };

  const handleManualDisconnect = async () => {
    try {
      setIsManualDisconnecting(true);
      await disconnectManualRazorpay();
      enqueueSnackbar('Razorpay keys removed successfully', { variant: 'success' });
      setManualKeyId('');
      setManualKeySecret('');
      setIsManualDisconnectModalOpen(false);
      await fetchIntegrationStatus();
    } catch (err) {
      enqueueSnackbar('Failed to remove Razorpay keys', { variant: 'error' });
    } finally {
      setIsManualDisconnecting(false);
    }
  };

  // ── Handlers: UPI ─────────────────────────────────────────
  const handleUpiUpdate = async () => {
    if (!vpa || !vpa.includes('@')) {
      enqueueSnackbar('Please enter a valid UPI ID (e.g. name@bank)', { variant: 'warning' });
      return;
    }
    try {
      setIsUpiUpdating(true);
      await updateUPIDetails(vpa, merchantName);
      enqueueSnackbar('UPI details updated successfully', { variant: 'success' });
      fetchIntegrationStatus();
    } catch (err) {
      enqueueSnackbar('Failed to update UPI details', { variant: 'error' });
    } finally {
      setIsUpiUpdating(false);
    }
  };

  const handleUpiDisconnect = async () => {
    try {
      setIsUpiDisconnecting(true);
      await disconnectUPI();
      enqueueSnackbar('UPI disconnected successfully', { variant: 'success' });
      setVpa('');
      setMerchantName('');
      fetchIntegrationStatus();
    } catch (err) {
      enqueueSnackbar('Failed to disconnect UPI', { variant: 'error' });
    } finally {
      setIsUpiDisconnecting(false);
    }
  };

  // ── Handlers: Delivery ────────────────────────────────────
  const handleDeliveryUpdate = async () => {
    try {
      setIsDeliveryUpdating(true);
      await axios.patch('/api/v1/integrations/merchant/update', {
        deliveryFee: parseFloat(String(deliveryFee)) || 0,
        minimumOrderValue: parseFloat(String(minimumOrderValue)) || 0,
        estimatedDeliveryTime: parseInt(String(estimatedDeliveryTime), 10) || 0,
      });
      enqueueSnackbar('Delivery settings updated successfully', { variant: 'success' });
      await fetchIntegrationStatus(false);
    } catch (err) {
      enqueueSnackbar('Failed to update delivery settings', { variant: 'error' });
    } finally {
      setIsDeliveryUpdating(false);
    }
  };

  // ── Derived state ─────────────────────────────────────────
  const isOAuthConnected = integration?.razorpay?.connected === true && integration?.razorpay?.method !== 'manual';
  const isManualConnected = integration?.razorpay?.connected === true && integration?.razorpay?.method === 'manual';
  const isUpiConnected = integration?.upi?.connected === true;

  const maskKey = (key: string) => {
    if (!key || key.length < 12) return key;
    return key.substring(0, 12) + '••••••••••••';
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleMockRecharge = async (type: string, amount: number) => {
    try {
      setIsWalletRecharging(true);

      // 1. Create order on backend (which sets up Split Routing for Pidge if type === DELIVERY_RECHARGE)
      const orderRes = await axios.post('/api/v1/billing/wallet/recharge-order', { amount, type });
      const { orderId, currency, keyId } = orderRes.data.data;

      // 2. Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // 3. Open Razorpay Checkout modal
      const options = {
        key: keyId || 'rzp_test_S4RhE3lkMmLbAn',
        amount: amount * 100,
        currency: currency || 'INR',
        name: 'Tubulu',
        description: type === 'DELIVERY_RECHARGE' ? 'Logistics Delivery Recharge (Split to Pidge)' : 'AI Tokens Recharge',
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Verify payment signature and credit wallet on backend
            await axios.post('/api/v1/billing/wallet/verify-recharge', {
              amount,
              type,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            enqueueSnackbar('Wallet recharged successfully!', { variant: 'success' });
            await fetchIntegrationStatus();
          } catch (err: any) {
            enqueueSnackbar(err.message || 'Payment verification failed', { variant: 'error' });
          }
        },
        prefill: {
          contact: integration?.phoneNumber || '',
          name: integration?.integrationName || '',
        },
        theme: {
          color: '#3b82f6',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      console.warn('Razorpay checkout failed, falling back to mock recharge:', err);
      // Fallback for development/testing if API credentials are mock or missing
      try {
        await axios.post('/api/v1/billing/wallet/recharge', { amount, type });
        await fetchIntegrationStatus();
        enqueueSnackbar('Wallet recharged successfully (Dev Mock)!', { variant: 'success' });
      } catch (mockErr) {
        enqueueSnackbar('Failed to recharge wallet', { variant: 'error' });
      }
    } finally {
      setIsWalletRecharging(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      setIsSubscribing(true);
      await axios.post('/api/v1/billing/subscriptions/subscribe', { planId });
      enqueueSnackbar('Successfully subscribed to plan!', { variant: 'success' });
      await fetchIntegrationStatus(false);
    } catch (err: any) {
      enqueueSnackbar(err.message || 'Failed to subscribe to plan', { variant: 'error' });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pb: 5, overflow: 'auto' }}>
      <Typography sx={{ fontSize: { xs: 20, sm: 22, md: 24 }, fontWeight: 700, mb: 1 }}>
        Payment Settings
      </Typography>
      <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: 3 }}>
        Manage subscriptions, tokens, delivery, and customer payments.
      </Typography>

      <Tabs 
        value={activeTab} 
        onChange={(e, val) => setActiveTab(val)} 
        sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="App Subscriptions" />
        <Tab label="AI Tokens" />
        <Tab label="Delivery Wallet" />
        <Tab label="Customer Payments" />
      </Tabs>

      {/* ── TAB 0: App Subscriptions ── */}
      {activeTab === 0 && (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e5e7eb', mb: 3 }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography fontSize={18} fontWeight={700} mb={3}>Your Subscription Plan</Typography>

            {/* Current Subscription Status */}
            {mySubscription ? (
              <Box sx={{ p: 3, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 2, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography fontSize={13} color="text.secondary" mb={0.5}>Current Plan</Typography>
                    <Typography fontSize={22} fontWeight={800} color="#166534">{mySubscription.planName}</Typography>
                    <Typography fontSize={13} color="text.secondary" mt={0.5}>{mySubscription.planDescription}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Box sx={{ px: 2, py: 0.5, bgcolor: '#dcfce7', color: '#166534', borderRadius: 1, fontSize: 13, fontWeight: 700, mb: 1 }}>
                      ✅ Active
                    </Box>
                    <Typography fontSize={13} color="text.secondary">
                      Valid until: <strong>{new Date(mySubscription.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                    </Typography>
                    <Typography fontSize={13} fontWeight={700}
                      color={mySubscription.daysLeft <= 7 ? '#f59e0b' : '#166534'}>
                      {mySubscription.daysLeft} days remaining
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box sx={{ p: 3, bgcolor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 2, mb: 4 }}>
                <Typography fontSize={15} fontWeight={700} color="#9a3412">⚠️ No Active Subscription</Typography>
                <Typography fontSize={13} color="#9a3412" mt={0.5}>
                  Your shop may be suspended. Please recharge your wallet to reactivate, or contact your Tubulu admin to assign a plan.
                </Typography>
              </Box>
            )}

            {/* Available Plans */}
            <Typography fontWeight={600} mb={2} fontSize={15}>Available Plans</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              {subscriptionPlans.filter((p: any) => p.isActive).map((plan: any) => {
                const isCurrent = mySubscription?.planName === plan.name;
                return (
                  <Box key={plan.id} sx={{
                    p: 3, border: isCurrent ? '2px solid #10b981' : '1px solid #e5e7eb',
                    borderRadius: 2, position: 'relative',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  }}>
                    <Box>
                      {isCurrent && (
                        <Box sx={{ position: 'absolute', top: 12, right: 12, px: 1.5, py: 0.3, bgcolor: '#dcfce7', color: '#166534', borderRadius: 1, fontSize: 12, fontWeight: 700 }}>
                          Current
                        </Box>
                      )}
                      <Typography fontWeight={700} fontSize={16}>{plan.name}</Typography>
                      <Typography fontSize={26} fontWeight={800} color="primary" mt={1}>₹{plan.price}</Typography>
                      <Typography fontSize={13} color="text.secondary" mb={1}>{plan.description}</Typography>
                      <Typography fontSize={13} color="text.secondary">{plan.durationDays} days</Typography>
                    </Box>
                    <Button
                      variant={isCurrent ? "outlined" : "contained"}
                      color={isCurrent ? "success" : "primary"}
                      disabled={isCurrent || isSubscribing}
                      onClick={() => handleSubscribe(plan.id)}
                      sx={{ mt: 2 }}
                      fullWidth
                    >
                      {isCurrent ? "Active Plan" : "Subscribe"}
                    </Button>
                  </Box>
                );
              })}
              {subscriptionPlans.filter((p: any) => p.isActive).length === 0 && (
                <Typography color="text.secondary" fontSize={14}>No plans available. Contact your Tubulu admin.</Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* ── TAB 1: AI Token Wallet ── */}
      {activeTab === 1 && (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e5e7eb', mb: 3 }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography fontSize={18} fontWeight={700} mb={1}>AI Token Wallet</Typography>
            <Typography fontSize={14} color="text.secondary" mb={3}>
              Tokens are used for Tubulu Vibe (AI Assistant) and Auto-Replies.
            </Typography>
            <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, mb: 3 }}>
              <Typography fontSize={14} color="text.secondary">Current Balance</Typography>
              <Typography fontSize={32} fontWeight={800} color="#0f172a">
                {wallet?.tokenBalance || 0} <span style={{ fontSize: 16, fontWeight: 600 }}>Tokens</span>
              </Typography>
            </Box>
            <Typography fontWeight={600} mb={2}>Recharge Tokens</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={() => handleMockRecharge('TOKEN_RECHARGE', 500)} disabled={isWalletRecharging}>
                Recharge ₹500
              </Button>
              <Button variant="contained" onClick={() => handleMockRecharge('TOKEN_RECHARGE', 1000)} disabled={isWalletRecharging}>
                Recharge ₹1000
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* ── TAB 2: Delivery Wallet ── */}
      {activeTab === 2 && (
        <Box>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e5e7eb', mb: 3 }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography fontSize={18} fontWeight={700} mb={1}>Delivery Wallet (Pidge)</Typography>
              <Typography fontSize={14} color="text.secondary" mb={3}>
                This balance is used to auto-deduct Pidge delivery charges for your orders.
              </Typography>
              <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, mb: 3 }}>
                <Typography fontSize={14} color="text.secondary">Current Balance</Typography>
                <Typography fontSize={32} fontWeight={800} color="#10b981">
                  ₹{wallet?.deliveryCashBalance || 0}
                </Typography>
              </Box>
              <Typography fontWeight={600} mb={2}>Recharge Delivery Wallet</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" color="success" onClick={() => handleMockRecharge('DELIVERY_RECHARGE', 500)} disabled={isWalletRecharging}>
                  Add ₹500
                </Button>
                <Button variant="contained" color="success" onClick={() => handleMockRecharge('DELIVERY_RECHARGE', 1000)} disabled={isWalletRecharging}>
                  Add ₹1000
                </Button>
              </Box>
            </CardContent>
          </Card>


      </Box>
      )}

      {/* ── TAB 3: Customer Payments (Razorpay / UPI) ── */}
      {activeTab === 3 && (
        <Box>
      {/* ── 1. Razorpay Direct Keys (Customer → Vendor) ── */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e5e7eb', mb: 3 }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <BiKey size={20} color="#6366f1" />
                <Typography fontSize={18} fontWeight={700}>Razorpay — Direct Keys</Typography>
              </Box>
              <Typography fontSize={13} color="text.secondary">
                Enter your own Razorpay Key ID &amp; Secret so customers can pay directly into your Razorpay account.
              </Typography>
            </Box>
            <Box sx={{
              px: 1.5, py: 0.5, borderRadius: 1, fontSize: 13, fontWeight: 600,
              bgcolor: isManualConnected ? '#dcfce7' : '#fef3c7',
              color: isManualConnected ? '#166534' : '#92400e',
              whiteSpace: 'nowrap', ml: 2,
            }}>
              {isManualConnected ? '✓ Connected' : 'Not Set Up'}
            </Box>
          </Box>

          <Alert severity="info" sx={{ mb: 3, fontSize: 13 }}>
            These are <strong>your own</strong> Razorpay live keys — customer order payments will be credited directly to your Razorpay account.
            Get your keys from{' '}
            <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>
              dashboard.razorpay.com → Settings → API Keys
            </a>.
          </Alert>

          <Divider sx={{ mb: 3 }} />

          {isManualConnected && (
            <Box sx={{ mb: 3, p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
              <Typography fontSize={13} color="#166534" fontWeight={600}>
                ✓ Active Key ID: <span style={{ fontFamily: 'monospace' }}>{maskKey(integration?.razorpay?.keyId || '')}</span>
              </Typography>
              <Typography fontSize={12} color="text.secondary" sx={{ mt: 0.5 }}>
                Connected on {formatDate(integration?.razorpay?.updatedAt)}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
            <TextField
              id="razorpay-key-id"
              label="Razorpay Key ID"
              placeholder="rzp_live_xxxxxxxxxxxx"
              value={manualKeyId}
              onChange={(e) => setManualKeyId(e.target.value)}
              fullWidth
              variant="outlined"
              helperText="Starts with rzp_live_ (production) or rzp_test_ (testing)"
              inputProps={{ style: { fontFamily: 'monospace', fontSize: 14 } }}
            />
            <TextField
              id="razorpay-key-secret"
              label="Razorpay Key Secret"
              placeholder={isManualConnected ? '(leave blank to keep existing)' : 'Your key secret'}
              value={manualKeySecret}
              onChange={(e) => setManualKeySecret(e.target.value)}
              type={showKeySecret ? 'text' : 'password'}
              fullWidth
              variant="outlined"
              helperText="Never share this with anyone"
              inputProps={{ style: { fontFamily: 'monospace', fontSize: 14 } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowKeySecret(!showKeySecret)} edge="end" size="small">
                      {showKeySecret ? <BiHide /> : <BiShow />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              id="save-razorpay-keys-btn"
              variant="contained"
              size="large"
              onClick={handleManualSave}
              disabled={isManualSaving}
              sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, textTransform: 'none', fontWeight: 600, px: 4 }}
              startIcon={isManualSaving ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <BiKey />}
            >
              {isManualSaving ? 'Saving...' : isManualConnected ? 'Update Keys' : 'Save Keys'}
            </Button>

            {isManualConnected && (
              <Button
                id="disconnect-razorpay-keys-btn"
                variant="outlined"
                color="error"
                size="large"
                onClick={() => setIsManualDisconnectModalOpen(true)}
                disabled={isManualDisconnecting}
                sx={{ textTransform: 'none', fontWeight: 600 }}
                startIcon={isManualDisconnecting ? <CircularProgress size={18} /> : <MdLinkOff />}
              >
                {isManualDisconnecting ? 'Removing...' : 'Remove Keys'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>



      {/* ── 4. Direct UPI ── */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e5e7eb' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography fontSize={18} fontWeight={700}>Direct UPI</Typography>
              <Typography fontSize={14} color="text.secondary">Accept payments directly to your bank account via UPI ID</Typography>
            </Box>
            <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1, fontSize: 13, fontWeight: 600, bgcolor: isUpiConnected ? '#dcfce7' : '#fef3c7', color: isUpiConnected ? '#166534' : '#92400e' }}>
              {isUpiConnected ? 'Active' : 'Not Setup'}
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
            <TextField
              id="upi-vpa-input"
              label="UPI ID (VPA)" placeholder="e.g. merchant@okaxis" value={vpa}
              onChange={(e) => setVpa(e.target.value)} fullWidth variant="outlined"
              helperText="Your virtual payment address"
            />
            <TextField
              id="upi-merchant-name-input"
              label="Merchant Name" placeholder="e.g. Anand Bakery" value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)} fullWidth variant="outlined"
              helperText="Name displayed on payment apps"
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              id="save-upi-btn"
              variant="contained" size="large" onClick={handleUpiUpdate} disabled={isUpiUpdating}
              sx={{ bgcolor: '#0ea5e9', '&:hover': { bgcolor: '#0284c7' }, textTransform: 'none', fontWeight: 600, px: 4 }}
              startIcon={isUpiUpdating ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <BiQrScan />}
            >
              {isUpiConnected ? 'Update UPI' : 'Set Up UPI'}
            </Button>
            {isUpiConnected && (
              <Button
                variant="text" color="error" disabled={isUpiDisconnecting} onClick={handleUpiDisconnect}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {isUpiDisconnecting ? 'Removing...' : 'Remove UPI'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
      </Box>
      )}

      {/* ── Modals ── */}
      <RevokeRazorpayConfirmation
        open={isDisconnectModalOpen}
        ProceedHeaderMessage="Are you sure you want to disconnect Razorpay OAuth?"
        message="You will not be able to accept card/wallet payments."
        alert="Are you ready to proceed?"
        onCancel={diconnectModalClose}
        onConfirm={handleDisconnect}
      />

      <RevokeRazorpayConfirmation
        open={isManualDisconnectModalOpen}
        ProceedHeaderMessage="Remove Razorpay Keys?"
        message="Your customers will no longer be able to pay via Razorpay until you add new keys."
        alert="Are you ready to proceed?"
        onCancel={() => setIsManualDisconnectModalOpen(false)}
        onConfirm={handleManualDisconnect}
      />
    </Box>
  );
};

export default Payment;