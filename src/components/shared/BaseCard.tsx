import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  CardHeader,
  Avatar,
  IconButton,
} from "@mui/material";
import { Description } from "@mui/icons-material";

type Props = {
  title?: string | JSX.Element;
  subtitle?: string;
  action?: JSX.Element | any;
  footer?: JSX.Element;
  cardheading?: string | JSX.Element;
  headtitle?: string | JSX.Element;
  headsubtitle?: string | JSX.Element;
  children?: JSX.Element;
  middlecontent?: string | JSX.Element;
  avatar?: string | JSX.Element;
  actionHead?: string | JSX.Element;
};

const DashboardCard = ({
  title,
  subtitle,
  children,
  action,
  footer,
  cardheading,
  headtitle,
  headsubtitle,
  middlecontent,
  avatar,
  actionHead,
}: Props) => {
  return (
    <Card
      sx={{ padding: 0, mt: 2 }}
      elevation={9}
      variant={undefined}
    >
      {/* <CardHeader
        avatar={
          avatar ? (
            <Avatar sx={{ bgcolor: "primary.main" }} aria-label="recipe">
              {avatar}
            </Avatar>
          ) : (
            ""
          )
        }
        action={actionHead ? actionHead : ""}
        title={title}
        subheader={subtitle}
      /> */}
      {/* {cardheading ? (
        <CardContent>
          <Typography variant="h4">{headtitle}</Typography>
          <Typography variant="subtitle2" color="textSecondary">
            {headsubtitle}
          </Typography>
        </CardContent>
      ) : ( */}
      <CardContent sx={{ p: "30px" }}>
        {/* {title ? (
            <Stack
              direction="row"
              spacing={2}
              justifyContent="space-between"
              alignItems={"center"}
              mb={3}
            >
              <Box>
                {title ? <Typography variant="h4">{title}</Typography> : ""}

                {subtitle ? (
                  <Typography variant="subtitle2" color="textSecondary">
                    {subtitle}
                  </Typography>
                ) : (
                  ""
                )}
              </Box>
              {action}
            </Stack>
          ) : null} */}

        {children}
      </CardContent>
      {/* // )} */}

      {middlecontent}
      {footer}
    </Card>
  );
};

export default DashboardCard;
