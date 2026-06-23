import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  LinearProgress,
  CardHeader,
  CardContent,
  Alert,
  Divider,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import axios from 'src/utils/axios';
import { useSnackbar } from 'src/components/snackbar';
import { useNavigate } from 'react-router-dom';

// ----------------------------------------------------------------------

const STEPS = ['Business Info', 'Location & GPS', 'KYC Details', 'Payment Settings'];

const VERTICAL_OPTIONS = [
  { value: 'FB', label: 'Food & Beverage' },
  { value: 'GROCERY', label: 'Grocery' },
  { value: 'RETAIL', label: 'Retail' },
  { value: 'SERVICES', label: 'Services' },
  { value: 'TICKETING', label: 'Ticketing' },
  { value: 'GOVT', label: 'Government Services' },
  { value: 'TECH', label: 'Tech' },
  { value: 'AI', label: 'AI Products' },
];

export default function EnablerOnboardPage() {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    integrationName: '',
    verticalType: 'FB',
    phoneNumber: '',
    email: '',
    ownerName: '',
    addressLine: '',
    pincode: '',
    cityId: user?.scopedCityId || '',
    cityName: user?.city || '',
    gpsLatitude: '',
    gpsLongitude: '',
    fieldNotes: '',
    gstNumber: '',
    panNumber: '',
    aadharNumber: '',
    upiVpa: '',
    upiMerchantName: '',
  });

  // GPS state
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // File uploading states (simulated)
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDocs, setUploadedDocs] = useState<Array<{ type: string; url: string; fileName: string }>>([]);

  useEffect(() => {
    // Keep city ID and name fresh from user scope
    if (user) {
      setFormData((prev) => ({
        ...prev,
        cityId: user.scopedCityId || '',
        cityName: user.city || '',
      }));
    }
  }, [user]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const captureGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          gpsLatitude: position.coords.latitude.toFixed(8),
          gpsLongitude: position.coords.longitude.toFixed(8),
        }));
        setGpsLoading(false);
        enqueueSnackbar('GPS coordinates captured successfully!', { variant: 'success' });
      },
      (error) => {
        console.error(error);
        setGpsError('Could not retrieve GPS. Please check location permissions.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSimulatedFileUpload = (docType: string, file: File | null) => {
    if (!file) return;

    setUploadingDoc(docType);
    setUploadProgress(10);

    const timer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            const simulatedUrl = `https://tubulu-kyc.s3.amazonaws.com/uploads/${docType}_${Date.now()}_${file.name}`;
            setUploadedDocs((prevDocs) => {
              // Remove if already exists, then append
              const filtered = prevDocs.filter((d) => d.type !== docType);
              return [...filtered, { type: docType, url: simulatedUrl, fileName: file.name }];
            });
            setUploadingDoc(null);
            setUploadProgress(0);
            enqueueSnackbar(`${file.name} uploaded successfully!`, { variant: 'success' });
          }, 400);
          return 100;
        }
        return prev + 30;
      });
    }, 300);
  };

  const handleNext = () => {
    // Basic step validation
    if (activeStep === 0) {
      if (!formData.integrationName || !formData.phoneNumber || !formData.ownerName) {
        enqueueSnackbar('Please fill all required fields', { variant: 'warning' });
        return;
      }
    }
    if (activeStep === 1) {
      if (!formData.addressLine || !formData.pincode) {
        enqueueSnackbar('Please fill in Address & Pincode', { variant: 'warning' });
        return;
      }
      if (!formData.gpsLatitude || !formData.gpsLongitude) {
        enqueueSnackbar('Please capture GPS coordinates to verify location', { variant: 'warning' });
        return;
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        documents: uploadedDocs,
      };

      const response = await axios.post('/api/v1/enabler/submit', payload);

      if (response.data.success) {
        enqueueSnackbar('Merchant onboard request submitted successfully!', { variant: 'success' });
        navigate('/dashboard/enabler/submissions');
      }
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(error.message || 'Failed to submit onboarding request', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <Typography variant="h6">Business Details</Typography>
            <TextField
              name="integrationName"
              label="Business Name (e.g. Imperial Hotel)"
              required
              fullWidth
              value={formData.integrationName}
              onChange={handleTextChange}
            />
            <FormControl fullWidth>
              <InputLabel>Vertical Category</InputLabel>
              <Select
                value={formData.verticalType}
                label="Vertical Category"
                onChange={(e) => handleSelectChange('verticalType', e.target.value)}
              >
                {VERTICAL_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="ownerName"
              label="Owner Full Name"
              required
              fullWidth
              value={formData.ownerName}
              onChange={handleTextChange}
            />
            <TextField
              name="phoneNumber"
              label="Owner Phone Number (10 digits)"
              required
              fullWidth
              value={formData.phoneNumber}
              onChange={handleTextChange}
            />
            <TextField
              name="email"
              label="Email Address"
              fullWidth
              value={formData.email}
              onChange={handleTextChange}
            />
          </Stack>
        );
      case 1:
        return (
          <Stack spacing={3}>
            <Typography variant="h6">Store Location & Geotagging</Typography>
            <TextField
              name="addressLine"
              label="Store Full Address"
              required
              fullWidth
              multiline
              rows={2}
              value={formData.addressLine}
              onChange={handleTextChange}
            />
            <TextField
              name="pincode"
              label="Pincode"
              required
              fullWidth
              value={formData.pincode}
              onChange={handleTextChange}
            />
            <TextField
              name="cityName"
              label="City (Assigned)"
              disabled
              fullWidth
              value={formData.cityName}
            />

            <Card sx={{ bgcolor: 'background.neutral', p: 3, border: '1px dashed', borderColor: 'divider' }}>
              <Stack spacing={2} alignItems="center" textAlign="center">
                <Iconify icon="solar:map-point-wave-bold-duotone" width={40} sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle2">Capture GPS Location Coordinates</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Please stand physically inside/near the store storefront for high geotagging accuracy.
                </Typography>
                <LoadingButton
                  variant="contained"
                  onClick={captureGPS}
                  loading={gpsLoading}
                  startIcon={<Iconify icon="solar:gps-bold" />}
                >
                  Get Coordinates
                </LoadingButton>
                {gpsError && <Alert severity="error">{gpsError}</Alert>}
                {formData.gpsLatitude && (
                  <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Lat:</strong> {formData.gpsLatitude}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Lng:</strong> {formData.gpsLongitude}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Card>

            <TextField
              name="fieldNotes"
              label="Field Executive Notes (Optional)"
              placeholder="e.g., Visited site, storefront verified, banners are visible."
              fullWidth
              multiline
              rows={3}
              value={formData.fieldNotes}
              onChange={handleTextChange}
            />
          </Stack>
        );
      case 2:
        return (
          <Stack spacing={3}>
            <Typography variant="h6">Business KYC Documents</Typography>
            <TextField
              name="gstNumber"
              label="GSTIN Number (Optional)"
              fullWidth
              value={formData.gstNumber}
              onChange={handleTextChange}
            />
            <TextField
              name="panNumber"
              label="PAN Card Number"
              fullWidth
              value={formData.panNumber}
              onChange={handleTextChange}
            />
            <TextField
              name="aadharNumber"
              label="Aadhaar Card Number"
              fullWidth
              value={formData.aadharNumber}
              onChange={handleTextChange}
            />

            <Typography variant="subtitle2" sx={{ mt: 2 }}>Upload Document Scans / Camera Captures</Typography>
            <Grid container spacing={2}>
              {['GST Certificate', 'PAN Card', 'Aadhaar Card', 'Shop Establishment License'].map((docType) => {
                const isUploaded = uploadedDocs.some((d) => d.type === docType);
                const isUploading = uploadingDoc === docType;
                return (
                  <Grid item xs={12} sm={6} key={docType}>
                    <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          {docType}
                        </Typography>
                        {isUploaded ? (
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'success.main' }}>
                            <Iconify icon="solar:check-circle-bold" />
                            <Typography variant="body2">Ready</Typography>
                          </Stack>
                        ) : (
                          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                            No scan uploaded
                          </Typography>
                        )}
                        {isUploading && (
                          <Box sx={{ width: '100%', mt: 1 }}>
                            <LinearProgress variant="determinate" value={uploadProgress} />
                            <Typography variant="caption">Uploading...</Typography>
                          </Box>
                        )}
                        <Button
                          variant="outlined"
                          size="small"
                          component="label"
                          startIcon={<Iconify icon="solar:camera-bold" />}
                          disabled={!!uploadingDoc}
                        >
                          Select / Capture File
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
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Stack>
        );
      case 3:
        return (
          <Stack spacing={3}>
            <Typography variant="h6">Bank & UPI Settlement Settings</Typography>
            <TextField
              name="upiVpa"
              label="UPI Address / VPA ID (e.g. storename@okaxis)"
              required
              fullWidth
              placeholder="storename@okaxis"
              value={formData.upiVpa}
              onChange={handleTextChange}
            />
            <TextField
              name="upiMerchantName"
              label="UPI Registered Merchant Name"
              required
              fullWidth
              value={formData.upiMerchantName}
              onChange={handleTextChange}
            />

            <Alert severity="info">
              Verify that the UPI ID is connected and can receive payments. The merchant's daily settlements will go directly to this address.
            </Alert>
          </Stack>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Onboard Merchant | Tubulu Enabler Portal</title>
      </Helmet>

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Stack spacing={3} sx={{ mb: 4 }}>
          <Typography variant="h4">Onboard a New Merchant</Typography>
          <Stepper activeStep={activeStep} alternativeLabel>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Stack>

        <Card>
          <CardHeader title={STEPS[activeStep]} titleTypographyProps={{ variant: 'h5' }} />
          <Divider />
          <CardContent sx={{ p: 4 }}>{renderStepContent(activeStep)}</CardContent>
          <Divider />
          <Stack direction="row" justifyContent="space-between" sx={{ p: 3 }}>
            <Button
              variant="outlined"
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<Iconify icon="solar:arrow-left-bold" />}
            >
              Back
            </Button>
            {activeStep === STEPS.length - 1 ? (
              <LoadingButton
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                loading={isSubmitting}
                endIcon={<Iconify icon="solar:check-circle-bold" />}
              >
                Submit Onboarding Request
              </LoadingButton>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<Iconify icon="solar:arrow-right-bold" />}
              >
                Next
              </Button>
            )}
          </Stack>
        </Card>
      </Container>
    </>
  );
}
