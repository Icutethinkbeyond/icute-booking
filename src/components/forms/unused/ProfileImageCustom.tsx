import React, { useState } from 'react';
import { Button, TextField, Box, Avatar } from '@mui/material';

const ProfileImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Generate preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle upload (placeholder for actual upload logic)
  const handleUpload = () => {
    if (selectedFile) {
      // Perform the upload action (e.g., using an API endpoint)
      console.log('Uploading:', selectedFile);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="flex-start" gap={2}>
      <Avatar
        alt="Profile Picture"
        src={previewUrl || '/default-avatar.png'} // Default avatar if no image
        sx={{ width: 120, height: 120, marginBottom: 2 }}
      />
      {/* <TextField
        type="file"
        size='small'
        inputProps={{ accept: 'image/*' }} // Accept only images
        onChange={handleFileChange}
      /> */}
      {/* <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={!selectedFile} // Disable if no file is selected
      >
        Upload Image
      </Button> */}
    </Box>
  );
};

export default ProfileImageUpload;
