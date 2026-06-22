import React from 'react'
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
import { display } from "@mui/system";

interface DeleteConfirmationModalProps  {
 open: boolean;
  deleteHeaderMessage: string;
  alert?: string;
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
}
const DeleteConfirmationModal:React.FC<DeleteConfirmationModalProps> = ({
    open,
    deleteHeaderMessage,
    alert,
    message,
    onCancel,
    onConfirm
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
        {deleteHeaderMessage}
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
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteConfirmationModal