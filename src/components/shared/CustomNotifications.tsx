"use client";

import React, { useEffect, useState } from "react";
import {
  Snackbar,
  Button,
  IconButton,
  Alert,
  AlertTitle,
  Stack,
  Typography,
} from "@mui/material";
import {
  Close as CloseIcon,
} from "@mui/icons-material";
import { useNotifyContext } from "@/contexts/NotifyContext";

export default function CustomNotification() {
  const { notify, setNotify } = useNotifyContext();

  const onClose = () => {
    setNotify({
      ...notify,
      open: false,
    });
  };

  return (
    <Snackbar
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={notify.open}
      autoHideDuration={3000}
      onClose={onClose}
    >
      <Alert
        variant="filled"
        severity={notify.color}
        action={
          <React.Fragment>
            {/* {action} */}
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              // sx={{ fontFamily: "inherit", fontSize: '1em' }}
              onClick={onClose}
            >
              <CloseIcon fontSize="small" />
              {/* รับทราบ */}
            </IconButton>
          </React.Fragment>
        }
      >
        <AlertTitle>{notify.header ? notify.header : "แจ้งเตือน"}</AlertTitle>
        {notify.message}
      </Alert>
    </Snackbar>
  );
}

// export default function NotificationDemo() {
//   const [simpleNotification, setSimpleNotification] = useState(false);
//   const [actionNotification, setActionNotification] = useState(false);
//   const [feedbackNotification, setFeedbackNotification] = useState(false);
//   const [undoNotification, setUndoNotification] = useState(false);

//   const handleSimpleNotification = () => {
//     setSimpleNotification(true);
//   };

//   const handleActionNotification = () => {
//     setActionNotification(true);
//   };

//   const handleFeedbackNotification = () => {
//     setFeedbackNotification(true);
//   };

//   const handleUndoNotification = () => {
//     setUndoNotification(true);
//   };

//   const handleClose =
//     (setter: React.Dispatch<React.SetStateAction<boolean>>) =>
//     (event?: React.SyntheticEvent | Event, reason?: string) => {
//       if (reason === "clickaway") {
//         return;
//       }
//       setter(false);
//     };

//   const handleAction = () => {
//     console.log("Action button clicked");
//     setActionNotification(false);
//   };

//   const handleFeedback = (isPositive: boolean) => {
//     console.log(`User feedback: ${isPositive ? "Positive" : "Negative"}`);
//     setFeedbackNotification(false);
//   };

//   const handleUndo = () => {
//     console.log("Undo action");
//     setUndoNotification(false);
//   };

//   return (
//     <Stack spacing={2} sx={{ maxWidth: 400, margin: "auto", mt: 4 }}>
//       <Typography variant="h4" gutterBottom>
//         Custom Notification Demo
//       </Typography>

//       <Button variant="contained" onClick={handleSimpleNotification}>
//         Show Simple Notification
//       </Button>

//       <Button variant="contained" onClick={handleActionNotification}>
//         Show Notification with Action
//       </Button>

//       <Button variant="contained" onClick={handleFeedbackNotification}>
//         Show Feedback Notification
//       </Button>

//       <Button variant="contained" onClick={handleUndoNotification}>
//         Show Undo Notification
//       </Button>

//       <CustomNotification
//         open={simpleNotification}
//         onClose={handleClose(setSimpleNotification)}
//         message="This is a simple notification."
//         severity="info"
//       />

//       <CustomNotification
//         open={actionNotification}
//         onClose={handleClose(setActionNotification)}
//         message="This notification has a custom action button."
//         severity="warning"
//         action={
//           <Button color="inherit" size="small" onClick={handleAction}>
//             ACTION
//           </Button>
//         }
//       />

//       <CustomNotification
//         open={feedbackNotification}
//         onClose={handleClose(setFeedbackNotification)}
//         message="How was your experience?"
//         severity="success"
//         action={
//           <React.Fragment>
//             <IconButton
//               size="small"
//               aria-label="thumbs up"
//               color="inherit"
//               onClick={() => handleFeedback(true)}
//             >
//               <ThumbUp fontSize="small" />
//             </IconButton>
//             <IconButton
//               size="small"
//               aria-label="thumbs down"
//               color="inherit"
//               onClick={() => handleFeedback(false)}
//             >
//               <ThumbDown fontSize="small" />
//             </IconButton>
//           </React.Fragment>
//         }
//       />

//       <CustomNotification
//         open={undoNotification}
//         onClose={handleClose(setUndoNotification)}
//         message="Action completed. Click undo to revert."
//         severity="success"
//         action={
//           <Button
//             color="inherit"
//             size="small"
//             onClick={handleUndo}
//             startIcon={<Undo />}
//           >
//             UNDO
//           </Button>
//         }
//       />
//     </Stack>
//   );
// }
