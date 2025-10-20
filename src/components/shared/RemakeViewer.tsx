import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

interface ViewRemakeDialogProps {
  remake: string;
  open: boolean;
  onClose: () => void;
}

const ViewRemakeDialog: React.FC<ViewRemakeDialogProps> = ({ remake, open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>View Remake</DialogTitle>
      <DialogContent>
        <Typography variant="body1">{remake}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewRemakeDialog;
