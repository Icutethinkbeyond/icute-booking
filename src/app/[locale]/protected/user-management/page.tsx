"use client";

import { Grid2 } from "@mui/material";
import PageContainer from "@/components/container/PageContainer";
import { useTranslations } from "next-intl";
import Breadcrumb from "@/components/shared/used/BreadcrumbCustom";
import UserTable from "@/components/forms/users/tables/UserTable";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import { useEffect } from "react";

const UserManagementPage = () => {
  // const t = useTranslations("HomePage");

  const { setBreadcrumbs } = useBreadcrumbContext();

  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: "/dashboard" },
      { name: "ผู้ใช้งาน", href: "/user-management" },
      { name: "ผู้ใช้งานทั้งหมด" },
    ]);
    return () => {
      setBreadcrumbs([]);
    };
  }, []);

  return (
    <PageContainer>
      <Grid2 container spacing={3}>
        <Grid2 size={12}>
          <UserTable />
        </Grid2>
      </Grid2>
    </PageContainer>
  );
};

export default UserManagementPage;
