"use client";
import { Grid2 } from "@mui/material";
import PageContainer from "@/components/container/PageContainer";
// components
import Breadcrumb from "@/components/shared/used/BreadcrumbCustom";
import UserForm from "@/components/forms/users/UserForm";
import DashboardCard from "@/components/shared/DashboardCard";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import { useEffect } from "react";
import SiteForm from "@/components/forms/site/SiteDetails";

const AddUserPage = () => {
  const { setBreadcrumbs } = useBreadcrumbContext();

  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: "/dashboard" },
      { name: "สถานที่", href: "/site" },
      { name: "เพิ่มสถานที่ใหม่" },
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
            <SiteForm />
          </DashboardCard>
        </Grid2>
      </Grid2>
    </PageContainer>
  );
};

export default AddUserPage;
