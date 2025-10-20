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
import { BrokenItems, Part } from "@/interfaces/Maintenance";
import { uniqueId } from "lodash";

interface TableProps {
  // data: any;
  returning?: boolean;
}

const ListPartTable: React.FC<TableProps> = ({ returning = false }) => {
  const {
    setBrokenItemsSelect,
    brokenItemsState,
    removePartFromBrokenItem,
    setBrokenItemsState,
  } = useMaintenanceContext();
  const { setNotify, notify } = useNotifyContext();
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const localActive = useLocale();
  const [loading, setLoading] = useState<boolean>(false);

  const canclePartItem = (brokenItemsId: BrokenItems, part: Part) => {
    axios
      .delete(`/api/maintenance/part?partId=${part.partId}`)
      .then(({ data }) => {
        removePartFromBrokenItem(
          brokenItemsId.brokenItemsId,
          part.partIdTemp,
          part.partId
        );

        setNotify({
          ...notify,
          open: true,
          message: "การดำเนินการสำเร็จ",
          color: "success",
        });
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
      .get(`/api/maintenance/broken-item?maintenanceId=${maintenanceId}`)
      .then(({ data }) => {
        console.log(data);

        setBrokenItemsState(data);

        const result = data.map((item: any) => ({
          brokenItemId: item?.brokenItemsId,
          brokenItemName: item?.equipment?.equipmentName,
        }));

        setBrokenItemsSelect(result);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      })
      .finally(() => {});
  };

  useEffect(() => {
    let maintenanceId = params.get("maintenanceId");
    if (maintenanceId) {
      getBrokenItems(maintenanceId);
    }
    return () => {
      setBrokenItemsState([]);
    };
  }, []);

  return (
    <Grid2 container spacing={3} p={"22px"}>
      <Grid2 size={12} container>
        <Grid2 size={6} container>
          <Grid2 container alignItems="center">
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <Cog size={20} />
            </Avatar>
            <Typography variant="h4" gutterBottom mt={0.5}>
              รายการอะไหล่
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
                <Typography
                  color="textSecondary"
                  variant="h6"
                  sx={{ width: "10px" }}
                >
                  #
                </Typography>
              </TableCell>
              <TableCell sx={{ width: "300px" }}>
                <Typography color="textSecondary" variant="h6">
                  อุปกรณ์
                </Typography>
              </TableCell>
              <TableCell sx={{ width: "50px" }}>
                <Typography color="textSecondary" variant="h6">
                  จำนวน
                </Typography>
              </TableCell>
              <TableCell sx={{ width: "150px" }}>
                <Typography color="textSecondary" variant="h6">
                  ราคา
                </Typography>
              </TableCell>
              <TableCell sx={{ width: "150px" }}>
                <Typography color="textSecondary" variant="h6">
                  รวม
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
                {brokenItemsState.length === 0 && loading === false && (
                  <TableRow key={"ERROR101"}>
                    <TableCell colSpan={10}>
                      <Grid2 container size={12} justifyContent="center">
                        <NotFound
                          title="โปรดข้อมูลลงในตาราง"
                          description="เมื่อคุณเพิ่มรายการเเล้วตารางจะเเสดงผลที่คุณเพิ่ม"
                        />
                      </Grid2>
                    </TableCell>
                  </TableRow>
                )}
                {brokenItemsState.map((brokenItem: BrokenItems, itemIndex) => (
                  <React.Fragment key={uniqueId()}>
                    <TableRow>
                      <TableCell>{itemIndex + 1}</TableCell>
                      <TableCell colSpan={7}>
                        {/* <Typography sx={{ fontWeight: "bold" }}>
                          {brokenItem.equipment?.equipmentName || "ไม่ระบุ"}
                        </Typography> */}
                        <Typography
                          sx={{ fontWeight: "bold" }}
                          variant="body1"
                          mb={1}
                        >
                          {brokenItem.equipment?.equipmentName
                            ? brokenItem.equipment.equipmentName
                            : brokenItem.equipmentName}
                        </Typography>
                        <Typography variant="body2" mb={1}>
                          {brokenItem.equipment?.serialNo}
                        </Typography>
                      </TableCell>
                    </TableRow>

                    {/* 🛠️ แก้ไข: ใช้ ?.map() ป้องกัน error */}
                    {brokenItem.parts?.map((part: Part, partIndex) => (
                      <TableRow key={uniqueId()}>
                        <TableCell>
                          {/* {itemIndex + 1}.{partIndex + 1} */}
                        </TableCell>
                        <TableCell>
                          <span>
                            <b style={{ marginRight: "1em" }}>
                              {itemIndex + 1}.{partIndex + 1}
                            </b>
                            {part.partName}
                            {!part.partId && (
                              <Chip
                                sx={{ ml: 1 }}
                                label="ใหม่"
                                variant="filled"
                                color="success"
                              />
                            )}
                          </span>
                        </TableCell>
                        <TableCell>{part.quantity}</TableCell>
                        <TableCell>{formatNumber(part.partPrice)}</TableCell>
                        <TableCell>
                          {formatNumber(part.partPrice * part.quantity)}
                        </TableCell>
                        <TableCell>
                          {part.partId ? (
                            <ConfirmRemove
                              itemId={brokenItem}
                              subItemId={part}
                              buttonName="ยกเลิกอะไหล่"
                              onDelete={canclePartItem}
                              massage={`หากคุณยกเลิกการรายการนี้ รายการนี้จะไม่รวมในใบเสนอราคา เเละข้อมูลการเเจ้งจะไม่ถูกนำไปประมวณผลในการออกรายงานทุกรูปแบบ "กดยืนยันเพื่อดำเนินการต่อ"`}
                            />
                          ) : (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                removePartFromBrokenItem(
                                  brokenItem.brokenItemsId,
                                  part.partIdTemp,
                                  part.partId
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
                  </React.Fragment>
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

export default ListPartTable;
