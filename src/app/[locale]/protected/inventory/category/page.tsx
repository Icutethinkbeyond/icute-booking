"use client";

import { Grid2 } from "@mui/material";
import PageContainer from "@/components/container/PageContainer";
import { useEffect, useState } from "react";
import axios from "axios";

// components
import Breadcrumb from "@/components/shared/used/BreadcrumbCustom";
import CategoryForm from "@/components/forms/equipment/CategoryForm";
import CategoryTable from "@/components/forms/equipment/tables/CategoryTable";
import AutohideSnackbar from "@/components/shared/SnackBarCustom";

// import { Category, initialCategory } from "@/interfaces/Category_Type";
import { AutohideSnackbarState } from "@/interfaces/AutohideSnackbarState";
import { useCategoryContext } from "@/contexts/CategoryContext";
import { initialCategory } from "@/interfaces/Category_Type";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";

const CategoryPage = () => {
  const [recall, setRecall] = useState<boolean>(false);

  const { setBreadcrumbs } = useBreadcrumbContext();

  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: "/dashboard" },
      { name: "คลังอุปกรณ์", href: "/inventory" },
      { name: "เพิ่มหมวดหมู่ใหม่" },
    ]);
    return () => {
      setBreadcrumbs([]);
    };
  }, []);

  return (
    <PageContainer>
      <Grid2 container spacing={3}>
        <Grid2 size={{ lg: 5, xs: 12 }}>
          <CategoryForm setRecall={setRecall} recall={recall} />
        </Grid2>
        <Grid2 size={{ lg: 7, xs: 12 }}>
          <CategoryTable recall={recall} />
        </Grid2>
      </Grid2>
    </PageContainer>
  );
};

export default CategoryPage;
