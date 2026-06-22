import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Stack, 
  MenuItem,
  CircularProgress
} from '@mui/material';
import { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, displayType: string) => void;
  isSubmitting: boolean;
}

const DISPLAY_TYPES = ['Grid View', 'List View'];

export default function ManualCatalogueModal({ open, onClose, onCreate, isSubmitting }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayType, setDisplayType] = useState('Grid View');

  const handleSubmit = () => {
    if (name.trim() && description.trim()) {
      onCreate(name, description, displayType);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Catalogue</DialogTitle>
      
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Catalogue Name"
            placeholder="e.g. Summer Collection"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextField
            label="Description"
            placeholder="Describe what's in this catalogue"
            fullWidth
            multiline
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <TextField
            select
            label="Display Style"
            fullWidth
            value={displayType}
            onChange={(e) => setDisplayType(e.target.value)}
          >
            {DISPLAY_TYPES.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={isSubmitting || !name || !description}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Creating...' : 'Create Catalogue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
