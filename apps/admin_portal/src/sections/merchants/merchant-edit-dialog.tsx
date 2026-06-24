import { useState, useEffect } from 'react';
// @mui
import {
  Dialog,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Box,
  Switch,
  FormControlLabel,
  Typography,
  InputAdornment,
  IconButton,
  Chip,
} from '@mui/material';
// types
import { IMerchantItem } from 'src/types/merchant';
// auth
import { useAuthContext } from 'src/auth/hooks';
// utils
import { getCountries, getStates, getCities } from 'src/utils/ApiActions';
import axios from 'src/utils/axios';
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type LocationOption = { id: string; name: string };

type Props = {
  open: boolean;
  onClose: VoidFunction;
  merchant: IMerchantItem | null;
  allMerchants?: IMerchantItem[];
  onUpdate: (updatedMerchant: IMerchantItem) => void;
};

export default function MerchantEditDialog({ open, onClose, merchant, allMerchants = [], onUpdate }: Props) {
  const { user } = useAuthContext();
  const canManageVoiceAI = user?.role === 'super_admin' || user?.role === 'regional_manager';
  const isCityManager = user?.role === 'city_manager';

  const [formData, setFormData] = useState<Partial<IMerchantItem>>({});

  const { enqueueSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Location cascading state
  const [countries, setCountries] = useState<LocationOption[]>([]);
  const [states, setStates] = useState<LocationOption[]>([]);
  const [cities, setCities] = useState<LocationOption[]>([]);

  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');

  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Load countries once on open
  useEffect(() => {
    if (!open) return;
    setLoadingCountries(true);
    getCountries()
      .then((res) => {
        if (res?.success) setCountries(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoadingCountries(false));
  }, [open]);

  // NOTE: State/city loading is handled in two ways:
  // 1. Eagerly in the merchant useEffect below (for pre-populating existing location)
  // 2. In handleCountryChange / handleStateChange (for user-driven cascading changes)

  // Populate form when merchant changes
  useEffect(() => {
    if (!merchant) return;

    setTestResult(null);

    setFormData({
      integrationName: merchant.integrationName || '',
      phoneNumber: merchant.phoneNumber || '',
      category: merchant.category || '',
      email: merchant.email || '',
      addressLine: merchant.addressLine || '',
      gstNumber: merchant.gstNumber || '',
      panNumber: merchant.panNumber || '',
      aadharNumber: merchant.aadharNumber || '',
      parentId: merchant.parentId || '',
      pstnDID: merchant.pstnDID || '',
      deliveryFee: merchant.deliveryFee || 0,
      minimumOrderValue: merchant.minimumOrderValue || 0,
      estimatedDeliveryTime: merchant.estimatedDeliveryTime || 30,
      latitude: merchant.latitude || '',
      longitude: merchant.longitude || '',
      pincode: merchant.pincode || '',
      loginPin: '',
      pidge: merchant.pidge || {
        enabled: false,
        username: '',
        password: '',
        environment: 'sandbox'
      },
    });

    const cntId = merchant.countryId || '';
    const stId = merchant.stateId || '';
    const ctId = merchant.cityId || '';

    setSelectedCountryId(cntId);
    setSelectedStateId(stId);
    setSelectedCityId(ctId);

    // Eagerly pre-load states & cities for the merchant's existing location
    if (stId) {
      setLoadingCities(true);
      getCities(stId)
        .then((res) => { if (res?.success) setCities(res.data || []); })
        .catch(console.error)
        .finally(() => setLoadingCities(false));
    }
    if (cntId) {
      setLoadingStates(true);
      getStates(cntId)
        .then((res) => { if (res?.success) setStates(res.data || []); })
        .catch(console.error)
        .finally(() => setLoadingStates(false));
    }
  }, [merchant]);


  const handleChange = (field: keyof IMerchantItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePidgeChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      pidge: {
        ...(prev.pidge || { enabled: false, username: '', password: '', environment: 'sandbox' }),
        [field]: value,
      },
    }));
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const payload = {
        integrationId: merchant?.id,
        username: formData.pidge?.username || '',
        password: formData.pidge?.password || '',
        environment: formData.pidge?.environment || 'sandbox',
      };
      
      const response = await axios.post('/api/v1/deliveries/pidge/test-connection', payload);
      if (response.data?.success) {
        setTestResult({
          success: true,
          message: response.data.message || 'Connected to Pidge Sandbox',
        });
        enqueueSnackbar('Connection successful', { variant: 'success' });
      } else {
        setTestResult({
          success: false,
          message: response.data?.message || 'Connection failed',
        });
        enqueueSnackbar('Connection failed', { variant: 'error' });
      }
    } catch (error: any) {
      console.error(error);
      const errMsg = error?.message || 'Connection failed';
      setTestResult({
        success: false,
        message: errMsg,
      });
      enqueueSnackbar(errMsg, { variant: 'error' });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleCountryChange = (countryId: string) => {
    setSelectedCountryId(countryId);
    setSelectedStateId('');
    setSelectedCityId('');
    setCities([]);
    if (!countryId) {
      setStates([]);
      return;
    }
    setLoadingStates(true);
    getStates(countryId)
      .then((res) => { if (res?.success) setStates(res.data || []); })
      .catch(console.error)
      .finally(() => setLoadingStates(false));
  };

  const handleStateChange = (stateId: string) => {
    setSelectedStateId(stateId);
    setSelectedCityId('');
    if (!stateId) {
      setCities([]);
      return;
    }
    setLoadingCities(true);
    getCities(stateId)
      .then((res) => { if (res?.success) setCities(res.data || []); })
      .catch(console.error)
      .finally(() => setLoadingCities(false));
  };


  const handleSubmit = () => {
    if (merchant) {
      // Resolve display names from selected IDs
      const cityName = cities.find((c) => c.id === selectedCityId)?.name || formData.city || merchant.city || '';
      const stateName = states.find((s) => s.id === selectedStateId)?.name || formData.state || merchant.state || '';

      onUpdate({
        ...merchant,
        ...formData,
        city: cityName,
        state: stateName,
        cityId: selectedCityId || null,
        stateId: selectedStateId || null,
        countryId: selectedCountryId || null,
      } as IMerchantItem);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 2 }}>Edit Merchant Details</DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
        <Grid container spacing={3}>
          {/* ── Left column ── */}
          <Grid item xs={12} sm={6}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Business Name"
                value={formData.integrationName || ''}
                onChange={(e) => handleChange('integrationName', e.target.value)}
              />

              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber || ''}
                inputProps={{ maxLength: 10 }}
                onChange={(e) => {
                  const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                  handleChange('phoneNumber', onlyNums);
                }}
              />

              <TextField
                fullWidth
                select
                label="Category"
                value={formData.category || ''}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                <MenuItem value="FB">Food &amp; Beverage</MenuItem>
                <MenuItem value="GROCERY">Grocery</MenuItem>
                <MenuItem value="Electronics">Electronics</MenuItem>
                <MenuItem value="Retail">Retail</MenuItem>
                <MenuItem value="Services">Services</MenuItem>
                <MenuItem value="Govt Sector">Govt Sector</MenuItem>
                <MenuItem value="General">General Store</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
              />


            </Stack>
          </Grid>

          {/* ── Right column ── */}
          <Grid item xs={12} sm={6}>
            <Stack spacing={2.5}>
              {/* Country dropdown */}
              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  value={selectedCountryId}
                  label="Country"
                  onChange={(e) => handleCountryChange(e.target.value)}
                  endAdornment={loadingCountries ? <CircularProgress size={18} sx={{ mr: 2 }} /> : null}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {countries.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* State dropdown — depends on country */}
              <FormControl fullWidth disabled={loadingStates}>
                <InputLabel>State</InputLabel>
                <Select
                  value={selectedStateId}
                  label="State"
                  onChange={(e) => handleStateChange(e.target.value)}
                  endAdornment={loadingStates ? <CircularProgress size={18} sx={{ mr: 2 }} /> : null}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {states.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* City dropdown — depends on state; locked for city_manager */}
              <FormControl fullWidth disabled={!selectedStateId || loadingCities || isCityManager}>
                <InputLabel>City</InputLabel>
                <Select
                  value={selectedCityId}
                  label="City"
                  onChange={(e) => setSelectedCityId(e.target.value)}
                  endAdornment={loadingCities ? <CircularProgress size={18} sx={{ mr: 2 }} /> : null}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {cities.map((city) => (
                    <MenuItem key={city.id} value={city.id}>{city.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Address Line"
                value={formData.addressLine || ''}
                onChange={(e) => handleChange('addressLine', e.target.value)}
              />

              <TextField
                fullWidth
                label="PIN Code"
                value={formData.pincode || ''}
                onChange={(e) => handleChange('pincode', e.target.value)}
              />

              <TextField
                fullWidth
                label="Latitude (Auto-Resolved if blank)"
                value={formData.latitude || ''}
                onChange={(e) => handleChange('latitude', e.target.value)}
              />

              <TextField
                fullWidth
                label="Longitude (Auto-Resolved if blank)"
                value={formData.longitude || ''}
                onChange={(e) => handleChange('longitude', e.target.value)}
              />

              {canManageVoiceAI && (
                <TextField
                  fullWidth
                  label="Voice Call DID Number"
                  value={formData.pstnDID || ''}
                  helperText="PSTN Call Routing Number (e.g. 1234567890)"
                  onChange={(e) => handleChange('pstnDID', e.target.value)}
                />
              )}

              <TextField
                fullWidth
                label="Manual Login PIN (Temporary)"
                value={formData.loginPin || ''}
                inputProps={{ maxLength: 4 }}
                onChange={(e) => {
                  const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                  handleChange('loginPin', onlyNums);
                }}
                helperText="Set a temporary 4-digit numeric login PIN for this vendor account"
              />
            </Stack>
          </Grid>

          {/* ── Delivery Settings ── */}
          <Grid item xs={12}>
            <DialogTitle sx={{ px: 0, pb: 1, pt: 1, fontSize: '1rem', fontWeight: 'bold' }}>
              Delivery Settings
            </DialogTitle>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={formData.pidge?.enabled ? 6 : 4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Minimum Order Value (₹)"
                  value={formData.minimumOrderValue ?? 0}
                  onChange={(e) => handleChange('minimumOrderValue', parseFloat(e.target.value) || 0)}
                />
              </Grid>
              <Grid item xs={12} sm={formData.pidge?.enabled ? 6 : 4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Est. Delivery Time (minutes)"
                  value={formData.estimatedDeliveryTime ?? 30}
                  onChange={(e) => handleChange('estimatedDeliveryTime', parseInt(e.target.value) || 0)}
                />
              </Grid>
              {!formData.pidge?.enabled && (
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Fallback Delivery Fee (₹)"
                    value={formData.deliveryFee ?? 0}
                    onChange={(e) => handleChange('deliveryFee', parseFloat(e.target.value) || 0)}
                  />
                </Grid>
              )}
            </Grid>
          </Grid>

          {/* ── Pidge Delivery Integration ── */}
          <Grid item xs={12}>
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 2.5, mt: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!formData.pidge?.enabled}
                    onChange={(e) => handlePidgeChange('enabled', e.target.checked)}
                  />
                }
                label={
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Enable Pidge Delivery Integration
                  </Typography>
                }
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                When enabled, Tubulu will dynamically fetch live delivery quotes from Pidge instead of charging a flat fallback delivery fee.
              </Typography>

              {formData.pidge?.enabled && (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Pidge Username"
                      value={formData.pidge?.username || ''}
                      onChange={(e) => handlePidgeChange('username', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type={showPassword ? 'text' : 'password'}
                      label="Pidge Password"
                      value={formData.pidge?.password || ''}
                      onChange={(e) => handlePidgeChange('password', e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      select
                      label="Environment"
                      value={formData.pidge?.environment || 'sandbox'}
                      onChange={(e) => handlePidgeChange('environment', e.target.value)}
                    >
                      <MenuItem value="sandbox">Sandbox (Development)</MenuItem>
                      <MenuItem value="production">Production</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleTestConnection}
                      disabled={testingConnection}
                      startIcon={testingConnection ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                      Test Connection
                    </Button>
                    {testResult && (
                      <Chip
                        icon={<Iconify icon={testResult.success ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} />}
                        label={testResult.message}
                        color={testResult.success ? 'success' : 'error'}
                        variant="soft"
                      />
                    )}
                  </Grid>
                </Grid>
              )}
            </Box>
          </Grid>

          {/* ── KYC & Tax Details ── */}
          <Grid item xs={12}>
            <DialogTitle sx={{ px: 0, pb: 1, pt: 1, fontSize: '1rem', fontWeight: 'bold' }}>
              KYC &amp; Tax Details
            </DialogTitle>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="GST Number"
                  value={formData.gstNumber || ''}
                  onChange={(e) => handleChange('gstNumber', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="PAN Number"
                  value={formData.panNumber || ''}
                  onChange={(e) => handleChange('panNumber', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Aadhaar Number"
                  value={formData.aadharNumber || ''}
                  onChange={(e) => handleChange('aadharNumber', e.target.value)}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
