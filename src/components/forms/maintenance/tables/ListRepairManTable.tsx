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
  Engineering,
} from "@mui/icons-material";
import BaseCard from "@/components/shared/BaseCard";

import { calculateRentalDays, formatNumber } from "@/utils/utils";
import { Rental } from "@/interfaces/Rental";
import { useRentalContext } from "@/contexts/RentalContext";
import {
  Archive,
  ArchiveRestore,
  BookDown,
  Delete,
  Download,
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
import { Repairman } from "@/interfaces/Maintenance";

interface TableProps {
  // data: any;
  returning?: boolean;
}

const ListRepairManTable: React.FC<TableProps> = ({ returning = false }) => {
  const {
    repairmanState,
    setRepairmanState,
    setRepairmanStateSelect,
    repairmanStateSelect,
    setRepairmanForm,
    repairmanForm,
    handleRemoveRepairMan,
  } = useMaintenanceContext();

  const { setNotify, notify, setOpenBackdrop, openBackdrop } =
    useNotifyContext();
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const localActive = useLocale();

  const [isReturn, setIsReturn] = useState<boolean>(false);
  // const [loading, setLoading] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const cancleEngineer = (engineer: Repairman) => {
    axios
      .delete(`/api/maintenance/engineer?repairmanId=${engineer.repairmanId}`)
      .then(({ data }) => {
        setNotify({
          ...notify,
          open: true,
          message: "การดำเนินการสำเร็จ",
          color: "success",
        });

        handleRemoveRepairMan(engineer.userId);
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

  const getRepairMan = (maintenanceId: string) => {
    // console.log(maintenanceId)
    setLoading(true);

    if (!maintenanceId) {
      setNotify({
        ...notify,
        open: true,
        message: "พบปัญหาบางอย่างโปรดติดต่อผู้พัฒนา",
        color: "error",
      });

      return;
    }

    axios
      .get(`/api/maintenance/engineer?maintenanceId=${maintenanceId}`)
      .then(({ data }) => {
        setLoading(false);
        setRepairmanState(data.engineer);
        // setRepairmanStateSelect(data.data);
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Request cancelled");
        } else {
          console.error("Fetch error:", error);
        }
      })
      .finally(() => {
        // console.info("done");
      });
  };

  useEffect(() => {
    let maintenanceId = params.get("maintenanceId");
    if (maintenanceId) {
      getRepairMan(maintenanceId);
    }
    return () => {
      setRepairmanState([]);
      // setIsReturn(false);
    };
  }, []);

  return (
    // <BaseCard title="รายการอุปกรณ์" avatar={<Archive size={20} />}>
    <Grid2 container spacing={3} p={"22px"}>
      <Grid2 size={12} container>
        <Grid2 size={6} container>
          <Grid2 container alignItems="center">
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <Engineering />
            </Avatar>
            <Typography variant="h4" gutterBottom mt={0.5}>
              รายการผู้ซ่อมแซม
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
              <TableCell>
                <Typography color="textSecondary" variant="h6">
                  ผู้ซ่อมเเซม
                </Typography>
              </TableCell>
              <TableCell>
                <Typography color="textSecondary" variant="h6">
                  หน้าที่
                </Typography>
              </TableCell>
              <TableCell>
                <Typography color="textSecondary" variant="h6">
                  ชั่วโมงทำงาน
                </Typography>
              </TableCell>
              <TableCell>
                <Typography color="textSecondary" variant="h6">
                  ค่าใช้จ่าย
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
                {repairmanState.length === 0 && loading === false && (
                  <TableRow key={"ERROR101"}>
                    <TableCell colSpan={6}>
                      <Grid2 container size={12} justifyContent="center">
                        <NotFound
                          title="โปรดเพิ่มข้อมูลลงในตาราง"
                          description="เมื่อคุณเพิ่มรายการเเล้วตารางจะเเสดงผลที่คุณเพิ่ม"
                        />
                      </Grid2>
                    </TableCell>
                  </TableRow>
                )}
                {repairmanState.map((engineer: Repairman, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography
                        sx={{ fontWeight: "bold" }}
                        variant="body1"
                        mb={1}
                      >
                        {engineer.user?.name}
                      </Typography>
                      {!engineer.repairmanId && (
                        <Chip label="ใหม่" variant="filled" color="success" />
                      )}
                    </TableCell>
                    <TableCell>{engineer.activities}</TableCell>
                    <TableCell>{engineer.manHours}</TableCell>
                    <TableCell>{engineer.cost}</TableCell>
                    <TableCell>
                      {engineer.maintenanceId ? (
                        <ConfirmRemove
                          itemId={engineer}
                          buttonName="ยกเลิกการมอบหมายงาน"
                          onDelete={cancleEngineer}
                          massage={`หากคุณยกเลิกการรายการนี้ รายการนี้จะไม่รวมในใบเสนอราคา เเละข้อมูลการเเจ้งจะไม่ถูกนำไปประมวณผลในการออกรายงานทุกรูปแบบ "กดยืนยันเพื่อดำเนินการต่อ"`}
                        />
                      ) : (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveRepairMan(engineer.userId)}
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

export default ListRepairManTable;
