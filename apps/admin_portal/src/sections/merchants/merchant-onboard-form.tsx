import { useState, useCallback, useEffect } from 'react';
// @mui
import { 
  Typography, 
  Container, 
  Card, 
  Stack, 
  TextField, 
  Button, 
  MenuItem, 
  Alert,
  CircularProgress,
  Grid,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  InputAdornment
} from '@mui/material';
// routes
import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';
// utils
import axios, { endpoints } from 'src/utils/axios';
import { getStates, getCities } from 'src/utils/ApiActions';
// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const CATEGORIES = [
  { value: 'FB', label: 'Food & Beverage' },
  { value: 'GROCERY', label: 'Grocery' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Retail', label: 'Retail' },
  { value: 'Services', label: 'Services' },
  { value: 'Govt Sector', label: 'Govt Sector' },
  { value: 'General', label: 'General Store' },
];

const DOC_TYPES = [
  { value: 'GST', label: 'GST Certificate' },
  { value: 'PAN', label: 'PAN Card' },
  { value: 'AADHAAR', label: 'Aadhaar Card' },
  { value: 'SHOP_ACT', label: 'Shop Act License' },
  { value: 'OTHER', label: 'Other Document' },
];

interface FileUpload {
  type: string;
  file?: File;
  base64?: string;
  fileName: string;
  url?: string;
}

