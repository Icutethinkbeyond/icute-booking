import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Grid2,
  Autocomplete,
  Button,
  Avatar,
  Radio,
} from "@mui/material";
import { Field, FieldProps, Form, Formik } from "formik";
import { useEquipmentContext } from "@/contexts/EquipmentContext";
import { EquipmentSelect, initialEquipment } from "@/interfaces/Equipment";
import axios from "axios";
import { LoadingButton } from "@mui/lab";
import { DocumentCategory, EquipmentOwner } from "@prisma/client";
import * as Yup from "yup";
import {
  FileText,
  FolderInput,
  Hammer,
  SquareMousePointer,
} from "lucide-react";
import { BrokenItems, initialBrokenItems } from "@/interfaces/Maintenance";
import { useMaintenanceContext } from "@/contexts/MaintenanceContext";
import { DeliveryCard } from "@/components/shared/used/DeliveryCard";
import { usePathname, useSearchParams } from "next/navigation";
import SelectOrAddEquipmentTable from "./tables/SelectOrAddEquipmentTable";
import { BuildCircle } from "@mui/icons-material";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { uniqueId } from "lodash";
import { useDocumentContext } from "@/contexts/DocumentContext";

const validationSchema = Yup.object().shape({
  equipmentOwner: Yup.string()
    .oneOf([EquipmentOwner.Plant, EquipmentOwner.Site])
    .required("กรุณาเลือกที่มาอุปกรณ์"),

  equipmentId: Yup.string().when("equipmentOwner", {
    is: EquipmentOwner.Plant, // ถ้า equipmentOwner เป็น Plant → Validate equipmentId
    then: (schema) => schema.required("กรุณากรอกหมายเลขอุปกรณ์"),
    otherwise: (schema) => schema.notRequired(), // ถ้าไม่ใช่ ไม่ต้อง validate
  }),

  // equipmentName: Yup.string().when("equipmentOwner", {
  //   is: EquipmentOwner.Site, // ถ้า equipmentOwner เป็น false → Validate equipmentName
  //   then: (schema) => schema.required("กรุณากรอกชื่ออุปกรณ์"),
  //   otherwise: (schema) => schema.notRequired(),
  // }),

  equipmentName: Yup.string().required("กรุณากรอกชื่ออุปกรณ์"), // ✅ ต้องกรอกเสมอ
});

interface RentalEquipmentProps {
  documentCategory: DocumentCategory;
  handleNext?: () => void;
  handleBack?: () => void;
  viewOnly?: boolean;
  setActiveStep?: (value: number) => void;
}

