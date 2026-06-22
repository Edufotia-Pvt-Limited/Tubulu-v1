
import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { MdClose, MdAdd, MdDelete } from 'react-icons/md';
import { Deal } from 'src/types/deals';
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from "dayjs";


interface EditDealModalProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (payload: Deal) => Promise<void> | void;
  isUpdating: boolean;
  deal: Deal | null;
}

const parseNumberInput = (value: string): number | '' => {
  if (value === '') return '';
  const num = Number(value);
  return isNaN(num) ? '' : num;
};

const toNumber = (value: number | ''): number => (value === '' ? 0 : Number(value));

const EditDealModal: React.FC<EditDealModalProps> = ({
  open,
  onClose,
  onUpdate,
  isUpdating,
  deal,
}) => {

  
  const [dealName, setDealName] = useState('');
  const [descriptions, setDescriptions] = useState<string[]>([]);
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
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Populate existing deal when modal opens or deal changes
  useEffect(() => {
    if (!open || !deal) return;

    setDealName(deal.name || '');
    setDescriptions(deal.descriptions && deal.descriptions.length ? deal.descriptions : []);
    setCouponCode(deal.couponCode ?? '');
    setDiscountType((deal.discountType as any) || 'percentage');

    setDiscountValue(deal.discountValue ?? '');
    setBuyQuantity(deal.buyQuantity ?? '');
    setGetQuantity(deal.getQuantity ?? '');
    setMinOrderValue(deal.minOrderValue ?? '');
    setMaxDiscount(deal.maxDiscount ?? '');
    setUsageLimit(deal.usageLimit ?? '');
    setPerUserLimit(deal.perUserLimit ?? '');
    setStartDate(deal.startDate ? String(deal.startDate).slice(0, 16) : '');
    setEndDate(deal.endDate ? String(deal.endDate).slice(0, 16) : '');

    setErrors({});
    setApiErrors({});
    setHasAttemptedSubmit(false);
  }, [open, deal]);

  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
    setApiErrors((prev) => {
      if (!prev[field]) return prev;
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const addDescriptionLine = () => setDescriptions((s) => [...s, '']);
  const updateDescription = (index: number, value: string) => {
    setDescriptions((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
    if (hasAttemptedSubmit) clearFieldError('description');
  };
  const removeDescriptionLine = (index: number) => {
    setDescriptions((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};


    if (!dealName.trim()) {
      newErrors.dealName = "Deal name is required";
    } else if (dealName.length > 40) {
      newErrors.dealName = "Deal name cannot exceed 40 characters";
    }


    // Discount rules
    if (discountType === 'percentage' || discountType === 'flat') {
      if (!discountValue || Number(discountValue) <= 0) newErrors.discountValue = 'Discount Is required (must be greater than 0)';

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
      if (!buyQuantity || Number(buyQuantity) <= 0) newErrors.buyQuantity = 'Buy quantity must be greater than 0';
      if (!getQuantity || Number(getQuantity) <= 0) newErrors.getQuantity = 'Get quantity must be greater than 0';
    }

    // Validity period
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (!endDate) newErrors.endDate = 'End date is required';
    if (startDate && endDate && new Date(endDate) <= new Date(startDate))
      newErrors.endDate = 'End date must be after start date';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async () => {
    setHasAttemptedSubmit(true);
    if (!validateForm()) return;
    setApiErrors({});

    // prepare descriptions: remove empty / whitespace-only items
    const cleanedDescriptions = (descriptions || []).filter((d) => d && d.trim() !== '');

    try {
      await onUpdate({
        ...deal!,
        name: dealName,
        descriptions: cleanedDescriptions,
        couponCode,
        discountType,

        discountValue: toNumber(discountValue),
        buyQuantity: toNumber(buyQuantity),
        getQuantity: toNumber(getQuantity),
        minOrderValue: toNumber(minOrderValue),
        maxDiscount: toNumber(maxDiscount),
        usageLimit: toNumber(usageLimit),
        perUserLimit: toNumber(perUserLimit),

        startDate,
        endDate,
      });
    } catch (error: unknown) {
      const errData = (error as any)?.response?.data;
      const mapped: Record<string, string> = {};

      if (errData?.errors) {
        if (typeof errData.errors === 'string') {
          mapped.dealName = errData.errors; // handle duplicate name
        } else if (Array.isArray(errData.errors)) {
          errData.errors.forEach((e: any) => {
            if (e.field) mapped[e.field] = e.message || 'Invalid';
          });
        } else if (typeof errData.errors === 'object') {
          Object.assign(mapped, errData.errors);
        }
      } else if (errData?.message) {
        if (typeof errData.message === 'string' && errData.message.toLowerCase().includes('already exists')) {
          mapped.dealName = errData.message;
        } else {
          mapped.general = errData.message;
        }
      } else if (error instanceof Error) {
        mapped.general = error.message;
      }

      setApiErrors(mapped);
    }
  }



  const handleClose = () => {
    setHasAttemptedSubmit(false);
    setErrors({});
    setApiErrors({});
    onClose();
  };

  if (!deal) return null;
  const showErrors = hasAttemptedSubmit;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: 18 }}>
        Edit Deal
        <IconButton onClick={handleClose}>
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
                  if (showErrors) clearFieldError('dealName');
                }}
                error={showErrors && (!!errors.dealName || !!apiErrors.dealName)}
                helperText={showErrors && (errors.dealName || apiErrors.dealName)}
                FormHelperTextProps={{ sx: { m: 0, minHeight: '1em' } }}
              />

              <TextField
                label="Coupon Code"
                fullWidth
                size="small"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                }}

              />
            </Stack>
          </Box>


          {/* Description (optional) */}
          <Box>
            <Typography fontWeight={600} mb={1}>Description</Typography>

            {descriptions.map((desc, i) => (
              <Stack key={i} direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <TextField
                  placeholder={`Description ${i + 1}`}
                  fullWidth
                  size="small"
                  value={desc}
                  onChange={(e) => updateDescription(i, e.target.value)}
                />
                <IconButton color="error" disabled={descriptions.length === 0} onClick={() => removeDescriptionLine(i)}>
                  <MdDelete />
                </IconButton>
              </Stack>
            ))}

            <Button startIcon={<MdAdd />} onClick={addDescriptionLine} size="small" variant="outlined">Add Line</Button>
            {/* no validation / helper text for descriptions — it's optional */}
          </Box>


          {/* Discount Config */}
          <Box>
            <Typography fontWeight={600} mb={1}>Discount Configuration</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Select
                size="small"
                fullWidth
                value={discountType}
                onChange={(e) => {
                  setDiscountType(e.target.value as any);

                  // CLEAR all related fields when discount type changes
                  setDiscountValue('');
                  setBuyQuantity('');
                  setGetQuantity('');
                  setMinOrderValue('');
                  setMaxDiscount('');
                  if (showErrors) clearFieldError('discountType');
                }}
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
                      if (showErrors) clearFieldError('buyQuantity');
                    }}
                    error={showErrors && !!errors.buyQuantity}
                    helperText={showErrors && errors.buyQuantity}
                    FormHelperTextProps={{ sx: { m: 0, minHeight: '1em' } }}
                  />
                  <TextField
                    label="Get Qty"
                    type="number"
                    size="small"
                    fullWidth
                    value={getQuantity}
                    onChange={(e) => {
                      setGetQuantity(parseNumberInput(e.target.value));
                      if (showErrors) clearFieldError('getQuantity');
                    }}
                    error={showErrors && !!errors.getQuantity}
                    helperText={showErrors && errors.getQuantity}
                    FormHelperTextProps={{ sx: { m: 0, minHeight: '1em' } }}
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
                    if (showErrors) clearFieldError('discountValue');
                  }}
                  error={showErrors && (!!errors.discountValue || !!apiErrors.discountValue)}
                  helperText={showErrors && (errors.discountValue || apiErrors.discountValue)}
                  FormHelperTextProps={{ sx: { m: 0, minHeight: '1em' } }}
                />
              )}
            </Stack>
          </Box>



          {/* Order Constraints */}
          <Box>
            <Typography fontWeight={600} mb={1}>Order Constraints</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Minimum Order Value"
                type="number"
                size="small"
                fullWidth
                value={minOrderValue}
                                inputProps={{ min: 0 }}

                onChange={(e) => {
                  setMinOrderValue(parseNumberInput(e.target.value));
                  if (showErrors) clearFieldError('minOrderValue');
                }}
                error={showErrors && (!!errors.minOrderValue || !!apiErrors.minOrderValue)}
                helperText={showErrors && (errors.minOrderValue || apiErrors.minOrderValue)}
                FormHelperTextProps={{ sx: { m: 0, minHeight: '1em' } }}
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
                  if (showErrors) clearFieldError('maxDiscount');
                }}
                error={showErrors && (!!errors.maxDiscount || !!apiErrors.maxDiscount)}
                helperText={showErrors && (errors.maxDiscount || apiErrors.maxDiscount)}
                FormHelperTextProps={{ sx: { m: 0, minHeight: '1em' } }}
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
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Usage Limit"
                type="number"
                size="small"
                fullWidth
                value={usageLimit}
                                inputProps={{ min: 0 }}

                onChange={(e) => {
                  setUsageLimit(parseNumberInput(e.target.value));
                  if (showErrors) clearFieldError('usageLimit');
                }}
                error={showErrors && (!!errors.usageLimit || !!apiErrors.usageLimit)}
                helperText={showErrors && (errors.usageLimit || apiErrors.usageLimit)}
                FormHelperTextProps={{ sx: { m: 0, minHeight: '1em' } }}
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
                  if (showErrors) clearFieldError('perUserLimit');
                }}
                error={showErrors && (!!errors.perUserLimit || !!apiErrors.perUserLimit)}
                helperText={showErrors && (errors.perUserLimit || apiErrors.perUserLimit)}
                FormHelperTextProps={{ sx: { m: 0, minHeight: '1em' } }}
              />
            </Stack>
          </Box>


          {/* Validity Period */}
          <Box>
          
            <Typography fontWeight={600} mb={1}>Validity Period</Typography>

