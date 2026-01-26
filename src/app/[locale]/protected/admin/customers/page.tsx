"use client";

import {
  Box,
  Typography,
  useTheme,
  Grid2,
} from "@mui/material";
import PageContainer from "@/components/container/PageContainer";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import { useRouter } from "next/navigation";
import { CustomerData, CustomerType, mockCustomers } from "@/components/lib/customer";
import { CustomerDetailDialog } from "@/components/forms/customer/CustomerDetailDialog";
import { CustomerFilters } from "@/components/forms/customer/CustomerFilters";
import { CustomerTable } from "@/components/forms/customer/CustomerTable";
import { StatCard } from "@/components/shared/StatCard";

import PersonIcon from "@mui/icons-material/Person";
import StarIcon from "@mui/icons-material/Star";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import BlockIcon from "@mui/icons-material/Block";

const Services = () => {
  
  const router = useRouter();
  const localActive = useLocale();

  const { setBreadcrumbs } = useBreadcrumbContext();

   const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<CustomerType>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredCustomers = useMemo(() => {
    return mockCustomers.filter((customer) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        customer.firstName.toLowerCase().includes(searchLower) ||
        customer.lastName.toLowerCase().includes(searchLower) ||
        customer.phone.includes(searchQuery) ||
        customer.lineId?.toLowerCase().includes(searchLower) ||
        customer.nickname?.toLowerCase().includes(searchLower);

      // Type filter
      let matchesType = true;
      if (filterType === "regular") {
        matchesType = customer.isRegular;
      } else if (filterType === "new") {
        matchesType = !customer.isRegular && customer.totalBookings <= 2;
      } else if (filterType === "blacklisted") {
        matchesType = customer.isBlacklisted;
      }

      return matchesSearch && matchesType;
    });
  }, [searchQuery, filterType]);

  const stats = useMemo(() => {
    const total = mockCustomers.length;
    const regular = mockCustomers.filter((c) => c.isRegular).length;
    const newCustomers = mockCustomers.filter(
      (c) => !c.isRegular && c.totalBookings <= 2
    ).length;
    const blacklisted = mockCustomers.filter((c) => c.isBlacklisted).length;
    return { total, regular, newCustomers, blacklisted };
  }, []);

  const handleViewCustomer = (customer: CustomerData) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);
  };

  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: `/${localActive}/protected/admin/dashboard` },
      { name: "บริการ", href: `/${localActive}/protected/admin/services` },
    ]);
    return () => {
      setBreadcrumbs([]);
    };
  }, []);

  return (
    <PageContainer title="" description="">
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.grey[50],
        p: { xs: 2, md: 4 },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary">
            จัดการลูกค้า
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ดูข้อมูลและประวัติการใช้บริการของลูกค้า
          </Typography>
        </Box>
        {/* <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          sx={{ borderRadius: 2 }}
        >
          เพิ่มลูกค้าใหม่
        </Button> */}
      </Box>

      {/* Stats Overview */}
      <Grid2 container spacing={2} sx={{ mb: 4 }}>
        <Grid2 size={{ xs: 6, sm: 3 }}>
          <StatCard
            title="ลูกค้าทั้งหมด"
            value={stats.total}
            icon={<PersonIcon />}
            color={theme.palette.primary.main}
          />
        </Grid2>
        <Grid2 size={{ xs: 6, sm: 3 }}>
          <StatCard
            title="ลูกค้าประจำ"
            value={stats.regular}
            icon={<StarIcon />}
            color="#FFD700"
          />
        </Grid2>
        <Grid2 size={{ xs: 6, sm: 3 }}>
          <StatCard
            title="ลูกค้าใหม่"
            value={stats.newCustomers}
            icon={<FiberNewIcon />}
            color={theme.palette.success.main}
          />
        </Grid2>
        <Grid2 size={{ xs: 6, sm: 3 }}>
          <StatCard
            title="Blacklist"
            value={stats.blacklisted}
            icon={<BlockIcon />}
            color={theme.palette.error.main}
          />
        </Grid2>
      </Grid2>

      {/* Filters */}
      <CustomerFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        // filterType={filterType}
        // onFilterTypeChange={setFilterType}
        filteredCount={filteredCustomers.length}
        totalCount={mockCustomers.length}
      />

      {/* Customer Table */}
      <CustomerTable
        customers={filteredCustomers}
        onViewCustomer={handleViewCustomer}
      />

      {/* Customer Detail Dialog */}
      <CustomerDetailDialog
        customer={selectedCustomer}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedCustomer(null);
        }}
      />
    </Box>
    </PageContainer>
  );
};

export default Services;
