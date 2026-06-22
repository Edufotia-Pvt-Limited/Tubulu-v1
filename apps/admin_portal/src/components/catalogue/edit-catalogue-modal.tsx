import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box,
  Divider,
  Typography,
  Select,
  MenuItem,
  Checkbox,
  TextareaAutosize,
  styled,
  ListItemText,
} from '@mui/material';
import { MdClose, MdOutlineFileUpload } from 'react-icons/md';
import FileUploadList from './file-upload-list';
import type { Catalogue } from 'src/types/catalogue';
import { Delivery_Type, Product_Display } from 'src/types/catalogue';

const SAMPLE_HEADERS = [
  'Name',
  'Description',
  'Price',
  'Currency',
  'ImageUrls',
  'Product_Category',
  'Product_Subcategory',
  'Preference',
  'Quantity',
  'Discount_Percentage',
  'Discount_Price',
  'CGST',
  'SGST',
  'OtherTaxes',
  'Speciality',
  'Future_Ref1',
  'Future_Ref2',
];

const OPTIONAL_HEADERS = ['preference', 'speciality', 'futureref1', 'futureref2']; // 👈 lowercase version for matching

interface StyledTextareaProps {
  error?: boolean; // our custom prop
}
const StyledTextarea = styled(TextareaAutosize, {
  shouldForwardProp: (prop: string) => prop !== 'error', // don't pass to DOM
})<StyledTextareaProps>(({ theme, error }) => ({
  width: '100%',
  borderRadius: 4,
  border: `0.5px solid ${error ? theme.palette.error.main : theme.palette.grey[400]}`,
  padding: theme.spacing(1),
  fontFamily: theme.typography.fontFamily,
  fontSize: theme.typography.body1.fontSize,
  transition: 'border-color 0.2s',

  '&:hover': {
    borderColor: error ? theme.palette.error.main : 'black',
  },
  '&:focus': {
    outline: 'none',

    borderColor: error ? '#d32f2f' : '#000000',
    borderWidth: 2,
  },
}));

interface EditCatalogueModalProps {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  catalog: Catalogue;
  updateFilter: 'Replace' | 'Append';
  setUpdateFilter: (val: 'Replace' | 'Append') => void;
  onSave: (
    csvFile?: File,
    name?: string,
    description?: string,
    mode?: 'Replace' | 'Append',
    displayType?: string,
    deliveryType?: Delivery_Type[]
  ) => Promise<void>;
}

