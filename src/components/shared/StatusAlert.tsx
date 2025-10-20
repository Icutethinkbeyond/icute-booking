import React, { useState, useEffect } from 'react';
import { Alert, Snackbar } from '@mui/material';

interface StatusAlertProps {
  status: 'success' | 'error' | 'info' | 'warning';
  message: string;
  show: boolean; // To trigger the alert
  onClose: () => void; // A function to trigger when alert closes
}

const StatusAlert: React.FC<StatusAlertProps> = ({ status, message, show, onClose }) => {
  const [open, setOpen] = useState(show);

  useEffect(() => {
    if (show) {
      setOpen(true);

      const timer = setTimeout(() => {
        setOpen(false);
        onClose(); // Close alert after 3 seconds
      }, 3000);

      return () => {
        clearTimeout(timer); // Clear timeout if component unmounts or re-renders
      };
    }
  }, [show, onClose]);

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} // Position bottom-right
      onClose={() => setOpen(false)}
    >
      <Alert onClose={() => setOpen(false)} severity={status} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default StatusAlert;
