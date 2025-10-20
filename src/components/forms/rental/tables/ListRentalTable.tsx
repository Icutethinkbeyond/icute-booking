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

import { calculateRentalDays, formatNumber } from "@/utils/utils";
import { Rental } from "@/interfaces/Rental";
import { useRentalContext } from "@/contexts/RentalContext";
import { Archive, Download, Trash2 } from "lucide-react";
import NotFound from "@/components/shared/used/NotFound";
import dayjs, { Dayjs } from "dayjs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useNotifyContext } from "@/contexts/NotifyContext";
import ConfirmRemove from "@/components/shared/used/ConfirmRemove";
import ConfirmInput from "@/components/shared/used/ConfirmInput";
import { useLocale } from "next-intl";
import { EquipmentStatus } from "@prisma/client";
import Status from "@/components/shared/used/Status";

interface TableProps {
  // data: any;
  returning?: boolean;
}

const ListRentalTable: React.FC<TableProps> = ({ returning = false }) => {
  const { rentalsState, handleRemoveRental, setRentalsState } =
    useRentalContext();
  const { setNotify, notify } = useNotifyContext();
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const localActive = useLocale();

  const [isReturn, setIsReturn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const returnEquipment = (
    rentalId: string,
    documentId: string,
    date: Dayjs
  ) => {
    axios
      .patch(
        `/api/rental/return?returnitem=true&rentalId=${rentalId}&documentId=${documentId}&date=${date}`
      )
      .then(({ data }) => {
        setNotify({
          ...notify,
          open: true,
          message: "การดำเนินการสำเร็จ",
          color: "success",
        });
        handleRemoveRental(rentalId);
        getRentalList(documentId);
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

  const handleRedirect = () => {
    router.push(`/${localActive}/protected/rental`);
  };

  const getRentalList = (documentId: string | null) => {
    if (!documentId) {
      setNotify({
        ...notify,
        open: true,
        message: "พบปัญหาบางอย่างโปรดติดต่อผู้พัฒนา",
        color: "error",
      });

      return;
    }
    // setLoading(true);
    axios
      .get(`/api/rental?documentId=${documentId}`)
      .then(({ data }) => {
        console.log(data);
        if (data.length === 0 && pathname.includes("return")) {
          handleRedirect();
        }
        setRentalsState(data);
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

  const cancleDocument = (rentalId: string | null) => {
    if (!rentalId) {
      setNotify({
        ...notify,
        open: true,
        message: "พบปัญหาบางอย่างโปรดติดต่อผู้พัฒนา",
        color: "error",
      });

      return;
    }
    axios
      .patch(`/api/rental/cancel?rentalcancle=true&rentalId=${rentalId}`)
      .then(({ data }) => {
        setNotify({
          ...notify,
          open: true,
          message: "การดำเนินการสำเร็จ",
          color: "success",
        });

        handleRedirect();
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

    if (documentId) {
      getRentalList(documentId);
    }

    if (pathname.includes("edit")) {
      if (documentId) {
        getRentalList(documentId);
      }
    } else {
      setIsReturn(true);
    }
    return () => {
      setIsReturn(false);
      setRentalsState([]);
      setLoading(true);
    };
  }, []);

  return (
    // <BaseCard title="รายการอุปกรณ์" avatar={<Archive size={20} />}>
    <Grid2 container spacing={3} p={"22px"}>
      <Grid2 size={12} container>
        <Grid2 size={6} container>
          <Grid2 container alignItems="center">
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <Archive size={20} />
            </Avatar>
            <Typography variant="h4" gutterBottom mt={0.5}>
              รายการให้เช่า-ยืม
            </Typography>
          </Grid2>
        </Grid2>
        <Grid2 size={6} container justifyContent={"flex-end"}>
          {isReturn && (
            <>
              {" "}
              <Button
                variant="outlined"
                color="primary"
                size="small"
                disabled
                startIcon={<Download />}
                // loading={loading}
              >
                ดาวน์โหลด
              </Button>
            </>
          )}
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
                  อุปกรณ์
                </Typography>
              </TableCell>
              <TableCell>
                <Typography color="textSecondary" variant="h6">
                  ราคาเช่า(ต่อเดือน)
                </Typography>
              </TableCell>
              <TableCell>
                <Typography color="textSecondary" variant="h6">
                  วันที่เริ่มเช่า
                </Typography>
              </TableCell>
              <TableCell>
                <Typography color="textSecondary" variant="h6">
                  สถานะอุปกรณ์
                </Typography>
              </TableCell>

              {isReturn ? (
                <>
                  <TableCell>
                    <Typography color="textSecondary" variant="h6">
                      ยืมมาเเล้ว/วัน
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="textSecondary" variant="h6">
                      คืนอุปกรณ์
                    </Typography>
                  </TableCell>
                </>
              ) : (
                <TableCell>
                  <Typography color="textSecondary" variant="h6">
                    ลบอุปกรณ์
                  </Typography>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow key={"ERROR101"}>
                <TableCell colSpan={6}>
                  <Grid2 container size={12} justifyContent="center" mt={5}>
                    <CircularProgress color="primary" />
                  </Grid2>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {rentalsState.length === 0 && !loading && (
                  <TableRow key={"ERROR101"}>
                    <TableCell colSpan={7}>
                      <Grid2 container size={12} justifyContent="center">
                        <NotFound
                          title="โปรดข้อมูลลงในตาราง"
                          description="เมื่อคุณเพิ่มรายการเเล้วตารางจะเเสดงผลที่คุณเพิ่ม"
                        />
                      </Grid2>
                    </TableCell>
                  </TableRow>
                )}
                {rentalsState.map((rental: Rental, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body1" mb={1}>
                        {rental.equipment?.equipmentName} 
                      </Typography>
                      <Typography variant="body2" mb={1}>
                        {rental.equipment?.serialNo}
                      </Typography>
                      {!rental.rentalId && (
                        <Chip label="ใหม่" variant="filled" color="success" />
                      )}
                    </TableCell>
                    <TableCell>
                      {rental.equipment?.aboutEquipment?.rentalPriceCurrent ===
                      0
                        ? ""
                        : formatNumber(
                            rental.equipment?.aboutEquipment?.rentalPriceCurrent
                          )} 
                    </TableCell>
                    <TableCell>
                      {dayjs(rental.erentionDatePlan).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell>
                      <Status
                        status={rental.equipment?.aboutEquipment?.stockStatus}
                      />
                    </TableCell>

                    {isReturn ? (
                      <>
                        <TableCell>
                          {rental.equipment?.aboutEquipment?.stockStatus ===
                          EquipmentStatus.CurrentlyRenting
                            ? calculateRentalDays(rental.erentionDatePlan)
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {rental.equipment?.aboutEquipment?.stockStatus ===
                          EquipmentStatus.CurrentlyRenting ? (
                            <ConfirmInput
                              rentalId={rental.rentalId}
                              documentId={rental.documentId}
                              onDelete={returnEquipment}
                              _erentionDatePlan={rental.erentionDatePlan}
                              lastItem={
                                rentalsState.length === 1 ? true : false
                              }
                              massage={`โปรดกำหนดวันที่คืนอุปกรณ์เพราะจำเป็นในการคำนวณ "รอบบิลถัดไป" กดยืนยันเพื่อดำเนินการต่อ`}
                            />
                          ) : (
                            ""
                          )}
                        </TableCell>
                      </>
                    ) : (
                      <TableCell>
                        {rental.rentalId ? (
                          <ConfirmRemove
                            itemId={rental.rentalId}
                            buttonName="ยกเลิกการยืม"
                            onDelete={cancleDocument}
                            massage={`หากคุณยกเลิกการยืมอุปกรณ์นี้ ข้อมูลการยืมจะไม่ถูกนำไปประมวณผลในการออกรายงานทุกรูปแบบ "กดยืนยันเพื่อดำเนินการต่อ"`}
                          />
                        ) : (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveRental(rental.rentalId)}
                          >
                            <Avatar sx={{ bgcolor: "primary.main" }}>
                              <Trash2 size={20} />
                            </Avatar>
                          </IconButton>
                        )}
                      </TableCell>
                    )}
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

export default ListRentalTable;
