import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Avatar,
} from '@mui/material';
import { BiErrorCircle, BiArrowBack } from 'react-icons/bi';

const FAILURE_REASON_MAP: Record<string, string> = {
  access_denied: 'You cancelled the Razorpay authorization.',
  invalid_state: 'Session expired. Please try connecting again.',
  token_exchange_failed: 'Unable to complete Razorpay connection.',
  revoked: 'Razorpay access was revoked.',
  error: 'Something went wrong while connecting Razorpay.',
};

const PaymentFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const reason = searchParams.get('reason') || 'error';

  const message = useMemo(() => {
    return FAILURE_REASON_MAP[reason] || FAILURE_REASON_MAP.error;
  }, [reason]);

  return (
    <Box
      sx={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid #e5e7eb',
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Icon */}
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: '#fee2e2',
              mx: 'auto',
              mb: 2,
            }}
          >
            <BiErrorCircle size={34} color="#dc2626" />
          </Avatar>

          {/* Title */}
          <Typography fontSize={20} fontWeight={700} gutterBottom>
            Razorpay Connection Failed
          </Typography>

          {/* Message */}
          <Typography
            fontSize={14}
            color="text.secondary"
            sx={{ mb: 3, lineHeight: 1.6 }}
          >
            {message}
          </Typography>

          {/* Actions */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<BiArrowBack />}
            onClick={() => navigate('/dashboard/payment')}
            sx={{
              bgcolor: '#2563eb',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            Back to Payment Settings
          </Button>

          {/* Helper text */}
          <Typography
            fontSize={12}
            color="text.secondary"
            sx={{ mt: 2 }}
          >
            You can try connecting Razorpay again from the payment settings page.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentFailure;
