import { useState, useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
// auth
import { useAuthContext } from 'src/auth/hooks';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import axios from 'src/utils/axios';
import { getCities, updateCity } from 'src/utils/ApiActions';

export default function SettingsCityBackground() {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [cityData, setCityData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchCityDetails();
  }, []);

  const fetchCityDetails = async () => {
    try {
      setLoading(true);
      // Fetch all cities and filter for the scoped one
      const res = await getCities();
      if (res.success && res.data) {
        const found = res.data.find((c: any) => c.id === user?.scopedCityId);
        if (found) {
          setCityData(found);
          const tc = found.themeConfig || {};
          setPreviewUrl(tc.backgroundPatternUrl || null);
        } else {
          enqueueSnackbar('No scoped city found for this City Manager account.', { variant: 'error' });
        }
      }
    } catch (err: any) {
      console.error(err);
      enqueueSnackbar('Error loading city configurations.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      enqueueSnackbar('Please select an image file.', { variant: 'warning' });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('images', file);

    try {
      // 1. Upload to cloud storage via backend
      const uploadRes = await axios.post('/api/v1/products/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (uploadRes.data?.success && uploadRes.data?.urls?.[0]) {
        const imageUrl = uploadRes.data.urls[0];
        
        // 2. Update City theme config in database
        const tc = cityData.themeConfig || {};
        const updatedConfig = {
          ...cityData,
          themeConfig: {
            ...tc,
            backgroundPatternUrl: imageUrl,
            // Keep default colors if empty
            themeName: tc.themeName || cityData.name,
            primaryColor: tc.primaryColor || '#1565C0',
            secondaryColor: tc.secondaryColor || '#64B5F6',
            gradientColors: tc.gradientColors || ['#1565C0', '#64B5F6'],
            isDark: tc.isDark || false
          }
        };

        const updateRes = await updateCity(cityData.id, updatedConfig);
        if (updateRes.success) {
          setPreviewUrl(imageUrl);
          setCityData(updateRes.data);
          enqueueSnackbar('City background image updated successfully!', { variant: 'success' });
        } else {
          enqueueSnackbar('Failed to update city configuration.', { variant: 'error' });
        }
      } else {
        enqueueSnackbar('Failed to upload image file.', { variant: 'error' });
      }
    } catch (err: any) {
      console.error(err);
      enqueueSnackbar(err.response?.data?.message || 'Error updating background image.', { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!cityData) return;
    if (!window.confirm('Are you sure you want to remove the city background pattern?')) return;

    setUploading(true);
    try {
      const tc = cityData.themeConfig || {};
      const updatedConfig = {
        ...cityData,
        themeConfig: {
          ...tc,
          backgroundPatternUrl: null,
          themeName: tc.themeName || cityData.name,
          primaryColor: tc.primaryColor || '#1565C0',
          secondaryColor: tc.secondaryColor || '#64B5F6',
          gradientColors: tc.gradientColors || ['#1565C0', '#64B5F6'],
          isDark: tc.isDark || false
        }
      };

      const res = await updateCity(cityData.id, updatedConfig);
      if (res.success) {
        setPreviewUrl(null);
        setCityData(res.data);
        enqueueSnackbar('City background image removed successfully.', { variant: 'success' });
      }
    } catch (err: any) {
      console.error(err);
      enqueueSnackbar('Failed to remove image.', { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!cityData) {
    return (
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No configurations available for your assigned city.
        </Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 4, maxWidth: 560, mx: 'auto' }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            City Banner Image ({cityData.name})
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            Upload a transparent PNG silhouette or background image pattern for your city. 
            This will be dynamically displayed as the home screen header background in the customer mobile app.
          </Typography>
        </Box>

        {previewUrl ? (
          <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            <Box
              component="img"
              src={previewUrl}
              alt="City Background Preview"
              sx={{
                width: '100%',
                maxHeight: 220,
                objectFit: 'cover',
                bgcolor: 'grey.800',
                display: 'block'
              }}
            />
            <Button
              size="small"
              color="error"
              variant="contained"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={handleRemoveImage}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                backdropFilter: 'blur(4px)',
                bgcolor: 'error.main'
              }}
              disabled={uploading}
            >
              Remove
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              height: 180,
              borderRadius: 2,
              border: '2px dashed',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: 'background.neutral',
              transition: 'background-color 0.15s ease',
              '&:hover': {
                bgcolor: 'action.hover',
              }
            }}
          >
            <Iconify icon="solar:cloud-upload-bold-duotone" sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="subtitle2" color="text.secondary">
              No Background Pattern Uploaded
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Only transparent silhouettes or pattern overlays are recommended
            </Typography>
          </Box>
        )}

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            component="label"
            variant="contained"
            color="primary"
            startIcon={uploading ? <CircularProgress size={18} color="inherit" /> : <Iconify icon="solar:cloud-upload-bold" />}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : previewUrl ? 'Change Picture' : 'Upload Picture'}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
