import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  IconButton,
  Box,
  Typography,
  Divider,
  Stack,
  CircularProgress,
  Grid,
  Paper,
} from "@mui/material";
import { MdClose } from "react-icons/md";
import FileUploadStep from "src/components/catalogue/file-upload-step";
import { useFileUpload } from "src/hooks/use-file-upload";
import { enqueueSnackbar } from "notistack";
import Iconify from "src/components/iconify";
import { serverCallWithToken, baseUrl } from "src/utils/ApiActions";

const PRODUCT_HEADERS = [
  'Name',
  'Description',
  'Price',
  'Currency',
  'ImageUrls',
  'Product_Category',
  'Product_Subcategory',
  'Quantity',
  'Discount_Percentage',
  'Discount_Price',
  'CGST',
  'SGST',
  'OtherTaxes',
  'Preference',
  'Speciality',
  'Future_Ref1',
  'Future_Ref2',
];

type ProductUploadDialogProps = {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
};

const ProductUploadDialog: React.FC<ProductUploadDialogProps> = ({
  open,
  onClose,
  onUpload,
}) => {
  const {
    selectedFile,
    error,
    setError,
    fileInputRef,
    handleDrop,
    handleFileSelect,
    resetForm,
    validateCSV,
  } = useFileUpload(PRODUCT_HEADERS);

  const [uploadedImages, setUploadedImages] = useState<{ name: string; url: string }[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingImages(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }
      
      const response = await serverCallWithToken({
        url: `${baseUrl}/products/upload-image`,
        method: 'POST',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data && response.data.urls) {
        const newUploaded = response.data.urls.map((url: string, index: number) => ({
          name: files[index]?.name || `Image-${index + 1}`,
          url
        }));
        setUploadedImages(prev => [...prev, ...newUploaded]);
        enqueueSnackbar("Images uploaded successfully!", { variant: 'success' });
      }
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Failed to upload images", { variant: 'error' });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDownloadSample = () => {
    const link = document.createElement("a");
    link.href = "/products.csv";
    link.setAttribute("download", "sample_products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async () => {
    if (!selectedFile) {
      setError("Please select a CSV file");
      return;
    }

    const { valid, error: validationError } = await validateCSV();
    if (!valid) {
      setError(validationError);
      return;
    }

    onUpload(selectedFile);

    setUploadedImages([]);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    setUploadedImages([]);
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        Upload Multiple Products
        <IconButton onClick={handleClose} size="small">
          <MdClose />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <FileUploadStep
          error={error}
          selectedFile={selectedFile}
          fileInputRef={fileInputRef}
          handleDrop={handleDrop}
          handleFileSelect={handleFileSelect}
          handleDownloadSample={handleDownloadSample}
          actionButtons={
            <Button variant="contained" sx={{ background: "#36F",
            color: "#FFF",   "&:hover": { background: "#36F" },}} onClick={handleSave}>
              Save
            </Button>
          }
        />

        {/* Upload Images Section */}
        <Box sx={{ mt: 3, px: 5, pb: 3 }}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="eva:image-fill" /> Upload Product Images for CSV Matching
          </Typography>
          <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 2 }}>
            Upload your images here first, then copy the generated URLs to paste them into your CSV's <b>ImageUrls</b> column.
          </Typography>
          
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={uploadingImages ? <CircularProgress size={20} /> : <Iconify icon="eva:cloud-upload-fill" />}
              disabled={uploadingImages}
            >
              {uploadingImages ? 'Uploading...' : 'Select Images to Upload'}
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleImageSelect}
              />
            </Button>
          </Stack>
          
          {uploadedImages.length > 0 && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {uploadedImages.map((img, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1.5, borderColor: 'divider' }}>
                    <Box
                      component="img"
                      src={img.url}
                      alt={img.name}
                      sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 1 }}
                    />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="caption" noWrap display="block" sx={{ fontWeight: 'bold' }}>
                        {img.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" noWrap display="block" sx={{ fontSize: 10 }}>
                        {img.url}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        navigator.clipboard.writeText(img.url);
                        enqueueSnackbar("Copied to clipboard!", { variant: 'success' });
                      }}
                    >
                      <Iconify icon="solar:copy-bold" width={18} />
                    </IconButton>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ProductUploadDialog;
