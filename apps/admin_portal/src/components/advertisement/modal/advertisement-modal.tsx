import React, { useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Button,
  CircularProgress,
  DialogActions,
} from "@mui/material";
import { MdClose } from "react-icons/md";
import { AxiosError } from "axios";
import { ImageCropDialog } from "./image-crop-dialog";



export interface AdvertisementPayload {
  name: string;
  description: string;
  image?: File | null;
  targetCity?: string;
  targetState?: string;
  latitude?: string;
  longitude?: string;
  radius?: string;
}

interface AdvertisementModalProps {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  onSave?: (payload: AdvertisementPayload) => Promise<void>;
  isSaving: boolean;
}
interface FormErrors {
  name?: string;
  description?: string;
  image?: string;
}
interface AdvertisementApiError {
  statusCode: number;
  message: string;
  errors?: string | { message: string }[];  // Updated: Allow errors to be a string or an array
}

// Required ratio for mobile UI
const REQUIRED_RATIO = 375 / 130;
const RATIO_TOLERANCE = 0.05;

const AdvertisementModal: React.FC<AdvertisementModalProps> = ({
  modalOpen,
  setModalOpen,
  onSave,
  isSaving,
}) => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [rawImage, setRawImage] = useState<File | null>(null);
  const [cropOpen, setCropOpen] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string>("");
  

 
  const REQUIRED_RATIO = 375 / 130;
const RATIO_TOLERANCE = 0.5; 
const MAX_FILE_SIZE_MB = 5;




const validateAspectRatio = (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const ratio = Math.round((width / height) * 100) / 100;
      const diff = Math.abs(ratio - REQUIRED_RATIO);

      if (diff > RATIO_TOLERANCE) {
        resolve(
          `Image must match aspect ratio 375:130. Current dimensions: ${width}×${height}`
        );
      } else {
        resolve(null);
      }
    };
    img.onerror = () => resolve("Invalid image file");
    img.src = URL.createObjectURL(file);
  });
};



  const validate = async (): Promise<boolean> => {
    const newErrors: FormErrors = {};

    if (!name.trim()) newErrors.name = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

    const resetForm = () => {
    setName("");
    setDescription("");
    setImage(null);
    setRawImage(null);
    setCropOpen(false);
    setErrors({});
    setModalOpen(false);
    setApiError("");

  };

  


  const handleSave = async () => {
  const isValid = await validate();
  if (!isValid) return;

  const payload: AdvertisementPayload = { 
    name, 
    description, 
    image
  };

  try {
    setErrors({});  // Clear previous field errors
    setApiError("");  // Clear previous API errors

    if (onSave) await onSave(payload);  // API call
    resetForm();  // Success: reset and close
  } catch (err) {
    console.error("Advertisement creation failed", err);  // Keep this for general logging

    let backendMessage = "Advertisement creation failed";  // Default fallback

    const axiosError = err as AxiosError<AdvertisementApiError>;

    if (axiosError.response?.data) {
      const data = axiosError.response.data;

      // Handle errors: could be a string or an array
      let extractedMessage = "";
      if (data.errors) {
        if (typeof data.errors === "string") {
          extractedMessage = data.errors;  // Direct string (e.g., "Deal with this name already exists")
        } else if (Array.isArray(data.errors) && data.errors.length > 0) {
          extractedMessage = data.errors[0].message;  // Array format (for future-proofing)
        }
      } else if (data.message) {
        extractedMessage = data.message;  // Fallback to general message
      }

      if (extractedMessage) {
        backendMessage = extractedMessage;
      }
    } else if (axiosError.message) {
      backendMessage = axiosError.message;  // Network or other error
    }

    // Check if the error is field-specific (e.g., related to "name")
    // You can expand this for other fields like "description" or "image" if needed
    const lowerMessage = backendMessage.toLowerCase();
    if (lowerMessage.includes("name")) {
      setErrors({ name: backendMessage });  // Show under the name field
    } else {
      setApiError(backendMessage);  // Show in the general error box
    }
  }
};






  return (
    <Dialog
      open={modalOpen}
      onClose={resetForm}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, overflowY: "auto", maxHeight: "95vh", p: 3 },
      }}
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
        New Advertisement
        <IconButton aria-label="close" onClick={resetForm} sx={{ color: "grey.600" }}>
          <MdClose size={22} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
        
        {apiError && (
          <Box sx={{ px: 3, mt: 2 }}>
            <Typography sx={{ color: "error.main", bgcolor: "error.lighter", p: 1.5, borderRadius: 1, fontSize: 13, border: "1px solid", borderColor: "error.light" }}>
              {apiError}
            </Typography>
          </Box>
        )}

        {/* Title */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: 14 }}>
            Advertisement Title
          </Typography>
          <TextField
            placeholder="Enter title"
            fullWidth
            variant="outlined"
            size="small"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            FormHelperTextProps={{ sx: { m: 0, minHeight: '1em' } }}
          />
      
        </Box>

        {/* Description */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: 14 }}>
            Advertisement Description
          </Typography>
          <TextField
            placeholder="Enter description"
            fullWidth
            variant="outlined"
            size="small"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
                  FormHelperTextProps={{ sx: { m: 0, minHeight: '1em' } }}

          />
        </Box>


        {/* Image Upload */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: 14 }}>
            Advertisement Banner Image 
            {/* (must be 375:130 ratio) */}
          </Typography>

          <Button variant="outlined" component="label" sx={{ width: "fit-content" }}>
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setErrors((prev) => ({ ...prev, image: "" }));
                if (file) {
                  // Check file size
                  if (file.size / 1024 / 1024 > MAX_FILE_SIZE_MB) {
                    setErrors((prev) => ({
                      ...prev,
                      image: `Image size too large. Max allowed size is ${MAX_FILE_SIZE_MB}MB. Current size: ${(
                        file.size / 1024 / 1024
                      ).toFixed(2)}MB`,
                    }));
                    return;
                  }
                  setRawImage(file);
                  setCropOpen(true);
                }
              }}

            />
          </Button>

          {image && (
            <Typography sx={{ fontSize: 13, color: "grey.700" }}>
              Selected: {image.name}
            </Typography>
          )}

          {errors.image && (
            <Typography sx={{ fontSize: 13, color: "error.main" }}>
              {errors.image}
            </Typography>
          )}
        </Box>
        <ImageCropDialog
          open={cropOpen}
          imageFile={rawImage}
          onClose={() => {
            setCropOpen(false);
            setRawImage(null);
          }}
          onCropComplete={(croppedFile) => {
            setImage(croppedFile);
            setCropOpen(false);
            setRawImage(null);
          }}
        />
      </DialogContent>

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
          onClick={handleSave}
          disabled={isSaving}
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            textTransform: "none",
            px: 3,
            py: 1,
          }}
        >
          {isSaving ? <CircularProgress size={20} color="inherit" /> : "+ Add Advertisement"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdvertisementModal;
