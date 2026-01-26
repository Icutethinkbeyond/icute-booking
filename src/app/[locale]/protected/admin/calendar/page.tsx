"use client";

import {
  Box,
  Typography,
  useTheme,
} from "@mui/material";
import PageContainer from "@/components/container/PageContainer";
import { useLocale, useTranslations } from "next-intl";
import BaseCard from "@/components/shared/BaseCard";
import { useEffect, useState } from "react";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import { useRouter } from "next/navigation";
import WeekView from "@/components/forms/calendar/WeekView";
import AppointmentDialog from "@/components/forms/calendar/AppointmentDialog";
import DayView from "@/components/forms/calendar/DayView";
import CalendarHeader from "@/components/forms/calendar/CalendarHeader";
import { Appointment } from "@/components/lib/calendar";
import { mockAppointments } from "@/components/lib/calendar-data";

const Services = () => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week">("week");
  const [appointments] = useState<Appointment[]>(mockAppointments);
   const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const localActive = useLocale();

  const router = useRouter();
  const { setBreadcrumbs } = useBreadcrumbContext();

  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: `/${localActive}/protected/admin/dashboard` },
      { name: "บริการ", href: `/${localActive}/protected/admin/services` },
    ]);
    return () => {
      setBreadcrumbs([]);
    };
  }, []);

  const handleAppointmentClick = (appointment: Appointment) => {
    // setSelectedAppointment(appointment)
    // setDialogOpen(true)
  };

  const handleCloseDialog = () => {
    // setDialogOpen(false)
    // setSelectedAppointment(null)
  };

  const handleAddAppointment = () => {

    router.push(`/${localActive}/protected/admin/bookings/new`)
    // setSnackbar({
    //   open: true,
    //   message: 'เปิดฟอร์มสร้างนัดหมายใหม่',
    //   severity: 'info',
    // })
  };

  const handleReschedule = (appointment: Appointment) => {
    // setDialogOpen(false)
    // setSnackbar({
    //   open: true,
    //   message: `กำลังเลื่อนนัดของ ${appointment.customerName}`,
    //   severity: 'info',
    // })
  };

  const handleCancelAppointment = (appointment: Appointment) => {
    // setDialogOpen(false)
    // setSnackbar({
    //   open: true,
    //   message: `ยกเลิกนัดหมายของ ${appointment.customerName} เรียบร้อย`,
    //   severity: 'success',
    // })
  };

  return (
    <PageContainer title="" description="">
      {/* <FloatingButton
        onClick={() => router.push(`/${localActive}/protected/admin/services/new`)}
      /> */}
      <Typography variant="h1" mt={2} >
        ปฎิทินร้าน
      </Typography>
      <BaseCard title="">
        {/* <ServiceTable />
      </BaseCard> */}
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          bgcolor: theme.palette.background.default,
        }}
      >
        {/* <Sidebar /> */}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 3 },
            // ml: { xs: 0, md: "280px" },
            minHeight: "100vh",
          }}
        >
          <CalendarHeader
            currentDate={currentDate}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onDateChange={setCurrentDate}
            onAddAppointment={handleAddAppointment}
          />

          {viewMode === "day" ? (
            <DayView
              currentDate={currentDate}
              appointments={appointments}
              onAppointmentClick={handleAppointmentClick}
            />
          ) : (
            <WeekView
              currentDate={currentDate}
              appointments={appointments}
              onAppointmentClick={handleAppointmentClick}
            />
          )}

          <AppointmentDialog
            open={dialogOpen}
            appointment={selectedAppointment}
            onClose={handleCloseDialog}
            onReschedule={handleReschedule}
            onCancel={handleCancelAppointment}
          />
        </Box>
      </Box>
       </BaseCard>
    </PageContainer>
  );
};

export default Services;
