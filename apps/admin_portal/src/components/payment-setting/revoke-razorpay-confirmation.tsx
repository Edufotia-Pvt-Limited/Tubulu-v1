import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import { MdClose } from "react-icons/md";

interface DeleteConfirmationDialogProps {
  open: boolean;
  ProceedHeaderMessage: string;
  alert?: string;
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const RevokeRazorpayConfirmation: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  ProceedHeaderMessage,
  alert,
  message,
  onCancel,
  onConfirm,
}) => {
  return (
    <Dialog  open={open} onClose={onCancel} fullWidth >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb:1,
          fontSize: {xs:13  ,sm:18},
          
        }}
      >
        {ProceedHeaderMessage}
        <IconButton
          aria-label="close"
          onClick={onCancel}
          sx={{ color: (theme) => theme.palette.grey[500] }}
        >
                  <MdClose />
        </IconButton>
      </DialogTitle>

      <DialogContent  sx={{ pt: 0 }}>
        <DialogContentText sx={{ mt: 0 , fontSize: {xs:12 ,sm:16},}}>
          {message} <br /> {alert}
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button
          style={{ background: "#FF5630", color: "#FFF" }}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          style={{ background: "#36F", color: "#FFF" }}
          onClick={onConfirm}
        >
          Proceed
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RevokeRazorpayConfirmation;
