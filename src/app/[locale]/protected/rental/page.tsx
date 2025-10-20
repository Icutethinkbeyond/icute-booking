"use client";

import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Grid2,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import PageContainer from "@/components/container/PageContainer";
import { useTranslations } from "next-intl";
import Breadcrumb from "@/components/shared/used/BreadcrumbCustom";
import SearchForm from "@/components/shared/SearchForm";
import { useEffect, useState } from "react";
import BaseCard from "@/components/shared/BaseCard";
import RentalTable from "@/components/forms/rental/tables/RentalTable";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";

const BorrowPage = () => {
  const t = useTranslations("HomePage");

  const [value, setValue] = useState<number[]>([0, 999999999]);

  const handleChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue as number[]);
    // onChange(newValue as number[]);
  };

  const { setBreadcrumbs } = useBreadcrumbContext();

  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: "/protected/dashboard" },
      { name: "เช่าอุปกรณ์", href: "/protected/rental" },
      { name: "รายการเช่าอุปกรณ์", href: "/protected/rental/add" },
    ]);
    return () => {
      setBreadcrumbs([]);
    };
  }, []);

  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Grid2 sx={{ mt: 2 }}>
        <RentalTable />
      </Grid2>
    </PageContainer>
  );
};

export default BorrowPage;
