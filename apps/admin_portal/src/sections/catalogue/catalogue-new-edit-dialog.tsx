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
  MenuItem,
} from '@mui/material';
// utils
import { createManualCatalogue, updateCatalogue } from 'src/utils/ApiActions';
import { enqueueSnackbar } from 'notistack';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentCatalogue: any | null;
  onRefresh: VoidFunction;
};

export default function CatalogueNewEditDialog({ open, onClose, currentCatalogue, onRefresh }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayType: 'Grid View',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentCatalogue) {
      setFormData({
        name: currentCatalogue.name || '',
        description: currentCatalogue.description || '',
        displayType: currentCatalogue.displayType || 'Grid View',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        displayType: 'Grid View',
      });
    }
  }, [currentCatalogue, open]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async () => {
    if (!formData.name || !formData.description) {
      enqueueSnackbar('Name and description are required', { variant: 'warning' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (currentCatalogue) {
        // UPDATE
        const updateData = new FormData();
        updateData.append('name', formData.name);
        updateData.append('description', formData.description);
        updateData.append('displayType', formData.displayType);
        updateData.append('mode', 'append'); // Required by backend validation but ignored if no file

        await updateCatalogue(currentCatalogue.id, updateData);
        enqueueSnackbar('Catalogue updated successfully');
      } else {
        // CREATE
        await createManualCatalogue(formData);
        enqueueSnackbar('Catalogue created successfully');
      }
      onRefresh();
      onClose();
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.message || 'Something went wrong', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{currentCatalogue ? 'Edit Catalogue' : 'Create New Catalogue'}</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <TextField
            name="name"
            label="Catalogue Name"
            fullWidth
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />

          <TextField
            name="description"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />

          <TextField
            select
            name="displayType"
            label="Display Layout"
            fullWidth
            value={formData.displayType}
            onChange={(e) => handleChange('displayType', e.target.value)}
          >
            {['Grid View', 'List View'].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={isSubmitting}>
          {currentCatalogue ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
