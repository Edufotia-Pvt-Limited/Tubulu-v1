import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  TextField,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  Divider,
  Tooltip,
} from '@mui/material';
import { MdAdd, MdClose, MdDelete } from 'react-icons/md';
import { Choice, Option } from 'src/types/customization';

interface EditCustomizationOptionModalProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (option: Option) => Promise<void>;
  isUpdating: boolean;
  option: Option | null;
  category:string | null;
}

const EditCustomizationOptionModal: React.FC<EditCustomizationOptionModalProps> = ({
  open,
  onClose,
  onUpdate,
  isUpdating,
  option,
  category
}) => {
  const defaultOption: Option = {
    _id: '',
    name: '',
    type: 'dropdown',
    required: false,
    priceType: 'base',
    isActive: true,
    isDeleted: false,
    choices: [],
  };

  const [optionData, setOptionData] = useState<Option>(defaultOption);
  const [errors, setErrors] = useState({ name: '', choices: '' });
  const [apiError, setApiError] = useState<string | null>(null);

   
const normalizeFoodType = (value?: string) => {
  if (!value) return "";

  const val = value.toLowerCase().replace(/_/g, "").replace(/-/g, "").trim();

  if (val === "veg") return "Veg";
  if (val === "nonveg" || val === "non veg") return "Non Veg";
  if (val === "egg") return "Egg";

  return "";
};


const getRuleError = (selected: "radio" | "checkbox", required: boolean, priceType: "base" | "adjustment") => {
  const isSS = selected === "radio";
  const isMS = selected === "checkbox";

  const isBase = priceType === "base";
  const isAdj = priceType === "adjustment";

  // --- SINGLE SELECT (SS) ---
  if (isSS && isBase && !required) return "Single Select + Base + Not Required is not allowed.";
  if (isSS && isBase && required) return null;
  if (isSS && isAdj && required) return null;
  if (isSS && isAdj && !required) return null;

  // --- MULTI SELECT (MS) ---
  if (isMS && isBase && required) return "Multi Select + Base + Required is not allowed.";
  if (isMS && isBase && !required) return "Multi Select + Base + Not Required is not allowed.";
  if (isMS && isAdj && required) return null;
  if (isMS && isAdj && !required) return null;

  return null;
};

 useEffect(() => {
  const baseError = getRuleError(
    optionData.type as "radio" | "checkbox",
    optionData.required,
    "base"
  );

  // If CURRENT priceType is base AND base is invalid → switch to adjustment
  if (optionData.priceType === "base" && baseError) {
    setOptionData(prev => ({
      ...prev,
      priceType: "adjustment",
    }));
  }
}, [optionData.type, optionData.required, optionData.priceType]);



  useEffect(() => {
    if (open && option) {
      
      const updatedChoices = option.choices.map((choice) => ({
  ...choice,
  isDefault: !!choice.isDefault, // ensures false if undefined or null
       foodType: normalizeFoodType(choice.foodType),
}));

      setOptionData({ ...option, choices: updatedChoices });
      setErrors({ name: '', choices: '' });
      setApiError(null);
    }
  }, [open, option]);

  
  const handleChange = <K extends keyof Option>(field: K, value: Option[K]) => {
  setOptionData((prev) => {
    // If `required` is being set to false → clear all default selections
    
    if (field === "required" && value === false) {
      return {
        ...prev,
        required: false,
        choices: prev.choices.map((choice) => ({
          ...choice,
          isDefault: false,
           foodType: "",
        })),
      };
    }

    // normal update for all other fields
    return { ...prev, [field]: value };
  });
};


 

  const handleChoiceChange = (index: number, key: keyof Choice, value: any) => {
    const newOptions = [...optionData.choices];
    newOptions[index] = { ...newOptions[index], [key]: value };

    if (key === 'name' && typeof value === 'string') {
      const trimmedName = value.trim().toLowerCase();

      if (trimmedName) {
        const duplicate = newOptions.some(
          (opt, i) => i !== index && opt.name.trim().toLowerCase() === trimmedName
        );

        if (duplicate) {
          setErrors((prev) => ({
            ...prev,
            choices: 'Duplicate choice name found. Please enter a unique name.',
          }));
          return;
        } else if (errors.choices) {
          setErrors((prev) => ({ ...prev, choices: '' }));
        }
      }
    }

    setOptionData((prev) => ({ ...prev, choices: newOptions }));
  };

  const addChoice = () => {
    const lastChoice = optionData.choices[optionData.choices.length - 1];

    if (lastChoice && !lastChoice.name.trim()) {
      setErrors((prev) => ({
        ...prev,
        choices: 'Please fill the current choice before adding another.',
      }));
      return;
    }

    if (errors.choices) {
      setErrors((prev) => ({ ...prev, choices: '' }));
    }

    // Add a new blank choice
    setOptionData((prev) => ({
      ...prev,
      choices: [
        ...prev.choices,
        {
          _id: crypto.randomUUID(),
          name: '',
          foodType: "",
          priceAdjustment: 0,
          isDefault: false,
        },
      ],
    }));
  };

  const removeChoice = (index: number) => {
    setOptionData((prev) => ({
      ...prev,
      choices: prev.choices.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { name: '', choices: '' };

    if (!optionData.name.trim()) {
      newErrors.name = 'Option Name is required';
      valid = false;
    }

    const hasAtLeastOne = optionData.choices.some((c) => c.name.trim() !== '');
    if (!hasAtLeastOne) {
      newErrors.choices = 'At least one choice is required';
      valid = false;
    }

    if (optionData.type === "radio") {
  const selectedDefaults = optionData.choices.filter(c => c.isDefault);

  if (selectedDefaults.length > 1) {
    newErrors.choices = "Only one default choice is allowed for Single Select.";
    valid = false;
  }
}

    const names = optionData.choices
      .map((c) => c.name.trim().toLowerCase())
      .filter((n) => n !== '');
    const duplicates = names.filter((n, i) => names.indexOf(n) !== i);

    if (duplicates.length > 0) {
      newErrors.choices = 'Choice names must be unique';
      valid = false;
    }

  if (optionData.required) {
    const hasDefault = optionData.choices.some((opt) => opt.isDefault);
    if (!hasDefault) {
      newErrors.choices =
        'At least one default choice is required.';
      valid = false;
    }
  }

 for (const c of optionData.choices) {
  if (c.priceAdjustment === "" || c.priceAdjustment === null || c.priceAdjustment === undefined) {
    newErrors.choices = "Amount cannot be empty.";
    valid = false;
    break;
  }

  if (Number(c.priceAdjustment) < 0) {
    newErrors.choices = "Amount cannot be negative.";
    valid = false;
    break;
  }
  }

 

 

    if (optionData.type === "radio" && optionData.priceType === "base") {
  const hasZero = optionData.choices.some(
    (opt) => Number(opt.priceAdjustment) === 0
  );

  if (hasZero) {
    newErrors.choices = "Base Price (Single Select) cannot have choices priced at 0.";
    valid = false;
  }
}

    setErrors(newErrors);
    return valid;
  };

 const ruleErrorForBase = getRuleError(optionData.type as "radio" | "checkbox", optionData.required, "base");
const ruleErrorForAdj = getRuleError(optionData.type as "radio" | "checkbox", optionData.required, "adjustment");

const ruleErrorForRadio = getRuleError("radio", optionData.required, optionData.priceType);
const ruleErrorForCheckbox = getRuleError("checkbox", optionData.required, optionData.priceType);



  const handleUpdate = async () => {
    if (!validateForm()) return;
    setApiError(null);

    try {
      await onUpdate(optionData);
      onClose();
    } catch (err: any) {
      console.error('Upload Error:', err);
      let backendMessage = 'Failed to save option';

      try {
        if (err.response?.data) {
          const data =
            typeof err.response.data === 'string'
              ? JSON.parse(err.response.data)
              : err.response.data;

          if (Array.isArray(data.errors)) {
            //
            backendMessage = data.errors.map((e: any) => e.message || e).join(', ');
          } else if (typeof data.errors === 'string') {
            backendMessage = data.errors;
          } else if (data.message) {
            backendMessage = data.message;
          }
        } else if (err.message) {
          backendMessage = err.message;
        }
      } catch (parseError) {
        console.error('Error parsing backend error:', parseError);
      }

      console.error('Backend Message:', backendMessage);
      setApiError(backendMessage);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, overflowY: 'auto', maxHeight: '95vh', p: 1 },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 700,
          fontSize: 18,
          px: 3,
          py: 2,
        }}
      >
        Edit Option
        <IconButton onClick={onClose}>
          <MdClose size={22} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Option Name */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: 14 }}>
            Option Name
          </Typography>
          <TextField
            placeholder="e.g. Size, Flavor"
            fullWidth
            variant="outlined"
            size="small"
            value={optionData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={!!errors.name || !!apiError}
            helperText={errors.name || apiError || ''}
                  FormHelperTextProps={{ sx: { m: 0, minHeight: '1em' } }}

          />
          <FormControlLabel
            sx={{ mt: -0.5 }}
            control={
              <Checkbox
                checked={optionData.required}
                
                onChange={(e) =>{ handleChange('required', e.target.checked)
                
                
                    if (errors.choices) {
    setErrors(prev => ({ ...prev, choices: "" }));
  }
                }}
                
                color="primary"
              />
            }
            label={
              <Typography fontSize={13}>
                <Box component="span" fontWeight={600}>
                  Required Field
                </Box>
                <Box component="span" sx={{ color: 'text.secondary', ml: 0.5 }}>
                  (Customer must make a selection)
                </Box>
              </Typography>
            }
          />
        </Box>

      
        <Select
  size="small"
  value={optionData.type}
  onChange={(e) =>{ handleChange("type", e.target.value)
     if (errors.choices) {
    setErrors(prev => ({ ...prev, choices: "" }));
  }
  setOptionData(prev => ({
  ...prev,
  choices: prev.choices.map(opt => ({
    ...opt,
    isDefault: false
  }))
}));

  
  }}
  sx={{ width: "70%", borderRadius: 1 }}
>
  <MenuItem value="radio" disabled={!!ruleErrorForRadio}>
    Single Select (User can select only one)
  </MenuItem>

  <MenuItem value="checkbox" disabled={!!ruleErrorForCheckbox}>
    Multi Select (User can select many)
  </MenuItem>
</Select>


        {/* Choices Section */}
        {
          category === "Food and beverage" ? 
          (
          <>
           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Choices & Pricing</Typography>
          {errors.choices && (
            <Typography sx={{ color: 'error.main', fontSize: 12 }}>{errors.choices}</Typography>
          )}

          {optionData.choices.map((choice, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                border: '2px solid',
                borderColor: choice.isDefault ? 'primary.main' : 'divider',
                borderRadius: 2,
                p: 2,
                position: 'relative',
                backgroundColor: choice.isDefault ? 'rgba(25, 118, 210, 0.06)' : 'transparent',
                transition: 'all 0.25s ease',
              }}
            >
              {choice.isDefault && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -9,
                    left: 14,
                    bgcolor: 'primary.main',
                    color: 'white',
                    px: 1,
                    py: 0.2,
                    borderRadius: 1,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: 0.3,
                  }}
                >
                  DEFAULT
                </Box>
              )}
              {optionData.required && (
              <Tooltip title="Mark as default selection">
                <Checkbox
                  color="primary"
                  checked={choice.isDefault}
                  onChange={(e) => {
                    const checked = e.target.checked;
                      if (errors.choices) {
    setErrors(prev => ({ ...prev, choices: "" }));
  }

                    if (!choice.name.trim()) {
                      setErrors((prev) => ({
                        ...prev,
                        choices: 'You cannot set an empty choice as default.',
                      }));
                      return;
                    }

                    if (optionData.type === 'radio' && checked) {
                      // Only one default allowed — uncheck others
                      const updatedChoices = optionData.choices.map((c, i) => ({
                        ...c,
                        isDefault: i === index,
                      }));
                      setOptionData((prev) => ({ ...prev, choices: updatedChoices }));
                    } else {
                      // Multiple defaults allowed
                      handleChoiceChange(index, 'isDefault', checked);
                    }

                    if (errors.choices) {
                      setErrors((prev) => ({ ...prev, choices: '' }));
                    }
                  }}
                />
              </Tooltip>
              )}
              <TextField
                label="Choice Name"
                size="small"
                fullWidth
                placeholder="e.g. Vanilla, Chocolate"
                value={choice.name}
                onChange={(e) => handleChoiceChange(index, 'name', e.target.value)}
                //               error={!!errors.choices}
                // helperText={errors.choices || ""}
              />
             
              
                          <TextField
  label="Amount (₹)"
  size="small"
  sx={{ width: 180 }}
  type="number"
  value={
    choice.priceAdjustment === 0 && choice._id.startsWith('temp_')
      ? ''
      : choice.priceAdjustment.toString()
  }
  onChange={(e) => {
    const val = e.target.value;

      if (errors.choices) {
    setErrors(prev => ({ ...prev, choices: "" }));
  }

    handleChoiceChange(
      index,
      'priceAdjustment',
      val === '' ? "" : Number(val)
    );
    
  }}
  placeholder="Enter amount"
/>
<Select
  size="small"
  value={choice.foodType || ""}
  onChange={(e) => handleChoiceChange(index, "foodType", e.target.value)}
  sx={{ width: 150 }}
  displayEmpty
>
  <MenuItem value="">Select Type</MenuItem>
  <MenuItem value="Veg">Veg</MenuItem>
  <MenuItem value="Non Veg">Non Veg</MenuItem>
  <MenuItem value="Egg">Egg</MenuItem>
</Select>



              {optionData.choices.length > 1 && (
                <IconButton color="error" onClick={() => removeChoice(index)}>
                  <MdDelete />
                </IconButton>
              )}
            </Box>
          ))}
            <Button
            startIcon={<MdAdd/>}
            variant="outlined"
            color="primary"
            size="small"
            fullWidth
            sx={{
             width:120,
              textTransform: 'none',
              mt: 1,
              py: 1,
              fontWeight: 500,
            }}
            onClick={addChoice}
          >
            Add Choice
          </Button>
         
          <Select
  size="small"
  value={optionData.priceType}
  onChange={(e) =>{
    
    setOptionData((prev) => ({
      ...prev,
      priceType: e.target.value as "base" | "adjustment",
    }))
  }}
  sx={{ width: "70%", borderRadius: 1 }}
