import { Info, ProductionQuantityLimits } from "@mui/icons-material";
import { Avatar, Grid2, Typography } from "@mui/material";

type Props = {
  icon?: JSX.Element;
  title: string;
};

const PageTitle = ({ title, icon }: Props) => (
  <Grid2 size={{ xs: 12 }} mb={2}>
    <Grid2 size={{ xs: 12 }} mb={2}>
      <Grid2 container alignItems="center">
        <Avatar sx={{ bgcolor: "primary.main" }}>
          {icon ? icon : <Info />}
        </Avatar>
        <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
          {title}
        </Typography>
      </Grid2>
    </Grid2>
  </Grid2>
);

export default PageTitle;
