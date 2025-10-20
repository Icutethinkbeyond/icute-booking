"use client";
import { Grid2 } from "@mui/material";
import PageContainer from "@/components/container/PageContainer";
// components
import Breadcrumb from "@/components/shared/used/BreadcrumbCustom";
import UserForm from "@/components/forms/users/UserForm";
import DashboardCard from "@/components/shared/DashboardCard";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import { useEffect } from "react";

const EditUserPage = () => {
  const { setBreadcrumbs } = useBreadcrumbContext();

  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: "/dashboard" },
      { name: "จัดการผู้ใช้งาน", href: "/user-management" },
      { name: "แก้ไขผู้ใช้งาน" },
    ]);
    return () => {
      setBreadcrumbs([]);
    };
  }, []);
  return (
    <PageContainer>
      {/* <Breadcrumb
        title="แก้ไขผู้ใช้งาน"
        breadcrumbs={[
          { name: "หน้าแรก", href: "/dashboard" },
          { name: "จัดการผู้ใช้งาน", href: "/user-management" },
          { name: "แก้ไขผู้ใช้งาน" },
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

export default EditUserPage;
