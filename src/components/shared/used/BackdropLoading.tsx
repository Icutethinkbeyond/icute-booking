import * as React from "react";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { useNotifyContext } from "@/contexts/NotifyContext";

interface Props {}

const LoadingBackdrop: React.FC<Props> = () => {

  const { openBackdrop } = useNotifyContext();

  return (
    <div>
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={openBackdrop}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
};

export default LoadingBackdrop;
