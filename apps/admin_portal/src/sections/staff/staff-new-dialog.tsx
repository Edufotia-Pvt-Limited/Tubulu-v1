import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
// utils
import axios from 'src/utils/axios';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  onSuccess: VoidFunction;
};

export default function StaffNewDialog({ open, onClose, onSuccess }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const NewStaffSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    phoneNumber: Yup.string().when('role', {
      is: (val: string) => ['ops_admin', 'onboarding_specialist', 'content_moderator', 'finance_admin', 'regional_partner'].includes(val),
      then: (schema) => schema.required('Phone number is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    role: Yup.string().required('Role is required'),
  });

  const defaultValues = {
    name: '',
    phoneNumber: '',
    email: '',
    role: 'support',
  };

  const methods = useForm({
    resolver: yupResolver(NewStaffSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const selectedRole = watch('role');
  const isGlobalRole = ['ops_admin', 'onboarding_specialist', 'content_moderator', 'finance_admin', 'regional_partner'].includes(selectedRole);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await axios.post('/api/v1/admin/staff/create', data);
      reset();
      onClose();
      onSuccess();
      enqueueSnackbar('Staff created successfully!');
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(error.response?.data?.message || error.message || 'Failed to create staff', { variant: 'error' });
    }
  });

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Add New Staff</DialogTitle>

        <DialogContent>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: '1fr',
              sm: '1fr 1fr',
            }}
            sx={{ mt: 1 }}
          >
            <RHFTextField name="name" label="Full Name" />
            <RHFTextField name="email" label="Email Address" />
            
            {isGlobalRole && <RHFTextField name="phoneNumber" label="Phone Number" />}

            <RHFSelect name="role" label="Role">
              <MenuItem value="manager">Store Manager</MenuItem>
              <MenuItem value="cashier">Store Cashier</MenuItem>
              <MenuItem value="support">Store Support Agent</MenuItem>
              <MenuItem value="delivery">Delivery Agent</MenuItem>
              <MenuItem value="ops_admin">Operations Admin (Global)</MenuItem>
              <MenuItem value="onboarding_specialist">Onboarding Specialist (Global)</MenuItem>
              <MenuItem value="content_moderator">Content Moderator (Global)</MenuItem>
              <MenuItem value="finance_admin">Finance Admin (Global)</MenuItem>
              <MenuItem value="regional_partner">Regional Partner (Global)</MenuItem>
            </RHFSelect>

            {selectedRole === 'regional_partner' && (
              <>
                <RHFTextField
                  name="assignedCity"
                  label="Assigned City"
                  placeholder="e.g. Bengaluru"
                />
                <RHFTextField
                  name="commissionRate"
                  label="Commission Rate (%)"
                  type="number"
                  placeholder="e.g. 5"
                  helperText="Percentage of each order value earned by this partner"
                />
              </>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Create Staff
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
