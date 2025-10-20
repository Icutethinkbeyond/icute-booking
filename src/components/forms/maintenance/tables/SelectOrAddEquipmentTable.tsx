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
  BuildCircle,
  Handyman,
  BrokenImage,
  Hardware,
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
import { BrokenItems, Repairman } from "@/interfaces/Maintenance";
import Status from "@/components/shared/used/Status";
import { RepairStatus } from "@prisma/client";

interface TableProps {
  // data: any;
  repaired?: boolean;
  handleNext?: () => void;
}

const SelectOrAddEquipmentTable: React.FC<TableProps> = ({
  repaired = false,
  handleNext,
}) => {
  const {
    brokenItemForm,
    addBrokenItem,
    brokenItemsState,
    setBrokenItemForm,
    setBrokenItemsState,
    handleRemoveBrokenItem,
  } = useMaintenanceContext();
  const { setNotify, notify } = useNotifyContext();
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const localActive = useLocale();

  const [isReturn, setIsReturn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const getBrokenItems = (maintenanceId: string | null) => {
    
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
      .get(
        `/api/maintenance/broken-item?maintenanceId=${maintenanceId}&get-all-broken=true`
      )
      .then(({ data }) => {
        setBrokenItemsState(data);
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
        // console.info("done");
      });
  };

  const cancleBrokenItem = (brokenItem: BrokenItems) => {
    axios
      .delete(
        `/api/maintenance/broken-item?brokenItemId=${brokenItem.brokenItemsId}`
      )
      .then(({ data }) => {
        setNotify({
          ...notify,
          open: true,
          message: "การดำเนินการสำเร็จ",
          color: "success",
        });

        handleRemoveBrokenItem(
          brokenItem.brokenItemsId,
          brokenItem.equipmentOwner,
          brokenItem.brokenItemsIdTemp
        );

        getBrokenItems(params.get("maintenanceId"));
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

  const updateRepairCompleted = (brokenItem: BrokenItems) => {
    axios
      .patch(`/api/maintenance/broken-item?update-completed=true`, brokenItem)
      .then(({ data }) => {
        setNotify({
          ...notify,
          open: true,
          message: "การดำเนินการสำเร็จ",
          color: "success",
        });

        getBrokenItems(params.get("maintenanceId"));

        if (Boolean(data.nextStep) === true) {
          handleNext && handleNext();
        }

        // getBrokenItems(params.get("maintenanceId"));
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

  const updateRepairUnrepairable = (brokenItem: BrokenItems) => {
    axios
      .patch(
        `/api/maintenance/broken-item?update-unrepairable=true`,
        brokenItem
      )
      .then(({ data }) => {
        setNotify({
          ...notify,
          open: true,
          message: "การดำเนินการสำเร็จ",
          color: "success",
        });

        getBrokenItems(params.get("maintenanceId"));

        if (Boolean(data.nextStep) === true) {
          handleNext && handleNext();
        }

        // getBrokenItems(params.get("maintenanceId"));
      })
      .catch((error) => {
          console.error("Fetch error:", error);
          setNotify({
            ...notify,
            open: true,
            message: "พบปัญหาบางอย่างโปรดติดต่อผู้พัฒนา",
            color: "error",
          });
      })
      .finally(() => {});
  };

  useEffect(() => {
    setBrokenItemsState([]);
    let maintenanceId = params.get("maintenanceId");
    getBrokenItems(maintenanceId);

    return () => {
      setIsReturn(false);
      setBrokenItemsState([]);
      // setRentalsState([]);
      // setLoading(true);
    };
  }, []);


  return (
    <Grid2 container spacing={3} p={"22px"}>
      <Grid2 size={12} container>
        <Grid2 size={6} container>
          <Grid2 container alignItems="center">
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <BuildCircle />
            </Avatar>
            <Typography variant="h4" gutterBottom mt={0.5}>
              รายการรอซ่อมแซม
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
                  ชื่ออุปกรณ์
                </Typography>
              </TableCell>
              <TableCell>
                <Typography color="textSecondary" variant="h6">
                  ที่มาอุปกรณ์
                </Typography>
              </TableCell>
              <TableCell>
                <Typography color="textSecondary" variant="h6">
                  {!repaired ? "ลบ" : "สถานะซ่อม"}
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
                {brokenItemsState?.length === 0 && !loading && (
                  <TableRow key={"ERROR101"}>
                    <TableCell colSpan={4}>
                      <Grid2 container size={12} justifyContent="center">
                        <NotFound
                          title="โปรดเพิ่มข้อมูลลงในตาราง"
                          description="เมื่อคุณเพิ่มรายการเเล้วตารางจะเเสดงผลที่คุณเพิ่ม"
                        />
                      </Grid2>
                    </TableCell>
                  </TableRow>
                )}
                {brokenItemsState &&
                  brokenItemsState.map((brokenItem: BrokenItems, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body1" mb={1}>
                          {brokenItem.equipment?.equipmentName
                            ? brokenItem.equipment.equipmentName
                            : brokenItem.equipmentName}
                        </Typography>
                        <Typography variant="body2" mb={1}>
                          {brokenItem.equipment?.serialNo}
                        </Typography>
                        {!brokenItem.equipmentId && (
                          <Chip label="ใหม่" variant="filled" color="success" />
                        )}
                      </TableCell>
                      <TableCell>
                        {<Status status={brokenItem.equipmentOwner} />}
                      </TableCell>
                      <TableCell>
                        {brokenItem.equipment?.equipmentName ? (
                          !repaired ? (
                            <ConfirmRemove
                              itemId={brokenItem}
                              buttonName="ยกเลิกการแจ้งซ่อม"
                              onDelete={cancleBrokenItem}
                              massage={`หากคุณยกเลิกการรายการนี้ รายการนี้จะไม่รวมในใบเสนอราคา เเละข้อมูลการเเจ้งจะไม่ถูกนำไปประมวณผลในการออกรายงานทุกรูปแบบ "กดยืนยันเพื่อดำเนินการต่อ"`}
                            />
                          ) : (
                            <>
                              {brokenItem.repairStatus ===
                              RepairStatus.Waiting ? (
                                <>
                                  <ConfirmRemove
                                    itemId={brokenItem}
                                    buttonName="ซ่อมสำเร็จ"
                                    onDelete={updateRepairCompleted}
                                    iconButton={<Hardware />}
                                    colorButton="success"
                                    massage={`โปรดตรวจสอบ "สถานะ" การซ่อมเเซมก่อนบันทึกผล`}
                                  />
                                  <ConfirmRemove
                                    itemId={brokenItem}
                                    buttonName="ซ่อมไม่สำเร็จ"
                                    onDelete={updateRepairUnrepairable}
                                    iconButton={<BrokenImage />}
                                    colorButton="error"
                                    massage={`โปรดตรวจสอบ "สถานะ" การซ่อมเเซมก่อนบันทึกผล`}
                                  />
                                </>
                              ) : (
                                <Status status={brokenItem.repairStatus} />
                              )}
                            </>
                          )
                        ) : (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              handleRemoveBrokenItem(
                                brokenItem.brokenItemsId,
                                brokenItem.equipmentOwner,
                                brokenItem.brokenItemsIdTemp
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

export default SelectOrAddEquipmentTable;