const EditCatalogueModal: React.FC<EditCatalogueModalProps> = ({
  modalOpen,
  setModalOpen,
  catalog,
  updateFilter,
  setUpdateFilter,
  onSave,
}) => {
  const [name, setName] = useState<string>(catalog.name);
  const [description, setDescription] = useState<string>(catalog.description);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [displayType, setDisplayType] = useState<Product_Display | "">("");
  const [deliveryType, setDeliveryType] = useState<Delivery_Type[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const deliveryOptions: Delivery_Type[] = [
    "Delivery",
    "Pick-up",
    "Dine-in",
    "Room-service",
  ];



  useEffect(() => {
    setName(catalog.name);
    setDescription(catalog.description);
    setSelectedFile(null);
    setError('');

    // Set displayType directly from catalog, with fallback to "List View"
    const type = catalog.displayType as Product_Display;
    setDisplayType(type || "List View");
    if (catalog.deliveryType) {
      try {
        let deliveryTypes: Delivery_Type[];

        // Handle both string and array cases
        if (typeof catalog.deliveryType === 'string') {
          deliveryTypes = JSON.parse(catalog.deliveryType) as Delivery_Type[];
        } else {
          deliveryTypes = catalog.deliveryType as Delivery_Type[];
        }

        // Validate against allowed options
        const validDeliveryTypes = deliveryTypes.filter(type =>
          deliveryOptions.includes(type as Delivery_Type)
        );

        setDeliveryType(validDeliveryTypes.length > 0 ? validDeliveryTypes : ["Delivery"]);
      } catch (e) {
        console.error('Error parsing deliveryType:', e);
        setDeliveryType(["Delivery"]);
      }
    } else {
      setDeliveryType(["Delivery"]);
    }

    setIsChecked(false);
  }, [catalog]);

  const handleClose = () => {
    setName(catalog.name);
    setDescription(catalog.description);
    setSelectedFile(null);
    setError('');
    setModalOpen(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || file.type !== 'text/csv') {
      setError('Only CSV files are allowed');
      return;
    }
    setSelectedFile(file);
    setError('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file || file.type !== 'text/csv') {
      setError('Only CSV files are allowed');
      return;
    }
    setSelectedFile(file);
    setError('');
  };

  const parseCSVHeaders = async (file: File) => {
    const text = await file.text();
    return text
      .split('\n')[0]
      .split(',')
      .map((h) => h.trim());
  };

  const clean = (h: string) =>
    h
      .replace(/\r/g, '')
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, '');

  const handleSave = async () => {
    // Block if mode requires a file but no file selected
    if (isChecked && !selectedFile && (updateFilter === 'Replace' || updateFilter === 'Append')) {
      setError('Please select a CSV file when using Replace or Append mode');

      return;
    }
    if (!isChecked && selectedFile) {
      console.log('Blocked: file selected but Replace/Append mode not enabled');
      setError('You cannot select a file when Replace or Append mode is not enabled');
      return;
    }

    try {
      setIsSaving(true);

      // Only validate headers if a file is present
      if (selectedFile) {
        const headers = await parseCSVHeaders(selectedFile);

        const lowerHeaders = headers.map(clean);
        const lowerSample = SAMPLE_HEADERS.map(clean);


        const missing = lowerSample.filter(
          (h) => !lowerHeaders.includes(h) && !OPTIONAL_HEADERS.includes(h)
        );

        const extra = lowerHeaders.filter((h) => !lowerSample.includes(h));

        if (missing.length > 0 || extra.length > 0) {
          setError(
            `CSV header mismatch.\nMissing: ${missing.join(', ') || 'None'}\nExtra: ${extra.join(', ') || 'None'
            }`
          );

          return;
        }
      }

      await onSave(
        selectedFile ?? undefined,
        name?.trim(),
        description?.trim(),
        selectedFile ? updateFilter : undefined,
        displayType,
        deliveryType
      );

      setError('');
      setModalOpen(false);
    } catch (err) {
      setError('Failed to save CSV');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={modalOpen}
      onClose={handleClose}
      fullWidth
      sx={{
        '& .MuiDialogContent-root': { p: 0 },
        '& .MuiDialogActions-root': { p: 2 },
        '& .MuiDialogTitle-root': { py: 2, px: 3 },
      }}
    >
      {/* Title */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 600,
        }}
      >
        Edit Catalog
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ color: (theme) => theme.palette.grey[500] }}
        >
          <MdClose size={22} />
        </IconButton>
      </DialogTitle>

      <Divider sx={{ bgcolor: 'divider' }} />

      {/* Content */}
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, px: 3, py: 3 }}>

          {/* Catalog Name */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              alignItems: 'center',
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ minWidth: 140, fontWeight: 500 }}
            >
              Catalog Name
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Box>


          {/* Catalog Description */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ minWidth: 140, fontWeight: 500 }}>
              Catalog Description
            </Typography>
            <StyledTextarea
              minRows={2}
              maxRows={3}
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              gap: 2,
              width: '100%',
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 500,
                // fontSize: 12,
                minWidth: 140, // ✅ same as your "Catalog Name" label width
                width: { xs: '100%', sm: 140 },
              }}
            >
              Products Display
            </Typography>

            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Select
                size="small"
                fullWidth
                value={displayType || "List View"}
                onChange={(e) => setDisplayType(e.target.value as Product_Display)}
                sx={{
                  flex: { xs: 'none', sm: 0.5 },
                  width: { xs: '100%', sm: 'auto' },
                  alignItems: 'center',
                }}
              >
                <MenuItem value="Grid View">Grid View</MenuItem>
                <MenuItem value="List View">List View</MenuItem>
              </Select>


              <Typography
                variant="caption"
                color="error"
                sx={{
                  mt: 0,
                  lineHeight: 1.5,
                  minHeight: '1em',
                }}
              >
                {/* Optional error message */}
              </Typography>
            </Box>
          </Box>




          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' }, // stack on mobile, inline on desktop
              gap: 2,
              alignItems: 'center', // aligns label and select vertically
              width: '100%',
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 500,
                fontSize: 15,
                minWidth: 140, // same width as Product Display label
                width: { xs: '100%', sm: 140 },
              }}
            >
              Delivery Type
            </Typography>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Select
                multiple
                size="small"
                fullWidth
                value={deliveryType}
                onChange={(e) => {
                  const value = e.target.value;
                  const selectedTypes = (typeof value === 'string' ? value.split(',') : value) as Delivery_Type[];
                  setDeliveryType(selectedTypes);
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((val) => (
                      <Typography
                        key={val}
                        sx={{
                          fontSize: 12,
                          bgcolor: 'grey.200',
                          px: 0.5,
                          py: 0.25,
                          borderRadius: 1,
                        }}
                      >
                        {val}
                      </Typography>
                    ))}
                  </Box>
                )}
              >
                {deliveryOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    <Checkbox checked={deliveryType.includes(option)} />
                    <ListItemText primary={option} />
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>




          {/* Update Mode */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Checkbox checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Add / Replace
            </Typography>
            {isChecked && (
              <Select
                size="small"
                value={updateFilter}
                onChange={(e) => setUpdateFilter(e.target.value as 'Replace' | 'Append')}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="Replace">Replace</MenuItem>
                <MenuItem value="Append">Add</MenuItem>
              </Select>
            )}
          </Box>
        </Box>

        {/* CSV Upload */}
        {isChecked && (
          <Box sx={{ px: 3, pb: 3 }}>
            <Box
              sx={{
                border: 2,
                borderColor: error && !selectedFile ? 'error.main' : 'grey.400',
                borderRadius: 2,
                px: 3,
                py: 4,
                textAlign: 'center',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                '&:hover': { backgroundColor: 'grey.50' },
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <MdOutlineFileUpload size={28} />
              <Typography variant="body2">Drag & drop CSV file here</Typography>
              <Typography variant="caption" color="text.secondary">
                or click to browse
              </Typography>

              {error && !selectedFile && (
                <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}
            </Box>
            {selectedFile && <FileUploadList files={[selectedFile]} />}
          </Box>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions>
        <Button onClick={handleClose} style={{ background: '#FF5630', color: '#FFF' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving}
          sx={{
            backgroundColor: '#36F',
            '&:hover': { backgroundColor: '#36F' },
          }}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCatalogueModal;
