import { Helmet } from 'react-helmet-async';
import { Box, Button, Card, Container, Typography, Stack } from '@mui/material';
import { useAuthContext } from 'src/auth/hooks';
import Iconify from 'src/components/iconify';

export default function PendingApprovalPage() {
  const { user, logout } = useAuthContext();

  return (
    <>
      <Helmet>
        <title> Tubulu: Pending Approval</title>
      </Helmet>

      <Container sx={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center' }}>
        <Card sx={{ p: 5, maxWidth: 540, textAlign: 'center', boxShadow: 3, borderRadius: 2 }}>
          <Box sx={{ mb: 3, display: 'inline-flex', p: 2, bgcolor: 'warning.lighter', borderRadius: '50%', color: 'warning.main' }}>
            <Iconify icon="solar:clock-square-bold" width={64} />
          </Box>

          <Typography variant="h4" gutterBottom>
            Application Under Review
          </Typography>

          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
            Hello <strong>{user?.firstName || 'Vendor'}</strong>, your onboarding submission has been received successfully! 
            Our Super Admin team is currently reviewing your KYC documents and integration setup. You will be notified as soon as your account is activated.
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="solar:refresh-bold" />}
              onClick={() => window.location.reload()}
            >
              Refresh Status
            </Button>

            <Button
              variant="contained"
              color="error"
              startIcon={<Iconify icon="solar:logout-bold" />}
              onClick={logout}
            >
              Logout
            </Button>
          </Stack>
        </Card>
      </Container>
    </>
  );
}
