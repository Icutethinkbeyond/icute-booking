"use client"

import React from 'react';
import { Box, AppBar, Toolbar, styled, Stack, IconButton, Badge, Button, Grid2 } from '@mui/material';
import PropTypes from 'prop-types';

// components
import Profile from './Profile';
import Search from './Search';
import {IconMenu2 } from '@tabler/icons-react';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import BreadcrumbCustom from '@/components/shared/used/BreadcrumbCustom';

interface ItemType {
  toggleMobileSidebar?:  (event: React.MouseEvent<HTMLElement>) => void ;
}

const Header = ({toggleMobileSidebar}: ItemType) => {

  // const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  // const lgDown = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  
  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    // boxShadow: 'none',
     background: "linear-gradient(90deg, rgba(42, 72, 160, 1) 0%, rgba(69, 189, 187, 1) 100%)",
    // boxShadow: '10px 0.1px 10px #ff9e75',
    // background: '#ffffff',
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    [theme.breakpoints.up('lg')]: {
      minHeight: '70px',
    },
  }));
  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    color: theme.palette.text.secondary,
  }));

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={toggleMobileSidebar}
          sx={{
            display: {
              lg: "none",
              xs: "inline",
            },
          }}
        >
          <IconMenu2 width="20" height="20" />
        </IconButton>

        {/* <Search/> */}
        <BreadcrumbCustom/>
        
        <Box flexGrow={1} />
        <Stack spacing={1} direction="row" alignItems="center">
          {/* <LanguageSwitcher/> */}
          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

Header.propTypes = {
  sx: PropTypes.object,
};

export default Header;
