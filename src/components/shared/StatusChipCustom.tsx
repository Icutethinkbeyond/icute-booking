import { Chip } from "@mui/material";
import React from "react";

interface StatusChipProps {
  status: string;
}

const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  return (
    <div>
      {/* Green (Active, Returned, Completed) */}
      {(status === "active" || status === "returned" || status === "completed") && (
        <Chip
          sx={{
            pl: "4px",
            pr: "4px",
            backgroundColor: "success.main",
            color: "#fff",
          }}
          size="small"
          label={status.charAt(0).toUpperCase() + status.slice(1)}
        ></Chip>
      )}
      
      {/* Gray (Inactive, Unrepairable) */}
      {(status === "inactive" || status === "unrepairable") && (
        <Chip
          sx={{
            pl: "4px",
            pr: "4px",
            backgroundColor: "secondary.main",
            color: "#fff",
          }}
          size="small"
          label={status.charAt(0).toUpperCase() + status.slice(1)}
        ></Chip>
      )}
      
      {/* Red (Waiting, Overdue, Cancelled) */}
      {(status === "waiting" || status === "overdue" || status === "cancelled") && (
        <Chip
          sx={{
            pl: "4px",
            pr: "4px",
            backgroundColor: "error.main",
            color: "#fff",
          }}
          size="small"
          label={status.charAt(0).toUpperCase() + status.slice(1)}
        ></Chip>
      )}
      
      {/* Yellow (Damaged, On Hold) */}
      {(status === "damaged" || status === "on-hold") && (
        <Chip
          sx={{
            pl: "4px",
            pr: "4px",
            backgroundColor: "warning.main",
            color: "#fff",
          }}
          size="small"
          label={status.charAt(0).toUpperCase() + status.slice(1)}
        ></Chip>
      )}
      
      {/* Light Blue (Returned Partially, Parts Ordered) */}
      {(status === "returned-partially" || status === "parts-ordered") && (
        <Chip
          sx={{
            pl: "4px",
            pr: "4px",
            backgroundColor: "info.main",
            color: "#fff",
          }}
          size="small"
          label={status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
        ></Chip>
      )}
      
      {/* Dark Blue (In Progress, Awaiting Approval, Under Review, Ready for Pickup, Pending) */}
      {(status === "in-progress" || status === "awaiting-approval" || status === "under-review" || status === "ready-for-pickup" || status === "pending") && (
        <Chip
          sx={{
            pl: "4px",
            pr: "4px",
            backgroundColor: "primary.main",
            color: "#fff",
          }}
          size="small"
          label={status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
        ></Chip>
      )}
      
      {/* Light Green (Borrowed) */}
      {status === "borrowed" && (
        <Chip
          sx={{
            pl: "4px",
            pr: "4px",
            backgroundColor: "success.light",
            color: "success.main",
          }}
          size="small"
          label={status.charAt(0).toUpperCase() + status.slice(1)}
        ></Chip>
      )}
    </div>
  );
};

export default StatusChip;
