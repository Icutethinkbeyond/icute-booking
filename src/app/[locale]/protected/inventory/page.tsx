"use client";

import { Grid2 } from "@mui/material";
import PageContainer from "@/components/container/PageContainer";
import Breadcrumb from "@/components/shared/used/BreadcrumbCustom";
import EquipmentTable from "@/components/forms/equipment/tables/EquipmentTable";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import { useEffect } from "react";

const BorrowPage = () => {
  const { setBreadcrumbs } = useBreadcrumbContext();

  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: "/dashboard" },
      { name: "คลังอุปกรณ์", href: "/inventory" },
      { name: "อุปกรณ์ทั้งหมด" },
    ]);
    return () => {
      setBreadcrumbs([]);
    };
  }, []);

  return (
    <PageContainer>
      <Grid2 container spacing={3}>
        <Grid2 size={12}>
          <EquipmentTable />
        </Grid2>
      </Grid2>
    </PageContainer>
  );
};

export default BorrowPage;
