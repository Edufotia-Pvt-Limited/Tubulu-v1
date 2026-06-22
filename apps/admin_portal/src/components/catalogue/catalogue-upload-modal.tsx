import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  TextareaAutosize,
  styled,
  Select,
  MenuItem,
 
  Checkbox,
  ListItemText,
 
} from '@mui/material';

import FileUploadList from './file-upload-list';
import { MdClose } from 'react-icons/md';

import { Delivery_Type, Product_Display } from 'src/types/catalogue';

interface StyledTextareaProps {
  error?: boolean; // our custom prop
}
const StyledTextarea = styled(TextareaAutosize, {
  shouldForwardProp: (prop: string) => prop !== 'error', // don't pass to DOM
})<StyledTextareaProps>(({ theme, error }) => ({
  width: '100%',
  borderRadius: 4,
  border: `0.5px solid ${error ? theme.palette.error.main : theme.palette.grey[300]}`,
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
  'Future_Ref2'
];
const OPTIONAL_HEADERS = ['preference', 'speciality', 'futureref1', 'futureref2']; // 👈 lowercase version for matching


const handleDownloadSample = () => {
  const link = document.createElement('a');
  link.href = '/products.csv';
  link.setAttribute('download', 'sample_products.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

interface CatalogueUploadModalProps {
  selectedDeliveryType: Delivery_Type[];
  setSelectedDeliveryType: (selectedDeliveryType: Delivery_Type[]) => void;
  view: Product_Display;
  setView: (view: Product_Display) => void;
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  onUpload: (file: File, fileName: string, fileDescription: string, view: Product_Display, selectedDeliveryType: Delivery_Type[]) => Promise<void>;
  isUploading: boolean;
}

const CatalogueUploadModal: React.FC<CatalogueUploadModalProps> = ({
  selectedDeliveryType,
  setSelectedDeliveryType,
  view,
  setView,
  modalOpen,
  setModalOpen,
  onUpload,
  isUploading,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileDescription, setFileDescription] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(1);

  const deliveryOptions: Delivery_Type[] = [
    'Delivery',
    'Pick-up',
    'Dine-in',
    'Room-service',
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setError('');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    setSelectedFile(file);
    setError('');
  };

  const parseCSVHeaders = async (file: File) => {
    const text = await file.text();
    const headers = text
      .split('\n')[0]
      .split(',')
      .map((h) => h.trim());
    return headers;
  };

  const handleNextStep = () => {
    if (!fileName.trim()) {
      setError('File name is required');
      return;
    }
    if (!fileDescription.trim()) {
      setError('File description is required');
      return;
    }
    setError('');
    setCurrentStep(2);
  };


  const clean = (h: string) =>
    h
      .replace(/\r/g, '')
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, '');

  const handleUploadClick = async () => {
    if (!selectedFile) return setError('Please select a CSV file');

    const headers = await parseCSVHeaders(selectedFile);
    console.log("CSV Headers:", headers);


    const lowerHeaders = headers.map(clean);
    const lowerSample = SAMPLE_HEADERS.map(clean);

    // const missing = lowerSample.filter((h) => !lowerHeaders.includes(h));
    const missing = lowerSample.filter(
      (h) => !lowerHeaders.includes(h) && !OPTIONAL_HEADERS.includes(h)
    );

    const extra = lowerHeaders.filter((h) => !lowerSample.includes(h));

    if (missing.length > 0 || extra.length > 0) {
      return setError(
        `CSV header mismatch.\nMissing: ${missing.length ? missing.join(', ') : 'None'}\nExtra: ${extra.length ? extra.join(', ') : 'None'
        }`
      );
    }

    try {
      await onUpload(selectedFile, fileName, fileDescription, view, selectedDeliveryType);
      setModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to upload catalogue');
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setFileName('');
    setFileDescription('');
    setError('');
    setCurrentStep(1);
    setModalOpen(false);
    setSelectedDeliveryType(['Delivery'])
  };

  return (
    <Dialog
      open={modalOpen}
      onClose={resetForm}
      maxWidth={currentStep === 1 ? "sm" : "md"}
      fullWidth
      sx={{
        '& .MuiDialogContent-root': {
          p: 0,
        },
        '& .MuiDialogActions-root': {
          p: 1,
        },
        '& .MuiDialogTitle-root': {
          py: 2,
          px: 5,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          flexDirection: 'column', // allow subtitle below title
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: 0.5, // spacing between title and subtitle
          // py: 1,
          px: 5,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          Create Catalog
          <IconButton
            aria-label="close"
            onClick={resetForm}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <MdClose size={24} />
          </IconButton>
        </Box>

        {currentStep === 1 ? (
          <Typography variant="subtitle1" color="textSecondary">
            Create Catalog by Uploading CSV Sheet
          </Typography>
        ) : (
          <Typography>Prepare your Subscriber List</Typography>
        )}
      </DialogTitle>
      {currentStep === 1 && <Divider sx={{ bgcolor: '#d6d2d2', height: 1 }} />}

      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0, // space between sections
          px: 5,
          py: 3,
          overflow: 'visible', // stop scrollbar
        }}
      >
        {currentStep === 1 ? (
          // Step 1: Name and Description
          <Box sx={{ display: 'flex', flexDirection: 'column', px: 5, py: 3, gap: 1, }}>
            {/* Catalogue Name */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',  // center vertically
                gap: 2,
                width: '100%',
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 500,
                  fontSize: 15,
                  width: { xs: '100%', sm: '200px' }, // fixed width on desktop
                }}
              >
                Catalogue Name
              </Typography>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  error={!!error && !fileName}
                  helperText={!fileName && error ? 'Catalogue name is required' : ' '}
                  FormHelperTextProps={{ sx: { m: 0, minHeight: '1em' } }}
                />
              </Box>
            </Box>

            {/* Catalogue Description */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',  // center vertically
                gap: 2,
                width: '100%',
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 500,
                  fontSize: 15,
                  width: { xs: '100%', sm: '200px' }, // fixed width on desktop
                }}
              >
                Catalogue Description
              </Typography>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <StyledTextarea
                  minRows={2}
                  maxRows={3}
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  error={!!error && !fileDescription}
                  style={{ width: '100%' }}
                />
                <Typography
                  variant="caption"
                  color="error"
                  sx={{
                    mt: 0,          // no top margin
                    lineHeight: 1.5,  // tighter spacing
                    minHeight: '1em'
                  }}
                >
                  {!fileDescription && error ? 'Catalogue description is required' : ' '}
                </Typography>
              </Box>
            </Box>

            {/* How would you like to show your products*/}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',  // center vertically
                gap: 2,
                width: '100%',
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 500,
                  fontSize: 15,
                  width: { xs: '100%', sm: '200px' }, // fixed width on desktop
                }}
              >
                Products Display
              </Typography>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', }}>
                <Select
                  size="small"
                  fullWidth
                  value={view}
                  onChange={(e) => setView(e.target.value as Product_Display)} // 👈 update parent state
                  sx={{
                    flex: { xs: "none", sm: 0.5 },
                    width: { xs: "100%", sm: "auto" },
                    alignItems: 'center'
                  }}
                >
                  <MenuItem value="Grid View">Grid View</MenuItem>
                  <MenuItem value="List View">List View</MenuItem>
                </Select>

              </Box>
            </Box>


            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'flex-start' }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 500, fontSize: 15, width: 200 }}
              >
                Delivery Type
              </Typography>

              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Select
                  multiple
                  size="small"
                  fullWidth
                  value={selectedDeliveryType}
                  onChange={(e) => setSelectedDeliveryType(e.target.value as Delivery_Type[])}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected || selected.length === 0) {
                      return <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Delivery</Typography>;
                    }

                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Typography
                            key={value}
                            sx={{
                              fontSize: 12,
                              bgcolor: 'grey.200',
                              px: 0.5,
                              py: 0.25,
                              borderRadius: 1,
                              maxWidth: 100,
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                            }}
                          >
                            {value}
                          </Typography>
                        ))}
                      </Box>
                    );
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: 40,
                    paddingY: 0.5,
                  }}
                >
                  {deliveryOptions.map((option) => {
                    const checked = selectedDeliveryType.includes(option);
                    return (
                      <MenuItem
                        key={option}
                        value={option}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Checkbox checked={checked} />
                        <ListItemText primary={option} />
                      </MenuItem>
                    );
                  })}
                </Select>
              </Box>
            </Box>






          </Box>
        ) : (
          // Step 2: File Upload
          <>
            <Box sx={{ px: 5, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  Main Identifiers
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Your subscriber list must include a phone number for each subscriber. This
                  information will be used to identify <br />
                  the correct WhatsApp accounts and personalise your message.
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" fontWeight={500}>
                  Optional variables
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  You can add variables and use them as placeholders in your message. Placeholders
                  get replaced with the value <br />
                  that you enter for each subscriber when the message is sent.
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', px: 5, py: 2, gap: 2, flexDirection: { xs: 'column', sm: 'row' }, }}>
              {/* Sample Button */}
              <Button
                variant="contained"
                sx={{ backgroundColor: '#37b37d', color: '#FFF', whiteSpace: 'nowrap' }}
                onClick={handleDownloadSample}
              >
                Sample
              </Button>

              {/* Instruction Text */}
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ flex: 1, whiteSpace: 'pre-line', lineHeight: 1.6 }}
              >
                You can add variables and use them as placeholders in your message. Placeholders get
                replaced with the value that you enter for each subscriber.
              </Typography>
            </Box>

            {/* <Divider sx={{ bgcolor: 'divider', height: 1.5 }} /> */}

            <Box
              sx={{ px: 5, py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <Box
                sx={{
                  border: 2,
                  borderColor: error && !selectedFile ? 'error.main' : 'black',
                  borderRadius: 3,
                  px: 3,
                  py: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'grey.100', borderColor: 'black.50' },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  width: '100%',
                  maxWidth: 600,
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
                <Typography variant="body1" color="textPrimary">
                  Drag and Drop or click to upload File
                  <br />
                  .csv
                </Typography>
              </Box>

              {selectedFile && (
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 600,
                  }}
                >
                  <FileUploadList files={[selectedFile]} />
                </Box>
              )}

              {(!selectedFile && error) && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5, minHeight: '1em' }}
                >
                  {error}
                </Typography>
              )}
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 5 }}>
        <Box
          sx={{
            px: 2,
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
          }}
        >
          {currentStep === 1 ? (
            <Button
              variant="contained"
              sx={{
                mb: 1,
                backgroundColor: '#36F',
                color: '#FFF',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#36F', // same color as default
                  boxShadow: 'none', // remove hover shadow
                },
              }}
              onClick={handleNextStep}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              sx={{
                mb: 1,
                backgroundColor: '#36F',
                color: '#FFF',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#36F',
                  boxShadow: 'none',
                },
                '&.Mui-disabled': {
                  backgroundColor: '#36F',
                  color: '#FFF',
                },
              }}
              onClick={handleUploadClick}
              disabled={isUploading}
            >
              {isUploading ? <CircularProgress size={20} color="inherit" /> : 'Save'}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default CatalogueUploadModal;
