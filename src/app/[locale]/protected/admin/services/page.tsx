"use client";

import { Typography } from "@mui/material";
import PageContainer from "@/components/container/PageContainer";
import { useLocale, useTranslations } from "next-intl";
import BaseCard from "@/components/shared/BaseCard";
import { useEffect, useState } from "react";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import FloatingButton from "@/components/shared/FloatingButton";
import { useRouter } from "next/navigation";
import { ServiceList } from "@/components/forms/services/ServiceList";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { serviceService } from "@/utils/services/api-services/ServiceAPI";
import { Service } from "@/interfaces/Store";
import { initialPaginationMeta, PaginationMeta } from "@/interfaces/Types";
import APIServices from "@/utils/services/APIServices";
import { ServicesHeader } from "@/components/forms/services/Services-Header";

const mockPagination: PaginationMeta = {
  totalItems: 3,
  totalPages: 1,
  currentPage: 1,
  pageSize: 10,
  hasNextPage: false,
  hasPrevPage: false,
};

interface ServiceFilters {
  search: string;
  category: string;
  status: string;
  priceRange: [number, number];
  duration: string;
}

const Services = () => {
  const t = useTranslations("HomePage");
  const router = useRouter();
  const localActive = useLocale();

  const { setBreadcrumbs } = useBreadcrumbContext();
  const { setNotify, notify } = useNotifyContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [services, setServices] = useState<Service[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [pagination, setPagination] = useState<PaginationMeta>(
    initialPaginationMeta
  );

  const handleSubmit = (data: any) => {
    // console.log("[v0] Service data submitted:", data)
    // setShowForm(false)
    // setSelectedService(null)
    // setSnackbar({
    //   open: true,
    //   message: selectedService ? "แก้ไขบริการสำเร็จ" : "เพิ่มบริการสำเร็จ",
    //   severity: "success",
    // })
  };

  //  const handleCloseForm = () => {
  //   setShowForm(false)
  //   setSelectedService(null)
  // }

  const handleFiltersChange = (filters: ServiceFilters) => {
    console.log("[v0] Filters changed:", filters);
    // let result = [...services]

    // // Search filter
    // if (filters.search) {
    //   const searchLower = filters.search.toLowerCase()
    //   result = result.filter(
    //     (s) => s.name.toLowerCase().includes(searchLower) || s.detail.toLowerCase().includes(searchLower),
    //   )
    // }

    // // Status filter
    // if (filters.status !== "all") {
    //   result = result.filter((s) => (filters.status === "active" ? s.active : !s.active))
    // }

    // // Price range filter
    // result = result.filter((s) => s.price >= filters.priceRange[0] && s.price <= filters.priceRange[1])

    // // Duration filter
    // if (filters.duration !== "all") {
    //   const duration = Number.parseInt(filters.duration)
    //   result = result.filter((s) => {
    //     if (duration === 120) return s.durationMinutes >= 120
    //     return s.durationMinutes === duration
    //   })
    // }

    // setFilteredServices(result)
    // setPagination((prev) => ({
    //   ...prev,
    //   totalItems: result.length,
    //   totalPages: Math.ceil(result.length / prev.pageSize),
    //   currentPage: 1,
    // }))
  };

  const handleExport = (format: "xlsx" | "csv") => {
    console.log("[v0] Export services as:", format);
    // TODO: Implement export functionality
    // setSnackbar({
    //   open: true,
    //   message: `ส่งออกไฟล์ ${format.toUpperCase()} สำเร็จ`,
    //   severity: "success",
    // })
  };

  const handleImport = (file: File, format: "xlsx" | "csv") => {
    console.log("[v0] Import file:", file.name, "format:", format);
    // TODO: Implement import functionality
    // setSnackbar({
    //   open: true,
    //   message: `นำเข้าไฟล์ ${file.name} สำเร็จ`,
    //   severity: "success",
    // })
  };

  const getServices = async () => {
    try {
      setLoading(true);
      let data: any = await APIServices.get1only(
        `/api/services?page=${pagination.currentPage + 1}&pageSize=${
          pagination.pageSize
        }`
      );
      console.log(data);
      setPagination((prev) => ({ ...prev, totalItems: data.totalItems }));
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

  const handleDeleteItem = async (serviceId: string) => {
    let result = await serviceService.deleteService(serviceId);

    if (result.success) {
      getServices();
    }

    setNotify({
      open: true,
      message: result.message,
      color: result.success ? "success" : "error",
    });
  };

  const handleEdit = (serviceId: string) => {
    router.push(
      `/${localActive}/protected/admin/services/edit/?serviceId=${serviceId}`
    );
  };

  const handleToggleStatus = async (serviceId: string, active: boolean) => {
    console.log("[v0] Toggle service status:", serviceId, active);
    // TODO: API call to update service status
    try {
      // setLoading(true);
      await APIServices.patch(`/api/services/toggle-active`, {
        id: serviceId,
        active: active, // ส่งค่าที่ต้องการเปลี่ยนไป
      });
    } catch (error: any) {
      setNotify({
        open: true,
        message: error.code,
        color: "error",
      });
    } finally {
      getServices();
    }
  };

  const handlePageChange = (page: number) => {
    console.log("[v0] Page changed to:", page);
    // TODO: Fetch data for new page
    // setPagination((prev) => ({ ...prev, currentPage: page }))
  };

  // useEffect(() => {
  //   getServices();
  //   return () => {
  //     setServices([]);
  //   };
  // }, [pagination]);

  useEffect(() => {
    getServices();
    return () => {
      setServices([]);
    };
  }, []);

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
      {/* <FloatingButton
        onClick={() =>
          router.push(`/${localActive}/protected/admin/services/new`)
        }
      /> */}
      <Typography variant="h1" mt={2}>
        จัดการบริการ
      </Typography>
      <BaseCard title="">
        <>
          {/* <ServiceTable /> */}
          <ServicesHeader
            onAddService={() =>
              router.push(`/${localActive}/protected/admin/services/new`)
            }
            onFiltersChange={handleFiltersChange}
            onExport={handleExport}
            onImport={handleImport}
            totalServices={services.length}
          />
          <ServiceList
            services={services}
            pagination={pagination}
            onPageChange={handlePageChange}
            onEdit={handleEdit}
            onDelete={handleDeleteItem}
            onToggleStatus={handleToggleStatus}
            loading={loading}
          />
        </>
      </BaseCard>
    </PageContainer>
  );
};

export default Services;
