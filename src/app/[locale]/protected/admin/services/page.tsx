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

  const [filters, setFilters] = useState<ServiceFilters>({
    search: '',
    category: 'all',
    status: 'all',
    priceRange: [0, 10000],
    duration: 'all'
  });

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

  const handleFiltersChange = (newFilters: ServiceFilters) => {
    console.log("[v0] Filters changed:", newFilters);
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
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

      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        pageSize: pagination.pageSize.toString(),
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.category !== 'all') params.append('category', filters.category);

      let data: any = await APIServices.get1only(`/api/services?${params.toString()}`);

      console.log('Services data:', data);

      setPagination({
        currentPage: data.metadata?.page || 1,
        pageSize: data.metadata?.pageSize || 10,
        totalItems: data.metadata?.total || 0,
        totalPages: data.metadata?.lastPage || 1,
        hasNextPage: (data.metadata?.page || 1) < (data.metadata?.lastPage || 1),
        hasPrevPage: (data.metadata?.page || 1) > 1,
      });

      setServices(data.data || []);
    } catch (error: any) {
      console.error('Get services error:', error);
      setNotify({
        open: true,
        message: error.message || error.code || 'เกิดข้อผิดพลาด',
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
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  // ค้นหาเมื่อพิมพ์อย่างน้อย 3 ตัว หรือเมื่อเคลียร์ search (empty string)
  useEffect(() => {
    const shouldSearch = filters.search === '' || filters.search.length >= 3;

    if (shouldSearch) {
      // Debounce search: รอ 500ms หลังจากพิมพ์เสร็จ
      const timeoutId = setTimeout(() => {
        getServices();
      }, filters.search === '' ? 0 : 500);

      return () => clearTimeout(timeoutId);
    }
  }, [pagination.currentPage, pagination.pageSize, filters.search, filters.status, filters.category]);

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