<Stack  direction={{ xs: "column", sm: "row" }} spacing={2}>

  {/* START DATE */}
  <DateTimePicker
    label="Start Date"
    value={startDate ? new Date(startDate) : null}
    onChange={(v) => setStartDate(v?.toISOString() || '')}
    minDate={dayjs().startOf("day").toDate()}

    onAccept={() => {   // <-- triggers when full datetime selected
      // Close only the date picker
      document.activeElement instanceof HTMLElement && document.activeElement.blur();
    }}
    slotProps={{
      textField: {
        size: "small",
        fullWidth: true,
        error: !!errors.startDate,
        helperText: errors.startDate,
        InputLabelProps: { shrink: true }
      }
    }}
  />

  {/* END DATE */}
  <DateTimePicker
    label="End Date"
    value={endDate ? new Date(endDate) : null}
        minDate={dayjs().startOf("day").toDate()}
    
    onChange={(v) => setEndDate(v?.toISOString() || '')}
    onAccept={() => {
      document.activeElement instanceof HTMLElement && document.activeElement.blur();
    }}
    slotProps={{
      textField: {
        size: "small",
        fullWidth: true,
        error: !!errors.endDate,
        helperText: errors.endDate,
        InputLabelProps: { shrink: true }
      }
    }}
  />

</Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isUpdating}>
          {isUpdating ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditDealModal;