const SelectOrAddEquipmentForm: React.FC<RentalEquipmentProps> = ({
  viewOnly = false,
  handleBack,
  handleNext,
  documentCategory,
  setActiveStep,
}) => {
  const { equipmentSelectState, setEquipmentSelectState } =
    useEquipmentContext();
  const { setHandleBack } = useDocumentContext();
  const { setNotify, setOpenBackdrop, notify, openBackdrop } =
    useNotifyContext();
  const {
    brokenItemForm,
    addBrokenItem,
    brokenItemsState,
    setBrokenItemForm,
    setBrokenItemsState,
  } = useMaintenanceContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const params = useSearchParams();
  const pathname = usePathname();

  const handleFormSubmit = (
    value: BrokenItems,
    { resetForm, validateForm }: any
  ) => {
    let maintenanceId = params.get("maintenanceId");
    if (!maintenanceId) {
      return;
    }

    // console.log(value);
    value = {
      ...value,
      maintenanceId: maintenanceId,
      brokenItemsIdTemp: uniqueId(),
    };

    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    setIsLoading(true);
    addBrokenItem(value);
    resetForm(); // รีเซ็ตค่าฟอร์ม
    setIsLoading(false);
  };

  const updateBrokenItems = () => {
    if (brokenItemsState.length === 0) {
      setNotify({
        ...notify,
        open: true,
        message: `โปรดเพิ่มอุปกรณ์ที่ต้องการซ่อมเเซม`,
        color: "error",
      });
      return;
    }
    setOpenBackdrop(true);
    setIsLoading(true);
    axios
      .post(`/api/maintenance/broken-item`, brokenItemsState)
      .then(({ data }) => {
        setNotify({
          ...notify,
          open: true,
          message: `เเก้ไขอุปกรณ์รอซ่อมเเล้ว`,
          color: "success",
        });

        setIsLoading(false);

        handleNext && handleNext();
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Request cancelled");
        } else {
          console.error("Fetch error:", error);
          setNotify({
            ...notify,
            open: true,
            message: error.response.data,
            color: "error",
          });
        }
      })
      .finally(() => {
        setOpenBackdrop(false);
      });
  };

  const getReadyForFixList = () => {
    axios
      .get(`/api/equipment?ready-for-fix-list=true`)
      .then(({ data }) => {
        setEquipmentSelectState(data.data);
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

  const onHandleBack = () => {
    let repairLocation = params.get("repairLocation");
    if (repairLocation && repairLocation === "OnSite") {
      handleBack && handleBack();
    } else {
      setActiveStep && setActiveStep(0);
      setHandleBack(true);
    }
  };

  useEffect(() => {
    // let maintenanceId = params.get("maintenanceId");
    getReadyForFixList();

    if (pathname.includes("new")) {
    } else {
      // setRentalEdit(true);
    }
    return () => {
      setBrokenItemsState([]);
      setIsLoading(false);
      setBrokenItemForm(initialBrokenItems);
      setEquipmentSelectState([]);
    };
  }, []);

  return (
    <>
      <Formik<BrokenItems>
        initialValues={brokenItemForm} // ใช้ state เป็น initialValues
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
        enableReinitialize // เพื่อให้ Formik อัปเดตค่าจาก useState
      >
        {({ errors, touched, setFieldValue, values, isSubmitting }) => (
          <Form>
            <Box
              p={3}
              border={viewOnly ? "none" : "1px solid #ccc"}
              borderRadius="8px"
            >
              <Grid2 container spacing={2}>
                <Grid2 size={6} mt={5}>
                  <Grid2 size={{ xs: 12 }} mb={5}>
                    <Grid2 container alignItems="center">
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <FolderInput size={20} />
                      </Avatar>
                      <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                        กำหนดที่มาของอุปกรณ์
                      </Typography>
                    </Grid2>
                  </Grid2>
                  <Grid2 size={12} spacing={2} container mb={2} ml={1}>
                    <Field name="equipmentOwn">
                      {({ field }: FieldProps) => (
                        <>
                          {Object.keys(EquipmentOwner).map((option, index) => (
                            <Grid2
                              container
                              mb={2}
                              flexDirection={"column"}
                              key={index}
                            >
                              <DeliveryCard
                                key={option}
                                isSelected={values.equipmentOwner === option}
                                onClick={() =>
                                  setFieldValue("equipmentOwner", option)
                                }
                                elevation={0}
                              >
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      color:
                                        values.equipmentOwner === option
                                          ? "#fff"
                                          : "text.primary",
                                      mb: 0.5,
                                    }}
                                  >
                                    {option}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                  }}
                                >
                                  <Radio
                                    checked={values.equipmentOwner === option}
                                    disabled={isSubmitting || isLoading}
                                    onChange={() =>
                                      setFieldValue("equipmentOwner", option)
                                    }
                                    value={option}
                                    name="delivery-method"
                                    sx={{
                                      "&.Mui-checked": {
                                        color: "#fff",
                                      },
                                    }}
                                  />
                                </Box>
                              </DeliveryCard>
                            </Grid2>
                          ))}
                        </>
                      )}
                    </Field>
                  </Grid2>
                </Grid2>
                {values.equipmentOwner === EquipmentOwner.Plant ? (
                  <>
                    <Grid2 size={{ xs: 12 }} mb={2}>
                      <Grid2 container alignItems="center">
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          <SquareMousePointer size={20} />
                        </Avatar>
                        <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                          เลือกอุปกรณ์จากคลัง
                        </Typography>
                      </Grid2>
                    </Grid2>
                    <Grid2 size={12} container>
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
                            fullWidth
                            onChange={(event, value) => {
                              setFieldValue(
                                "equipmentId",
                                value !== null ? value.equipmentId : ""
                              );
                              setFieldValue(
                                "equipmentName",
                                value !== null ? value.equipmentName : ""
                              );
                              // getEquipment(
                              //   value !== null ? value.equipmentId : ""
                              // );
                            }}
                            disabled={isSubmitting || isLoading}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="อุปกรณ์ (จำเป็น)"
                                name="equipmentId"
                                error={
                                  touched.equipmentId &&
                                  Boolean(errors.equipmentId)
                                }
                                disabled={isSubmitting || isLoading}
                                helperText={
                                  touched.equipmentId && errors.equipmentId
                                }
                              />
                            )}
                          />
                        )}
                      </Field>
                    </Grid2>
                  </>
                ) : (
                  <>
                    <Grid2 size={{ xs: 12 }} mb={2}>
                      <Grid2 container alignItems="center">
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          <FileText size={20} />
                        </Avatar>
                        <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                          กำหนดรายละเอียดอุปกรณ์
                        </Typography>
                      </Grid2>
                    </Grid2>
                    {/* Equipment Name */}
                    <Grid2 size={{ xs: 12 }} container>
                      <Field name="brokenItems.equipmentName">
                        {({ field }: FieldProps) => (
                          <TextField
                            {...field}
                            name="equipmentName"
                            label="ชื่ออุปกรณ์ (จำเป็น)"
                            value={values.equipmentName}
                            onChange={(e) => {
                              setFieldValue("equipmentName", e.target.value);
                            }}
                            disabled={isSubmitting || isLoading}
                            error={
                              touched.equipmentName &&
                              Boolean(errors.equipmentName)
                            }
                            helperText={
                              touched.equipmentName && errors.equipmentName
                            }
                            fullWidth
                          />
                        )}
                      </Field>
                    </Grid2>
                  </>
                )}
              </Grid2>

              <Grid2
                spacing={1}
                container
                size={12}
                mt={5}
                justifyContent="flex-end"
                alignItems="flex-end"
              >
                <Button
                  variant="outlined"
                  onClick={() => onHandleBack()}
                  sx={{ mr: 1 }}
                  disabled={isSubmitting || isLoading}
                >
                  ย้อนกลับ
                </Button>
                <LoadingButton
                  variant="contained"
                  type="submit"
                  color="primary"
                  sx={{ mr: 1 }}
                  loading={isLoading || isSubmitting}
                  disabled={isLoading || isSubmitting}
                  startIcon={<Hammer size={20} />}
                >
                  {" "}
                  กำหนดอุปกรณ์สำหรับซ่อม
                </LoadingButton>
              </Grid2>
            </Box>
          </Form>
        )}
      </Formik>
      <SelectOrAddEquipmentTable />
      <Grid2 container justifyContent={"center"} mt={2}>
        <LoadingButton
          variant="contained"
          type="submit"
          color="primary"
          sx={{ mr: 1 }}
          loading={isLoading}
          startIcon={<BuildCircle />}
          onClick={() => updateBrokenItems()}
        >
          {pathname.includes("new")
            ? "เพิ่มอุปกรณ์รอซ่อม"
            : "แก้ไขอุปกรณ์รอซ่อม"}
        </LoadingButton>
      </Grid2>
    </>
  );
};

export default SelectOrAddEquipmentForm;
