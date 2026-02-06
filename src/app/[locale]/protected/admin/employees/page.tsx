"use client";

import { Typography, useTheme } from "@mui/material";
import PageContainer from "@/components/container/PageContainer";
import { useLocale, useTranslations } from "next-intl";
import BaseCard from "@/components/shared/BaseCard";
import { useEffect, useState } from "react";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import { useRouter } from "next/navigation";
import { EmployeeList } from "@/components/forms/employees/EmployeeList";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { initialPaginationMeta, PaginationMeta } from "@/interfaces/Types";
import { Employee } from "@/interfaces/Store";
import { EmployeeHeader } from "@/components/forms/employees/EmployeeHeader";
import APIServices from "@/utils/services/APIServices";

const mockPagination: PaginationMeta = {
  totalItems: 3,
  totalPages: 1,
  currentPage: 1,
  pageSize: 10,
  hasNextPage: false,
  hasPrevPage: false,
};

interface EmployeeFilters {
  search: string;
  category: string;
  status: string;
  priceRange: [number, number];
  duration: string;
}

const EmployeePage = () => {
  const theme = useTheme()
  const router = useRouter();
  const localActive = useLocale();

  const { setBreadcrumbs } = useBreadcrumbContext();
  const { setNotify, notify } = useNotifyContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [employees, setEmployee] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [pagination, setPagination] = useState<PaginationMeta>(
    initialPaginationMeta
  );

  const [filters, setFilters] = useState<EmployeeFilters>({
    search: '',
    category: 'all',
    status: 'all',
    priceRange: [0, 10000],
    duration: 'all'
  });

  const handleSubmit = (data: any) => {
    // console.log("[v0] Employee data submitted:", data)
    // setShowForm(false)
    // setSelectedEmployee(null)
    // setSnackbar({
    //   open: true,
    //   message: selectedEmployee ? "แก้ไขพนักงานสำเร็จ" : "เพิ่มพนักงานสำเร็จ",
    //   severity: "success",
    // })
  };

  //  const handleCloseForm = () => {
  //   setShowForm(false)
  //   setSelectedEmployee(null)
  // }

  const handleFiltersChange = (newFilters: EmployeeFilters) => {
    console.log("[v0] Filters changed:", newFilters);
    setFilters(newFilters);
    // Reset to page 1 when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleExport = (format: "xlsx" | "csv") => {
    console.log("[v0] Export employees as:", format);
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

  const getEmployee = async () => {
    try {
      setLoading(true);

      // Build query params with filters
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        pageSize: pagination.pageSize.toString(),
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.status !== 'all') params.append('status', filters.status);

      let data: any = await APIServices.get1only(`/api/employees?${params.toString()}`);

      console.log('Employees data:', data);

      setPagination({
        currentPage: data.metadata?.page || 1,
        pageSize: data.metadata?.pageSize || 10,
        totalItems: data.metadata?.total || 0,
        totalPages: data.metadata?.lastPage || 1,
        hasNextPage: (data.metadata?.page || 1) < (data.metadata?.lastPage || 1),
        hasPrevPage: (data.metadata?.page || 1) > 1,
      });

      setEmployee(data.data || []);
    } catch (error: any) {
      console.error('Get employees error:', error);
      setNotify({
        open: true,
        message: error.message || error.code || 'เกิดข้อผิดพลาดในการดึงข้อมูล',
        color: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (serviceId: string) => {
    // let result = await serviceEmployee.deleteEmployee(serviceId);

    // if (result.success) {
    //   getEmployee();
    // }

    // setNotify({
    //   open: true,
    //   message: result.message,
    //   color: result.success ? "success" : "error",
    // });
  };

  const handleEdit = (employeeId: string) => {
    router.push(
      `/${localActive}/protected/admin/employees/edit/?employeeId=${employeeId}`
    );
  };

  const handleToggleStatus = async (serviceId: string, active: boolean) => {
    try {
      // setLoading(true);
      await APIServices.patch(`/api/employees/toggle-active`, {
        id: serviceId,
        active: active, // ส่งค่าที่ต้องการเปลี่ยนไป
      });

      setNotify({
        open: true,
        message: 'เปลี่ยนสถานะสำเร็จ',
        color: "success",
      });
    } catch (error: any) {
      setNotify({
        open: true,
        message: error.code || 'เกิดข้อผิดพลาด',
        color: "error",
      });
    } finally {
      getEmployee();
    }
  };

  const handlePageChange = (page: number) => {
    console.log("[v0] Page changed to:", page);
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  // Fetch employees when pagination or filters change
  // ค้นหาเมื่อพิมพ์อย่างน้อย 3 ตัว หรือเมื่อเคลียร์ search (empty string)
  useEffect(() => {
    const shouldSearch = filters.search === '' || filters.search.length >= 3;

    if (shouldSearch) {
      // Debounce search: รอ 500ms หลังจากพิมพ์เสร็จ
      const timeoutId = setTimeout(() => {
        getEmployee();
      }, filters.search === '' ? 0 : 500);

      return () => clearTimeout(timeoutId);
    }
  }, [pagination.currentPage, pagination.pageSize, filters.search, filters.status]);

  // Don't cleanup employees array, it causes flickering
  // useEffect(() => {
  //   return () => {
  //     setEmployee([]);
  //   };
  // }, []);

  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: `/${localActive}/protected/admin/dashboard` },
      { name: "พนักงาน", href: `/${localActive}/protected/admin/employees` },
    ]);
    return () => {
      setBreadcrumbs([]);
    };
  }, []);

  return (
    <PageContainer title="" description="">
      <BaseCard title="">
        <>
          {/* <EmployeeTable /> */}
          <EmployeeHeader
            onAddEmployee={() =>
              router.push(`/${localActive}/protected/admin/employees/new`)
            }
            onFiltersChange={handleFiltersChange}
            onExport={handleExport}
            onImport={handleImport}
            totalEmployees={employees.length}
          />
          <EmployeeList
            employees={employees}
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

export default EmployeePage;

