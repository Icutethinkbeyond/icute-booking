"use client";

import { Grid2 } from "@mui/material";
import PageContainer from "@/components/container/PageContainer";
import { useEffect } from "react";
import EquipmentForm from "@/components/forms/equipment/EquipmentForm";
import { useRouter } from "next/navigation";
import DashboardCard from "@/components/shared/DashboardCard";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";

const NewEquipmentPage = () => {
  const { setBreadcrumbs } = useBreadcrumbContext();
  
  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: "/dashboard" },
      { name: "คลังอุปกรณ์", href: "/inventory" },
      { name: "เพิ่มอุปกรณ์ใหม่" },
    ]);
    return () => {
      setBreadcrumbs([]);
    };
  }, []);
  return (
    <PageContainer>
      <Grid2 container spacing={3}>
        <Grid2 size={12}>
          <DashboardCard>
            <EquipmentForm />
          </DashboardCard>
        </Grid2>
      </Grid2>
    </PageContainer>
  );
};

export default NewEquipmentPage;
