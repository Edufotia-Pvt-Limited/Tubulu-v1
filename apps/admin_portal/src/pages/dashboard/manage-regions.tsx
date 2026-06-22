import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
import {
  Box,
  Card,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import {
  getCountries,
  createCountry,
  updateCountry,
  deleteCountry,
  getStates,
  createState,
  updateState,
  deleteState,
  getCities,
  createCity,
  updateCity,
  deleteCity,
} from 'src/utils/ApiActions';

export default function ManageRegionsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const loggedInRole = user?.role?.toLowerCase();

  // Selected entities
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<any>(null);

  // Lists
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'country' | 'state' | 'city'>('country');
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string>('');

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState(''); // Only for country
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState('20');
  const [themeName, setThemeName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#1565C0');
  const [secondaryColor, setSecondaryColor] = useState('#64B5F6');
  const [gradientColors, setGradientColors] = useState('');
  const [backgroundPatternUrl, setBackgroundPatternUrl] = useState('');

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const res = await getCountries();
      if (res.success) {
        setCountries(res.data || []);
      }
    } catch (err: any) {
      enqueueSnackbar(err.message || 'Error fetching countries', { variant: 'error' });
    }
  };

  const fetchStates = async (countryId: string) => {
    try {
      const res = await getStates(countryId);
      if (res.success) {
        setStates(res.data || []);
        setCities([]);
        setSelectedState(null);
      }
    } catch (err: any) {
      enqueueSnackbar(err.message || 'Error fetching states', { variant: 'error' });
    }
  };

  const fetchCities = async (stateId: string) => {
    try {
      const res = await getCities(stateId);
      if (res.success) {
        setCities(res.data || []);
      }
    } catch (err: any) {
      enqueueSnackbar(err.message || 'Error fetching cities', { variant: 'error' });
    }
  };

  const handleOpenDialog = (type: 'country' | 'state' | 'city', item?: any) => {
    setDialogType(type);
    if (item) {
      setEditMode(true);
      setCurrentId(item.id);
      setName(item.name);
      setCode(item.code || '');
      if (type === 'city') {
        setLatitude(item.latitude !== null && item.latitude !== undefined ? String(item.latitude) : '');
        setLongitude(item.longitude !== null && item.longitude !== undefined ? String(item.longitude) : '');
        setRadius(item.radius !== null && item.radius !== undefined ? String(item.radius) : '20');
        const tc = item.themeConfig || {};
        setThemeName(tc.themeName || '');
        setPrimaryColor(tc.primaryColor || '#1565C0');
        setSecondaryColor(tc.secondaryColor || '#64B5F6');
        setGradientColors(tc.gradientColors ? tc.gradientColors.join(',') : '');
        setBackgroundPatternUrl(tc.backgroundPatternUrl || '');
      }
    } else {
      setEditMode(false);
      setCurrentId('');
      setName('');
      setCode('');
      setLatitude('');
      setLongitude('');
      setRadius('20');
      setThemeName('');
      setPrimaryColor('#1565C0');
      setSecondaryColor('#64B5F6');
      setGradientColors('');
      setBackgroundPatternUrl('');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setName('');
    setCode('');
    setLatitude('');
    setLongitude('');
    setRadius('20');
    setThemeName('');
    setPrimaryColor('#1565C0');
    setSecondaryColor('#64B5F6');
    setGradientColors('');
    setBackgroundPatternUrl('');
  };

  const handleSave = async () => {
    try {
      if (dialogType === 'country') {
        if (editMode) {
          const res = await updateCountry(currentId, { name, code });
          if (res.success) {
            enqueueSnackbar('Country updated successfully');
            fetchCountries();
          }
        } else {
          const res = await createCountry({ name, code });
          if (res.success) {
            enqueueSnackbar('Country created successfully');
            fetchCountries();
          }
        }
      } else if (dialogType === 'state') {
        if (editMode) {
          const res = await updateState(currentId, { name });
          if (res.success) {
            enqueueSnackbar('State updated successfully');
            if (selectedCountry) fetchStates(selectedCountry.id);
          }
        } else {
          const res = await createState({ name, countryId: selectedCountry.id });
          if (res.success) {
            enqueueSnackbar('State created successfully');
            if (selectedCountry) fetchStates(selectedCountry.id);
          }
        }
      } else if (dialogType === 'city') {
        const cityPayload = {
          name,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          radius: radius ? parseFloat(radius) : 20.0,
          themeConfig: {
            themeName: themeName || name,
            primaryColor,
            secondaryColor,
            gradientColors: gradientColors ? gradientColors.split(',').map(c => c.trim()) : [primaryColor, secondaryColor],
            backgroundPatternUrl: backgroundPatternUrl || null,
            isDark: false
          }
        };
        if (editMode) {
          const res = await updateCity(currentId, cityPayload);
          if (res.success) {
            enqueueSnackbar('City updated successfully');
            if (selectedState) fetchCities(selectedState.id);
          }
        } else {
          const res = await createCity({ ...cityPayload, stateId: selectedState.id });
          if (res.success) {
            enqueueSnackbar('City created successfully');
            if (selectedState) fetchCities(selectedState.id);
          }
        }
      }
      handleCloseDialog();
    } catch (err: any) {
      enqueueSnackbar(err.message || 'Error saving changes', { variant: 'error' });
    }
  };

  const handleDelete = async (type: 'country' | 'state' | 'city', id: string) => {
    if (!window.confirm('Are you sure you want to delete this region?')) return;
    try {
      if (type === 'country') {
        const res = await deleteCountry(id);
        if (res.success) {
          enqueueSnackbar('Country deleted successfully');
          fetchCountries();
          if (selectedCountry?.id === id) {
            setSelectedCountry(null);
            setStates([]);
            setSelectedState(null);
            setCities([]);
          }
        }
      } else if (type === 'state') {
        const res = await deleteState(id);
        if (res.success) {
          enqueueSnackbar('State deleted successfully');
          if (selectedCountry) fetchStates(selectedCountry.id);
          if (selectedState?.id === id) {
            setSelectedState(null);
            setCities([]);
          }
        }
      } else if (type === 'city') {
        const res = await deleteCity(id);
        if (res.success) {
          enqueueSnackbar('City deleted successfully');
          if (selectedState) fetchCities(selectedState.id);
        }
      }
    } catch (err: any) {
      enqueueSnackbar(err.message || 'Error deleting region', { variant: 'error' });
    }
  };

  return (
    <>
      <Helmet>
        <title>Region Manager | Tubulu</title>
      </Helmet>

      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Region Manager
        </Typography>

        <Grid container spacing={3}>
          {/* Countries Panel */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2, height: '70vh', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Countries</Typography>
                {loggedInRole === 'super_admin' && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    onClick={() => handleOpenDialog('country')}
                  >
                    Add
                  </Button>
                )}
              </Box>
              <Divider />
              <Box sx={{ flexGrow: 1, overflowY: 'auto', mt: 1 }}>
                <List>
                  {countries.map((c) => (
                    <ListItem
                      button
                      key={c.id}
                      selected={selectedCountry?.id === c.id}
                      onClick={() => {
                        setSelectedCountry(c);
                        fetchStates(c.id);
                      }}
                    >
                      <ListItemText primary={`${c.name} (${c.code})`} />
                      {loggedInRole === 'super_admin' && (
                        <ListItemSecondaryAction>
                          <IconButton size="small" onClick={() => handleOpenDialog('country', c)}>
                            <Iconify icon="solar:pen-bold" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete('country', c.id)}>
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Card>
          </Grid>

          {/* States Panel */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2, height: '70vh', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  States {selectedCountry ? `in ${selectedCountry.name}` : ''}
                </Typography>
                {selectedCountry && loggedInRole === 'super_admin' && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    onClick={() => handleOpenDialog('state')}
                  >
                    Add
                  </Button>
                )}
              </Box>
              <Divider />
              <Box sx={{ flexGrow: 1, overflowY: 'auto', mt: 1 }}>
                {!selectedCountry ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography color="text.secondary">Select a country to view states</Typography>
                  </Box>
                ) : (
                  <List>
                    {states.map((s) => (
                      <ListItem
                        button
                        key={s.id}
                        selected={selectedState?.id === s.id}
                        onClick={() => {
                          setSelectedState(s);
                          fetchCities(s.id);
                        }}
                      >
                        <ListItemText primary={s.name} />
                        {loggedInRole === 'super_admin' && (
                          <ListItemSecondaryAction>
                            <IconButton size="small" onClick={() => handleOpenDialog('state', s)}>
                              <Iconify icon="solar:pen-bold" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDelete('state', s.id)}>
                              <Iconify icon="solar:trash-bin-trash-bold" />
                            </IconButton>
                          </ListItemSecondaryAction>
                        )}
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Card>
          </Grid>

          {/* Cities Panel */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2, height: '70vh', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Cities {selectedState ? `in ${selectedState.name}` : ''}
                </Typography>
                {selectedState && loggedInRole === 'super_admin' && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    onClick={() => handleOpenDialog('city')}
                  >
                    Add
                  </Button>
                )}
              </Box>
              <Divider />
              <Box sx={{ flexGrow: 1, overflowY: 'auto', mt: 1 }}>
                {!selectedState ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography color="text.secondary">Select a state to view cities</Typography>
                  </Box>
                ) : (
                  <List>
                    {cities.map((city) => {
                      const canEditCity = loggedInRole === 'super_admin' || (loggedInRole === 'city_manager' && city.id === user?.scopedCityId);
                      const canDeleteCity = loggedInRole === 'super_admin';
                      return (
                        <ListItem key={city.id}>
                          <ListItemText primary={city.name} />
                          {(canEditCity || canDeleteCity) && (
                            <ListItemSecondaryAction>
                              {canEditCity && (
                                <IconButton size="small" onClick={() => handleOpenDialog('city', city)}>
                                  <Iconify icon="solar:pen-bold" />
                                </IconButton>
                              )}
                              {canDeleteCity && (
                                <IconButton size="small" color="error" onClick={() => handleDelete('city', city.id)}>
                                  <Iconify icon="solar:trash-bin-trash-bold" />
                                </IconButton>
                              )}
                            </ListItemSecondaryAction>
                          )}
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Dialog for Add/Edit */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="xs">
        <DialogTitle>
          {editMode ? 'Edit' : 'Add New'}{' '}
          {dialogType === 'country' ? 'Country' : dialogType === 'state' ? 'State' : 'City'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          {dialogType === 'country' && (
            <TextField
              margin="dense"
              label="Country Code (e.g. IN, US)"
              fullWidth
              variant="outlined"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          )}
          {dialogType === 'city' && (
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    margin="dense"
                    label="Latitude"
                    fullWidth
                    variant="outlined"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    margin="dense"
                    label="Longitude"
                    fullWidth
                    variant="outlined"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                </Grid>
              </Grid>
              <TextField
                margin="dense"
                label="Search Radius (km)"
                fullWidth
                variant="outlined"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                sx={{ mt: 1 }}
              />
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                City Theme Config
              </Typography>
              <TextField
                margin="dense"
                label="Theme Name"
                fullWidth
                variant="outlined"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
              />
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={6}>
                  <TextField
                    margin="dense"
                    label="Primary Color (Hex)"
                    fullWidth
                    variant="outlined"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    margin="dense"
                    label="Secondary Color (Hex)"
                    fullWidth
                    variant="outlined"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                  />
                </Grid>
              </Grid>
              <TextField
                margin="dense"
                label="Gradient Colors (comma-separated, e.g. #FFA800,#E15B4D)"
                fullWidth
                variant="outlined"
                value={gradientColors}
                onChange={(e) => setGradientColors(e.target.value)}
                sx={{ mt: 1 }}
              />
              <TextField
                margin="dense"
                label="Background Pattern / Silhouette URL"
                fullWidth
                variant="outlined"
                value={backgroundPatternUrl}
                onChange={(e) => setBackgroundPatternUrl(e.target.value)}
                sx={{ mt: 1 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!name}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
