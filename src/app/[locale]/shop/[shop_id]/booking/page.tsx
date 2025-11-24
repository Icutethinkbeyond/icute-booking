"use client"

import { Container, Box, Typography } from "@mui/material"
import BookingForm from "@/components/forms/booking/CustomerBooking-md"
import BookingForm_lg from "@/components/forms/booking/CustomerBooking-lg"

export default function BookingPage() {
  const handleBookingSubmit = (values: any) => {
    console.log("Booking data:", values)
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom align="center" sx={{ mb: 4 }}>
          ระบบจองบริการ
        </Typography>
        <BookingForm onSubmit={handleBookingSubmit} />
      </Box>
    </Container>
  )
}
