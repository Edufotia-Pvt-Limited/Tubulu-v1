import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  IconButton,
} from "@mui/material";
// import { CustomizationPayload } from "src/pages/dashboard/customization";
import { CloseIcon } from "src/components/tubulu-otp-verification";
import { CustomizationPayload } from "src/types/customization";

interface EditCustomizationModalProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (payload: CustomizationPayload) => Promise<void>;
  isUpdating: boolean;
  customization: CustomizationPayload | null;
}

const EditCustomizationModal: React.FC<EditCustomizationModalProps> = ({
  open,
  onClose,
  onUpdate,
  isUpdating,
  customization,
}) => {
  const [customizationName, setCustomizationName] = useState<string>("");

  // useEffect(() => {
  //   if (customization) {
  //     setCustomizationName(customization.customizationName);
  //   } else {
  //     setCustomizationName("");
  //   }
  // }, [customization]);
    useEffect(() => {
    if (customization && open) {
      setCustomizationName(customization.customizationName || "");
    } else if (open) {
      setCustomizationName(""); // reset when creating new
    }
  }, [customization, open]);

  const handleUpdate = () => {
    if (!customization) return;
    const updatedPayload: CustomizationPayload= {
      ...customization,
      customizationName,
      updatedAt: new Date().toISOString(),
    };
    onUpdate(updatedPayload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Edit Customization
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Customization Name"
          fullWidth
          margin="normal"
          value={customizationName}
          onChange={(e) => setCustomizationName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isUpdating} style={{ background: '#FF5630', color:'#FFF'}}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdate}
          disabled={isUpdating || !customizationName.trim()}
        >
          {isUpdating ? <CircularProgress size={20} /> : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCustomizationModal;
