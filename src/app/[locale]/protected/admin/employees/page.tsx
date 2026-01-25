// "use client";

// import {
//   Grid,
//   Box,
//   TextField,
//   Button,
//   Typography,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
// } from "@mui/material";
// import PageContainer from "@/components/container/PageContainer";
// import { useLocale, useTranslations } from "next-intl";
// import Breadcrumb from "@/components/shared/BreadcrumbCustom";
// import BaseCard from "@/components/shared/BaseCard";
// import { useEffect, useState } from "react";
// import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
// import EmployeeTable from "@/components/forms/employees/EmployeeTable";
// import FloatingButton from "@/components/shared/FloatingButton";
// import { useRouter } from "next/navigation";

// const Employees = () => {
//   const t = useTranslations("HomePage");
//   const localActive = useLocale();
//   const router = useRouter();
//   const { setBreadcrumbs } = useBreadcrumbContext();

//   useEffect(() => {
//     setBreadcrumbs([
//       { name: "หน้าแรก", href: `/${localActive}/protected/admin/dashboard` },
//       { name: "จัดการพนักงาน", href: `/${localActive}/protected/admin/employees` },
//     ]);
//     return () => {
//       setBreadcrumbs([]);
//     };
//   }, []);

//   return (
//     <PageContainer title="" description="">
//       <FloatingButton
//         onClick={() => router.push(`/${localActive}/protected/admin/employees/new`)}
//       />
//       <Typography variant="h1" mt={2} >
//         การจัดการพนักงาน
//       </Typography>
//       <BaseCard title="">
//         <EmployeeTable />
//       </BaseCard>
//     </PageContainer>
//   );
// };

// export default Employees;

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

  const handleFiltersChange = (filters: EmployeeFilters) => {
    console.log("[v0] Filters changed:", filters);
    // let result = [...employees]

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

    // setFilteredEmployee(result)
    // setPagination((prev) => ({
    //   ...prev,
    //   totalItems: result.length,
    //   totalPages: Math.ceil(result.length / prev.pageSize),
    //   currentPage: 1,
    // }))
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
      let data: any = await APIServices.get1only(
        `/api/employees?page=${pagination.currentPage + 1}&pageSize=${
          pagination.pageSize
        }`
      );
      console.log(data);
      setPagination((prev) => ({ ...prev, totalItems: data.totalItems }));
      setEmployee(data.data);
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
    } catch (error: any) {
      setNotify({
        open: true,
        message: error.code,
        color: "error",
      });
    } finally {
      getEmployee();
    }
  };

  const handlePageChange = (page: number) => {
    console.log("[v0] Page changed to:", page);
    // TODO: Fetch data for new page
    // setPagination((prev) => ({ ...prev, currentPage: page }))
  };

  // useEffect(() => {
  //   getEmployee();
  //   return () => {
  //     setEmployee([]);
  //   };
  // }, [pagination]);

  useEffect(() => {
    getEmployee();
    return () => {
      setEmployee([]);
    };
  }, []);

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

