import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import * as XLSX from 'xlsx';
import { axios } from 'src/utils/axios';
import { useSnackbar } from 'src/components/snackbar';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  catalogueId: string;
  onSuccess: VoidFunction;
};

export default function ExcelImportModal({ open, onClose, catalogueId, onSuccess }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Map Excel columns to Product fields
        // Expecting columns: Name, Description, Price, Quantity, Discount
        const products = jsonData.map((row: any) => ({
            name: row.Name || row.name,
            description: row.Description || row.description || '',
            price: parseFloat(row.Price || row.price || 0),
            quantity: parseInt(row.Quantity || row.quantity || 1),
            discountPercentage: parseFloat(row.Discount || row.discount || 0),
        }));

        await axios.post(`/api/v1/products/bulk-upload/${catalogueId}`, { products });

        enqueueSnackbar(`${products.length} products imported successfully!`, { variant: 'success' });
        onSuccess();
        onClose();
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to import products. Check your file format.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Import Products from Excel</DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
          Upload an .xlsx or .csv file with columns: <b>Name, Price, Description, Quantity, Discount</b>.
        </Typography>

        <Box
          sx={{
            p: 3,
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 1,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: 'background.neutral',
            '&:hover': { opacity: 0.72 },
          }}
          onClick={() => document.getElementById('excel-upload-input')?.click()}
        >
          <input
            id="excel-upload-input"
            type="file"
            accept=".xlsx, .xls, .csv"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <Typography variant="subtitle2">
            {file ? file.name : 'Click to select file'}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!file || loading}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
        >
          Upload & Import
        </Button>
      </DialogActions>
    </Dialog>
  );
}
