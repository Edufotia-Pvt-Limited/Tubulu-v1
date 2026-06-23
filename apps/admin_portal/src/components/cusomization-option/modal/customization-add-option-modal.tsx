
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
  category: string | null;
}

interface Option {
  name: string;
  price: string;
  foodType?:string;
  isDefault?: boolean;
}

const CustomizationAddOptionModal: React.FC<CustomizationModalProps> = ({
  modalOpen,
  setModalOpen,
  onSave,
  isSaving,
  category
}) => {
  const [selected, setSelected] = useState<"checkbox" | "radio">("radio");
  const [priceType, setPriceType] = useState<"base" | "adjustment">("adjustment");
  const [optionLabel, setOptionLabel] = useState<string>("");
  const [required, setRequired] = useState<boolean>(false);
  const [options, setOptions] = useState<Option[]>([{ name: "", price: "" , foodType:""}]);

  const [errors, setErrors] = useState({
  optionLabel: "",
  choices: "",
  priceType: "",
});
  const [apiError, setApiError] = useState<string>("");

  useEffect(() => {
  const baseError = getRuleError(selected, required, "base");

  // If BASE is now invalid → force ADJUSTMENT
  if (priceType === "base" && baseError) {
    setPriceType("adjustment");
  }
}, [selected, required]);

  const resetForm = () => {
    setOptionLabel("");
    setOptions([{ name: "", price: "", foodType:"" }]);
    setSelected("radio");
    setRequired(true);
    setErrors({ optionLabel: "", choices: "", priceType: "" });
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


const validateForm = (): boolean => {
  let valid = true;
  const newErrors = { optionLabel: "", choices: "", priceType: "" };

  // Option name validation
  if (!optionLabel.trim()) {
    newErrors.optionLabel = "Option Name is required";
    valid = false;
  }

  // Choices validation
  const validChoices = options.filter((opt) => opt.name.trim() !== "");
  if (validChoices.length === 0) {
    newErrors.choices = "At least one choice is required.";
    valid = false;
  } else if (validChoices.some((opt) => opt.price.trim() === "")) {
    newErrors.choices = "Each choice must have a valid price.";
    valid = false;
  }

  // Price Type validation
  if (!priceType) {
    newErrors.priceType = "Please select a price type.";
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
  newErrors.choices = "can have at most 1 default.";
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
  
   
  // 🧠 Duplicate check only when editing the 'name' field
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
        // clear any previous error if resolved
        setErrors((prev) => ({ ...prev, choices: "" }));
      }
    }
  }

  setOptions(newOptions);
};


  const addOption = () => {
    const lastOption = options[options.length - 1];
    if (!lastOption.name.trim()) {
      setErrors((prev) => ({
        ...prev,
        choices: "Please fill the current choice before adding another.",
      }));
      return;
    }
    setOptions([...options, { name: "", price: "", foodType:"" }]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, idx) => idx !== index));
  };

  const handleDefaultChange = (idx: number, checked: boolean) => {
    if (selected === "radio") {
      const updated = options.map((opt, i) => ({
        ...opt,
        isDefault: i === idx ? checked : false,
      }));
      setOptions(updated);
    } else {
      const updated = [...options];
      updated[idx].isDefault = checked;
      setOptions(updated);
    }
  };

const ruleErrorForBase = getRuleError(selected, required, "base");
const ruleErrorForAdj = getRuleError(selected, required, "adjustment");
const ruleErrorForRadio = getRuleError("radio", required, priceType);
const ruleErrorForCheckbox = getRuleError("checkbox", required, priceType);




const handleSaveClick = async () => {
  if (!validateForm()) return;

  const hasAtLeastOneChoice = options.some((opt) => opt.name.trim() !== "");
  if (!hasAtLeastOneChoice) {
    setErrors((prev) => ({ ...prev, choices: "At least one choice is required" }));
    return;
  }

  const payload = {
    name: optionLabel.trim(),
    type: selected,
    required,
    priceType,
    choices: options
      .filter((opt) => opt.name.trim() !== "")
      .map((opt) => ({
        name: opt.name.trim(),
        priceAdjustment: Number(opt.price) || 0,
foodType: opt.foodType?.trim() ? opt.foodType : null,
        isDefault: !!opt.isDefault,
      })),
  };


  try {
    console.log("Saving payload:", payload);
    await onSave(payload);
    resetForm();
  } catch (err: any) {
    console.error("Upload Error:", err);
    let backendMessage = "Failed to save option";

    try {
      if (err.response?.data) {
        const data =
          typeof err.response.data === "string"
            ? JSON.parse(err.response.data)
            : err.response.data;

        if (Array.isArray(data.errors)) {
          //
          backendMessage = data.errors
            .map((e: any) => e.message || e)
            .join(", ");
        } else if (typeof data.errors === "string") {
          backendMessage = data.errors;
        } else if (data.message) {
          backendMessage = data.message;
        }
      } else if (err.message) {
        backendMessage = err.message;
      }
    } catch (parseError) {
      console.error("Error parsing backend error:", parseError);
    }

    console.error("Backend Message:", backendMessage);
    setApiError(backendMessage);
  }
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
        New Option
        <IconButton aria-label="close" onClick={resetForm} sx={{ color: "grey.600" }}>
          <MdClose size={22} />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
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
            error={!!errors.optionLabel || !!apiError}
            helperText={errors.optionLabel || apiError}
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
      // When required = false → remove all default selections
      setOptions((prev) =>
        prev.map((opt) => ({
          ...opt,
          isDefault: false,
        }))
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
   setSelected(e.target.value as "checkbox" | "radio")}}
  sx={{ width: "70%", borderRadius: 1 }}
>
  <MenuItem value="radio" disabled={!!ruleErrorForRadio}>
    Single Select (User can select only one)
  </MenuItem>

  <MenuItem value="checkbox" disabled={!!ruleErrorForCheckbox}>
    Multiple Select (User can select many)
  </MenuItem>
</Select>


        {/* Choices */}
        {
          category === "Food and beverage" ? (
          <>
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
    fullWidth
    sx={{ 
       textTransform: 'none', mt: 1, py: 1, fontWeight: 500,
       width:120
        }}
    onClick={addOption}
  >
    Add Choice
  </Button>

  {/* Price Type Selection */}
  
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
  <MenuItem value="base" disabled={!!ruleErrorForBase}>
    Base Price
  </MenuItem>

  <MenuItem value="adjustment" disabled={!!ruleErrorForAdj}>
    Adjustment Price
  </MenuItem>
</Select>

  {/* Add Button */}
 
</Box>
        </>
        ):
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
              <Tooltip title="Check this to make this choice the default selection" 
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
    fullWidth
    sx={{ 
       textTransform: 'none', mt: 1, py: 1, fontWeight: 500,
       width:120
        }}
    onClick={addOption}
  >
    Add Choice
  </Button>
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
  <MenuItem value="base" disabled={!!ruleErrorForBase}>
    Base Price
  </MenuItem>

  <MenuItem value="adjustment" disabled={!!ruleErrorForAdj}>
    Adjustment Price
  </MenuItem>
</Select>


          {/* Add Button */}
          
        </Box>
        }

        {/* Price Type */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {errors.priceType && (
  <Typography sx={{ color: "error.main", fontSize: 12 }}>
    {errors.priceType}
  </Typography>
)}
        
      

        </Box>
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
          {isSaving ? <CircularProgress size={20} color="inherit" /> : "+ Add Option"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomizationAddOptionModal;
