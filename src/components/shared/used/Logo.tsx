"use client";

import Link from "next/link";
import { Grid2, styled } from "@mui/material";
import Image from "next/image";
import { useLocale } from "next-intl";

const LinkStyled = styled(Link)(() => ({
  height: "80px",
  width: "100%",
  overflow: "hidden",
  display: "block",
}));

const Logo = () => {
  const localActive = useLocale();
  return (
    <LinkStyled href={`/${localActive}/dashboard`}>
      <Grid2 container justifyContent="center" alignItems={"center"}>
        <Image
          src="/images/logos/image004.png"
          alt="logo"
          height={70}
          width={105}
          priority
        />
      </Grid2>
      {/* Logo Here */}
    </LinkStyled>
  );
};

export default Logo;
