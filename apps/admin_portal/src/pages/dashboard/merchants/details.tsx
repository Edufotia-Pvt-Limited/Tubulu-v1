import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Divider,
  Container,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
} from '@mui/material';
// components
import { useSettingsContext } from 'src/components/settings';
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';
import { axios } from 'src/utils/axios';
import Label from 'src/components/label';
import LoadingScreen from 'src/components/loading-screen/loading-screen';
import {
  getCountries,
  getStates,
  getCities,
  assignVendorLocation,
} from 'src/utils/ApiActions';

// ----------------------------------------------------------------------

export default function MerchantDetailsPage() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();

  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [merchants, setMerchants] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [savingLocation, setSavingLocation] = useState(false);

  useEffect(() => {
    axios.get('/api/v1/admin/integrations?showAll=true')
      .then((res) => {
        if (res.data.success) {
          setMerchants(res.data.data.filter((m: any) => m.parentId === null && m.id !== id));
        }
      })
      .catch(console.error);

    getCountries().then((res) => {
      if (res.success) {
        setCountries(res.data || []);
      }
    });
  }, [id]);

  useEffect(() => {
    if (merchant) {
      setSelectedParentId(merchant.parentId || null);
      setSelectedCountryId(merchant.countryId || null);
      setSelectedStateId(merchant.stateId || null);
      setSelectedCityId(merchant.cityId || null);
    }
  }, [merchant]);

  useEffect(() => {
    if (selectedCountryId) {
      getStates(selectedCountryId).then((res) => {
        if (res.success) {
          setStates(res.data || []);
        }
      });
    } else {
      setStates([]);
    }
  }, [selectedCountryId]);

  useEffect(() => {
    if (selectedStateId) {
      getCities(selectedStateId).then((res) => {
        if (res.success) {
          setCities(res.data || []);
        }
      });
    } else {
      setCities([]);
    }
  }, [selectedStateId]);

  const handleSaveLocation = async () => {
    setSavingLocation(true);
    try {
      const res = await assignVendorLocation(id!, {
        countryId: selectedCountryId,
        stateId: selectedStateId,
        cityId: selectedCityId,
        parentId: selectedParentId,
      });
      if (res.success) {
        enqueueSnackbar('Location & Brand assignments saved successfully');
        fetchMerchant();
      }
    } catch (err: any) {
      enqueueSnackbar(err.message || 'Failed to save location assignment', { variant: 'error' });
    } finally {
      setSavingLocation(false);
    }
  };

  const fetchMerchant = useCallback(async () => {
    try {
      const response = await axios.get(`/api/v1/integrations/byId/${id}`);
      if (response.data.success) {
        setMerchant(response.data.data);
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to fetch merchant details', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id, enqueueSnackbar]);

  useEffect(() => {
    fetchMerchant();
  }, [fetchMerchant]);

  const handleStatusUpdate = async (status: 'Approved' | 'Rejected') => {
    try {
      const response = await axios.post('/api/v1/admin/integration/approve', {
        integrationId: id,
        isApproved: status === 'Approved' ? true : false
      });
      
      if (response.data.success) {
        enqueueSnackbar(`Merchant ${status} successfully`);
        fetchMerchant();
      }
    } catch (error) {
      enqueueSnackbar('Action failed', { variant: 'error' });
    }
  };

  const handleSuspend = async () => {
    try {
      const response = await axios.post('/api/v1/admin/integration/suspend', {
        integrationId: id,
        isSuspended: !merchant.isSuspended
      });
      if (response.data.success) {
        enqueueSnackbar(`Merchant ${merchant.isSuspended ? 'unsuspended' : 'suspended'} successfully`);
        fetchMerchant();
      }
    } catch (error) {
      enqueueSnackbar('Action failed', { variant: 'error' });
    }
  };

  if (loading) return <LoadingScreen />;
  if (!merchant) return <Container>Merchant not found</Container>;

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">Merchant Details</Typography>
        
        <Stack direction="row" spacing={2}>
          <Button 
            variant="contained" 
            color="success" 
            startIcon={<Iconify icon="solar:check-circle-bold" />}
            onClick={() => handleStatusUpdate('Approved')}
            disabled={merchant.isApproved}
          >
            Approve
          </Button>
          <Button 
            variant="outlined" 
            color={merchant.isSuspended ? 'success' : 'error'}
            startIcon={<Iconify icon={merchant.isSuspended ? 'solar:play-circle-bold' : 'solar:pause-circle-bold'} />}
            onClick={handleSuspend}
          >
            {merchant.isSuspended ? 'Unsuspend' : 'Suspend'}
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ mb: 2, position: 'relative', display: 'inline-block' }}>
              <Paper
                variant="outlined"
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'background.neutral'
                }}
              >
                {merchant.logo ? (
                    <img src={merchant.logo} alt={merchant.integrationName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <Iconify icon="solar:shop-bold" width={48} />
                )}
              </Paper>
            </Box>

            <Typography variant="h6">{merchant.integrationName}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>{merchant.email}</Typography>
            
            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
              <Label color={merchant.isApproved ? 'success' : 'warning'} variant="soft">
                {merchant.isApproved ? 'Approved' : 'Pending Review'}
              </Label>
              {merchant.isSuspended && (
                <Label color="error" variant="filled">
                  Suspended
                </Label>
              )}
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Business Information</Typography>
            <Stack spacing={2} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>GST Number</Typography>
                <Typography variant="subtitle2">{merchant.gstNumber || 'Not Provided'}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>PAN Number</Typography>
                <Typography variant="subtitle2">{merchant.panNumber || 'Not Provided'}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Aadhaar Number</Typography>
                <Typography variant="subtitle2">{merchant.aadharNumber || 'Not Provided'}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Location</Typography>
                <Typography variant="subtitle2">{`${merchant.city || ''}, ${merchant.state || ''}`}</Typography>
              </Stack>
            </Stack>
          </Card>

          <Card sx={{ p: 3, mt: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>KYC Documents</Typography>
            <Grid container spacing={2}>
              {(merchant.documents || []).map((doc: any, index: number) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Iconify icon="solar:document-bold" width={32} sx={{ color: 'primary.main' }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2">{doc.type}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{doc.fileName || 'document.pdf'}</Typography>
                      </Box>
                      <IconButton color="primary" href={doc.url} target="_blank">
                        <Iconify icon="solar:eye-bold" />
                      </IconButton>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
              {(!merchant.documents || merchant.documents.length === 0) && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>No documents uploaded yet.</Typography>
              )}
            </Grid>
          </Card>

          <Accordion sx={{ mt: 3 }} defaultExpanded>
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
              <Typography variant="subtitle1">Location & Brand Assignment</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                <Autocomplete
                  options={merchants}
                  getOptionLabel={(option) => option.integrationName || ''}
                  value={merchants.find((m) => m.id === selectedParentId) || null}
                  onChange={(event, newValue) => {
                    setSelectedParentId(newValue ? newValue.id : null);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Parent Brand (leave empty if this IS a brand HQ)"
                      variant="outlined"
                    />
                  )}
                />

                <FormControl fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={selectedCountryId || ''}
                    label="Country"
                    onChange={(e) => {
                      setSelectedCountryId(e.target.value || null);
                      setSelectedStateId(null);
                      setSelectedCityId(null);
                    }}
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {countries.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth disabled={!selectedCountryId}>
                  <InputLabel>State</InputLabel>
                  <Select
                    value={selectedStateId || ''}
                    label="State"
                    onChange={(e) => {
                      setSelectedStateId(e.target.value || null);
                      setSelectedCityId(null);
                    }}
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {states.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth disabled={!selectedStateId}>
                  <InputLabel>City</InputLabel>
                  <Select
                    value={selectedCityId || ''}
                    label="City"
                    onChange={(e) => setSelectedCityId(e.target.value || null)}
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {cities.map((city) => (
                      <MenuItem key={city.id} value={city.id}>
                        {city.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveLocation}
                  disabled={savingLocation}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Save Assignment
                </Button>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Container>
  );
}
