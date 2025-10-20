import { Chip } from "@mui/material";
import {
  DocumentStatus,
  EquipmentOwner,
  EquipmentStatus,
  RepairStatus,
  RoleName,
  UserStatus,
} from "@prisma/client";
import React from "react";

interface StatusProps {
  status: string | null | undefined;
  message?: string;
}

const Status: React.FC<StatusProps> = ({ status, message }) => {
  return (
    <div>
      {/* Green (Active, Returned, Completed) */}
      {(status === "active" ||
        status === "returned" ||
        status === "completed" ||
        status === EquipmentStatus.InStock ||
        status === UserStatus.Active ||
        status === DocumentStatus.Open ||
        status === EquipmentOwner.Plant ||
        status === RepairStatus.Completed) && (
        <Chip
          sx={{
            pl: "4px",
            pr: "4px",
            backgroundColor: "success.main",
            color: "#fff",
          }}
          size="small"
          label={
            message ? message : status.charAt(0).toUpperCase() + status.slice(1)
          }
        ></Chip>
      )}

      {/* Gray (Inactive, Unrepairable) */}
      {(status === "inactive" ||
        status === "unrepairable" ||
        status === EquipmentStatus.Booked) && (
        <Chip
          sx={{
            pl: "4px",
            pr: "4px",
            backgroundColor: "secondary.main",
            color: "#fff",
          }}
          size="small"
          label={
            message ? message : status.charAt(0).toUpperCase() + status.slice(1)
          }
        ></Chip>
      )}

      {(status === EquipmentStatus.CurrentlyRenting ||
        status === "" ||
        status === RepairStatus.Cancel ||
        status === DocumentStatus.Cancel) && (
        <Chip
          sx={{
            pl: "4px",
            pr: "4px",
            backgroundColor: "primary.main",
            color: "#fff",
          }}
          size="small"
          label={
            message ? message : status.charAt(0).toUpperCase() + status.slice(1)
          }
        ></Chip>
      )}

      {/* Red (Waiting, Overdue, Cancelled) */}
      {(status === "waiting" ||
        status === "overdue" ||
        status === "cancelled" ||
        status === EquipmentStatus.Broken ||
        status === EquipmentStatus.Damaged ||
        status === EquipmentStatus.InActive ||
        status === UserStatus.InActice ||
        status === EquipmentOwner.Site ||
        status === RepairStatus.Unrepairable) && (
        <Chip
          sx={{
            pl: "4px",
            pr: "4px",
            backgroundColor: "error.main",
            color: "#fff",
          }}
          size="small"
          label={
            message ? message : status.charAt(0).toUpperCase() + status.slice(1)
          }
        ></Chip>
      )}

      {/* Yellow (Damaged, On Hold) */}
      {(status === "damaged" ||
        status === "on-hold" ||
        status === RoleName.Employee ||
        status === DocumentStatus.Draft) && (
        <Chip
          sx={{
            pl: "4px",
            pr: "4px",
            backgroundColor: "primary.main",
            color: "#fff",
          }}
          size="small"
          label={
            message ? message : status.charAt(0).toUpperCase() + status.slice(1)
          }
        ></Chip>
      )}

      {/* Light Blue (Returned Partially, Parts Ordered) */}
      {(status === "returned-partially" ||
        status === "parts-ordered" ||
        // status === EquipmentStatus.WillBeSold ||
        status === RoleName.Developer ||
        status === RoleName.Admin ||
        status === DocumentStatus.Close ||
        status === DocumentStatus.WaitingApprove) && (
        <Chip
          sx={{
            pl: "4px",
            pr: "4px",
            backgroundColor: "info.main",
            color: "#fff",
          }}
          size="small"
          label={
            message
              ? message
              : status.charAt(0).toUpperCase() +
                status.slice(1).replace("-", " ")
          }
        ></Chip>
      )}

      {/* Dark Blue (In Progress, Awaiting Approval, Under Review, Ready for Pickup, Pending) */}
      {(status === "in-progress" ||
        status === "awaiting-approval" ||
        status === "under-review" ||
        status === "ready-for-pickup" ||
        status === "pending" ||
        status === RoleName.User) && (
        <Chip
          sx={{
            pl: "4px",
            pr: "4px",
            backgroundColor: "primary.main",
            color: "#fff",
          }}
          size="small"
          label={
            message
              ? message
              : status.charAt(0).toUpperCase() +
                status.slice(1).replace("-", " ")
          }
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
          label={
            message ? message : status.charAt(0).toUpperCase() + status.slice(1)
          }
        ></Chip>
      )}
    </div>
  );
};

export default Status;
