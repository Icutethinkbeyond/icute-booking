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
  useMediaQuery,
  useTheme,
  Paper,
  TablePagination,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@mui/material";
import PageContainer from "@/components/container/PageContainer";
import { useLocale, useTranslations } from "next-intl";
import BaseCard from "@/components/shared/BaseCard";
import { useEffect, useMemo, useState } from "react";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import { useRouter } from "next/navigation";
import { BookingFilters, BookingRecord } from "@/components/lib/bookings";
import { mockBookings } from "@/components/lib/bookings-data";
import BookingDetailDialog from "@/components/forms/admin-booking/BookingDetailDialog";
import BookingCardMobile from "@/components/forms/admin-booking/BookingCardMobile";
import BookingRow from "@/components/forms/admin-booking/BookingRow";
import BookingsHeader from "@/components/forms/admin-booking/BookingsHeader";

const Booking = () => {
  const theme = useTheme();
  const t = useTranslations("HomePage");
  const localActive = useLocale();
  const router = useRouter();

  const { setBreadcrumbs } = useBreadcrumbContext();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [filters, setFilters] = useState<BookingFilters>({
    search: "",
    status: "all",
    channel: "all",
    dateFrom: "",
    dateTo: "",
    staffId: "",
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(
    null
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return mockBookings.filter((booking) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          booking.customerName.toLowerCase().includes(searchLower) ||
          booking.customerPhone.includes(filters.search) ||
          booking.service.toLowerCase().includes(searchLower) ||
          booking.id.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== "all" && booking.status !== filters.status) {
        return false;
      }

      // Channel filter
      if (filters.channel !== "all" && booking.channel !== filters.channel) {
        return false;
      }

      // Staff filter
      if (filters.staffId && booking.staffId !== filters.staffId) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom) {
        const bookingDate = new Date(booking.date);
        const fromDate = new Date(filters.dateFrom);
        if (bookingDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const bookingDate = new Date(booking.date);
        const toDate = new Date(filters.dateTo);
        if (bookingDate > toDate) return false;
      }

      return true;
    });
  }, [filters]);

  // Pagination
  const paginatedBookings = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredBookings.slice(start, start + rowsPerPage);
  }, [filteredBookings, page, rowsPerPage]);

  const handleAddNew = () => {
    router.push(`/${localActive}/protected/admin/bookings/new`)
  };

  const handleExport = (format: "xlsx" | "csv") => {
    // setSnackbar({ open: true, message: `กำลัง Export เป็นไฟล์ ${format.toUpperCase()}...`, severity: 'success' })
  };

  const handleView = (booking: BookingRecord) => {
    setSelectedBooking(booking);
    setDetailDialogOpen(true);
  };

  const handleEdit = (booking: BookingRecord) => {
    // setDetailDialogOpen(false)
    // setSnackbar({ open: true, message: `กำลังแก้ไขการจอง ${booking.id}`, severity: 'success' })
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: `/${localActive}/protected/admin/dashboard` },
      {
        name: "การจองทั้งหมด",
        href: `/${localActive}/protected/admin/dashboard/bookings`,
      },
    ]);
    return () => {
      setBreadcrumbs([]);
    };
  }, []);

  return (
    <PageContainer title="" description="">
      {/* <FloatingButton
        onClick={() =>
          router.push(`/${localActive}/protected/admin/dashboard/bookings/new`)
        }
      />
      <Typography variant="h1" mt={2}>
        การจองทั้งหมด
      </Typography> */}
      {/* <BaseCard title=""> */}
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          bgcolor: theme.palette.background.default,
        }}
      >
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 3 },
            // ml: { xs: 0, md: '280px' },
            // width: { xs: '100%', md: 'calc(100% - 280px)' }
          }}
        >
          <BookingsHeader
            filters={filters}
            onFilterChange={setFilters}
            onAddNew={handleAddNew}
            onExport={handleExport}
          />

          {/* Desktop Table View */}
          {!isMobile && (
            <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.grey[100] }}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        รหัส / ลูกค้า
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>บริการ</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>วันเวลา</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>พนักงาน</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>ราคา</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>สถานะ</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>ช่องทาง</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        แก้ไขล่าสุด
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        จัดการ
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedBookings.length > 0 ? (
                      paginatedBookings.map((booking) => (
                        <BookingRow
                          key={booking.id}
                          booking={booking}
                          onView={handleView}
                          onEdit={handleEdit}
                        />
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                          <Typography
                            variant="body1"
                            sx={{ color: theme.palette.text.secondary }}
                          >
                            ไม่พบรายการจอง
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={filteredBookings.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="แสดง:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} จาก ${count}`
                }
                sx={{
                  borderTop: `1px solid ${theme.palette.divider}`,
                }}
              />
            </Paper>
          )}

          {/* Mobile Card View */}
          {isMobile && (
            <Box>
              {paginatedBookings.length > 0 ? (
                <>
                  {paginatedBookings.map((booking) => (
                    <BookingCardMobile
                      key={booking.id}
                      booking={booking}
                      onView={handleView}
                      onEdit={handleEdit}
                    />
                  ))}
                  <Paper sx={{ mt: 2, borderRadius: 2 }}>
                    <TablePagination
                      component="div"
                      count={filteredBookings.length}
                      page={page}
                      onPageChange={handleChangePage}
                      rowsPerPage={rowsPerPage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      rowsPerPageOptions={[5, 10, 25]}
                      labelRowsPerPage="แสดง:"
                      labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} จาก ${count}`
                      }
                    />
                  </Paper>
                </>
              ) : (
                <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
                  <Typography
                    variant="body1"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    ไม่พบรายการจอง
                  </Typography>
                </Paper>
              )}
            </Box>
          )}

          {/* Summary */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary }}
            >
              พบ {filteredBookings.length} รายการ
            </Typography>
          </Box>
        </Box>

        {/* Booking Detail Dialog */}
        <BookingDetailDialog
          open={detailDialogOpen}
          booking={selectedBooking}
          onClose={() => setDetailDialogOpen(false)}
          onEdit={handleEdit}
        />
      </Box>
      {/* </BaseCard> */}
    </PageContainer>
  );
};

export default Booking;
