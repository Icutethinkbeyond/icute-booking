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
import { useEffect, useState } from "react";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import BookingTabs from "@/components/forms/booking/BookingTabs";
import FloatingButton from "@/components/shared/used/FloatingButton";
import { useRouter } from "next/navigation";
import BookingTable from "@/components/forms/booking/BookingTable";

const Booking = () => {
  const t = useTranslations("HomePage");
  const localActive = useLocale();
  const router = useRouter();

  const { setBreadcrumbs } = useBreadcrumbContext();


    useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: `/${localActive}/protected/admin/dashboard` },
      { name: "การจองทั้งหมด", href: `/${localActive}/protected/admin/dashboard/bookings` },
    ]);
    return () => {
      setBreadcrumbs([]);
    };
  }, []);

  return (
    <PageContainer title="" description="">
      <FloatingButton
        onClick={() => router.push(`/${localActive}/protected/admin/dashboard/bookings/new`)}
      />
      <Typography variant="h1" mt={2} >
        การจองทั้งหมด
      </Typography>
      <BaseCard title="">
        <BookingTable />
      </BaseCard>
    </PageContainer>
  );
};

export default Booking;
