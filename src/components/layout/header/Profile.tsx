import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";
import {
  Box,
  Menu,
  Avatar,
  Typography,
  Divider,
  Button,
  IconButton,
  ListItemButton,
  List,
  ListItemText,
} from "@mui/material";

import { Stack } from "@mui/system";
import {
  IconChevronDown,
  IconCreditCard,
  IconCurrencyDollar,
  IconMail,
  IconShield,
} from "@tabler/icons-react";
import ProfileFormDialog from "@/components/shared/ProfileDialog";
import { useTranslations, useLocale } from "next-intl";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Profile = () => {
  const localeActive = useLocale();
  const { data: session } = useSession();

  const [anchorEl2, setAnchorEl2] = useState(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const handleClick2 = (event: any) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const handleOpenProfileDialog = () => {
    setIsProfileDialogOpen(true);
  };

  const handleCloseProfileDialog = () => {
    setIsProfileDialogOpen(false);
  };

  const theme = useTheme();
  const router = useRouter();
  const localActive = useLocale();

  const handleEdit = () => {
    if (session?.user?.id) {
      router.push(
        `/${localActive}/protected/user-management/edit/?userId=${session?.user?.id}`
      );
    }
  };

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="menu"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === "object" && {
            borderRadius: "9px",
          }),
        }}
        onClick={handleClick2}
      >
        {/* <Avatar
          src={"/images/users/user2.jpg"}
          alt={"ProfileImg"}
          sx={{
            width: 30,
            height: 30,
          }}
        /> */}
        <Box
          sx={{
            display: {
              xs: "none",
              sm: "flex",
            },
            alignItems: "center",
          }}
        >
          <Typography
            color="textSecondary"
            variant="h5"
            fontWeight="400"
            sx={{ ml: 1 }}
          >
            สวัสดีคุณ,
          </Typography>
          <Typography
            variant="h5"
            fontWeight="700"
            sx={{
              ml: 1,
            }}
          >
            {session?.user?.name}
          </Typography>
          <IconChevronDown width="20" height="20" />
        </Box>
      </IconButton>
      {/* ------------------------------------------- */}
      {/* Message Dropdown */}
      {/* ------------------------------------------- */}
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        sx={{
          "& .MuiMenu-paper": {
            width: "360px",
            p: 2,
            pb: 2,
            pt: 0,
          },
        }}
      >
        <Box pt={0}>
          <List>
            <ListItemButton component="a" onClick={handleEdit}>
              <ListItemText primary="แก้ไขโปรไฟล์" />
            </ListItemButton>
          </List>
        </Box>
        <Divider />
        <Box mt={2}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => signOut()}
          >
            ออกจากระบบ
          </Button>
        </Box>
      </Menu>
      {/* <ProfileFormDialog
        open={isProfileDialogOpen}
        onClose={handleCloseProfileDialog}
        profileData={profileData}
      /> */}
    </Box>
  );
};

export default Profile;
