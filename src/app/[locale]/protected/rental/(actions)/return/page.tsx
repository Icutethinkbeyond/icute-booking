"use client";
import {
  Box,
  Typography,
  Grid2,
  StepLabel,
  StepContent,
  Step,
  Stepper,
} from "@mui/material";
import PageContainer from "@/components/container/PageContainer";

// components
import DashboardCard from "@/components/shared/DashboardCard";
import Breadcrumb from "@/components/shared/used/BreadcrumbCustom";
import { useSearchParams } from "next/navigation";
import RentalReturnEquipmentForm from "@/components/forms/rental/RentalReturnEquipmentForm";
import { MapPin } from "lucide-react";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import { useEffect } from "react";

const steps = ["เกี่ยวกับเอกสาร", "สถานที่", "กำหนดอุปกรณ์"];

const ReturnRentingPage = () => {
  
  const params = useSearchParams();
  const { setBreadcrumbs } = useBreadcrumbContext();

  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: "/protected/dashboard",},
      { name: "เช่าอุปกรณ์", href: "/protected/rental" },
      { name: "คืนอุปกรณ์" },
    ])
    return () => {
      setBreadcrumbs([])
    }
  }, [])

  return (
    <PageContainer>
      <Grid2 container size={12}>
        <RentalReturnEquipmentForm />
      </Grid2>
    </PageContainer>
  );
};

export default ReturnRentingPage;
