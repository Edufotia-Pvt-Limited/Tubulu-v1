/* eslint-disable jsx-a11y/label-has-associated-control */
import { useEffect, useRef, useState } from "react";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import { validatePhoneNumber } from "src/utils/helper";
import { storeLoginDetails } from "src/utils/ApiActions";
import { LoadingButton } from "@mui/lab";
import {
    Alert, Box, IconButton, InputAdornment, Stack,
    TextField, Typography, Tab, Tabs
} from "@mui/material";
import Logo from '../../assets/tubulu_logo.png';
import axiosInstance from "src/utils/axios";
import { HOST_API } from "src/config-global";

// ─── API helpers ────────────────────────────────────────────────────────────

const api = (path: string) => `${HOST_API}/api/v1/integrations${path}`;
const adminApi = (path: string) => `${HOST_API}/api/v1/integrations${path}`;

async function apiSendOtp(phoneNumber: string, forgotPin = false) {
    const res = await axiosInstance.post(api('/verifyIntegrationPhoneNumber'), { phoneNumber, forgotPin });
    return res.data as { hasPin: boolean; message: string };
}

async function apiVerifyOtp(phoneNumber: string, code: string, forgotPin = false) {
    const res = await axiosInstance.post(api('/confirmIntegrationPhoneAndCode'), { phoneNumber, code, forgotPin });
    return res.data as { requiresPinSetup: boolean; data: { authToken: string; role: string; isOnboarded: boolean; isDocumentsUploaded: boolean; isTubuluAppSetupDone: boolean }; authToken?: string };
}

async function apiVerifyPin(phoneNumber: string, pin: string) {
    const res = await axiosInstance.post(api('/verifyPin'), { phoneNumber, pin });
    return res.data as { authToken?: string; data?: { authToken: string; role: string; isOnboarded: boolean } };
}

async function apiSetPin(pin: string, authToken: string) {
    await axiosInstance.post(api('/set-pin'), { pin }, {
        headers: { Authorization: `Bearer ${authToken}` },
    });
}

async function apiAdminLogin(username: string, password: string) {
    const res = await axiosInstance.post(adminApi('/admin/login'), { username, password });
    return res.data as { authToken: string; data: { authToken: string; role: string } };
}

// ─── Types ────────────────────────────────────────────────────────────────

type Step = 'phone' | 'otp' | 'pin' | 'set-pin';
type LoginMode = 'mobile' | 'email';

// ─── Component ───────────────────────────────────────────────────────────

