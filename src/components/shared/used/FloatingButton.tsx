import { Add } from "@mui/icons-material";
import { Button } from "@mui/material";

const FloatingButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      variant="contained"
      color="primary"
      onClick={onClick}
      style={{
        position: "fixed",
        bottom: "16px",
        right: "16px",
        borderRadius: "50%",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
        padding: "16px",
        minWidth: "56px",
        minHeight: "56px",
        zIndex: 999
      }}
    >
      <Add />
    </Button>
  );
};

export default FloatingButton;
