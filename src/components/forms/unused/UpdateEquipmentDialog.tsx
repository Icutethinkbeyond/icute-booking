import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Grid,
  Grid2,
} from "@mui/material";

interface UpdateEquipmentDialogProps {
  open: boolean;
  onClose: () => void;
  currentStatus: string;
  onSave: (newStatus: string, remark: string) => void;
}

const statusOptions = ["Borrow", "Under Maintenance", "Returned", "Overdue"];

const UpdateEquipmentDialog: React.FC<UpdateEquipmentDialogProps> = ({
  open,
  onClose,
  currentStatus,
  onSave,
}) => {
  const [newStatus, setNewStatus] = useState<string>(currentStatus);
  const [remark, setRemark] = useState<string>("");
  const [date, setReturnDate] = useState(new Date());

  const handleStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setNewStatus(event.target.value as string);
  };

  const handleRemarkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRemark(event.target.value);
  };

  const handleSave = () => {
    onSave(newStatus, remark);
    onClose(); // Close the dialog after saving
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Equipment Status</DialogTitle>
      <DialogContent>
        <Grid2 container spacing={2} sx={{ mt: 2 }}>
          <Grid2 size={12}>
            <Select
              label="Equipment Status"
              value={newStatus}
              // onChange={(e) => setEquipmentStatus(e.target.value as string)}
              fullWidth
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
            {/* <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={newStatus}>
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl> */}
          </Grid2>
          <Grid2 size={12}>
            <TextField
              type="date"
              label="Returned Date"
              variant="outlined"
              margin="normal"
              value={date}
              fullWidth
              //   value={repairDate}
              //   onChange={(e) => setRepairDate(e.target.value)}
              required
            />
          </Grid2>
          <Grid2 size={12}>
            <TextField
              label="Remark"
              fullWidth
              value={remark}
              onChange={handleRemarkChange}
              multiline
              rows={3}
            />
          </Grid2>
        </Grid2>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateEquipmentDialog;
