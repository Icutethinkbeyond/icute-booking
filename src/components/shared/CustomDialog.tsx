// components/AppDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

export type DialogType = 'success' | 'error' | 'warning' | 'info';

interface AppDialogProps {
  open: boolean;
  type?: DialogType;
  title: string;
  description?: string;
  imageSrc?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onClose: () => void;
}

const dialogConfig = {
  success: {
    color: 'success.main',
    icon: <CheckCircleIcon fontSize="large" color="success" />,
  },
  error: {
    color: 'error.main',
    icon: <ErrorIcon fontSize="large" color="error" />,
  },
  warning: {
    color: 'warning.main',
    icon: <WarningIcon fontSize="large" color="warning" />,
  },
  info: {
    color: 'info.main',
    icon: <InfoIcon fontSize="large" color="info" />,
  },
};

export const AppDialog: React.FC<AppDialogProps> = ({
  open,
  type = 'info',
  title,
  description,
  imageSrc,
  confirmText = 'ตกลง',
  cancelText = 'ยกเลิก',
  onConfirm,
  onClose,
}) => {
  const config = dialogConfig[type];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {config.icon}
          <Typography variant="h6">{title}</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {imageSrc && (
          <Box mb={2} textAlign="center">
            <img
              src={imageSrc}
              alt="dialog"
              style={{ maxWidth: '100%', borderRadius: 8 }}
            />
          </Box>
        )}

        {description && (
          <Typography variant="body1">{description}</Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {cancelText}
        </Button>

        {onConfirm && (
          <Button
            onClick={onConfirm}
            variant="contained"
            color={type}
          >
            {confirmText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
