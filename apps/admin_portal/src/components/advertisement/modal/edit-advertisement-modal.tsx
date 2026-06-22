import React, { useEffect, useState } from "react";
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
import { Advertisement } from "src/pages/dashboard/advertisement";
import { AxiosError } from "axios";
import { ImageCropDialog } from "./image-crop-dialog";

interface EditAdvertisementModalProps {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  advertisement: Advertisement | null;
  onUpdate: (updated: Advertisement) => void;
  isSaving: boolean;
}

interface FormErrors {
  title?: string;
  description?: string;
  image?: string;
}

const EditAdvertisementModal: React.FC<EditAdvertisementModalProps> = ({
  modalOpen,
  setModalOpen,
  advertisement,
  onUpdate,
  isSaving,
}) => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [rawImage, setRawImage] = useState<File | null>(null);
  const [cropOpen, setCropOpen] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string>("");
  
  // Prefill modal
  useEffect(() => {
    if (advertisement) {
      setTitle(advertisement.name);
      setDescription(advertisement.description);
      setPreviewImage(advertisement.bannerUrl);
    }
  }, [advertisement]);


const MAX_FILE_SIZE_MB = 5;

  const validate = async () => {
    const newErrors: FormErrors = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSave = async () => {
  const isValid = await validate();
  if (!isValid) return;

  const updated: any = {
    ...advertisement,
    name: title,
    description,
    bannerUrl: image ? image : advertisement!.bannerUrl,
  };

  try {
    setErrors({});      // clear field errors
    setApiError("");    // clear API errors

    await onUpdate(updated); // API call
  } catch (err) {
    console.error("Advertisement update failed", err);

    let backendMessage = "Failed to update advertisement";

    const axiosError = err as AxiosError<{
      message?: string;
      errors?: string | { message: string }[];
    }>;

    if (axiosError.response?.data) {
      const data = axiosError.response.data;

      let extracted = "";

      // ==== Handle errors from backend ====
      if (data.errors) {
        if (typeof data.errors === "string") {
          extracted = data.errors;
        } else if (Array.isArray(data.errors) && data.errors.length > 0) {
          extracted = data.errors[0].message;
        }
      } else if (data.message) {
        extracted = data.message;
      }

      if (extracted) {
        backendMessage = extracted;
      }
    } else if (axiosError.message) {
      backendMessage = axiosError.message;
    }

    // ==== Field-level error detection ====
    const lowerMessage = backendMessage.toLowerCase();
    if (lowerMessage.includes("name")) {
      setErrors({ title: backendMessage });  // Show under the name field
    } else {
      setApiError(backendMessage);  // Show in the general error box
    }
  }
};

  const handleClose = () => {
    setImage(null);
    setRawImage(null);
    setCropOpen(false);
    setErrors({});
    setApiError("");
    setModalOpen(false);
  };

  return (
    <Dialog
      open={modalOpen}
      onClose={handleClose}
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
        Edit Advertisement
        <IconButton aria-label="close" onClick={handleClose} sx={{ color: "grey.600" }}>
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
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
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.5 }}>
           Advertisement Banner Image 
          </Typography>

          <Button variant="outlined" component="label" sx={{ mt: 1 }}>
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              
              onChange={(e) => {
                const fileInput = e.target as HTMLInputElement;
                const file = e.target.files?.[0] ?? null;
                setErrors((prev) => ({ ...prev, image: "" }));

                if (file) {
                  if (file.size / 1024 / 1024 > MAX_FILE_SIZE_MB) {
                    setErrors((prev) => ({
                      ...prev,
                      image: `Image size too large. Max allowed size is ${MAX_FILE_SIZE_MB}MB. Current size: ${(
                        file.size / 1024 / 1024
                      ).toFixed(2)}MB`,
                    }));
                    fileInput.value = "";
                    return;
                  }
                  setRawImage(file);
                  setCropOpen(true);
                  fileInput.value = "";
                }
              }}
            />
          </Button>

          {errors.image && (
            <Typography sx={{ color: "error.main", fontSize: 13, mt: 1 }}>
              {errors.image}
            </Typography>
          )}

          {previewImage && (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: 13, color: "grey.600", mb: 1 }}>
                Preview:
              </Typography>

              <img
                src={previewImage}
                alt="Preview"
                style={{
                  width: "100%",
                  height: 180,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
            </Box>
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
            setPreviewImage(URL.createObjectURL(croppedFile));
            setCropOpen(false);
            setRawImage(null);
          }}
        />
      </DialogContent>

      <DialogActions>
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
          {isSaving ? <CircularProgress size={20} /> : "Update Advertisement"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditAdvertisementModal;
