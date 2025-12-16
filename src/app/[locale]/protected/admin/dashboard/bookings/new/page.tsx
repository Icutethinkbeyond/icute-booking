"use client";

import {
  Grid,
  Box,
  TextField,
  Button,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import PageContainer from "@/components/container/PageContainer";
import { useLocale, useTranslations } from "next-intl";
import BaseCard from "@/components/shared/BaseCard";
import { useEffect } from "react";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import { useRouter } from "next/navigation";
import NewBooking from "@/components/forms/booking/NewBooking";

const Booking = () => {
  const t = useTranslations("HomePage");
  const localActive = useLocale();
  const router = useRouter();

  const { setBreadcrumbs } = useBreadcrumbContext();

    useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: `/${localActive}/protected/admin/dashboard` },
      { name: "การจองทั้งหมด", href: `/${localActive}/protected/admin/dashboard/bookings` },
      { name: "เพิ่มการจองใหม่", href: `/${localActive}/protected/admin/dashboard/bookings/new` },
    ]);
    return () => {
      setBreadcrumbs([]);
    };
  }, []);

  return (
    <PageContainer title="" description="">
      <Typography variant="h1" mt={2} >
        การจองทั้งหมด
      </Typography>
      <BaseCard title="">
        <NewBooking />
      </BaseCard>
    </PageContainer>
  );
};

export default Booking;
