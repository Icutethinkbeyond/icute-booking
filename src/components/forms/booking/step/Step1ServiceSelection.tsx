"use client";
import {
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Chip,
  useTheme,
  CircularProgress,
  Grid2,
} from "@mui/material";
import { AccessTime, AttachMoney } from "@mui/icons-material";
import { services } from "@/utils/lib/booking-data";
import APIServices from "@/utils/services/APIServices";
import { useEffect, useState } from "react";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { useStoreContext } from "@/contexts/StoreContext";
import { useServiceContext } from "@/contexts/ServiceContext";
import { Service } from "@/interfaces/Store";
import { useParams } from "next/navigation";
import { ServiceCard } from "../../services/ServiceCard";
import { useBookingContext } from "@/contexts/BookingContext";

interface Step1Props {
  value?: string;
  onChange?: (value: string) => void;
}

export function Step1ServiceSelection({ value, onChange }: Step1Props) {
  const params = useParams<{ shop_id: string }>();

  const { setServices, services } = useServiceContext();
  const { setBookingForm, bookingForm } = useBookingContext();
  const { setNotify } = useNotifyContext();
  const [loading, setLoading] = useState<boolean>(false);

  const handleSelect = (id: string) => {
    // Logic: ถ้ากดตัวเดิมให้ยกเลิก (null) ถ้ากดตัวใหม่ให้แทนที่ตัวเก่า
    setBookingForm((prevState) => ({
      ...prevState,
      serviceId: id,
    }));
  };

  const getServices = async () => {
    try {
      setLoading(true);
      let data: any = await APIServices.get(
        `/api/services/public/?store_username=${params.shop_id}`,
      );
      console.log(data);
      setServices(data.data);
    } catch (error: any) {
      setNotify({
        open: true,
        message: error.code,
        color: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getServices();
    return () => {
      setServices([]);
    };
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant="h5"
        sx={{
          mb: 1,
          fontWeight: 600,
          color: "text.primary",
        }}
      >
        เลือกบริการ
      </Typography>
      <Typography
        variant="body2"
        sx={{
          mb: 3,
          color: "text.secondary",
        }}
      >
        เลือกบริการที่คุณต้องการจอง
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
          gap: 2,
        }}
      >
        {services.map((service: Service, index) => (
          <ServiceCard
            key={index}
            service={service}
            displayToggle={false}
            displayCTA={false}
            displayColorOfService={false}
            onSelect={handleSelect}
            selectable={true}
            // เช็คว่า ID นี้ตรงกับที่เลือกไว้หรือไม่
            selected={bookingForm.serviceId === service.id}
          />
        ))}
      </Box>
    </Box>
  );
}
