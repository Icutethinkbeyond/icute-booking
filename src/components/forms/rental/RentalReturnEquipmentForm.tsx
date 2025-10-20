import React, { useEffect, useState } from "react";
import {
  Grid2,
} from "@mui/material";
import { useEquipmentContext } from "@/contexts/EquipmentContext";
import { initialEquipment } from "@/interfaces/Equipment";
import axios from "axios";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { initialRental } from "@/interfaces/Rental";
import { useRentalContext } from "@/contexts/RentalContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { DocumentCategory, } from "@prisma/client";
import ListRentalTable from "./tables/ListRentalTable";
import DocumentForm from "../document/DocumentDetails";
import SiteForm from "../site/SiteDetails";
import DashboardCard from "@/components/shared/DashboardCard";
import ConfirmRemove from "@/components/shared/used/ConfirmRemove";

interface RentalEquipmentProps {}

const RentalReturnEquipmentForm: React.FC<RentalEquipmentProps> = ({}) => {
  const {
    setEquipment,
    setEquipmentSelectState,
  } = useEquipmentContext();

  const {
    setRentalForm,
    setRentalEdit,
    setRentalsState,
  } = useRentalContext();
  const params = useSearchParams();
  const router = useRouter();
  const localActive = useLocale();
  const pathname = usePathname();

  const [disableRenting, setDisableRenting] = useState(true);
  const { setNotify, notify } = useNotifyContext()
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getRentalList = (documentId: string) => {
    axios
      .get(`/api/rental?documentId=${documentId}`)
      .then(({ data }) => {
        // console.log(data);
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

    const cancleDocument = (documentId: string | null) => {
    if (!documentId) {
      setNotify({
        ...notify,
        open: true,
        message: "พบปัญหาบางอย่างโปรดติดต่อผู้พัฒนา",
        color: "error",
      });
    }
    axios
      .patch(`/api/rental/cancel?cancle=true&documentId=${documentId}`)
      .then(({ data }) => {
        setNotify({
          ...notify,
          open: true,
          message: "การดำเนินการสำเร็จ",
          color: "success",
        });
        router.push(`/${localActive}/protected/rental`);
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Request cancelled");
        } else {
          console.error("Fetch error:", error);
          setNotify({
            ...notify,
            open: true,
            message: "พบปัญหาบางอย่างโปรดติดต่อผู้พัฒนา",
            color: "error",
          });
        }
      })
      .finally(() => {});
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
            documentCategory={DocumentCategory.Rental}
            viewOnly={true}
          />
        </Grid2>
        <Grid2
          size={6}
          pl={1}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <SiteForm
            documentCategory={DocumentCategory.Rental}
            viewOnly={true}
          />
        </Grid2>
        <Grid2 size={12} sx={{ display: "flex", flexDirection: "column" }}>
          <ListRentalTable returning={true} />
        </Grid2>
        <ConfirmRemove
          itemId={params.get("documentId") ? params.get("documentId") : ""}
          onDelete={cancleDocument}
          massage={`หากคุณยกเลิกเอกสาร ข้อมูลการยืมของเอกสารฉบับนี้จะไม่ถูกนำไปประมวณผลในการออกรายงานทุกรูปแบบ "กดยืนยันเพื่อดำเนินการต่อ"`}
        />
      </Grid2>
    </DashboardCard>
  );
};

export default RentalReturnEquipmentForm;