export default function LoginScreen(): JSX.Element {

    const [loginMode, setLoginMode] = useState<LoginMode>('mobile');

    // Mobile OTP flow state
    const [step, setStep] = useState<Step>('phone');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [isForgotPin, setIsForgotPin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Email/Admin login state
    const [adminUsername, setAdminUsername] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [showAdminPassword, setShowAdminPassword] = useState(false);
    const [adminLoading, setAdminLoading] = useState(false);
    const [adminError, setAdminError] = useState('');

    // Stores auth token between OTP verification and PIN setup
    const pendingAuthToken = useRef<string>('');
    const pendingAuthData = useRef<any>(null);

    useEffect(() => {
        setError('');
    }, [phoneNumber, otp, pin, confirmPin]);

    // ── Step 1: Send OTP or check for PIN ─────────────────────────────────
    async function handlePhoneSubmit() {
        if (!validatePhoneNumber(phoneNumber)) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const result = await apiSendOtp(`+${phoneNumber}`);
            if (result.hasPin) {
                setStep('pin');
            } else {
                setStep('otp');
            }
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || 'Failed to send OTP. Try again.');
        } finally {
            setLoading(false);
        }
    }

    // ── Step 2a: Verify OTP ───────────────────────────────────────────────
    async function handleOtpSubmit() {
        if (!otp || otp.length < 6) {
            setError('Please enter the 6-digit OTP');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const result = await apiVerifyOtp(`+${phoneNumber}`, otp, isForgotPin);
            const authData = result.data;
            const authToken = authData?.authToken;

            if (!authToken) throw new Error('No auth token received');

            if (result.requiresPinSetup) {
                pendingAuthToken.current = authToken;
                pendingAuthData.current = authData;
                setPin('');
                setConfirmPin('');
                setStep('set-pin');
            } else {
                finalizeSession(authToken, authData);
            }
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    // ── Step 2b: Verify PIN login ─────────────────────────────────────────
    async function handlePinLogin() {
        if (!pin || pin.length !== 4) {
            setError('Please enter your 4-digit PIN');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const result = await apiVerifyPin(`+${phoneNumber}`, pin);
            const authData = result.data || result;
            const authToken = (result.data?.authToken || result.authToken);
            if (!authToken) throw new Error('No auth token received');
            finalizeSession(authToken, authData);
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || 'Invalid PIN. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    // ── Step 3: Set new PIN ──────────────────────────────────────────────
    async function handleSetPin() {
        if (!pin || pin.length !== 4) {
            setError('PIN must be exactly 4 digits');
            return;
        }
        if (pin !== confirmPin) {
            setError('PINs do not match');
            return;
        }
        if (!pendingAuthToken.current) {
            setError('Session expired. Please login again.');
            setStep('phone');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await apiSetPin(pin, pendingAuthToken.current);
            finalizeSession(pendingAuthToken.current, pendingAuthData.current);
            pendingAuthToken.current = '';
            pendingAuthData.current = null;
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || 'Failed to set PIN. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    // ── Finalize: store session and redirect ──────────────────────────────
    function finalizeSession(authToken: string, authData: any) {
        storeLoginDetails({
            authToken,
            phoneNumber: authData?.phoneNumber || phoneNumber,
            refreshToken: authData?.refreshToken || '',
            role: authData?.role || 'merchant_admin',
            isOnboarded: authData?.isOnboarded ?? true,
            isDocumentsUploaded: authData?.isDocumentsUploaded ?? true,
            isTubuluAppSetupDone: authData?.isTubuluAppSetupDone ?? true,
        });
        sessionStorage.setItem('accessToken', authToken);
        window.location.href = '/dashboard';
    }

    async function handleForgotPin() {
        setLoading(true);
        setError('');
        setIsForgotPin(true);
        try {
            await apiSendOtp(`+${phoneNumber}`, true);
            setOtp('');
            setStep('otp');
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    }

    // ── Admin / Email login ───────────────────────────────────────────────
    async function handleAdminLogin() {
        if (!adminUsername.trim()) {
            setAdminError('Please enter your username or email');
            return;
        }
        if (!adminPassword.trim()) {
            setAdminError('Please enter your password');
            return;
        }
        setAdminLoading(true);
        setAdminError('');
        try {
            const result = await apiAdminLogin(adminUsername.trim(), adminPassword.trim());
            const authToken = result?.data?.authToken || result?.authToken;
            const authData = result?.data || result;
            if (!authToken) throw new Error('No auth token received');
            finalizeSession(authToken, authData);
        } catch (e: any) {
            setAdminError(e?.response?.data?.message || e?.message || 'Invalid credentials. Please try again.');
        } finally {
            setAdminLoading(false);
        }
    }

    // ─── Render ────────────────────────────────────────────────────────────
    const stepTitles: Record<Step, { title: string; subtitle: string }> = {
        phone: {
            title: 'Sign In to Tubulu',
            subtitle: 'Enter your mobile number to continue',
        },
        otp: {
            title: isForgotPin ? 'Reset Your PIN' : 'Verify OTP',
            subtitle: `Enter the 6-digit code sent to +${phoneNumber}`,
        },
        pin: {
            title: 'Enter Your PIN',
            subtitle: 'Use your 4-digit PIN to login securely',
        },
        'set-pin': {
            title: 'Create Your PIN',
            subtitle: 'Set a 4-digit PIN to secure future logins',
        },
    };

    const { title, subtitle } = loginMode === 'mobile'
        ? stepTitles[step]
        : { title: 'Admin & Staff Login', subtitle: 'Enter your email and temporary password to continue' };

    return (
        <div className="flex flex-col gap-4 justify-center items-center min-h-screen pb-6 bg-white">
            <img alt='logo' src={Logo} style={{ height: 120, width: 120, objectFit: 'contain' }} />

            <div className="flex flex-col items-center">
                <span className="sign-in-title text-center text-text-200 text-2xl font-bold">{title}</span>
                <span className="text-center text-text-200 w-96 text-base mt-2">{subtitle}</span>
            </div>

            {/* ── Mode Tabs (always visible at top) ── */}
            {(loginMode === 'mobile' ? step === 'phone' : true) && (
                <Box sx={{ width: '24rem' }}>
                    <Tabs
                        value={loginMode === 'email' ? 1 : 0}
                        onChange={(_, newValue) => {
                            setError('');
                            setAdminError('');
                            setLoginMode(newValue === 1 ? 'email' : 'mobile');
                            setStep('phone');
                        }}
                        variant="fullWidth"
                        sx={{
                            borderBottom: 1,
                            borderColor: 'divider',
                            mb: 2,
                            '& .MuiTab-root': { fontWeight: 'bold', fontSize: '0.8rem' }
                        }}
                    >
                        <Tab label="📱 Mobile OTP" />
                        <Tab label="🔑 Email & Staff" />
                    </Tabs>
                </Box>
            )}

            {/* ── Error alerts ── */}
            {loginMode === 'mobile' && !!error && (
                <Alert severity="error" sx={{ width: '24rem', fontSize: '0.8rem' }}>{error}</Alert>
            )}
            {loginMode === 'email' && !!adminError && (
                <Alert severity="error" sx={{ width: '24rem', fontSize: '0.8rem' }}>{adminError}</Alert>
            )}

            {/* ══════════════ MOBILE OTP FLOW ══════════════ */}
            {loginMode === 'mobile' && (
                <>
                    {/* ── Phone Input ── */}
                    {step === 'phone' && (
                        <div className="mt-2" onKeyDown={(e) => e.key === 'Enter' && !loading && handlePhoneSubmit()}>
                            <PhoneInput
                                inputStyle={{ width: '24rem', height: '46px' }}
                                specialLabel="Mobile Number"
                                onChange={setPhoneNumber}
                                country="in"
                                onlyCountries={['in']}
                                countryCodeEditable={false}
                            />
                        </div>
                    )}

                    {/* ── OTP Input ── */}
                    {step === 'otp' && (
                        <Box sx={{ width: '24rem' }}>
                            <TextField
                                fullWidth
                                label={isForgotPin ? 'OTP (Forgot PIN)' : 'One-Time Password'}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                inputProps={{ maxLength: 6, inputMode: 'numeric' }}
                                placeholder="Enter 6-digit OTP"
                                onKeyDown={(e) => e.key === 'Enter' && !loading && handleOtpSubmit()}
                            />
                            <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                                <Typography
                                    variant="caption" color="text.secondary"
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => { setStep('phone'); setIsForgotPin(false); }}
                                >
                                    ← Change number
                                </Typography>
                                <Typography
                                    variant="caption" color="primary.main"
                                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                                    onClick={() => apiSendOtp(`+${phoneNumber}`, isForgotPin)}
                                >
                                    Resend OTP
                                </Typography>
                            </Stack>
                        </Box>
                    )}

                    {/* ── PIN Login ── */}
                    {step === 'pin' && (
                        <Box sx={{ width: '24rem' }}>
                            <TextField
                                fullWidth
                                label="4-Digit PIN"
                                type={showPin ? 'text' : 'password'}
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                                inputProps={{ maxLength: 4, inputMode: 'numeric' }}
                                placeholder="Enter your PIN"
                                onKeyDown={(e) => e.key === 'Enter' && !loading && handlePinLogin()}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPin(v => !v)}>
                                                <span style={{ fontSize: 18 }}>{showPin ? '🙈' : '👁'}</span>
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Stack alignItems="flex-end" sx={{ mt: 1 }}>
                                <Typography
                                    variant="caption" color="primary.main"
                                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                                    onClick={handleForgotPin}
                                >
                                    Forgot PIN? Use OTP instead
                                </Typography>
                            </Stack>
                        </Box>
                    )}

                    {/* ── Set PIN ── */}
                    {step === 'set-pin' && (
                        <Box sx={{ width: '24rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                fullWidth
                                label="New 4-Digit PIN"
                                type={showPin ? 'text' : 'password'}
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                                inputProps={{ maxLength: 4, inputMode: 'numeric' }}
                                placeholder="Choose a 4-digit PIN"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPin(v => !v)}>
                                                <span style={{ fontSize: 18 }}>{showPin ? '🙈' : '👁'}</span>
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Confirm PIN"
                                type={showPin ? 'text' : 'password'}
                                value={confirmPin}
                                onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                                inputProps={{ maxLength: 4, inputMode: 'numeric' }}
                                placeholder="Re-enter your PIN"
                                onKeyDown={(e) => e.key === 'Enter' && !loading && handleSetPin()}
                            />
                        </Box>
                    )}

                    {/* ── Submit Button ── */}
                    <div className="mt-4 h-11">
                        <LoadingButton
                            loading={loading}
                            style={{ height: 46, background: '#36F', width: loading ? 40 : '24rem', borderRadius: '4px' }}
                            variant="contained"
                            onClick={
                                step === 'phone' ? handlePhoneSubmit :
                                step === 'otp' ? handleOtpSubmit :
                                step === 'pin' ? handlePinLogin :
                                handleSetPin
                            }
                        >
                            {step === 'phone' ? 'Continue' :
                             step === 'otp' ? 'Verify OTP' :
                             step === 'pin' ? 'Login' :
                             'Set PIN & Login'}
                        </LoadingButton>
                    </div>
                </>
            )}

            {/* ══════════════ EMAIL / STAFF FLOW ══════════════ */}
            {loginMode === 'email' && (
                <>
                    <Box sx={{ width: '24rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Info hint */}
                        <Box sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: '#f0f4ff',
                            border: '1px dashed #90a4f0',
                        }}>
                            <Typography variant="caption" color="primary.main" fontWeight="bold" display="block">
                                🔑 Admin & Staff Access
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Use your email address and the temporary password sent to your inbox. Super Admin: use username <strong>superadmin</strong>.
                            </Typography>
                        </Box>

                        <TextField
                            fullWidth
                            label="Username or Email"
                            value={adminUsername}
                            onChange={(e) => { setAdminUsername(e.target.value); setAdminError(''); }}
                            placeholder="e.g. superadmin or manager@example.com"
                            onKeyDown={(e) => e.key === 'Enter' && !adminLoading && handleAdminLogin()}
                            autoComplete="username"
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            type={showAdminPassword ? 'text' : 'password'}
                            value={adminPassword}
                            onChange={(e) => { setAdminPassword(e.target.value); setAdminError(''); }}
                            placeholder="Enter your password"
                            onKeyDown={(e) => e.key === 'Enter' && !adminLoading && handleAdminLogin()}
                            autoComplete="current-password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowAdminPassword(v => !v)}>
                                            <span style={{ fontSize: 18 }}>{showAdminPassword ? '🙈' : '👁'}</span>
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    <div className="mt-4 h-11">
                        <LoadingButton
                            loading={adminLoading}
                            style={{ height: 46, background: '#36F', width: adminLoading ? 40 : '24rem', borderRadius: '4px' }}
                            variant="contained"
                            onClick={handleAdminLogin}
                        >
                            Login to Portal
                        </LoadingButton>
                    </div>
                </>
            )}
        </div>
    );
}