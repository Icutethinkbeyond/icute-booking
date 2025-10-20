import React, {  Dispatch, FC, useState } from "react";
import {
  Box,
  Typography,
  Grid2,
  TextField,
  Avatar,
} from "@mui/material";
import BaseCard from "@/components/shared/BaseCard";
import { Category, initialCategory } from "@/interfaces/Category_Type";
import * as Yup from "yup";
import { Field, FieldProps, Form, Formik } from "formik";
import { LoadingButton } from "@mui/lab";
import { useCategoryContext } from "@/contexts/CategoryContext";
import ConfirmDelete from "@/components/shared/used/ConfirmDelete";
import { ButtonType } from "@/interfaces/ShredType";
import { useNotifyContext } from "@/contexts/NotifyContext";
import axios from "axios";
import CategoryIcon from "@mui/icons-material/Category";
import { categoryService } from "@/utils/services/api-services/CategoryApi";

const validationSchema = Yup.object().shape({
  categoryName: Yup.string().required("กรุณากรอกชื่อหมวดหมู่"),
});

interface CategoryFormProps {
  setRecall: Dispatch<React.SetStateAction<boolean>>;
  recall: boolean;
}

const CategoryForm: FC<CategoryFormProps> = ({ setRecall, recall }) => {
  const { categoryForm, categoryEdit } =
    useCategoryContext();
  const { setNotify, notify, setOpenBackdrop, openBackdrop } = useNotifyContext()

  // Handle form submission
  const handleFormSubmit = (
    value: Category,
    { resetForm, validateForm }: any
  ) => {
    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    if (categoryEdit) {
      handleUpdateCategory(value);
    } else {
      handleCreateCategory(value);
    }
    resetForm(); // รีเซ็ตค่าฟอร์ม
  };

  const handleUpdateCategory = async (category: Category) => {
    setOpenBackdrop(true);
    const result = await categoryService.updateCategory(category);
    setOpenBackdrop(false);
    setNotify({
      open: true,
      message: result.message,
      color: result.success ? "success" : "error",
    });
    if (result.success) {
      setRecall((prev) => !prev);
    }
  };

  const handleCreateCategory = async (category: Category) => {
    setOpenBackdrop(true);
    const result = await categoryService.createCategory(category);
    setOpenBackdrop(false);
    setNotify({
      open: true,
      message: result.message,
      color: result.success ? "success" : "error",
    });
    if (result.success) {
      setRecall((prev) => !prev);
    }
  };

  return (
    <BaseCard>
      <>
        <Formik
          initialValues={categoryForm} // ใช้ state เป็น initialValues
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
          enableReinitialize // เพื่อให้ Formik อัปเดตค่าจาก useState
        >
          {({ errors, touched, resetForm, values, setFieldValue }) => (
            <Form>
                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12 }} sx={{ mb: 1 }}>
                    <Grid2 size={{ xs: 12 }} mb={2}>
                      <Grid2 container alignItems="center">
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          <CategoryIcon fontSize="small" />
                        </Avatar>
                        <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                          หมวดหมู่อุปกรณ์
                        </Typography>
                      </Grid2>
                    </Grid2>
                  </Grid2>

                  <Grid2 size={{ xs: 12 }} mb={2}>
                    <Field name="categoryName">
                      {({ field }: FieldProps) => (
                        <TextField
                          {...field}
                          name="categoryName"
                          label="ชื่อหมวดหมู่ (จำเป็น)"
                          size="small"
                          value={values.categoryName}
                          onChange={(e) => {
                            setFieldValue("categoryName", e.target.value);
                          }}
                          error={
                            touched.categoryName && Boolean(errors.categoryName)
                          }
                          helperText={
                            touched.categoryName && errors.categoryName
                          }
                          fullWidth
                          slotProps={{
                            inputLabel: { shrink: true },
                          }}
                        />
                      )}
                    </Field>
                  </Grid2>
                  <Grid2 size={{ xs: 12 }}>
                    <Field name="categoryDesc">
                      {({ field }: FieldProps) => (
                        <TextField
                          {...field}
                          name="categoryDesc"
                          multiline 
                          rows={4}
                          slotProps={{
                            inputLabel: { shrink: true },
                          }}
                          size="small"
                          label="รายละเอียดหมวดหมู่ (ถ้ามี)"
                          value={values.categoryDesc ? values.categoryDesc : ""}
                          onChange={(e) => {
                            setFieldValue("categoryDesc", e.target.value);
                          }}
                          fullWidth
                        />
                      )}
                    </Field>
                  </Grid2>
                </Grid2>
              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <LoadingButton
                  variant="contained"
                  type="submit"
                  color="primary"
                  sx={{ mr: 1, minWidth: 150 }}
                  loading={openBackdrop}
                  startIcon={<CategoryIcon fontSize="small" />}
                >
                  บันทึก
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
      </>
    </BaseCard>
  );
};

export default CategoryForm;
