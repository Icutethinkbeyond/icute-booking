import React, { useState } from "react";
import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid2,
  IconButton,
  Typography,
} from "@mui/material";
import { Cancel, Close, Delete, RemoveCircle } from "@mui/icons-material";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { DocumentStatus } from "@prisma/client";
import { AlertOctagon, BookDown } from "lucide-react";
import {
  Additional,
  BrokenItems,
  Part,
  Repairman,
} from "@/interfaces/Maintenance";

interface ConfirmRemoveProps {
  massage?: string; // Name of the item to be deleted
  onDelete: (value: any, subvalue?: any) => void; // Callback for deletion action
  itemId: string | null | BrokenItems | Repairman | Additional;
  subItemId?: string | null | BrokenItems | Part;
  dialogTitle?: string;
  buttonName?: string;
  iconButton?: JSX.Element | null;
  colorButton?: "success" | "error" | "info" | "primary" | "warning";
  variantButton?: "contained" | "outlined" | "text";
  isLoading?: boolean;
  iconOnly?: boolean;
}

const ConfirmRemove: React.FC<ConfirmRemoveProps> = ({
  massage,
  onDelete,
  itemId,
  dialogTitle,
  buttonName,
  subItemId,
  iconButton,
  colorButton,
  variantButton,
  isLoading,
  iconOnly = false,
}) => {
  const [open, setOpen] = useState(false);
  const { setNotify, notify } = useNotifyContext()

  // Open the dialog
  const handleClickOpen = () => {
    setOpen(true);
  };

  // Close the dialog
  const handleClose = () => {
    setOpen(false);
  };

  // Handle the deletion
  const handleDelete = () => {
    if (!itemId) {
      setNotify({
        ...notify,
        open: true,
        message: "พบปัญหาบางอย่างโปรดติดต่อผู้พัฒนา",
        color: "error",
      });
      return;
    }
    onDelete(itemId, subItemId);
    handleClose();
  };

  return (
    <>
      {iconOnly === true ? (
        <>
          {" "}
          <IconButton
            size="small"
            color="error"
            onClick={handleClickOpen}
            disabled={isLoading}
          >
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: 30,
                height: 30,
              }}
            >
              <Close sx={{ fontSize: "18px" }} />
            </Avatar>
          </IconButton>
        </>
      ) : (
        <Button
          variant={variantButton ? variantButton : "outlined"}
          color={colorButton ? colorButton : "primary"}
          size="small"
          startIcon={iconButton ? iconButton : <Cancel />}
          onClick={handleClickOpen}
          disabled={isLoading}
          sx={{ mr: 1 }}
        >
          {buttonName ? buttonName : "ยกเลิกเอกสาร"}
        </Button>
      )}

      <Dialog open={open} maxWidth="sm" fullWidth onClose={handleClose}>
        <DialogTitle id="alert-dialog-title" variant="h3">
          <Grid2 container>
            <Avatar sx={{ bgcolor: "primary.main", width: 30, height: 30 }}>
              <AlertOctagon size={16} />
            </Avatar>
            <Typography variant="h4" ml={1} mt={0.2}>
              {dialogTitle ? dialogTitle : "แจ้งเตือนสำคัญ"}
            </Typography>
          </Grid2>
        </DialogTitle>
        <DialogContent sx={{ minHeight: 100 }}>
          <DialogContentText id="alert-dialog-description">
            {massage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined">
            ยกเลิก
          </Button>
          <Button onClick={handleDelete} autoFocus variant="contained">
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConfirmRemove;
