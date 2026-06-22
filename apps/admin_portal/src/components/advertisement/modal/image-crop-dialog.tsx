import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slider,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { MdClose } from "react-icons/md";

interface ImageCropDialogProps {
  open: boolean;
  imageFile: File | null;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
}

const FRAME_WIDTH = 525;
const FRAME_HEIGHT = 182; // 525 * (130 / 375) = 182

export const ImageCropDialog: React.FC<ImageCropDialogProps> = ({
  open,
  imageFile,
  onClose,
  onCropComplete,
}) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageDims, setImageDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [naturalDims, setNaturalDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const imageRef = useRef<HTMLImageElement | null>(null);
  const isDragging = useRef<boolean>(false);
  const startDrag = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      setZoom(1);
      setPosition({ x: 0, y: 0 });

      // Clean up previous URL
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setImageUrl("");
    }
  }, [imageFile]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;
    setNaturalDims({ width: naturalW, height: naturalH });

    const imgRatio = naturalW / naturalH;
    const frameRatio = FRAME_WIDTH / FRAME_HEIGHT;

    let initialW = FRAME_WIDTH;
    let initialH = FRAME_HEIGHT;

    if (imgRatio > frameRatio) {
      initialH = FRAME_HEIGHT;
      initialW = FRAME_HEIGHT * imgRatio;
    } else {
      initialW = FRAME_WIDTH;
      initialH = FRAME_WIDTH / imgRatio;
    }

    setImageDims({ width: initialW, height: initialH });
    // Center the image initially
    setPosition({
      x: (FRAME_WIDTH - initialW) / 2,
      y: (FRAME_HEIGHT - initialH) / 2,
    });
  };

  const getBounds = (currentZoom: number) => {
    const w = imageDims.width * currentZoom;
    const h = imageDims.height * currentZoom;
    return {
      minX: FRAME_WIDTH - w,
      maxX: 0,
      minY: FRAME_HEIGHT - h,
      maxY: 0,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    startDrag.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const nextX = e.clientX - startDrag.current.x;
    const nextY = e.clientY - startDrag.current.y;

    const bounds = getBounds(zoom);
    setPosition({
      x: Math.max(bounds.minX, Math.min(bounds.maxX, nextX)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, nextY)),
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleZoomChange = (event: Event, newValue: number | number[]) => {
    const nextZoom = newValue as number;
    const bounds = getBounds(nextZoom);

    // Adjust position to stay within bounds under new zoom
    setPosition((prev) => ({
      x: Math.max(bounds.minX, Math.min(bounds.maxX, prev.x)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, prev.y)),
    }));
    setZoom(nextZoom);
  };

  const handleCrop = () => {
    if (!imageRef.current || !imageFile) return;

    const img = imageRef.current;
    const scale = (imageDims.width * zoom) / naturalDims.width;

    const cropX = -position.x / scale;
    const cropY = -position.y / scale;
    const cropW = FRAME_WIDTH / scale;
    const cropH = FRAME_HEIGHT / scale;

    const canvas = document.createElement("canvas");
    canvas.width = cropW;
    canvas.height = cropH;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    }

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const croppedFile = new File([blob], imageFile.name, {
            type: imageFile.type || "image/jpeg",
          });
          onCropComplete(croppedFile);
        }
      },
      imageFile.type || "image/jpeg",
      0.95
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Crop Advertisement Banner
        <IconButton onClick={onClose}>
          <MdClose size={22} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, p: 3 }}>
        <Typography variant="body2" color="textSecondary" sx={{ textAlign: "center" }}>
          Drag the image to position it and use the slider to zoom. The box indicates the cropped region.
        </Typography>

        {/* Cropping Window */}
        <Box
          sx={{
            width: FRAME_WIDTH,
            height: FRAME_HEIGHT,
            overflow: "hidden",
            position: "relative",
            border: "2px solid",
            borderColor: "primary.main",
            borderRadius: 1,
            cursor: "move",
            backgroundColor: "#212121",
            userSelect: "none",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {imageUrl && (
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Crop Workspace"
              onLoad={handleImageLoad}
              style={{
                width: imageDims.width * zoom,
                height: imageDims.height * zoom,
                position: "absolute",
                left: position.x,
                top: position.y,
                pointerEvents: "none",
              }}
            />
          )}
        </Box>

        {/* Zoom Slider */}
        <Box sx={{ width: "80%", display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Zoom
          </Typography>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.01}
            onChange={handleZoomChange}
            valueLabelDisplay="auto"
            valueLabelFormat={(val) => `${Math.round(val * 100)}%`}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button onClick={handleCrop} variant="contained" color="primary">
          Apply Crop
        </Button>
      </DialogActions>
    </Dialog>
  );
};
