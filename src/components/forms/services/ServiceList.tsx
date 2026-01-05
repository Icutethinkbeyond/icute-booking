"use client"

import type React from "react"

import { Box, Button, Typography, Pagination, CircularProgress, Grid2 } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ServiceCard } from "./ServiceCard"
import { Service } from "@/interfaces/Store"
import { PaginationMeta } from "@/interfaces/Types"
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Add } from "@mui/icons-material";


interface ServiceListProps {
  services: Service[]
  pagination: PaginationMeta
  onPageChange: (page: number) => void
  onEdit: (serviceId: string) => void
  onDelete: (serviceId: string) => void
  onToggleStatus?: (serviceId: string, active: boolean) => void
  loading?: boolean
}

export function ServiceList({
  services,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
  onToggleStatus,
  loading,
}: ServiceListProps) {
  const theme = useTheme()
    const router = useRouter();
    const localActive = useLocale();

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    onPageChange(page)
  }

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
    )
  }

  if (!services || services.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
        }}
      >
        <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
          ไม่พบรายการบริการ
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
          คลิกปุ่ม "เพิ่มบริการใหม่" เพื่อเริ่มต้น
        </Typography>
            <Button
              variant="contained"
              color="warning"
              onClick={() =>
          router.push(`/${localActive}/protected/admin/services/new`)
        }
              style={{
                // background: '#fff',
                // color: 'palette.primary.main',
                borderRadius: "50%",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
                padding: "16px",
                minWidth: "56px",
                minHeight: "56px",
              }}
            >
              <Add />
            </Button>
      </Box>
    )
  }

  return (
    <Box>
      {/* Services Grid */}
      <Grid2 container spacing={3}>
        {services.map((service) => (
          <Grid2 size={{xs: 12, sm: 6, md:4}} key={service.id}>
            <ServiceCard service={service} onEdit={onEdit} onDelete={onDelete} onToggleStatus={onToggleStatus} />
          </Grid2>
        ))}
      </Grid2>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: 4,
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            แสดง {services.length} จาก {pagination.totalItems} รายการ
          </Typography>
          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
            sx={{
              "& .MuiPaginationItem-root": {
                color: theme.palette.text.primary,
                borderColor: theme.palette.divider,
                "&:hover": {
                  backgroundColor: `${theme.palette.primary.main}10`,
                },
              },
              "& .Mui-selected": {
                backgroundColor: `${theme.palette.primary.main} !important`,
                color: `${theme.palette.primary.contrastText} !important`,
              },
            }}
          />
        </Box>
      )}
    </Box>
  )
}