>
  <MenuItem value="base" disabled={!!ruleErrorForBase}>
    Base Price 
  </MenuItem>

  <MenuItem value="adjustment" disabled={!!ruleErrorForAdj}>
    Adjustment Price
  </MenuItem>
</Select>


        
        </Box>
          </>
          ) :
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Choices & Pricing</Typography>
          {errors.choices && (
            <Typography sx={{ color: 'error.main', fontSize: 12 }}>{errors.choices}</Typography>
          )}

          {optionData.choices.map((choice, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                border: '2px solid',
                borderColor: choice.isDefault ? 'primary.main' : 'divider',
                borderRadius: 2,
                p: 2,
                position: 'relative',
                backgroundColor: choice.isDefault ? 'rgba(25, 118, 210, 0.06)' : 'transparent',
                transition: 'all 0.25s ease',
              }}
            >
              {choice.isDefault && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -9,
                    left: 14,
                    bgcolor: 'primary.main',
                    color: 'white',
                    px: 1,
                    py: 0.2,
                    borderRadius: 1,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: 0.3,
                  }}
                >
                  DEFAULT
                </Box>
              )}
              {optionData.required && (
              <Tooltip title="Mark as default selection">
                <Checkbox
                  color="primary"
                  checked={choice.isDefault}
                  onChange={(e) => {
                    const checked = e.target.checked;
                      if (errors.choices) {
    setErrors(prev => ({ ...prev, choices: "" }));
  }

                    if (!choice.name.trim()) {
                      setErrors((prev) => ({
                        ...prev,
                        choices: 'You cannot set an empty choice as default.',
                      }));
                      return;
                    }

                    if (optionData.type === 'radio' && checked) {
                      // Only one default allowed — uncheck others
                      const updatedChoices = optionData.choices.map((c, i) => ({
                        ...c,
                        isDefault: i === index,
                      }));
                      setOptionData((prev) => ({ ...prev, choices: updatedChoices }));
                    } else {
                      // Multiple defaults allowed
                      handleChoiceChange(index, 'isDefault', checked);
                    }

                    if (errors.choices) {
                      setErrors((prev) => ({ ...prev, choices: '' }));
                    }
                  }}
                />
              </Tooltip>
              )}
              <TextField
                label="Choice Name"
                size="small"
                fullWidth
                placeholder="e.g. Vanilla, Chocolate"
                value={choice.name}
                onChange={(e) => handleChoiceChange(index, 'name', e.target.value)}
                //               error={!!errors.choices}
                // helperText={errors.choices || ""}
              />
             
              
                          <TextField
  label="Amount (₹)"
  size="small"
  sx={{ width: 180 }}
  type="number"
  value={
    choice.priceAdjustment === 0 && choice._id.startsWith('temp_')
      ? ''
      : choice.priceAdjustment.toString()
  }
  onChange={(e) => {
    const val = e.target.value;
    

    handleChoiceChange(
      index,
      'priceAdjustment',
      val === '' ? "" : Number(val)
    );
      if (errors.choices) {
    setErrors(prev => ({ ...prev, choices: "" }));
  }
  }}
  placeholder="Enter amount"
