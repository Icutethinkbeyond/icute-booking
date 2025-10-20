import React, { useEffect, useState } from "react";
import { Grid2 } from "@mui/material";
import { useEquipmentContext } from "@/contexts/EquipmentContext";
import { EquipmentSelect, initialEquipment } from "@/interfaces/Equipment";
import axios from "axios";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { initialRental } from "@/interfaces/Rental";
import { useRentalContext } from "@/contexts/RentalContext";
import { usePathname, useSearchParams } from "next/navigation";
import { DocumentCategory } from "@prisma/client";
import DocumentForm from "../document/DocumentDetails";
import SiteForm from "../site/SiteDetails";
import DashboardCard from "@/components/shared/DashboardCard";

interface RentalEquipmentProps {}

const MaintenanceEquipmentForm: React.FC<RentalEquipmentProps> = ({}) => {
  const {
    setEquipment,
    equipment,
    equipmentSelectState,
    setEquipmentSelectState,
  } = useEquipmentContext();

  const {
    rentalForm,
    rentalEdit,
    setRentalForm,
    setRentalEdit,
    addRental,
    rentalsState,
    setRentalsState,
  } = useRentalContext();
  const params = useSearchParams();
  const pathname = usePathname();

  const [disableRenting, setDisableRenting] = useState(true);
  const { setNotify, notify } = useNotifyContext()
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getRentalList = (documentId: string) => {
    axios
      .get(`/api/rental?documentId=${documentId}`)
      .then(({ data }) => {
        console.log(data);
        setRentalsState(data);
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Request cancelled");
        } else {
          console.error("Fetch error:", error);
        }
      })
      .finally(() => {
        console.info("done");
      });
  };

  useEffect(() => {
    let documentId = params.get("documentId");
    if (pathname.includes("new")) {
    } else {
      setRentalEdit(true);
      if (documentId) {
        getRentalList(documentId);
      }
    }
    return () => {
      setEquipment(initialEquipment);
      setDisableRenting(true);
      setIsLoading(false);
      setRentalForm(initialRental);
      setEquipmentSelectState([]);
    };
  }, []);

  return (
    <DashboardCard>
      <Grid2 container justifyContent="center" alignItems="stretch">
        <Grid2
          size={6}
          pr={1}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <DocumentForm
            documentCategory={DocumentCategory.Maintenance}
            viewOnly={true}
          />
        </Grid2>
        <Grid2
          size={6}
          pl={1}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <SiteForm
            documentCategory={DocumentCategory.Maintenance}
            viewOnly={true}
          />
        </Grid2>
        {/* <Grid2 size={12} sx={{ display: "flex", flexDirection: "column" }}>
          <ListRentalTable returning={true} />
        </Grid2> */}
      </Grid2>
    </DashboardCard>
  );
};

export default MaintenanceEquipmentForm;
