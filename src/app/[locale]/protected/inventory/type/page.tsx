"use client";

import { Grid2 } from "@mui/material";
import PageContainer from "@/components/container/PageContainer";
import { useState } from "react";
import axios from "axios";

// components
import Breadcrumb from "@/components/shared/used/BreadcrumbCustom";
import AutohideSnackbar from "@/components/shared/SnackBarCustom";

// import { Category, initialCategory } from "@/interfaces/Category_Type";
import { AutohideSnackbarState } from "@/interfaces/AutohideSnackbarState";
import { useCategoryContext } from "@/contexts/CategoryContext";
import {
  EquipmentType,
  initialCategory,
  initialEquipmentType,
} from "@/interfaces/Category_Type";
import EquipmentTypeForm from "@/components/forms/equipment/TypeForm";
import TypeTable from "@/components/forms/equipment/tables/TypeTable";
import { useNotifyContext } from "@/contexts/NotifyContext";

const TypePage = () => {
  const { setTypeForm, setTypeEdit, typeEdit } = useCategoryContext();

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recall, setRecall] = useState<boolean>(false);
  const { setNotify, notify, setOpenBackdrop, openBackdrop } = useNotifyContext()

  const handleSubmit = (value: EquipmentType) => {
    setIsLoading(true);
    if (typeEdit) {
      updateType(value);
    } else {
      createType(value);
    }
  };

  const updateType = (value: EquipmentType) => {
    axios
      .patch("/api/equipment/type", value)
      .then(() => {
        setOpenDialog(true);
        setNotify({
          ...notify,
          open: true,
          message: "การดำเนินการสำเร็จ",
          color: "success",
        });
        setRecall((recall) => !recall);
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
      .finally(() => {
        setIsLoading(false);
        setTypeForm(initialEquipmentType);
        setTypeEdit(false);
      });
  };

  const createType = (value: EquipmentType) => {
    axios
      .post("/api/equipment/type", value)
      .then(() => {
        setOpenDialog(true);
        setNotify({
          ...notify,
          open: true,
          message: "การดำเนินการสำเร็จ",
          color: "success",
        });
        setRecall((recall) => !recall);
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
      .finally(() => {
        setIsLoading(false);
        setTypeForm(initialEquipmentType);
      });
  };

  return (
    <PageContainer>
      {/* <Breadcrumb
        title="เพิ่มประเภทใหม่"
        breadcrumbs={[
          { name: "หน้าแรก", href: "/dashboard" },
          { name: "คลังอุปกรณ์", href: "/inventory" },
          { name: "เพิ่มประเภทใหม่" },
        ]}
      /> */}
      <Grid2 container spacing={3}>
        <Grid2 size={4}>
          <EquipmentTypeForm
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </Grid2>
        <Grid2 size={8}>
          <TypeTable recall={recall} />
        </Grid2>
      </Grid2>
    </PageContainer>
  );
};

export default TypePage;
