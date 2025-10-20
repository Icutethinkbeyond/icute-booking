import { Paper, styled } from "@mui/material";

export const DeliveryCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "isSelected",
})<{ isSelected?: boolean }>(({ theme, isSelected }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  border: `1px solid ${
    isSelected ? theme.palette.primary.main : theme.palette.divider
  }`,
  backgroundColor: isSelected
    ? theme.palette.primary.light
    : theme.palette.background.paper,
  cursor: "pointer",
  transition: theme.transitions.create(["border-color", "background-color"], {
    duration: theme.transitions.duration.short,
  }),
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: isSelected
      ? theme.palette.primary.light
      : theme.palette.action.hover,
  },
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: theme.spacing(2),
}));
