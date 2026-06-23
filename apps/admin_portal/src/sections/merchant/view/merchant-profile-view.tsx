import { useState, useEffect, useCallback } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Grid,
  Stack,
  Typography,
  Container,
  Tab,
  Tabs,
  TextField,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
// auth
import { useAuthContext } from 'src/auth/hooks';
// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFUpload, RHFSwitch } from 'src/components/hook-form';
import { axios } from 'src/utils/axios';

// ----------------------------------------------------------------------

export default function MerchantProfileView() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();

  const [currentTab, setCurrentTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [parentBrand, setParentBrand] = useState<{ id: string; name: string } | null>(null);

  // Separate state for pending logo upload (kept outside Yup schema so it's not stripped)
  const [logoUploadData, setLogoUploadData] = useState<{ base64: string; fileName: string; mimeType: string } | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>('');

  const RECEIPT_DEFAULTS = {
    primaryColor: '#007bff',
    logoUrl: '',
    headerNote: '',
    footerNote: 'Powered by Tubulu',
    gstNumber: '',
    centralTaxRate: 2.5,
    stateTaxRate: 2.5,
  };

  // Helper: coerce empty string to undefined for number fields so Yup doesn't see NaN
  const numField = (msg?: string) =>
    Yup.number()
      .transform((val, orig) => (orig === '' || orig === null || orig === undefined ? undefined : val))
      .nullable()
      .typeError(msg || 'Must be a number');

  const ProfileSchema = Yup.object().shape({
    integrationName: Yup.string().required('Business name is required'),
    email: Yup.string().email('Must be a valid email').nullable(),
    description: Yup.string().nullable(),
    addressLine: Yup.string().nullable(),
    city: Yup.string().nullable(),
    state: Yup.string().nullable(),
    pincode: Yup.string().nullable(),
    gstNumber: Yup.string().nullable(),
    panNumber: Yup.string().nullable(),
    aadharNumber: Yup.string().nullable(),
    documents: Yup.array(),
    verticalType: Yup.string().nullable(),
    deliveryFee: numField('Delivery Fee must be a number').min(0, 'Must be at least 0'),
    minimumOrderValue: numField('Minimum Order Value must be a number').min(0, 'Must be at least 0'),
    estimatedDeliveryTime: numField('Estimated Delivery Time must be a number').min(0, 'Must be at least 0'),
    receiptSettings: Yup.object().shape({
      primaryColor: Yup.string().nullable(),
      logoUrl: Yup.string().nullable(),
      headerNote: Yup.string().nullable(),
      footerNote: Yup.string().nullable(),
      gstNumber: Yup.string().nullable(),
      centralTaxRate: numField().min(0, 'Min 0').max(100, 'Max 100'),
      stateTaxRate: numField().min(0, 'Min 0').max(100, 'Max 100'),
    }),
    openingHours: Yup.object().nullable(),
  });

  const methods = useForm({
    resolver: yupResolver(ProfileSchema),
    defaultValues: {
      integrationName: '',
      email: '',
      description: '',
      addressLine: '',
      city: '',
      state: '',
      pincode: '',
      gstNumber: '',
      panNumber: '',
      aadharNumber: '',
      documents: [],
      verticalType: '',
      deliveryFee: 0,
      minimumOrderValue: 0,
      estimatedDeliveryTime: 30,
      receiptSettings: { ...RECEIPT_DEFAULTS },
      openingHours: {
        monday: { open: '09:00', close: '22:00', isOpen: true },
        tuesday: { open: '09:00', close: '22:00', isOpen: true },
        wednesday: { open: '09:00', close: '22:00', isOpen: true },
        thursday: { open: '09:00', close: '22:00', isOpen: true },
        friday: { open: '09:00', close: '22:00', isOpen: true },
        saturday: { open: '09:00', close: '22:00', isOpen: true },
        sunday: { open: '09:00', close: '22:00', isOpen: true },
      },
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const fetchProfile = useCallback(async () => {
    try {
      const response = await axios.get('/api/v1/integrations/myDetails');
      if (response.data.success) {
        const profileData = response.data.data;
        const mergedReceiptSettings = {
          ...RECEIPT_DEFAULTS,
          ...(profileData.receiptSettings || {})
        };
        const mergedOpeningHours = {
          monday: { open: '09:00', close: '22:00', isOpen: true },
          tuesday: { open: '09:00', close: '22:00', isOpen: true },
          wednesday: { open: '09:00', close: '22:00', isOpen: true },
          thursday: { open: '09:00', close: '22:00', isOpen: true },
          friday: { open: '09:00', close: '22:00', isOpen: true },
          saturday: { open: '09:00', close: '22:00', isOpen: true },
          sunday: { open: '09:00', close: '22:00', isOpen: true },
          ...(profileData.openingHours || {})
        };
        profileData.receiptSettings = mergedReceiptSettings;
        profileData.openingHours = mergedOpeningHours;
        reset(profileData);
        // Restore logo preview from saved GCS url
        if (mergedReceiptSettings.logoUrl) {
          setLogoPreviewUrl(mergedReceiptSettings.logoUrl);
        }
        // If this is a branch, fetch the parent brand info
        if (profileData.parentId) {
          try {
            const parentRes = await axios.get('/api/v1/integrations/branch/parent');
            if (parentRes.data?.success && parentRes.data?.data) {
              setParentBrand({ id: parentRes.data.data.id, name: parentRes.data.data.integrationName || 'Parent Brand' });
            }
          } catch {
            setParentBrand({ id: profileData.parentId, name: 'Parent Brand' });
          }
        } else {
          setParentBrand(null);
        }
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to fetch profile', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [reset, enqueueSnackbar]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Build final payload — inject logo outside Yup-validated data to avoid stripping
      const payload = {
        ...data,
        receiptSettings: {
          ...(data.receiptSettings || {}),
          ...(logoUploadData ? { logo: logoUploadData } : {}),
        },
      };

      const response = await axios.patch('/api/v1/integrations/merchant/update', payload);
      if (response.data.success) {
        enqueueSnackbar('Profile updated successfully');
        const saved = response.data.data;
        const mergedReceiptSettings = {
          ...RECEIPT_DEFAULTS,
          ...(saved.receiptSettings || {}),
        };
        const mergedOpeningHours = {
          monday: { open: '09:00', close: '22:00', isOpen: true },
          tuesday: { open: '09:00', close: '22:00', isOpen: true },
          wednesday: { open: '09:00', close: '22:00', isOpen: true },
          thursday: { open: '09:00', close: '22:00', isOpen: true },
          friday: { open: '09:00', close: '22:00', isOpen: true },
          saturday: { open: '09:00', close: '22:00', isOpen: true },
          sunday: { open: '09:00', close: '22:00', isOpen: true },
          ...(saved.openingHours || {})
        };
        saved.receiptSettings = mergedReceiptSettings;
        saved.openingHours = mergedOpeningHours;
        reset(saved);
        if (mergedReceiptSettings.logoUrl) {
          setLogoPreviewUrl(mergedReceiptSettings.logoUrl);
        } else if (!logoUploadData) {
          setLogoPreviewUrl('');
        }
        setLogoUploadData(null);
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Update failed', { variant: 'error' });
    }
  });

  // Handle receipt logo file selection via hidden input
  const handleLogoFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          const base64 = dataUrl.split(',')[1];
          // Store upload payload in separate state (outside Yup schema)
          setLogoUploadData({ base64, fileName: file.name, mimeType: file.type });
          // Store data URL for local preview only
          setLogoPreviewUrl(dataUrl);
          enqueueSnackbar('Receipt logo staged — click "Save Changes" to upload.');
        };
        reader.readAsDataURL(file);
      }
      // Reset so same file can be re-selected
      e.target.value = '';
    },
    [enqueueSnackbar]
  );

  const handleDrop = useCallback(
    async (acceptedFiles: File[], type: string) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64 = e.target?.result as string;
          const newDoc = {
            base64,
            fileName: file.name,
            mimeType: file.type,
            type,
          };
          
          const currentDocs = methods.getValues('documents') || [];
          methods.setValue('documents', [...currentDocs, newDoc]);
          
          enqueueSnackbar(`Document uploaded.`);
        };
        reader.readAsDataURL(file);
      }
    },
    [methods, enqueueSnackbar]
  );



  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <Typography variant="h4" sx={{ mb: parentBrand ? 1.5 : 3 }}>
        Business Profile
      </Typography>

      {/* Branch Identity Banner */}
      {parentBrand && (
        <Box
          sx={{
            mb: 3,
            px: 2.5,
            py: 1.5,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.lighter} 0%, ${theme.palette.info.lighter} 100%)`,
            border: (theme) => `1px solid ${theme.palette.primary.light}`,
          }}
        >
          <Iconify
            icon="solar:branching-paths-bold"
            sx={{ color: 'primary.main', width: 22, height: 22, flexShrink: 0 }}
          />
          <Box>
            <Typography variant="caption" sx={{ color: 'primary.dark', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Branch Location
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
              Part of&nbsp;<strong>{parentBrand.name}</strong>
            </Typography>
          </Box>
          <Box
            sx={{
              ml: 'auto',
              px: 1.5,
              py: 0.4,
              borderRadius: 1,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            Branch
          </Box>
        </Box>
      )}

      <Tabs
        value={currentTab}
        onChange={(event, newValue) => setCurrentTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="General" value="general" icon={<Iconify icon="solar:user-id-bold" width={24} />} />
        <Tab label="Store Timings" value="timings" icon={<Iconify icon="solar:clock-circle-bold" width={24} />} />
        <Tab label="KYC Compliance" value="kyc" icon={<Iconify icon="solar:shield-check-bold" width={24} />} />
        <Tab label="Contact" value="contact" icon={<Iconify icon="solar:phone-bold" width={24} />} />
        <Tab label="Receipt Settings" value="receipt" icon={<Iconify icon="solar:bill-list-bold-duotone" width={24} />} />
      </Tabs>
 
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          {currentTab === 'timings' && (
            <Grid item xs={12}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Store Timings</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Day</TableCell>
                        <TableCell>Open Time</TableCell>
                        <TableCell>Close Time</TableCell>
                        <TableCell align="right">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                        const isOpen = methods.watch(`openingHours.${day}.isOpen` as any);
                        return (
                          <TableRow key={day}>
                            <TableCell sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{day}</TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`openingHours.${day}.open` as any}
                                type="time"
                                size="small"
                                disabled={!isOpen}
                                InputLabelProps={{ shrink: true }}
                                sx={{ width: 150 }}
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`openingHours.${day}.close` as any}
                                type="time"
                                size="small"
                                disabled={!isOpen}
                                InputLabelProps={{ shrink: true }}
                                sx={{ width: 150 }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <RHFSwitch
                                name={`openingHours.${day}.isOpen` as any}
                                label={isOpen ? 'Open' : 'Closed'}
                                labelPlacement="start"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>
          )}

          {currentTab === 'general' && (
            <Grid item xs={12}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <Box
                    columnGap={2}
                    rowGap={3}
                    display="grid"
                    gridTemplateColumns={{ xs: '1fr', md: 'repeat(2, 1fr)' }}
                  >
                    <RHFTextField name="integrationName" label="Business Name" disabled />
                    <RHFTextField name="email" label="Email Address" disabled />
                  </Box>
                  <RHFTextField name="description" label="Description" multiline rows={4} disabled />
                  <Box
                    columnGap={2}
                    rowGap={3}
                    display="grid"
                    gridTemplateColumns={{ xs: '1fr', md: 'repeat(2, 1fr)' }}
                  >
                    <RHFTextField name="addressLine" label="Address" disabled />
                    <RHFTextField name="city" label="City" disabled />
                    <RHFTextField name="state" label="State" disabled />
                    <RHFTextField name="pincode" label="Pincode" disabled />
                  </Box>
                </Stack>
              </Card>
            </Grid>
          )}

          {currentTab === 'kyc' && (
            <Grid item xs={12}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <Box
                    columnGap={2}
                    rowGap={3}
                    display="grid"
                    gridTemplateColumns={{ xs: '1fr', md: 'repeat(3, 1fr)' }}
                  >
                    <RHFTextField name="gstNumber" label="GST Number" />
                    <RHFTextField name="panNumber" label="PAN Number" />
                    <RHFTextField name="aadharNumber" label="Aadhaar Number" />
                  </Box>

                  <Divider sx={{ borderStyle: 'dashed' }} />

                  <Typography variant="subtitle2">KYC Documents</Typography>
                  <Grid container spacing={2}>
                    {['GST', 'PAN', 'Aadhaar'].map((type) => (
                      <Grid item xs={12} md={4} key={type}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Upload {type} Document
                          </Typography>
                        </Stack>
                        <RHFUpload
                          name={`${type.toLowerCase()}_file`}
                          onDrop={(files) => handleDrop(files, type)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              </Card>
            </Grid>
          )}

          {currentTab === 'contact' && (
            <Grid item xs={12}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <RHFTextField name="phoneNumber" label="Phone Number" disabled />
                  <RHFTextField name="website" label="Website URL" />
                </Stack>
              </Card>
            </Grid>
          )}

          {currentTab === 'receipt' && (
            <Grid container spacing={3} sx={{ px: 3, pt: 1 }}>
              {/* Form Input fields */}
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3 }}>
                  <Stack spacing={3}>
                    <Typography variant="h6">Receipt Customization</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Customize the details on the HTML and PDF receipts generated for your customers.
                    </Typography>

                    {/* Logo Upload — custom file input button */}
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                        Receipt Logo
                        {logoUploadData && (
                          <Typography component="span" variant="caption" sx={{ ml: 1, color: 'warning.main', fontWeight: 600 }}>
                            ✓ New logo staged — save to upload
                          </Typography>
                        )}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        {logoPreviewUrl ? (
                          <Box
                            component="img"
                            src={logoPreviewUrl}
                            alt="Receipt Logo"
                            sx={{ height: 56, width: 'auto', maxWidth: 120, objectFit: 'contain', border: '1px solid #e0e0e0', borderRadius: 1, p: 0.5, bgcolor: 'white' }}
                          />
                        ) : (
                          <Box sx={{ height: 56, width: 80, border: '1px dashed #bbb', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.disabled' }}>
                            <Iconify icon="solar:gallery-add-bold" width={28} />
                          </Box>
                        )}
                        <Stack spacing={0.5}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Iconify icon="solar:upload-bold" />}
                            component="label"
                            htmlFor="receipt-logo-input"
                          >
                            {logoPreviewUrl ? 'Change Logo' : 'Upload Logo'}
                          </Button>
                          <input
                            id="receipt-logo-input"
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleLogoFileChange}
                          />
                          {logoPreviewUrl && (
                            <Button
                              variant="text"
                              color="error"
                              size="small"
                              onClick={() => {
                                setLogoUploadData(null);
                                setLogoPreviewUrl('');
                                methods.setValue('receiptSettings.logoUrl', '');
                              }}
                            >
                              Remove
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </Box>

                    <RHFTextField
                      name="receiptSettings.headerNote"
                      label="Header Thank-You Note"
                      multiline
                      rows={2}
                      placeholder="e.g. Thank you for your business!"
                    />
                    <RHFTextField
                      name="receiptSettings.footerNote"
                      label="Footer Disclaimer / Terms"
                      multiline
                      rows={2}
                      placeholder="e.g. Powered by Tubulu. All sales are final."
                    />

                    <Divider sx={{ borderStyle: 'dashed' }} />

                    <Typography variant="subtitle2">GST Tax Rates</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Set your applicable central and state tax percentages. For Food &amp; Beverages the central tax will be shown as IGST.
                    </Typography>
                    <Box
                      columnGap={2}
                      rowGap={2}
                      display="grid"
                      gridTemplateColumns={{ xs: '1fr', md: 'repeat(2, 1fr)' }}
                    >
                      <RHFTextField
                        name="receiptSettings.centralTaxRate"
                        label={methods.watch('verticalType') === 'FB' ? 'IGST Rate (%)' : 'CGST Rate (%)'}
                        type="number"
                        placeholder="2.5"
                        inputProps={{ min: 0, max: 100, step: 0.5 }}
                      />
                      <RHFTextField
                        name="receiptSettings.stateTaxRate"
                        label="SGST Rate (%)"
                        type="number"
                        placeholder="2.5"
                        inputProps={{ min: 0, max: 100, step: 0.5 }}
                      />
                    </Box>
                  </Stack>
                </Card>
              </Grid>

              {/* Receipt Preview */}
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: 'grey.100', minHeight: 450 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>Live Receipt Preview</Typography>

                  {/* Receipt Mockup Card */}
                  <Box sx={{
                    width: '100%',
                    maxWidth: 360,
                    bgcolor: 'white',
                    borderRadius: 2,
                    boxShadow: 2,
                    p: 3,
                    fontFamily: 'sans-serif',
                    color: '#333'
                  }}>
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', borderBottom: '1px dashed #ccc', pb: 2, mb: 2 }}>
                      {logoPreviewUrl ? (
                        <Box sx={{ mb: 1.5 }}>
                          <img
                            src={logoPreviewUrl}
                            style={{ maxHeight: 50, objectFit: 'contain' }}
                            alt="Logo"
                          />
                        </Box>
                      ) : null}
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {methods.watch('integrationName') || 'Store Name'}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5 }}>
                        Order #ORD12345
                      </Typography>
                      {methods.watch('gstNumber') ? (
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5 }}>
                          GSTIN: {methods.watch('gstNumber')}
                        </Typography>
                      ) : null}
                      {[methods.watch('addressLine'), methods.watch('city'), methods.watch('state'), methods.watch('pincode')].filter(Boolean).join(', ') ? (
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5 }}>
                          {[methods.watch('addressLine'), methods.watch('city'), methods.watch('state'), methods.watch('pincode')].filter(Boolean).join(', ')}
                        </Typography>
                      ) : null}
                      {methods.watch('email') || user?.phoneNumber ? (
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5 }}>
                          Email: {methods.watch('email') || '—'} | Phone: {user?.phoneNumber || '—'}
                        </Typography>
                      ) : null}
                      {methods.watch('receiptSettings.headerNote') ? (
                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', mt: 1, fontSize: '0.85rem' }}>
                          "{methods.watch('receiptSettings.headerNote')}"
                        </Typography>
                      ) : null}
                    </Box>

                    {/* Items */}
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Items</Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Sample Butter Dosa x 2</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>₹200.00</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Sample Filter Coffee x 1</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>₹50.00</Typography>
                      </Box>
                    </Box>

                    {/* Total — tax exclusive: subtotal=250, tax added on top */}
                    {(() => {
                      const centralRate = parseFloat(String(methods.watch('receiptSettings.centralTaxRate') ?? 2.5)) || 0;
                      const stateRate = parseFloat(String(methods.watch('receiptSettings.stateTaxRate') ?? 2.5)) || 0;
                      const subtotal = 250;
                      const centralTax = parseFloat((subtotal * centralRate / 100).toFixed(2));
                      const stateTax = parseFloat((subtotal * stateRate / 100).toFixed(2));
                      const grandTotal = parseFloat((subtotal + centralTax + stateTax).toFixed(2));
                      const centralLabel = methods.watch('verticalType') === 'FB' ? 'IGST' : 'CGST';
                      const showTax = centralRate > 0 || stateRate > 0;
                      return (
                        <Box sx={{ borderTop: '1px dashed #ccc', pt: 1.5, mt: 1.5 }}>
                          {showTax ? (
                            <>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                                <Typography variant="body2" color="text.secondary">₹{subtotal.toFixed(2)}</Typography>
                              </Box>
                              {centralRate > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="body2" color="text.secondary">{centralLabel} ({centralRate}%)</Typography>
                                  <Typography variant="body2" color="text.secondary">₹{centralTax.toFixed(2)}</Typography>
                                </Box>
                              )}
                              {stateRate > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="body2" color="text.secondary">SGST ({stateRate}%)</Typography>
                                  <Typography variant="body2" color="text.secondary">₹{stateTax.toFixed(2)}</Typography>
                                </Box>
                              )}
                            </>
                          ) : null}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: showTax ? '1px dashed #eee' : 'none', pt: showTax ? 1 : 0 }}>
                            <Typography variant="body1">Grand Total</Typography>
                            <Typography variant="body1">₹{grandTotal.toFixed(2)}</Typography>
                          </Box>
                        </Box>
                      );
                    })()}

                    {/* Button Mockup */}
                    <Box sx={{
                      display: 'block',
                      bgcolor: '#000000',
                      color: 'white',
                      textAlign: 'center',
                      py: 1,
                      borderRadius: 1,
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      mt: 3,
                      cursor: 'default'
                    }}>
                      Download Tubulu App to See Full History
                    </Box>
                  </Box>

                  {/* Footer disclaimer */}
                  <Typography variant="caption" sx={{ mt: 3, color: 'text.secondary', textAlign: 'center', maxWidth: 300 }}>
                    {methods.watch('receiptSettings.footerNote') || 'Powered by Tubulu'}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          )}

          {currentTab !== 'general' && (
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="flex-end" spacing={2}>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  Save Changes
                </LoadingButton>
              </Stack>
            </Grid>
          )}
        </Grid>
      </FormProvider>
    </Container>
  );
}
