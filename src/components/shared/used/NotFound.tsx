import React from 'react';
import { Box, Typography, SvgIcon } from '@mui/material';
import { FolderOpen, LucideIcon } from "lucide-react";

interface NotFoundProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
}

const NotFound: React.FC<NotFoundProps> = ({ 
  title = "ไม่พบข้อมูล",
  description = "ขออภัย ไม่พบข้อมูลที่คุณต้องการ",
  icon: Icon = FolderOpen,
  className = "",
}) => {
  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        textAlign: 'center'
      }}
      className={className}
    >
      <SvgIcon 
        component={Icon} 
        sx={{ 
          width: 48,
          height: 48,
          color: 'primary.main',
          mb: 2
        }} 
      />
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Box>
  );
};

export default NotFound;
