import * as React from "react";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import { Alert } from "@mui/material";

interface SnackProps {
  message?: string | null;
  handleOpen: (value: boolean) => void;
  open: boolean;
  notiColor?: any;
}

const AutohideSnackbar: React.FC<SnackProps> = ({
  message = "This Snackbar will be dismissed in 5 seconds.",
  handleOpen,
  open = false,
  notiColor = 'success'
}) => {
  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    handleOpen(false);
  };

  return (
    <div>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity={notiColor}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AutohideSnackbar;
