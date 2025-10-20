import React, { FC } from "react";
import { Box, Typography, Grid2, TextField } from "@mui/material";
import BaseCard from "@/components/shared/BaseCard";
import * as Yup from "yup";
import { Field, FieldProps, Form, Formik } from "formik";
import { LoadingButton } from "@mui/lab";
import { useCategoryContext } from "@/contexts/CategoryContext";
import { EquipmentType } from "@/interfaces/Category_Type";
import ConfirmDelete from "@/components/shared/used/ConfirmDelete";
import { ButtonType } from "@/interfaces/ShredType";

// Validation Schema
const validationSchema = Yup.object().shape({
  equipmentTypeName: Yup.string().required("กรุณากรอกชื่อประเภทอุปกรณ์"),
});

interface EquipmentTypeFormProps {
  handleSubmit: (value: EquipmentType) => void;
  isLoading: boolean;
}

const EquipmentTypeForm: FC<EquipmentTypeFormProps> = ({
  handleSubmit,
  isLoading,
}) => {
  const { typeForm, typeEdit } = useCategoryContext();

  const handleFormSubmit = (
    value: EquipmentType,
    { resetForm, validateForm }: any
  ) => {
    validateForm();
    handleSubmit(value);
    resetForm();
  };

  return (
    <BaseCard>
      <Formik<EquipmentType>
        initialValues={typeForm}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
        enableReinitialize
      >
        {({ errors, touched, values, setFieldValue, resetForm }) => (
          <Form>
            <Box p={3} border="1px solid #ccc" borderRadius="8px">
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12 }} sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    ประเภทอุปกรณ์
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    โปรดกำหนดรายละเอียดข้อมูลที่ต้องการ
                  </Typography>
                </Grid2>
                {/* Type Name */}
                <Grid2 size={{ xs: 12 }}>
                  <Field name="equipmentTypeName">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="equipmentTypeName"
                        label="ชื่อประเภทอุปกรณ์ (จำเป็น)"
                        value={values.equipmentTypeName}
                        onChange={(e) => {
                          setFieldValue("equipmentTypeName", e.target.value);
                        }}
                        error={
                          touched.equipmentTypeName &&
                          Boolean(errors.equipmentTypeName)
                        }
                        helperText={
                          touched.equipmentTypeName && errors.equipmentTypeName
                        }
                        fullWidth
                      />
                    )}
                  </Field>
                </Grid2>
                {/* Description */}
                <Grid2 size={{ xs: 12 }}>
                  <Field name="equipmentTypeDesc">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="equipmentTypeDesc"
                        multiline // เพิ่มคุณสมบัตินี้เพื่อทำให้ TextField เป็น textarea
                        rows={4}
                        label="คำอธิบาย (ถ้ามี)"
                        value={
                          values.equipmentTypeDesc
                            ? values.equipmentTypeDesc
                            : ""
                        }
                        onChange={(e) => {
                          setFieldValue("equipmentTypeDesc", e.target.value);
                        }}
                        fullWidth
                      />
                    )}
                  </Field>
                </Grid2>
              </Grid2>
            </Box>
            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <LoadingButton
                variant="contained"
                type="submit"
                color="primary"
                sx={{ mr: 1 }}
                loading={isLoading}
              >
                {!typeEdit ? "เพิ่มประเภทอุปกรณ์" : "แก้ไขประเภทอุปกรณ์"}
              </LoadingButton>
              <ConfirmDelete
                itemId={""}
                onDelete={() => resetForm()}
                massage={`คุณต้องการล้างฟอร์มใช่หรือไม่?`}
                buttonType={ButtonType.Button}
              />
            </Box>
          </Form>
        )}
      </Formik>
    </BaseCard>
  );
};

export default EquipmentTypeForm;
