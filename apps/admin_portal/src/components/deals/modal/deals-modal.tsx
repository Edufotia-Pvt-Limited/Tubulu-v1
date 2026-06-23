

import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
  Button,
  CircularProgress,
  DialogActions,
  Stack,
  Divider,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MdClose, MdAdd, MdDelete } from 'react-icons/md';
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";

interface DealModalProps {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  onSave?: (payload: any) => Promise<void>;
  isSaving?: boolean;
}

const parseNumberInput = (value: string): number | '' => {
  if (value === '') return '';
  const num = Number(value);
  return isNaN(num) ? '' : num;
};

const toNumber = (value: number | ''): number => (value === '' ? 0 : Number(value));

const DealModal: React.FC<DealModalProps> = ({
  modalOpen,
  setModalOpen,
  onSave,
  isSaving = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [dealName, setDealName] = useState('');
  const [descriptions, setDescriptions] = useState<string[]>(['']);
  const [couponCode, setCouponCode] = useState('');

  const [discountType, setDiscountType] = useState<'percentage' | 'flat' | 'bogo'>('percentage');
  const [discountValue, setDiscountValue] = useState<number | ''>('');
  const [buyQuantity, setBuyQuantity] = useState<number | ''>('');
  const [getQuantity, setGetQuantity] = useState<number | ''>('');

  const [minOrderValue, setMinOrderValue] = useState<number | ''>('');
  const [maxDiscount, setMaxDiscount] = useState<number | ''>('');
  const [usageLimit, setUsageLimit] = useState<number | ''>('');
  const [perUserLimit, setPerUserLimit] = useState<number | ''>('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiErrors, setApiErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setDealName('');
    setDescriptions(['']);
    setCouponCode('');
    setDiscountType('percentage');
    setDiscountValue('');
    setBuyQuantity('');
    setGetQuantity('');
    setMinOrderValue('');
    setMaxDiscount('');
    setUsageLimit('');
    setPerUserLimit('');
    setStartDate('');
    setEndDate('');
    setErrors({});
    setApiErrors({});
    setModalOpen(false);
  };

  const addDescriptionLine = () => setDescriptions(prev => [...prev, '']);
  const updateDescription = (index: number, value: string) => {
    const updated = [...descriptions];
    updated[index] = value;
    setDescriptions(updated);
  };
  const removeDescriptionLine = (index: number) => {
    if (descriptions.length === 1) return;
    setDescriptions(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!dealName.trim()) newErrors.dealName = 'Deal name is required';
    else if (dealName.length > 40) newErrors.dealName = 'Deal name cannot exceed 40 characters';

    if (discountType === 'percentage' || discountType === 'flat') {
      if (!discountValue || Number(discountValue) <= 0)
        newErrors.discountValue = 'Discount must be greater than 0)';

      else if (discountType === 'percentage' && Number(discountValue) > 100)
        newErrors.discountValue = 'Percentage cannot exceed 100';
    }
    if(Number(usageLimit) < 0 ){
      newErrors.usageLimit = "Usage Limit must greater than 0"
    }
     if(Number(minOrderValue) < 0 ){
      newErrors.minOrderValue = "Minimum Order Value must greater than 0"
    }
     if(Number(maxDiscount) < 0 ){
      newErrors.maxDiscount = "Maximum Discount must greater than 0"
    }
     if(Number(perUserLimit) < 0 ){
      newErrors.perUserLimit = "Per User Limit must greater than 0"
    }

    if (discountType === 'bogo') {
      if (!buyQuantity || Number(buyQuantity) <= 0)
        newErrors.buyQuantity = 'Buy quantity must be greater than 0';
      if (!getQuantity || Number(getQuantity) <= 0)
        newErrors.getQuantity = 'Get quantity must be greater than 0';
    }

    if (!startDate) newErrors.startDate = 'Start date is required';
    if (!endDate) newErrors.endDate = 'End date is required';
    if (startDate && endDate && new Date(endDate) <= new Date(startDate))
      newErrors.endDate = 'End date must be after start date';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setApiErrors({}); // reset previous API errors
    const cleanedDescriptions = descriptions.filter(d => d && d.trim() !== '');
    const payload: any = {
      name: dealName,
      descriptions: cleanedDescriptions,
      couponCode,
      discountType,
      minOrderValue: toNumber(minOrderValue),
      maxDiscount: toNumber(maxDiscount),
      usageLimit: toNumber(usageLimit),
      perUserLimit: toNumber(perUserLimit),
      startDate,
      endDate,
      isActive: true,
    };

    if (discountType === 'bogo') {
      payload.buyQuantity = toNumber(buyQuantity);
      payload.getQuantity = toNumber(getQuantity);
    } else {
      payload.discountValue = toNumber(discountValue);
    }


    if (onSave) {
      try {
        await onSave(payload);
        resetForm();
      } catch (error: unknown) {
        const errData = (error as any)?.response?.data;
        setApiErrors({}); // clear previous

        if (errData) {
          // Handle "Deal with this name already exists"
          if (typeof errData.errors === 'string' && errData.errors.includes('already exists')) {
            setApiErrors({ dealName: errData.errors });
          } else if (errData.errors && typeof errData.errors === 'object') {
            setApiErrors(errData.errors);
          } else if (errData.message) {
            setApiErrors({ general: errData.message });
          } else {
            setApiErrors({ general: 'Something went wrong' });
          }
        } else if (error instanceof Error) {
          setApiErrors({ general: error.message });
        }
      }
    }

  };

  return (
    <Dialog
      open={modalOpen}
      onClose={resetForm}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 600,
          fontSize: 18,
        }}
      >
        Create New Deal
        <IconButton onClick={resetForm}>
          <MdClose size={22} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={3}>
          {/* Basic Info */}
          <Box>
            <Typography fontWeight={600} mb={1}>Basic Information</Typography>
            <Stack spacing={2}>
              <TextField
                label="Deal Name"
                fullWidth
                size="small"
                value={dealName}
                onChange={(e) => {
                  setDealName(e.target.value);
                  if (errors.dealName) setErrors(prev => ({ ...prev, dealName: '' }));
                  if (apiErrors.dealName) setApiErrors(prev => ({ ...prev, dealName: '' }));
                }}
                error={!!errors.dealName || !!apiErrors.dealName}
                helperText={errors.dealName || apiErrors.dealName}
              />
              <TextField
                label="Coupon Code"
                fullWidth
                size="small"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                error={!!errors.couponCode || !!apiErrors.couponCode}
                helperText={errors.couponCode || apiErrors.couponCode}
                FormHelperTextProps={{ sx: { m: 0, minHeight: '1em' } }}
              />
            </Stack>
          </Box>

          {/* <Divider /> */}

          {/* Description */}
          <Box>
            <Typography fontWeight={600} mb={1}>Description</Typography>
            {descriptions.map((desc, index) => (
              <Stack key={index} direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <TextField
                  placeholder={`Description ${index + 1}`}
                  fullWidth
                  size="small"
                  value={desc}
                  onChange={(e) => updateDescription(index, e.target.value)}
                />
                <IconButton
                  color="error"
                  onClick={() => removeDescriptionLine(index)}
                  disabled={descriptions.length === 1}
                >
                  <MdDelete />
                </IconButton>
              </Stack>
            ))}
            <Button startIcon={<MdAdd />} onClick={addDescriptionLine} size="small" variant="outlined">Add Line</Button>
          </Box>

          {/* <Divider /> */}

          {/* Discount Configuration */}
          <Box>
            <Typography fontWeight={600} mb={1}>Discount Configuration</Typography>
            <Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
              <Select
                size="small"
                value={discountType}
                onChange={(e) => {
                  const newType = e.target.value as any;
                  setDiscountType(newType);

                  // CLEAR all related fields when discount type changes
                  setDiscountValue('');
                  setBuyQuantity('');
                  setGetQuantity('');
                  setMinOrderValue('');
                  setMaxDiscount('');
                  if (errors.discountType) setErrors(prev => ({ ...prev, discountType: '' }));
                }}
                fullWidth
              >
                <MenuItem value="percentage">Percentage</MenuItem>
                <MenuItem value="flat">Flat</MenuItem>
                <MenuItem value="bogo">Buy X Get Y</MenuItem>
              </Select>

              {discountType === 'bogo' ? (
                <Stack direction="row" spacing={2} width="100%">
                  <TextField
                    label="Buy Qty"
                    type="number"
                    size="small"
                    fullWidth
                    value={buyQuantity}
                    onChange={(e) => {
                      setBuyQuantity(parseNumberInput(e.target.value));
                      if (errors.buyQuantity) setErrors(prev => ({ ...prev, buyQuantity: '' }));
                    }}
                    error={!!errors.buyQuantity}
                    helperText={errors.buyQuantity}
                  />
                  <TextField
                    label="Get Qty"
                    type="number"
                    size="small"
                    fullWidth
                    value={getQuantity}
                    onChange={(e) => {
                      setGetQuantity(parseNumberInput(e.target.value));
                      if (errors.getQuantity) setErrors(prev => ({ ...prev, getQuantity: '' }));
                    }}
                    error={!!errors.getQuantity}
                    helperText={errors.getQuantity}
                  />
                </Stack>
              ) : (
                <TextField
                  label={`Discount (${discountType === 'percentage' ? '%' : '₹'})`}
                  type="number"
                  size="small"
                  fullWidth
                  value={discountValue}
                  onChange={(e) => {
                    setDiscountValue(parseNumberInput(e.target.value));
                    if (errors.discountValue) setErrors(prev => ({ ...prev, discountValue: '' }));
                  }}
                  error={!!errors.discountValue || !!apiErrors.discountValue}
                  helperText={errors.discountValue || apiErrors.discountValue}
                />
              )}
            </Stack>
          </Box>

          {/* <Divider /> */}

          {/* Order Constraints */}
          <Box>
            <Typography fontWeight={600} mb={1}>Order Constraints</Typography>
            <Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
              <TextField
                label="Minimum Order Value"
                type="number"
                size="small"
                fullWidth
                value={minOrderValue}
                inputProps={{ min: 0 }}
                onChange={(e) => {
                  setMinOrderValue(parseNumberInput(e.target.value));
                  if (errors.minOrderValue) setErrors(prev => ({ ...prev, minOrderValue: '' }));
                }}
                error={!!errors.minOrderValue || !!apiErrors.minOrderValue}
                helperText={errors.minOrderValue || apiErrors.minOrderValue}
                 disabled={discountType === 'bogo'}
                sx={{
                  '& .MuiInputBase-root.Mui-disabled': {
                    backgroundColor: '#f5f5f5',
                    color: 'rgba(0,0,0,0.6)',
                  },
                }}
              />
              <TextField
                label="Maximum Discount"
                type="number"
                size="small"
                fullWidth
                value={maxDiscount}
                inputProps={{ min: 0 }}
                onChange={(e) => {
                  setMaxDiscount(parseNumberInput(e.target.value));
                  if (errors.maxDiscount) setErrors(prev => ({ ...prev, maxDiscount: '' }));
                }}
                error={!!errors.maxDiscount || !!apiErrors.maxDiscount}
                helperText={errors.maxDiscount || apiErrors.maxDiscount}
                disabled={discountType === 'bogo' || discountType === 'flat'}
                sx={{
                  '& .MuiInputBase-root.Mui-disabled': {
                    backgroundColor: '#f5f5f5',
                    color: 'rgba(0,0,0,0.6)',
                  },
                }}
              />
            </Stack>
          </Box>

          {/* Usage Rules */}
          <Box>
            <Typography fontWeight={600} mb={1}>Usage Rules</Typography>
            <Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
              <TextField
                label="Usage Limit"
                type="number"
                size="small"
                fullWidth
                value={usageLimit}
                inputProps={{ min: 0 }}
                onChange={(e) => {
                  setUsageLimit(parseNumberInput(e.target.value));
                  if (errors.usageLimit) setErrors(prev => ({ ...prev, usageLimit: '' }));
                }}
                error={!!errors.usageLimit || !!apiErrors.usageLimit}
                helperText={errors.usageLimit || apiErrors.usageLimit}
              />
              <TextField
                label="Per User Limit"
                type="number"
                size="small"
                fullWidth
                value={perUserLimit}
                inputProps={{ min: 0 }}
                onChange={(e) => {
                  setPerUserLimit(parseNumberInput(e.target.value));
                  if (errors.perUserLimit) setErrors(prev => ({ ...prev, perUserLimit: '' }));
                }}
                error={!!errors.perUserLimit || !!apiErrors.perUserLimit}
                helperText={errors.perUserLimit || apiErrors.perUserLimit}
              />
            </Stack>
          </Box>

          {/* <Divider /> */}

          {/* Validity Period */}
          <Box>
            {/* <Typography fontWeight={600} mb={1}>Validity Period</Typography>
            <Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
              <TextField
                label="Start Date"
                type="datetime-local"
                size="small"
                fullWidth
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  e.target.blur();
                  if (errors.startDate) setErrors(prev => ({ ...prev, startDate: '' }));
                }}
                error={!!errors.startDate}
                helperText={errors.startDate}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date"
                type="datetime-local"
                size="small"
                fullWidth
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  e.target.blur();
                  if (errors.endDate) setErrors(prev => ({ ...prev, endDate: '' }));
                }}
                error={!!errors.endDate}
                helperText={errors.endDate}
                InputLabelProps={{ shrink: true }}
              />
            </Stack> */}
            <Typography fontWeight={600} mb={1}>Validity Period</Typography>
<Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
  <DateTimePicker
    label="Start Date"
    value={startDate ? new Date(startDate) : null}
    minDate={dayjs().startOf("day").toDate()}
    onChange={(v) => setStartDate(v?.toISOString() || '')}
    
    onAccept={() => {
      // Only close modal if both start and end date are selected
      // if (startDate && endDate) setModalOpen(false);
    }}
    
    slotProps={{
      textField: {
        size: 'small',
        fullWidth: true,
        error: !!errors.startDate,
        helperText: errors.startDate,
      }
    }}
  />

  <DateTimePicker
    label="End Date"
    value={endDate ? new Date(endDate) : null}
        minDate={dayjs().startOf("day").toDate()}
    onChange={(v) => setEndDate(v?.toISOString() || '')}
    onAccept={() => {
      // Only close modal if both start and end date are selected
      // if (startDate && endDate) setModalOpen(false);
    }}
    slotProps={{
      textField: {
        size: 'small',
        fullWidth: true,
        error: !!errors.endDate,
        helperText: errors.endDate,
      }
    }}
  />
</Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <CircularProgress size={20} /> : 'Create Deal'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DealModal;
