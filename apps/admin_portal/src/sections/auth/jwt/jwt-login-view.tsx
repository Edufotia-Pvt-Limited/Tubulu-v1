import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useState, useRef } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
// routes
import { useSearchParams, useRouter } from 'src/routes/hooks';
// config
import { PATH_AFTER_LOGIN } from 'src/config-global';
// auth
import { useAuthContext } from 'src/auth/hooks';
// utils
import axiosInstance, { endpoints } from 'src/utils/axios';
// components
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Step = 'phone' | 'otp' | 'pin' | 'set-pin' | 'admin-password';

export default function JwtLoginView() {
  const { sendOtp, verifyOtp, verifyPin, finalizeLogin, adminLogin } = useAuthContext();

  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isForgotPin, setIsForgotPin] = useState(false);

  // Stores auth data temporarily between OTP verification and PIN setup
  // This is in component state — not the auth provider — so nothing can interrupt it
  const pendingAuth = useRef<{ authToken: string; user: any } | null>(null);

  // ─── Schema per step ──────────────────────────────────────────────────────
  const schema = Yup.object().shape({
    phoneNumber: step === 'phone'
      ? Yup.string().required('Phone number is required').min(10, 'Enter a valid 10-digit number')
      : Yup.string().notRequired(),
    otp: step === 'otp'
      ? Yup.string().required('OTP is required').length(6, 'OTP must be 6 digits')
      : Yup.string().notRequired(),
    pin: (step === 'pin' || step === 'set-pin')
      ? Yup.string().required('PIN is required').length(4, 'PIN must be 4 digits')
      : Yup.string().notRequired(),
    confirmPin: step === 'set-pin'
      ? Yup.string().required('Please confirm your PIN').oneOf([Yup.ref('pin')], 'PINs do not match')
      : Yup.string().notRequired(),
    username: step === 'admin-password'
      ? Yup.string().required('Username is required')
      : Yup.string().notRequired(),
    password: step === 'admin-password'
      ? Yup.string().required('Password is required')
      : Yup.string().notRequired(),
  });

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: { phoneNumber: '', otp: '', pin: '', confirmPin: '', username: '', password: '' },
  });

  const { handleSubmit, setValue, formState: { isSubmitting } } = methods;

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const onSubmit = handleSubmit(async (data) => {
    setErrorMsg('');
    try {
      // ── STEP 1: Phone ──
      if (step === 'phone') {
        const phone = (data.phoneNumber || '').replace(/[^0-9]/g, '').slice(-10);
        setPhoneNumber(phone);
        const result = await sendOtp(phone);
        setStep(result.hasPin ? 'pin' : 'otp');
      }

      // ── STEP 2a: OTP ──
      else if (step === 'otp') {
        const result = await verifyOtp(phoneNumber, data.otp || '', isForgotPin);

        if (result.requiresPinSetup) {
          // Store auth data in component ref — no auth provider involvement yet
          pendingAuth.current = { authToken: result.authToken!, user: result.user };
          setValue('pin', '');
          setValue('confirmPin', '');
          setStep('set-pin');
        } else {
          // Logged in without PIN setup
          router.push(returnTo || PATH_AFTER_LOGIN);
        }
      }

      // ── STEP 2b: PIN Login ──
      else if (step === 'pin') {
        await verifyPin(phoneNumber, data.pin || '');
        router.push(returnTo || PATH_AFTER_LOGIN);
      }

      // ── STEP 3: Set PIN ──
      else if (step === 'set-pin') {
        if (!pendingAuth.current) {
          throw new Error('Session expired. Please login again.');
        }
        const { authToken, user } = pendingAuth.current;

        // Call /set-pin directly with the pending auth token
        await axiosInstance.post(endpoints.auth.setPin, { pin: data.pin }, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        // Now finalize authentication
        finalizeLogin(authToken, user);
        pendingAuth.current = null;
        router.push(returnTo || PATH_AFTER_LOGIN);
      }

      // ── STEP 4: Admin Password ──
      else if (step === 'admin-password') {
        await adminLogin(data.username!, data.password!);
        router.push(returnTo || PATH_AFTER_LOGIN);
      }
    } catch (error: any) {
      setErrorMsg(typeof error === 'string' ? error : error?.message || 'Something went wrong');
    }
  });

  const handleForgotPin = async () => {
    setErrorMsg('');
    setIsForgotPin(true);
    try {
      await sendOtp(phoneNumber, true);
      setValue('otp', '');
      setStep('otp');
    } catch (error: any) {
      setErrorMsg(typeof error === 'string' ? error : error?.message || 'Failed to send OTP');
    }
  };

  const handleResendOtp = async () => {
    setErrorMsg('');
    try {
      await sendOtp(phoneNumber, isForgotPin);
    } catch (error: any) {
      setErrorMsg(typeof error === 'string' ? error : error?.message || 'Failed to resend OTP');
    }
  };

  // ─── Step Config ──────────────────────────────────────────────────────────
  const stepConfig: Record<Step, { title: string; subtitle: string; buttonLabel: string; icon: string }> = {
    phone: {
      title: 'Sign in to Tubulu',
      subtitle: 'Enter your registered mobile number to continue',
      buttonLabel: 'Continue',
      icon: 'solar:phone-bold',
    },
    otp: {
      title: isForgotPin ? 'Reset Your PIN' : 'Verify OTP',
      subtitle: `Enter the 6-digit code sent to +91 ${phoneNumber}`,
      buttonLabel: 'Verify & Continue',
      icon: 'solar:shield-check-bold',
    },
    pin: {
      title: 'Enter Your PIN',
      subtitle: `Welcome back! Enter your 4-digit PIN`,
      buttonLabel: 'Login',
      icon: 'solar:lock-password-bold',
    },
    'set-pin': {
      title: 'Create Your PIN',
      subtitle: 'Set a 4-digit PIN to secure your account for future logins',
      buttonLabel: 'Set PIN & Login',
      icon: 'solar:key-bold',
    },
    'admin-password': {
      title: 'Admin & Staff Login',
      subtitle: 'Enter your admin credentials or manager email to access the portal',
      buttonLabel: 'Login',
      icon: 'solar:user-speak-bold',
    },
  };

  const config = stepConfig[step];

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {/* Header */}
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h4">{config.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {config.subtitle}
        </Typography>
      </Stack>

      {/* Auth Mode Toggle Tabs (Only show on first-level screens) */}
      {(step === 'phone' || step === 'admin-password') && (
        <Tabs
          value={step === 'admin-password' ? 1 : 0}
          onChange={(e, newValue) => {
            setErrorMsg('');
            setStep(newValue === 1 ? 'admin-password' : 'phone');
          }}
          variant="fullWidth"
          sx={{
            mb: 3,
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { fontWeight: 'bold' }
          }}
        >
          <Tab label="📱 Mobile Sign In" />
          <Tab label="🔑 Email & Staff" />
        </Tabs>
      )}

      {/* Hint box — only on first screen */}
      {(step === 'phone' || step === 'admin-password') && (
        <Box
          sx={{
            mb: 3, p: 2, borderRadius: 1.5,
            bgcolor: 'primary.lighter',
            border: '1px dashed', borderColor: 'primary.light',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <Iconify icon="solar:shield-user-bold" color="primary.main" width={18} />
            <Typography variant="caption" fontWeight="bold" color="primary.main">
              Admin & Staff Access
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
            <Chip label="User: superadmin" size="small" variant="soft" color="primary" />
            <Chip label="PIN/Pass: 2123" size="small" variant="soft" color="primary" />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            💡 Managers / Staff: Log in using your registered Email & the Temporary Password sent to your inbox.
          </Typography>
        </Box>
      )}

      {/* Error */}
      {!!errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

      {/* ── Step: Phone ── */}
      {step === 'phone' && (
        <RHFTextField
          name="phoneNumber"
          label="Mobile Number"
          placeholder="e.g. 9999999999"
          inputProps={{ maxLength: 10 }}
          autoFocus
          InputProps={{
            startAdornment: (
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>+91</Typography>
            ),
          }}
        />
      )}

      {/* ── Step: Admin Password ── */}
      {step === 'admin-password' && (
        <Stack spacing={2}>
          <RHFTextField
            name="username"
            label="Username"
            placeholder="e.g. superadmin"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                passwordRef.current?.focus();
              }
            }}
          />
          <RHFTextField
            name="password"
            label="Password / PIN"
            placeholder="Enter your admin PIN"
            type={showPin ? 'text' : 'password'}
            inputRef={passwordRef}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPin((v) => !v)} edge="end">
                    <Iconify icon={showPin ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      )}

      {/* ── Step: OTP ── */}
      {step === 'otp' && (
        <RHFTextField
          name="otp"
          label={isForgotPin ? 'OTP (Forgot PIN Reset)' : 'One-Time Password (OTP)'}
          placeholder="Enter 6-digit OTP"
          inputProps={{ maxLength: 6 }}
          autoFocus
          helperText={
            <Stack direction="row" justifyContent="space-between" component="span">
              <span>Enter the OTP sent to your mobile</span>
              <Typography
                component="span" variant="caption" color="primary.main"
                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                onClick={handleResendOtp}
              >
                Resend OTP
              </Typography>
            </Stack>
          }
        />
      )}

      {/* ── Step: Enter PIN ── */}
      {step === 'pin' && (
        <RHFTextField
          name="pin"
          label="4-Digit PIN"
          placeholder="Enter your PIN"
          type={showPin ? 'text' : 'password'}
          inputProps={{ maxLength: 4, inputMode: 'numeric' }}
          autoFocus
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPin((v) => !v)} edge="end">
                  <Iconify icon={showPin ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      )}

      {/* ── Step: Set PIN ── */}
      {step === 'set-pin' && (
        <Stack spacing={2}>
          <RHFTextField
            name="pin"
            label="New 4-Digit PIN"
            placeholder="Choose your PIN"
            type={showPin ? 'text' : 'password'}
            inputProps={{ maxLength: 4, inputMode: 'numeric' }}
            autoFocus
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPin((v) => !v)} edge="end">
                    <Iconify icon={showPin ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <RHFTextField
            name="confirmPin"
            label="Confirm PIN"
            placeholder="Re-enter your PIN"
            type={showPin ? 'text' : 'password'}
            inputProps={{ maxLength: 4, inputMode: 'numeric' }}
          />
        </Stack>
      )}

      {/* Submit Button */}
      <LoadingButton
        fullWidth color="inherit" size="large" type="submit"
        variant="contained" loading={isSubmitting}
        startIcon={<Iconify icon={config.icon} />}
        sx={{ mt: 3 }}
      >
        {config.buttonLabel}
      </LoadingButton>

      {/* Navigation links */}
      <Stack spacing={0.5} sx={{ mt: 2 }} alignItems="center">
        {step === 'phone' && (
          <Typography
            variant="caption" color="primary.main"
            sx={{ cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => setStep('admin-password')}
          >
            Switch to Admin / Staff Login
          </Typography>
        )}
        {step === 'admin-password' && (
          <Typography
            variant="caption" color="primary.main"
            sx={{ cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => setStep('phone')}
          >
            ← Back to Mobile Login
          </Typography>
        )}
        {step === 'pin' && (
          <Typography
            variant="caption" color="primary.main"
            sx={{ cursor: 'pointer', fontWeight: 'bold' }}
            onClick={handleForgotPin}
          >
            Forgot PIN? Use OTP instead
          </Typography>
        )}
        {step !== 'phone' && step !== 'admin-password' && (
          <Typography
            variant="caption" color="text.secondary"
            sx={{ cursor: 'pointer' }}
            onClick={() => { setStep('phone'); setIsForgotPin(false); setErrorMsg(''); }}
          >
            ← Use a different number
          </Typography>
        )}
      </Stack>
    </FormProvider>
  );
}
