

import { useEffect, useState } from "react";
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
} from "@mui/material";
import { MdAdd, MdClose, MdDelete } from "react-icons/md";

interface CustomizationModalProps {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  onSave: (payload: any) => Promise<void>;
  isSaving: boolean;
    category?: string | null; // <-- new prop

}

interface Option {
  name: string;
  price: string;
  foodType?:string;
  isDefault?:boolean;
}

const CustomizationModal: React.FC<CustomizationModalProps> = ({
  modalOpen,
  setModalOpen,
  onSave,
  isSaving,
  category
}) => {
  const [selected, setSelected] = useState<"checkbox" | "radio" >("radio");
  const [priceType, setPriceType] = useState<"base" | "adjustment">("adjustment");
  const [customizationName, setCustomizationName] = useState<string>("");
  const [optionLabel, setOptionLabel] = useState<string>("");
  const [required, setRequired] = useState<boolean>(false);
  const [options, setOptions] = useState<Option[]>([{ name: "", price: "" , foodType:""}]);


  // Validation state
  const [errors, setErrors] = useState({
    customizationName: "",
    optionLabel: "",
    choices: "",
  });

  // API error from backend
  const [apiError, setApiError] = useState<string>("");

  useEffect(() => {
  const baseError = getRuleError(selected, required, "base");

  // If BASE is now invalid → force ADJUSTMENT
  if (priceType === "base" && baseError) {
    setPriceType("adjustment");
  }
}, [selected, required]);


  const resetForm = () => {
    setCustomizationName("");
    setOptionLabel("");
    setOptions([{ name: "", price: "" , foodType: ""}]);
    setSelected("radio");
    setRequired(true);
    setErrors({ customizationName: "", optionLabel: "", choices: "" });
    setApiError("");
    setModalOpen(false);
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
  if (isMS && isAdj && required) return null; // allowed
  if (isMS && isAdj && !required) return null; // allowed

  return null;
};


  // --- Validation ---
const validateForm = (): boolean => {
  let valid = true;
  const newErrors = { customizationName: "", optionLabel: "", choices: "" };

  // ---- Existing checks ----
  if (!customizationName.trim()) {
    newErrors.customizationName = "Customization Name is required";
    valid = false;
  }

  if (!optionLabel.trim()) {
    newErrors.optionLabel = "Option Name is required";
    valid = false;
  }

  const hasAtLeastOneChoice = options.some((opt) => opt.name.trim() !== "");
  if (!hasAtLeastOneChoice) {
    newErrors.choices = "At least one choice is required";
    valid = false;
  }

  if (required) {
    const hasDefault = options.some((opt) => opt.isDefault);
    if (!hasDefault) {
      newErrors.choices = "At least one default choice is required.";
      valid = false;
    }
  }

  if (selected === "radio" && priceType === "base") {
  const hasZero = options.some(
    (opt) => Number(opt.price) === 0
  );

  if (hasZero) {
    newErrors.choices = "Base Price (Single Select) cannot have choices priced at 0.";
    valid = false;
  }
}

const isSS = selected === "radio";
const isMS = selected === "checkbox";
const isBase = priceType === "base";
const isAdj = priceType === "adjustment";
const defaults = options.filter(o => o.isDefault).length;

// SS REQUIRED → exactly 1
if (isSS && required && defaults !== 1) {
  newErrors.choices = "must have exactly 1 default.";
  valid = false;
}

// SS NOT REQUIRED → max 1
if (isSS && !required && defaults > 1) {
  newErrors.choices = " can have at most 1 default.";
  valid = false;
}

// MS REQUIRED + ADJUSTMENT → at least 1
if (isMS && isAdj && required && defaults < 1) {
  newErrors.choices = "must have at least 1 default.";
  valid = false;
}


  setErrors(newErrors);
  return valid;
};


  // --- Handlers for real-time error clearing ---
  const handleCustomizationNameChange = (value: string) => {
    setCustomizationName(value);
    if (value.trim() !== "" && errors.customizationName) {
      setErrors((prev) => ({ ...prev, customizationName: "" }));
    }
    if (apiError) setApiError(""); 
  };

  const handleOptionLabelChange = (value: string) => {
    setOptionLabel(value);
    if (value.trim() !== "" && errors.optionLabel) {
      setErrors((prev) => ({ ...prev, optionLabel: "" }));
    }
  };

  const handleChoiceChange = <K extends keyof Option>(
  index: number,
  key: K,
  value: Option[K]
) => {
  const newOptions = [...options];
  newOptions[index] = { ...newOptions[index], [key]: value } as Option;

 


  if (key === "name" && typeof value === "string") {
    const trimmedName = value.trim().toLowerCase();

    if (trimmedName) {
      const duplicate = newOptions.some(
        (opt, i) => i !== index && opt.name.trim().toLowerCase() === trimmedName
      );

      if (duplicate) {
        setErrors((prev) => ({
          ...prev,
          choices: "Duplicate choice name found. Please enter a unique name.",
        }));
        
        return;
      } else if (errors.choices) {
        setErrors((prev) => ({ ...prev, choices: "" }));
      }
    }
    
  }

  setOptions(newOptions);
};


  // --- Save Handler ---
  const handleSaveClick = async () => {
    if (!validateForm()) return;

    const payload = {
      customizationName: customizationName.trim(),
      options: [
        {
          name: optionLabel.trim() || "Option",
          type: selected,
          required,
          priceType,
          choices: options
            .filter((opt) => opt.name.trim() !== "")
            .map((opt) => ({
              name: opt.name.trim(),
              priceAdjustment: Number(opt.price) || 0,
              foodType: opt?.foodType || null,   // 👈 ADD THIS
               isDefault: !!opt.isDefault,
            })),
            

        },
      ],
      isActive: true,
    };

    try {
      console.log("this is the payload",payload)
      await onSave(payload); 
      resetForm(); 
    } catch (err) {
      let backendMessage = "Failed to save customization";

      if (err.response?.data) {
        try {
          const data =
            typeof err.response.data === "string"
              ? JSON.parse(err.response.data)
              : err.response.data;

          backendMessage = data.errors || data.message || backendMessage;
        } catch (parseError) {
          console.log("Failed to parse backend error:", parseError);
        }
      } else {
        backendMessage = err.message;
      }

      console.log("Backend Error:", backendMessage);
      setApiError(backendMessage); 
    }
  };

const ruleErrorForBase = getRuleError(selected, required, "base");
const ruleErrorForAdj = getRuleError(selected, required, "adjustment");
const ruleErrorForRadio = getRuleError("radio", required, priceType);
const ruleErrorForCheckbox = getRuleError("checkbox", required, priceType);



  
   const removeOption = (index: number) =>
    setOptions(options.filter((_, idx) => idx !== index));
  const addOption = () => {
  const lastOption = options[options.length - 1];

  if (!lastOption.name.trim()) {
    setErrors((prev) => ({
      ...prev,
      choices: "Please fill the current choice before adding another.",
    }));
    return;
  }

  setOptions([...options, { name: "", price: "" }]);
};

 
  return (
    <Dialog
      open={modalOpen}
      onClose={resetForm}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflowY: "auto", maxHeight: "95vh", p: 1 } }}
    >
      <DialogTitle
        sx={{
          position: "sticky",
          top: 0,
          bgcolor: "background.paper",
          zIndex: 1,
          fontWeight: 700,
          fontSize: 18,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          py: 2,
        }}
      >
        New Customization
        <IconButton aria-label="close" onClick={resetForm} sx={{ color: "grey.600" }}>
          <MdClose size={22} />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Customization Name */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: 14 }}>
            Customization Name
          </Typography>
           
          
          <TextField
            placeholder="Enter customization name"
            fullWidth
            variant="outlined"
            size="small"
            value={customizationName}
            onChange={(e) => handleCustomizationNameChange(e.target.value)}
            error={!!errors.customizationName || !!apiError}
            helperText={errors.customizationName || apiError}
                  FormHelperTextProps={{ sx: { m: 0, minHeight: '1em' } }}

          />
        </Box>

        {/* Option Name */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: 14 }}>
            Option Name
          </Typography>
         <TextField
  placeholder="e.g. Size"
  fullWidth
  variant="outlined"
  size="small"
  value={optionLabel}
  onChange={(e) => handleOptionLabelChange(e.target.value)}
  error={!!errors.optionLabel }
  helperText={errors.optionLabel }
        FormHelperTextProps={{ sx: { m: 0, minHeight: '1em' } }}

