import React, { useState } from 'react';
import { TextField, Button, IconButton, InputAdornment, Box, Typography } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const ChangePasswordForm = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleToggleOldPasswordVisibility = () => setShowOldPassword(!showOldPassword);
  const handleToggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword);
  const handleToggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Add form validation logic
    if (newPassword !== confirmPassword) {
      alert("New password and confirmation don't match");
      return;
    }
    // Implement password change logic here
    console.log('Old Password:', oldPassword);
    console.log('New Password:', newPassword);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, margin: '0 auto' }}>
      {/* Old Password Field */}
      <TextField
        label="Old Password"
        type={showOldPassword ? 'text' : 'password'}
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        fullWidth
        size='small'
        margin="normal"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleToggleOldPasswordVisibility}>
                {showOldPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* New Password Field */}
      <TextField
        label="New Password"
        type={showNewPassword ? 'text' : 'password'}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        fullWidth
        margin="normal"
        size='small'
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleToggleNewPasswordVisibility}>
                {showNewPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Confirm New Password Field */}
      <TextField
        label="Confirm New Password"
        type={showConfirmPassword ? 'text' : 'password'}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        fullWidth
        margin="normal"
        size='small'
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleToggleConfirmPasswordVisibility}>
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Submit Button */}
      <Button type="submit" variant="contained" color="primary" fullWidth sx={{ marginTop: 2 }}>
        Change Password
      </Button>
    </Box>
  );
};

export default ChangePasswordForm;
