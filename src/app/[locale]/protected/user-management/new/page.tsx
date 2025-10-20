"use client";
import { Grid2 } from "@mui/material";
import PageContainer from "@/components/container/PageContainer";
// components
import Breadcrumb from "@/components/shared/used/BreadcrumbCustom";
import UserForm from "@/components/forms/users/UserForm";
import DashboardCard from "@/components/shared/DashboardCard";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import { useEffect } from "react";

const AddUserPage = () => {
  const { setBreadcrumbs } = useBreadcrumbContext();

  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: "/dashboard" },
      { name: "จัดการผู้ใช้งาน", href: "/user-management" },
      { name: "เพิ่มผู้ใช้งานใหม่" },
    ]);
    return () => {
      setBreadcrumbs([]);
    };
  }, []);

  return (
    <PageContainer>
      {/* <Breadcrumb
        title="เพิ่มผู้ใช้งานใหม่"
        breadcrumbs={[
          { name: "หน้าแรก", href: "/dashboard" },
          { name: "จัดการผู้ใช้งาน", href: "/user-management" },
          { name: "เพิ่มผู้ใช้งานใหม่" },
        ]}
      /> */}
      <Grid2 container spacing={3}>
        <Grid2 size={12}>
          <DashboardCard>
            <UserForm />
          </DashboardCard>
        </Grid2>
      </Grid2>
    </PageContainer>
  );
};

export default AddUserPage;