/>


              {optionData.choices.length > 1 && (
                <IconButton color="error" onClick={() => removeChoice(index)}>
                  <MdDelete />
                </IconButton>
              )}
            </Box>
          ))}
          <Button
            startIcon={<MdAdd/>}
            variant="outlined"
            color="primary"
            size="small"
            fullWidth
            sx={{
             width:120,
              textTransform: 'none',
              mt: 1,
              py: 1,
              fontWeight: 500,
            }}
            onClick={addChoice}
          >
            Add Choice
          </Button>

        
          <Select
  size="small"
  value={optionData.priceType}
  onChange={(e) =>
    setOptionData((prev) => ({
      ...prev,
      priceType: e.target.value as "base" | "adjustment",
    }))
  }
  sx={{ width: "70%", borderRadius: 1 }}
>
  <MenuItem value="base" disabled={!!ruleErrorForBase}>
    Base Price 
  </MenuItem>

  <MenuItem value="adjustment" disabled={!!ruleErrorForAdj}>
    Adjustment Price
  </MenuItem>
</Select>


       
        </Box>
}
      </DialogContent>

      <Divider />

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          position: 'sticky',
          bottom: 0,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdate}
          disabled={isUpdating}
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none',
            px: 3,
          }}
        >
          {isUpdating ? <CircularProgress size={20} color="inherit" /> : 'Update Option'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCustomizationOptionModal;
