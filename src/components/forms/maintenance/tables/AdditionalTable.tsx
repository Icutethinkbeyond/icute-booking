import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Grid2,
  Avatar,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  EditNoteTwoTone,
  DeleteSweepTwoTone,
  Cancel,
  PriceChange,
} from "@mui/icons-material";
import BaseCard from "@/components/shared/BaseCard";

import { calculateRentalDays, formatNumber } from "@/utils/utils";
import { Rental } from "@/interfaces/Rental";
import { useRentalContext } from "@/contexts/RentalContext";
import {
  Archive,
  ArchiveRestore,
  BookDown,
  Cog,
  Delete,
  Download,
  Edit,
  Trash2,
} from "lucide-react";
import NotFound from "@/components/shared/used/NotFound";
import { formatUtcDate } from "../../../../utils/utils";
import dayjs, { Dayjs } from "dayjs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useNotifyContext } from "@/contexts/NotifyContext";
import ConfirmRemove from "@/components/shared/used/ConfirmRemove";
import ConfirmInput from "@/components/shared/used/ConfirmInput";
import { useLocale } from "next-intl";
import { useMaintenanceContext } from "@/contexts/MaintenanceContext";
import { Additional, Part } from "@/interfaces/Maintenance";

interface TableProps {
  // data: any;
  returning?: boolean;
}

const AdditionalTable: React.FC<TableProps> = ({}) => {
  const {
    additionalState,
    additionalForm,
    setAdditionalState,
    handleRemoveAdditional,
  } = useMaintenanceContext();

  const { setNotify, notify } = useNotifyContext();
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const localActive = useLocale();
  const [loading, setLoading] = useState<boolean>(false);

  const getAdditionalList = (maintenanceId: string | null) => {
    if (!maintenanceId) {
      setNotify({
        ...notify,
        open: true,
        message: "พบปัญหาบางอย่างโปรดติดต่อผู้พัฒนา",
        color: "error",
      });

      return;
    }

    setLoading(true);

    axios
      .get(`/api/maintenance/additional?maintenanceId=${maintenanceId}`)
      .then(({ data }) => {
        // console.log(data)
        setAdditionalState(data);
        setLoading(false);
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

  const cancleAdditional = (additional: Additional) => {
    axios
      .delete(
        `/api/maintenance/additional?additionalId=${additional.additionalId}`
      )
      .then(({ data }) => {
        handleRemoveAdditional(
          additional.additionalId,
          additional.additionalTempId
        );

        setNotify({
          ...notify,
          open: true,
          message: "การดำเนินการสำเร็จ",
          color: "success",
        });

        // handleRedirect();
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
    let maintenanceId = params.get("maintenanceId");
    if (maintenanceId) {
      getAdditionalList(maintenanceId);
    }
    return () => {
      setAdditionalState([]);
    };
  }, []);

  return (
    <Grid2 container spacing={3} p={"22px"}>
      <Grid2 size={12} container>
        <Grid2 size={6} container>
          <Grid2 container alignItems="center">
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <PriceChange />
            </Avatar>
            <Typography variant="h4" gutterBottom mt={0.5}>
              บริการและค่าใช้จ่ายเพิ่มเติม
            </Typography>
          </Grid2>
        </Grid2>
      </Grid2>
      <TableContainer
        sx={{
          width: {
            xs: "100%",
          },
        }}
      >
        <Table
          aria-label="simple table"
          sx={{
            whiteSpace: "nowrap",
            //   mt: 2,
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography color="textSecondary" variant="h6">
                  #ลำดับ.
                </Typography>
              </TableCell>
              <TableCell sx={{ width: "200px" }}>
                <Typography color="textSecondary" variant="h6">
                  ชื่อบริการ
                </Typography>
              </TableCell>
              <TableCell>
                <Typography color="textSecondary" variant="h6">
                  ราคา
                </Typography>
              </TableCell>
              <TableCell>
                <Typography color="textSecondary" variant="h6">
                  ลบ
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading === true ? (
              <TableRow key={"ERROR101"}>
                <TableCell colSpan={6}>
                  <Grid2 container size={12} justifyContent="center" mt={5}>
                    <CircularProgress color="primary" />
                  </Grid2>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {additionalState.length === 0 && loading === false && (
                  <TableRow key={"ERROR101"}>
                    <TableCell colSpan={5}>
                      <Grid2 container size={12} justifyContent="center">
                        <NotFound
                          title="โปรดข้อมูลลงในตาราง"
                          description="เมื่อคุณเพิ่มรายการเเล้วตารางจะเเสดงผลที่คุณเพิ่ม"
                        />
                      </Grid2>
                    </TableCell>
                  </TableRow>
                )}
                {additionalState.map((additional: Additional, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography
                        sx={{ fontWeight: "bold" }}
                        variant="body1"
                        mb={1}
                      >
                        {additional.additionalName}
                      </Typography>

                      {!additional.additionalId && (
                        <Chip label="ใหม่" variant="filled" color="success" />
                      )}
                    </TableCell>
                    <TableCell>{additional.additionalPrice}</TableCell>
                    {/* <TableCell>{additional.additionalDesc}</TableCell> */}
                    <TableCell>
                      {additional.additionalId ? (
                        <ConfirmRemove
                          itemId={additional}
                          buttonName="ยกเลิกค่าใช้จ่าย"
                          onDelete={cancleAdditional}
                          massage={`หากคุณยกเลิกการรายการนี้ รายการนี้จะไม่รวมในใบเสนอราคา เเละข้อมูลการเเจ้งจะไม่ถูกนำไปประมวณผลในการออกรายงานทุกรูปแบบ "กดยืนยันเพื่อดำเนินการต่อ"`}
                        />
                      ) : (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            handleRemoveAdditional(
                              additional.additionalId,
                              additional.additionalTempId
                            )
                          }
                        >
                          <Avatar sx={{ bgcolor: "primary.main" }}>
                            <Trash2 size={20} />
                          </Avatar>
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid2>
    // </BaseCard>
  );
};

export default AdditionalTable;
