import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Grid2,
  Autocomplete,
  Button,
} from "@mui/material";
import { Field, FieldProps, Form, Formik } from "formik";
import { useEquipmentContext } from "@/contexts/EquipmentContext";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { EquipmentSelect, initialEquipment } from "@/interfaces/Equipment";
import axios from "axios";
import * as Yup from "yup";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { Rental, initialRental } from "@/interfaces/Rental";
import { useRentalContext } from "@/contexts/RentalContext";
import { LoadingButton } from "@mui/lab";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { EquipmentStatus } from "@prisma/client";
import ListRentalTable from "./tables/ListRentalTable";
import { Save } from "lucide-react";
import { useDocumentContext } from "@/contexts/DocumentContext";

interface RentalEquipmentProps {
  handleNext?: () => void;
  handleBack: () => void;
  setActive?: (value: number) => void
}

const RentalEquipmentForm: React.FC<RentalEquipmentProps> = ({
  handleBack,
  handleNext,
  setActive
}) => {
  const {
    setEquipment,
    equipment,
    equipmentSelectState,
    setEquipmentSelectState,
  } = useEquipmentContext();

  const {
    rentalForm,
    setRentalForm,
    addRental,
    rentalsState,
    setRentalsState,
  } = useRentalContext();
  const { setHandleBack } = useDocumentContext();

  const router = useRouter();
  const localActive = useLocale();
  const params = useSearchParams();
  const pathname = usePathname();

  const [disableRenting, setDisableRenting] = useState(true);
  const { setNotify, notify, openBackdrop, setOpenBackdrop } =
    useNotifyContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validationSchema = Yup.object().shape({
    equipmentId: Yup.string().required("โปรดเลือกอุปกรณ์"),
    erentionDatePlan: Yup.date().required("โปรดกำหนดวันที่"),
    dismantlingDatePlan: Yup.date()
      .nullable()
      .test(
        "is-greater",
        "วันสิ้นสุดต้องไม่น้อยกว่าวันเริ่มต้น",
        function (value) {
          const { erentionDatePlan } = this.parent;
          if (!erentionDatePlan || !value) return true; // ถ้าวันเริ่มต้นหรือวันสิ้นสุดว่าง ไม่ต้องตรวจสอบ
          return value >= erentionDatePlan; // วันสิ้นสุดต้องมากกว่าหรือเท่ากับวันเริ่มต้น
        }
      ),
  });

  const handleFormSubmit = (
    value: Rental,
    { resetForm, validateForm }: any
  ) => {
    let documentId = params.get("documentId");
    if (!documentId) {
      return;
    }

    value = { ...value, documentId: documentId, equipment: equipment };
    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    addRental(value);
    setEquipment(initialEquipment);
    setRentalForm(initialRental);
    resetForm(); // รีเซ็ตค่าฟอร์ม
  };

  const getReadyForRentalList = () => {
    axios
      .get(`/api/equipment?ready-for-rental-list=true`)
      .then(({ data }) => {
        if (data.data?.length === 0) {
          setNotify({
            ...notify,
            open: true,
            message: "พบปัญหาบางอย่างโปรดติดต่อผู้พัฒนา",
            color: "error",
          });
        } else {
          setEquipmentSelectState(data.data);
        }
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

  const getEquipment = (equipmentId: string) => {
    axios
      .get(`/api/equipment?equipmentId=${equipmentId}`)
      .then(({ data }) => {
        // console.log(data);
        setEquipment(data);
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

    axios
      .get(`/api/rental?documentId=${documentId}`)
      .then(({ data }) => {
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

  const createRental = () => {
    setOpenBackdrop(true);
    axios
      .post("/api/rental", rentalsState)
      .then(({ data }) => {
        setNotify({
          ...notify,
          open: true,
          message: "การดำเนินการสำเร็จ",
          color: "success",
        });
        setOpenBackdrop(false);
        handleNext && handleNext();
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

  // const cancleDocument = (documentId: string | null) => {
  //   if (!documentId) {
  //     setOpenDialog(true);
  //     setNoti({
  //       ...noti,
  //       message: "โปรดตรวจสอบ Document ID",
  //       notiColor: "error",
  //     });
  //   }
  //   axios
  //     .patch(`/api/rental/cancel?cancle=true&documentId=${documentId}`)
  //     .then(({ data }) => {
  //       setOpenDialog(true);
  //       setNoti({
  //         ...noti,
  //         message: `ยกเลิกการใช้งานเอกสารเเล้ว`,
  //         notiColor: "success",
  //       });
  //     })
  //     .catch((error) => {
  //       if (error.name === "AbortError") {
  //         console.log("Request cancelled");
  //       } else {
  //         console.error("Fetch error:", error);
  //         setOpenDialog(true);
  //         setNoti({
  //           ...noti,
  //           message: error.response.data,
  //           notiColor: "error",
  //         });
  //       }
  //     })
  //     .finally(() => {});
  // };

  useEffect(() => {
    equipment?.aboutEquipment?.stockStatus === EquipmentStatus.InStock
      ? setDisableRenting(false)
      : setDisableRenting(true);
  }, [equipment?.aboutEquipment?.stockStatus]);

  const loadAllData = async () => {
    let documentId = params.get("documentId");
    setOpenBackdrop(true);
    try {
      console.log("⏳ Loading data...");
      await Promise.all([getReadyForRentalList(), getRentalList(documentId)]);
      setOpenBackdrop(false);
    } catch (error) {
      console.error("❌ Error loading data:", error);
    }
  };

  useEffect(() => {
    loadAllData();

    return () => {
      setEquipment(initialEquipment);
      setDisableRenting(true);
      setIsLoading(false);
      setRentalForm(initialRental);
      setEquipmentSelectState([]);
    };
  }, []);

  return (
    <>
      <Formik<Rental>
        initialValues={rentalForm} // ใช้ state เป็น initialValues
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
        enableReinitialize // เพื่อให้ Formik อัปเดตค่าจาก useState
      >
        {({ errors, touched, setFieldValue, values }) => (
          <Form>
            <Box p={3} border="1px solid #ccc" borderRadius="8px">
              <Typography variant="h4" gutterBottom>
                กำหนดอุปกรณ์สำหรับการเช่า
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                โปรดเลือกอุปกรณ์ที่จะให้ลูกค้าเช่า
                โดยระบบจะแสดงรายการพร้อมเช่าเท่านั้น
              </Typography>
              <Grid2 container spacing={2} mt={3}>
                <Grid2 size={6}>
                  {/* เลือกชื่ออุปกรณ์ */}
                  <Field name="equipmentId">
                    {({ field }: FieldProps) => (
                      <Autocomplete
                        id="equipmentId"
                        options={equipmentSelectState}
                        getOptionLabel={(option: EquipmentSelect) =>
                          `${option.equipmentName} - (${option.serialNo})`
                        }
                        loading
                        value={
                          equipmentSelectState.find(
                            (option) =>
                              option.equipmentId === values.equipmentId
                          ) || null
                        }
                        onChange={(event, value) => {
                          setFieldValue(
                            "equipmentId",
                            value !== null ? value.equipmentId : ""
                          );
                          getEquipment(value !== null ? value.equipmentId : "");
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="อุปกรณ์ (จำเป็น)"
                            name="equipmentId"
                            error={
                              touched.equipmentId && Boolean(errors.equipmentId)
                            }
                            helperText={
                              touched.equipmentId && errors.equipmentId
                            }
                          />
                        )}
                      />
                    )}
                  </Field>
                </Grid2>
                <Grid2 size={6}>
                  {/* วันที่เริ่มเช่า หรือ วันที่ติดตั้ง */}
                  <Field name="erentionDatePlan">
                    {({ field }: FieldProps) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="วันที่เริ่มเช่า หรือ วันที่ติดตั้ง (จำเป็น)"
                          name="erentionDatePlan"
                          // disableFuture
                          value={
                            values.erentionDatePlan !== undefined
                              ? values.erentionDatePlan
                              : null
                          }
                          disabled={disableRenting}
                          format="DD/MM/YYYY"
                          onChange={(newValue) => {
                            setFieldValue("erentionDatePlan", newValue);
                          }}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: Boolean(
                                touched.erentionDatePlan &&
                                  errors.erentionDatePlan
                              ),
                              helperText:
                                touched.erentionDatePlan &&
                                errors.erentionDatePlan
                                  ? String(errors.erentionDatePlan)
                                  : "",
                            },
                          }}
                        />
                      </LocalizationProvider>
                    )}
                  </Field>
                </Grid2>
              </Grid2>
              <Grid2
                spacing={1}
                container
                size={12}
                justifyContent="flex-end"
                alignItems="flex-end"
                mt={4}
              >
                <Button variant="outlined" onClick={handleBack} sx={{ mr: 1 }}>
                  ย้อนกลับ
                </Button>
                <LoadingButton
                  variant="contained"
                  type="submit"
                  color="primary"
                  sx={{ mr: 1 }}
                  loading={isLoading}
                >
                  {/* {!documentEdit ? "เพิ่มเอกสาร" : "แก้ไขเอกสาร"} */}
                  เพิ่มอุปกรณ์ลงในรายการเช่า
                </LoadingButton>
              </Grid2>
              {/* </Grid2> */}
            </Box>
          </Form>
        )}
      </Formik>
      <Box mt={2} />
      <ListRentalTable />
      <Grid2 container justifyContent={"center"} mt={2}>
        <LoadingButton
          variant="contained"
          type="submit"
          color="primary"
          sx={{ mr: 1 }}
          loading={isLoading}
          startIcon={<Save />}
          onClick={() => createRental()}
        >
          บันทึกรายการเช่า
        </LoadingButton>
        {/* <ConfirmRemove
          itemId={params.get("documentId") ? params.get("documentId") : ""}
          onDelete={cancleDocument}
          massage={`หากคุณยกเลิกเอกสาร ข้อมูลการยืมของเอกสารฉบับนี้จะไม่ถูกนำไปประมวณผลในการออกรายงานทุกรูปแบบ "กดยืนยันเพื่อดำเนินการต่อ"`}
        /> */}
      </Grid2>
    </>
  );
};

export default RentalEquipmentForm;
