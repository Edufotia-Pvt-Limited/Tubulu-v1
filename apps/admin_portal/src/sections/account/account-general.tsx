import * as Yup from 'yup';
import { useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
// hooks
import { useAuthContext } from 'src/auth/hooks';
// utils
import { fData } from 'src/utils/format-number';
import axios from 'src/utils/axios';
// assets
import { countries } from 'src/assets/data';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
  RHFAutocomplete,
} from 'src/components/hook-form';

// ----------------------------------------------------------------------

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export default function AccountGeneral() {
  const { enqueueSnackbar } = useSnackbar();

  const { user, refreshUser } = useAuthContext();
  const merchantUser = user as any;

  const isSuperAdmin = merchantUser?.role === 'super_admin';

  const UpdateUserSchema = Yup.object().shape({
    displayName: Yup.string().required('Name is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    photoURL: Yup.mixed<any>().nullable(),
    phoneNumber: Yup.string().required('Phone number is required'),
    country: Yup.string().required('Country is required'),
    address: Yup.string().required('Address is required'),
    state: Yup.string().required('State is required'),
    city: Yup.string().required('City is required'),
    zipCode: Yup.string().required('Zip code is required'),
    about: isSuperAdmin ? Yup.string() : Yup.string().required('About is required'),
    // not required
    isPublic: Yup.boolean(),
  });

  const defaultValues = {
    displayName: merchantUser?.displayName || merchantUser?.integrationName || '',
    email: merchantUser?.email || '',
    photoURL: merchantUser?.photoURL || merchantUser?.logo || null,
    phoneNumber: merchantUser?.phoneNumber || '',
    country: merchantUser?.country || '',
    address: merchantUser?.address || merchantUser?.addressLine || '',
    state: merchantUser?.state || '',
    city: merchantUser?.city || '',
    zipCode: merchantUser?.zipCode || merchantUser?.pincode || '',
    about: merchantUser?.about || merchantUser?.description || '',
    isPublic: merchantUser?.isPublic || false,
  };

  const methods = useForm({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting },
  } = methods;

  const countryValue = watch('country');
  const phoneNumberValue = watch('phoneNumber');

  // Reset form when user details are retrieved/initialized
  useEffect(() => {
    if (merchantUser) {
      reset({
        displayName: merchantUser.displayName || merchantUser.integrationName || '',
        email: merchantUser.email || '',
        photoURL: merchantUser.photoURL || merchantUser.logo || null,
        phoneNumber: merchantUser.phoneNumber || '',
        country: merchantUser.country || '',
        address: merchantUser.address || merchantUser.addressLine || '',
        state: merchantUser.state || '',
        city: merchantUser.city || '',
        zipCode: merchantUser.zipCode || merchantUser.pincode || '',
        about: merchantUser.about || merchantUser.description || '',
        isPublic: merchantUser.isPublic || false,
      });
    }
  }, [merchantUser, reset]);

  // Removed flawed country select auto-prefix logic that caused duplicated codes

  const onSubmit = handleSubmit(async (data) => {
    try {
      const patchData: any = {
        displayName: data.displayName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        address: data.address,
        country: data.country,
        state: data.state,
        city: data.city,
        zipCode: data.zipCode,
        about: data.about,
      };

      if (data.photoURL && typeof data.photoURL === 'object' && data.photoURL.preview) {
        const file = data.photoURL;
        const base64String = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        patchData.logo = {
          base64: base64String,
          mimeType: file.type,
          fileName: file.name,
        };
      }

      await axios.patch('/api/v1/integrations/merchant/update', patchData);
      await refreshUser();
      enqueueSnackbar('Update success!');
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(error.message || 'Failed to update settings', { variant: 'error' });
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('photoURL', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3, textAlign: 'center' }}>
            <RHFUploadAvatar
              name="photoURL"
              maxSize={3145728}
              onDrop={handleDrop}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 3,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.disabled',
                  }}
                >
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br /> max size of {fData(3145728)}
                </Typography>
              }
            />

            <RHFSwitch
              name="isPublic"
              labelPlacement="start"
              label="Public Profile"
              sx={{ mt: 5 }}
            />

            <Button variant="soft" color="error" sx={{ mt: 3 }}>
              Delete User
            </Button>
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="displayName" label="Name" />
              <RHFTextField name="email" label="Email Address" />
              <RHFAutocomplete
                name="country"
                label="Country"
                options={countries.map((country) => country.label)}
                getOptionLabel={(option) => option}
                renderOption={(props, option) => {
                  const { code, label, phone } = countries.filter(
                    (country) => country.label === option
                  )[0];

                  if (!label) {
                    return null;
                  }

                  return (
                    <li {...props} key={label}>
                      <Iconify
                        key={label}
                        icon={`circle-flags:${code.toLowerCase()}`}
                        width={28}
                        sx={{ mr: 1 }}
                      />
                      {label} ({code}) +{phone}
                    </li>
                  );
                }}
              />

              <Controller
                name="phoneNumber"
                control={methods.control}
                render={({ field, fieldState: { error } }) => {
                  const selectedCountry = countries.find((c) => c.label === countryValue);
                  const countryCode = selectedCountry && selectedCountry.phone ? `+${selectedCountry.phone}` : '';
                  
                  // Extract just the digits from the current stored value by removing the country code if present
                  let displayValue = field.value || '';
                  if (countryCode && displayValue.startsWith(countryCode)) {
                    displayValue = displayValue.substring(countryCode.length);
                  } else if (displayValue.startsWith('+')) {
                    // If it starts with some other plus code, try to find and strip it
                    for (const c of countries) {
                      const cCode = `+${c.phone}`;
                      if (displayValue.startsWith(cCode)) {
                        displayValue = displayValue.substring(cCode.length);
                        break;
                      }
                    }
                  }

                  // Strip all non-digits from display value just in case
                  displayValue = displayValue.replace(/\D/g, '');

                  // Clean up corrupted legacy data that might have saved "+9191..."
                  if (displayValue.length > 10 && displayValue.startsWith('91')) {
                    displayValue = displayValue.substring(displayValue.length - 10);
                  }

                  // Strictly limit to 10 digits for display
                  if (displayValue.length > 10) {
                    displayValue = displayValue.substring(0, 10);
                  }

                  return (
                    <TextField
                      {...field}
                      value={displayValue}
                      label="Phone Number"
                      fullWidth
                      error={!!error}
                      helperText={error ? error?.message : ''}
                      InputProps={{
                        startAdornment: countryCode ? (
                          <InputAdornment position="start">{countryCode}</InputAdornment>
                        ) : null,
                      }}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        const limitedDigits = digits.substring(0, 10);
                        field.onChange(`${countryCode}${limitedDigits}`);
                      }}
                    />
                  );
                }}
              />
              <RHFTextField name="address" label="Address" />

              {countryValue === 'India' ? (
                <RHFAutocomplete
                  name="state"
                  label="State"
                  options={INDIAN_STATES}
                  getOptionLabel={(option) => option}
                />
              ) : (
                <RHFTextField name="state" label="State/Region" />
              )}
              <RHFTextField name="city" label="City" />
              <RHFTextField name="zipCode" label="Zip/Code" />
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <RHFTextField name="about" multiline rows={4} label="About" />

              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Save Changes
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