export default function MerchantOnboardForm() {
  const settings = useSettingsContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentId = null; // searchParams.get('parentId');
  const { user } = useAuthContext();

  const isSuperAdmin = user?.role === 'super_admin' || ['9999999999', '9844982389'].includes(user?.phoneNumber || '');
  const canManageVoiceAI = isSuperAdmin || user?.role === 'regional_manager';


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    countryCode: '+91',
    phoneNumber: '',
    integrationName: '',
    category: 'General',
    addressLine: '',
    city: '',
    state: '',
    stateId: '',
    cityId: '',
    country: 'India',
    pincode: '',
    latitude: '',
    longitude: '',
    gstNumber: '',
    panNumber: '',
    aadharNumber: '',
    shopEstablishmentNumber: '',
    parentId: '',
    pstnDID: '',
  });

  const [partners, setPartners] = useState<any[]>([]);
  const [allMerchants, setAllMerchants] = useState<any[]>([]);

  const fetchPartners = useCallback(async () => {
    try {
      const response = await axios.get(endpoints.merchants.list, { params: { showAll: 'true' } });
      const allIntegrations = response.data.data || [];
      setAllMerchants(allIntegrations);
      const regionalPartners = allIntegrations.filter((i: any) => i.role === 'regional_partner');
      setPartners(regionalPartners);
    } catch (error) {
      console.error('Failed to fetch partners:', error);
    }
  }, []);

  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  // Fetch states on mount if parentId is present
  useEffect(() => {
    if (parentId) {
      getStates().then(res => {
        if (res?.success) setStates(res.data || []);
      });
    }
  }, [parentId]);

  // Fetch cities when stateId changes
  useEffect(() => {
    if (parentId && formData.stateId) {
      getCities(formData.stateId).then(res => {
        if (res?.success) setCities(res.data || []);
      });
    } else {
      setCities([]);
    }
  }, [parentId, formData.stateId]);

  useEffect(() => {
    if (user) {
      const isCM = user.role === 'city_manager';
      const isRM = user.role === 'regional_manager' || user.role === 'state_manager';
      if (isCM) {
        setFormData(prev => ({
          ...prev,
          city: user.city || '',
          state: user.state || '',
          cityId: user.scopedCityId || '',
          stateId: user.scopedStateId || '',
          country: user.country || 'India'
        }));
      } else if (isRM) {
        setFormData(prev => ({
          ...prev,
          state: user.state || '',
          stateId: user.scopedStateId || '',
          country: user.country || 'India'
        }));
      }
    }
  }, [user]);

  useEffect(() => {
    if (parentId && allMerchants.length > 0) {
      const parentBrand = allMerchants.find(m => m.id === parentId);
      if (parentBrand) {
        setFormData(prev => ({
          ...prev,
          integrationName: parentBrand.integrationName || '',
          category: parentBrand.category || 'General',
          gstNumber: parentBrand.gstNumber || '',
          panNumber: parentBrand.panNumber || '',
          aadharNumber: parentBrand.aadharNumber || '',
          shopEstablishmentNumber: parentBrand.shopEstablishmentNumber || '',
        }));
      }
    }
  }, [parentId, allMerchants]);

  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [selectedDocType, setSelectedDocType] = useState('GST');

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          
          let guessedType = selectedDocType;
          const nameLower = file.name.toLowerCase();
          if (nameLower.includes('gst')) {
            guessedType = 'GST';
          } else if (nameLower.includes('pan')) {
            guessedType = 'PAN';
          } else if (nameLower.includes('aadhar') || nameLower.includes('aadhaar')) {
            guessedType = 'AADHAAR';
          } else if (nameLower.includes('shop') || nameLower.includes('license') || nameLower.includes('establishment')) {
            guessedType = 'SHOP_ACT';
          }

          setUploadedFiles(prev => {
            if (prev.some(p => p.fileName === file.name && p.file.size === file.size)) {
              return prev;
            }
            return [
              ...prev,
              {
                type: guessedType,
                file,
                base64: base64String,
                fileName: file.name
              }
            ];
          });
        };
        reader.readAsDataURL(file);
      });
    }
  }, [selectedDocType]);

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const isDuplicatePhone = formData.phoneNumber.length === 10 && allMerchants.some(
    m => m.phoneNumber === formData.phoneNumber || m.phoneNumber === `${formData.countryCode}${formData.phoneNumber}` || m.phoneNumber === `${formData.countryCode} ${formData.phoneNumber}`
  );

  const submitForm = async (isPending: boolean) => {
    if (isDuplicatePhone) {
      setError('This merchant number already exists.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        ...formData,
        phoneNumber: `${formData.countryCode}${formData.phoneNumber}`,
        parentId: parentId || undefined,
        isApproved: isPending ? false : true,
        isOnboarded: isPending ? false : true,
        isActive: true, // Show on the Shops page
        address: {
          addressLine: formData.addressLine,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          pincode: formData.pincode,
          cityId: formData.cityId || undefined,
          stateId: formData.stateId || undefined,
        },
        shopEstablishmentNumber: formData.shopEstablishmentNumber,
        documents: uploadedFiles.map(f => ({
          type: f.type,
          base64: f.base64,
          mimeType: f.file.type,
          fileName: f.fileName
        }))
      };

      await axios.post(endpoints.merchants.create, payload);
      setSuccess(true);
      setTimeout(() => {
        router.push(paths.dashboard.merchants.root);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to onboard merchant');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm(false);
  };

  const handleSavePending = async () => {
    await submitForm(true);
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={parentId ? "Add New Branch" : "Onboard New Merchant"}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Merchants', href: paths.dashboard.merchants.root },
          { name: parentId ? 'Add Branch' : 'Onboard' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      
      {success && <Alert severity="success" sx={{ mb: 3 }}>{parentId ? 'Branch added successfully!' : 'Merchant onboarded successfully!'} Redirecting...</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 4, mb: 3 }}>
              <Stack spacing={3}>
                <Typography variant="h6">{parentId ? 'Branch Information' : 'Store Information'}</Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Merchant Phone Number"
                      placeholder="e.g. 9876543210"
                      fullWidth
                      required
                      value={formData.phoneNumber}
                      inputProps={{ maxLength: 10, pattern: '[0-9]*' }}
                      error={isDuplicatePhone}
                      helperText={isDuplicatePhone ? 'This number already exists' : ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\\D/g, '');
                        if (val.length <= 10) setFormData({ ...formData, phoneNumber: val });
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <TextField
                              select
                              variant="standard"
                              value={formData.countryCode}
                              onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                              InputProps={{ disableUnderline: true }}
                              sx={{ width: 70, '& .MuiSelect-select': { py: 0, typography: 'body2' } }}
                            >
                              <MenuItem value="+91">+91</MenuItem>
                              <MenuItem value="+1">+1</MenuItem>
                              <MenuItem value="+44">+44</MenuItem>
                              <MenuItem value="+971">+971</MenuItem>
                              <MenuItem value="+61">+61</MenuItem>
                              <MenuItem value="+65">+65</MenuItem>
                            </TextField>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Store Name"
                      placeholder="e.g. Tubulu Snacks"
                      fullWidth
                      required
                      value={formData.integrationName}
                      disabled={!!parentId}
                      onChange={(e) => setFormData({ ...formData, integrationName: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      select
                      label="Business Category"
                      fullWidth
                      value={formData.category}
                      disabled={!!parentId}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {CATEGORIES.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {canManageVoiceAI && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Voice Call DID Number"
                        placeholder="Enter 10-digit DID number"
                        fullWidth
                        value={formData.pstnDID}
                        helperText="PSTN Call Routing Number for Voice Commerce"
                        onChange={(e) => setFormData({ ...formData, pstnDID: e.target.value })}
                      />
                    </Grid>
                  )}

                  {isSuperAdmin && (
                    <Grid item xs={12}>
                      <TextField
                        select
                        label="Assign to Regional Partner"
                        placeholder="Select a partner (Optional)"
                        fullWidth
                        value={formData.parentId}
                        onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                      >
                        <MenuItem value="">
                          <em>None (Direct Merchant)</em>
                        </MenuItem>
                        {partners.map((partner) => (
                          <MenuItem key={partner.id} value={partner.id}>
                            {partner.integrationName} ({partner.city})
                          </MenuItem>
                        ))}
                      </TextField>
                      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                        Assigning a partner will enable commission tracking for them.
                      </Typography>
                    </Grid>
                  )}
                </Grid>

                <Divider />
                
                <Typography variant="h6">Location Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Address Line"
                      fullWidth
                      value={formData.addressLine}
                      onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                    />
                  </Grid>
                  {parentId ? (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="State"
                          fullWidth
                          value={formData.stateId || ''}
                          onChange={(e) => {
                            const selectedStateId = e.target.value;
                            const stateObj = states.find(s => s.id === selectedStateId);
                            setFormData({ 
                              ...formData, 
                              stateId: selectedStateId, 
                              state: stateObj ? stateObj.name : '',
                              cityId: '',
                              city: '' 
                            });
                          }}
                        >
                          {states.map((s) => (
                            <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="City"
                          fullWidth
                          value={formData.cityId || ''}
                          disabled={!formData.stateId}
                          onChange={(e) => {
                            const selectedCityId = e.target.value;
                            const cityObj = cities.find(c => c.id === selectedCityId);
                            setFormData({ 
                              ...formData, 
                              cityId: selectedCityId, 
                              city: cityObj ? cityObj.name : '' 
                            });
                          }}
                        >
                          {cities.map((c) => (
                            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="City"
                          fullWidth
                          value={formData.city}
                          disabled={user?.role === 'city_manager'}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="State"
                          fullWidth
                          value={formData.state}
                          disabled={user?.role === 'city_manager' || user?.role === 'regional_manager' || user?.role === 'state_manager'}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        />
                      </Grid>
                    </>
                  )}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Pincode"
                      fullWidth
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Country"
                      fullWidth
                      value={formData.country}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Latitude (Auto-Resolved if blank)"
                      fullWidth
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Longitude (Auto-Resolved if blank)"
                      fullWidth
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    />
                  </Grid>
                </Grid>

                <Divider />

                <Typography variant="h6">KYC & Compliance</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="GST Number"
                      placeholder="e.g. 27AAAAA0000A1Z5"
                      fullWidth
                      value={formData.gstNumber}
                      disabled={!!parentId}
                      onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="PAN Number"
                      placeholder="e.g. ABCDE1234F"
                      fullWidth
                      value={formData.panNumber}
                      disabled={!!parentId}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Aadhaar Number"
                      placeholder="e.g. 1234 5678 9012"
                      fullWidth
                      value={formData.aadharNumber}
                      disabled={!!parentId}
                      onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Shop License Number (Shop Establishment)"
                      placeholder="e.g. MH-MUM-123456"
                      fullWidth
                      value={formData.shopEstablishmentNumber}
                      disabled={!!parentId}
                      onChange={(e) => setFormData({ ...formData, shopEstablishmentNumber: e.target.value })}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Card sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Upload Documents</Typography>
                <Stack spacing={2}>
                  <TextField
                    select
                    label="Document Type"
                    fullWidth
                    size="small"
                    value={selectedDocType}
                    onChange={(e) => setSelectedDocType(e.target.value)}
                  >
                    {DOC_TYPES.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Button
                    variant="contained"
                    component="label"
                    fullWidth
                    startIcon={<Iconify icon="eva:cloud-upload-fill" />}
                    sx={{ bgcolor: 'text.primary', color: 'background.paper' }}
                  >
                    Select File
                    <input type="file" hidden multiple onChange={handleFileChange} accept="image/*,application/pdf" />
                  </Button>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                    Supported: JPG, PNG, PDF (Max 5MB)
                  </Typography>
                </Stack>

                {uploadedFiles.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Selected Documents ({uploadedFiles.length})</Typography>
                    <List disablePadding>
                      {uploadedFiles.map((file, index) => (
                        <Paper key={index} variant="outlined" sx={{ mb: 1, p: 1 }}>
                          <ListItem
                            secondaryAction={
                              <IconButton edge="end" onClick={() => removeFile(index)}>
                                <Iconify icon="eva:trash-2-outline" />
                              </IconButton>
                            }
                            disablePadding
                          >
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <Iconify 
                                icon={file.url ? 'solar:file-check-bold' : (file.file?.type === 'application/pdf' ? 'solar:file-text-bold' : 'solar:gallery-bold')} 
                                color="primary.main"
                              />
                            </ListItemIcon>
                            <ListItemText 
                              primary={
                                <TextField
                                  select
                                  size="small"
                                  variant="standard"
                                  value={file.type}
                                  onChange={(event) => {
                                    const newType = event.target.value;
                                    setUploadedFiles(prev => prev.map((item, idx) => 
                                      idx === index ? { ...item, type: newType } : item
                                    ));
                                  }}
                                  sx={{ 
                                    width: 140, 
                                    '& .MuiInput-underline:before': { borderBottom: 'none' },
                                    '& .MuiInput-underline:after': { borderBottom: 'none' },
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {DOC_TYPES.map((option) => (
                                    <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.75rem' }}>
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              }
                              secondary={file.fileName}
                              secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
                            />
                          </ListItem>
                        </Paper>
                      ))}
                    </List>
                  </Box>
                )}
              </Card>

              <Card sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Please ensure all details are correct before submitting. Merchants will be notified via phone.
                </Typography>
                <Stack spacing={2}>
                  {!parentId && (
                    <Button
                      fullWidth
                      type="button"
                      variant="outlined"
                      size="large"
                      color="warning"
                      disabled={loading}
                      onClick={handleSavePending}
                      startIcon={loading ? <CircularProgress size={20} /> : <Iconify icon="solar:document-text-bold" />}
                    >
                      Save as Pending
                    </Button>
                  )}
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    color="primary"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Iconify icon={parentId ? "solar:branching-paths-bold" : "eva:person-add-fill"} />}
                  >
                    {loading ? 'Processing...' : (parentId ? 'Add Branch' : 'Finish Onboarding')}
                  </Button>
                </Stack>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}