/>
          <FormControlLabel
            sx={{ mt: -0.5 }}
            control={
           <Checkbox
  checked={required}
  onChange={(e) => {
    const checked = e.target.checked;
    setRequired(checked);
       if (errors.choices) {
    setErrors(prev => ({ ...prev, choices: "" }));
  }

    if (!checked) {
      // When "Required" is turned off, clear all defaults
      setOptions((prev) =>
        prev.map((opt) => ({ ...opt, isDefault: false }))
      );
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
                <Box component="span" sx={{ color: "text.secondary", ml: 0.5 }}>
                  (Customer must make a selection)
                </Box>
              </Typography>
            }
          />
        </Box>

        {/* Option Type */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Option Type</Typography>
          <Select
            size="small"
            value={selected}
            onChange={(e) =>{
             if (errors.choices) {
    setErrors(prev => ({ ...prev, choices: "" }));
  }
    setOptions((prev) =>
        prev.map((opt) => ({ ...opt, isDefault: false }))
      );
              setSelected(e.target.value as "checkbox" | "radio" )
              
            }}
            sx={{ width: "70%", borderRadius: 1 }}
          >
            <MenuItem value="radio"  disabled={!!ruleErrorForRadio}>Single Select (User can select only one)</MenuItem>
            <MenuItem value="checkbox"  disabled={!!ruleErrorForCheckbox}>Multiple Select (User can select many)</MenuItem>
          </Select>
        </Box>
{
  category === 'Food and beverage' ? (
  <>
        {/* Choices & Pricing */}
       
         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

  {/* Choices & Pricing Title */}
  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Choices & Pricing</Typography>

  {errors.choices && (
    <Typography sx={{ color: 'error.main', fontSize: 12 }}>
      {errors.choices}
    </Typography>
  )}

  {options.map((opt, idx) => (
    <Box
      key={idx}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        border: '2px solid',
        borderColor: opt.isDefault ? 'primary.main' : 'divider',
        borderRadius: 2,
        p: 2,
        position: 'relative',
        backgroundColor: opt.isDefault ? 'rgba(25,118,210,0.06)' : 'transparent',
        transition: 'all 0.25s ease',
      }}
    >
      {/* DEFAULT tag */}
      {opt.isDefault && (
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

      {/* Default Selector Checkbox */}
      {required && (
        <Tooltip
          title="Check this to make this choice the default selection"
          arrow
          placement="top"
        >
          <Checkbox
            color="primary"
             sx={{ ml: -1.5 }}
            checked={opt.isDefault || false}
            onChange={(e) => {
              const checked = e.target.checked;
              let updated = [...options];

              if (!opt.name.trim()) {
                setErrors((prev) => ({
                  ...prev,
                  choices: 'You cannot set an empty choice as default.',
                }));
                return;
              }

              if (selected === 'radio') {
                updated = updated.map((o, i) => ({
                  ...o,
                  isDefault: i === idx ? checked : false,
                }));
              } else {
                updated[idx].isDefault = checked;
              }
              setOptions(updated);
              
                if (errors.choices) {
    setErrors(prev => ({ ...prev, choices: "" }));
  }
            }}
          />
        </Tooltip>
      )}

      {/* Choice Name */}
      <TextField
        label="Choice Name"
        size="small"
        sx={{width: 180, ml: -1.5 }}
        placeholder="e.g. Red, Blue"
        value={opt.name}
        onChange={(e) => handleChoiceChange(idx, 'name', e.target.value)}
      />

      {/* Amount */}
      <TextField
        label="Amount (₹)"
        size="small"
        type="number"
        value={opt.price}
        onChange={(e) =>{ handleChoiceChange(idx, 'price', e.target.value)
          if (errors.choices) {
        setErrors((prev) => ({ ...prev, choices: "" }));
      }
        }}
        sx={{ width: 100 }}
      />

      {/* Food Preference */}
   <Select
  size="small"
  value={opt.foodType || ""}
  onChange={(e) => handleChoiceChange(idx, "foodType", e.target.value)}
  sx={{ width: 150 }}
  displayEmpty
>
  <MenuItem value="">Select Type</MenuItem>
  <MenuItem value="Veg">Veg</MenuItem>
  <MenuItem value="Non Veg">Non Veg</MenuItem>
  <MenuItem value="Egg">Egg</MenuItem>
</Select>

      {/* Delete Button */}
      {options.length > 1 && (
        <IconButton color="error" onClick={() => removeOption(idx)}>
          <MdDelete />
        </IconButton>
      )}
    </Box>
  ))}
<Button
    startIcon={<MdAdd />}
    variant="outlined"
    color="primary"
    size="small"
    
    sx={{
      //  textTransform: 'none', mt: 1, py: 1, fontWeight: 500, 
       width:120 }}
    onClick={addOption}
  >
    Add Choice
  </Button>

  {/* Price Type Selection */}
   <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Price Type</Typography>
          <Select
  size="small"
  value={priceType}
  onChange={(e) => {setPriceType(e.target.value as "base" | "adjustment")
    if (errors.choices) {
        setErrors((prev) => ({ ...prev, choices: "" }));
      }
  }}
  sx={{ width: "70%", borderRadius: 1 }}
>
  <MenuItem value="base" disabled={!!ruleErrorForBase}>Base Price</MenuItem>
  <MenuItem value="adjustment" disabled={!!ruleErrorForAdj}>Adjustment Price</MenuItem>
</Select>
        </Box>
  
</Box>
  </>
  ) :
   <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Choices & Pricing</Typography>
          {errors.choices && (
            <Typography sx={{ color: "error.main", fontSize: 12 }}>{errors.choices}</Typography>
          )}
          {options.map((opt, idx) => (
          
            <Box
  key={idx}
  sx={{
    display: "flex",
    alignItems: "center",
    gap: 2,
    border: "2px solid",
    borderColor: opt.isDefault ? "primary.main" : "divider",
    borderRadius: 2,
    p: 2,
    position: "relative",
    backgroundColor: opt.isDefault ? "rgba(25, 118, 210, 0.06)" : "transparent",
    transition: "all 0.25s ease",
  }}
>
  {opt.isDefault && (
    <Box
      sx={{
        position: "absolute",
        top: -9,
        left: 14,
        bgcolor: "primary.main",
        color: "white",
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
    {required && (
  <Tooltip
    title="Check this to make this choice the default selection"
    arrow
    placement="top"
    enterDelay={200}
    leaveDelay={200}
  >
    <Checkbox
      color="primary"
      checked={opt.isDefault || false}
      onChange={(e) => {
        const checked = e.target.checked;
        let updated = [...options];

        if (!opt.name.trim()) {
          setErrors((prev) => ({
            ...prev,
            choices: "You cannot set an empty choice as default.",
          }));
          return;
        }

        if (selected === "radio") {
          // Only one can be default
          updated = updated.map((o, i) => ({
            ...o,
            isDefault: i === idx ? checked : false,
          }));
        } else {
          // Multiple defaults allowed for checkbox
          updated[idx].isDefault = checked;
        }

        setOptions(updated);
          if (errors.choices) {
    setErrors(prev => ({ ...prev, choices: "" }));
  }
      }}
    />
  </Tooltip>
)}

              <TextField
                label="Choice Name"
                size="small"
                fullWidth
                placeholder="e.g. Red, Blue"
                value={opt.name}
                onChange={(e) => handleChoiceChange(idx, "name", e.target.value)}
              />
              <TextField
                label="Amount (₹)"
                size="small"
                sx={{ width: 180 }}
                type="number"
                value={opt.price}
                onChange={(e) =>{ handleChoiceChange(idx, "price", e.target.value)
                  if (errors.choices) {
        setErrors((prev) => ({ ...prev, choices: "" }));
      }
                }}
              />
         


              
              
              {options.length > 1 && (
                <IconButton color="error" onClick={() => removeOption(idx)}>
                  <MdDelete />
                </IconButton>
              )}
            </Box>
          ))}
           <Button
    startIcon={<MdAdd />}
    variant="outlined"
    color="primary"
    size="small"
    
    sx={{
      //  textTransform: 'none', mt: 1, py: 1, fontWeight: 500, 
       width:120 }}
    onClick={addOption}
  >
    Add Choice
  </Button>
           <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Price Type</Typography>
          <Select
  size="small"
  value={priceType}
  onChange={(e) =>{ setPriceType(e.target.value as "base" | "adjustment")
    if (errors.choices) {
        setErrors((prev) => ({ ...prev, choices: "" }));
      }
  }}
  sx={{ width: "70%", borderRadius: 1 }}
>
  <MenuItem value="base" disabled={!!ruleErrorForBase}>Base Price</MenuItem>
  <MenuItem value="adjustment" disabled={!!ruleErrorForAdj}>Adjustment Price</MenuItem>
</Select>
        </Box>
        
        
        </Box>
}

       
        
      </DialogContent>

      <Divider />

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          position: "sticky",
          bottom: 0,
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveClick}
          disabled={isSaving}
          sx={{ borderRadius: 2, fontWeight: 600, textTransform: "none", px: 3, py: 1 }}
        >
          {isSaving ? <CircularProgress size={20} color="inherit" /> : "+ Add Customization"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomizationModal;







