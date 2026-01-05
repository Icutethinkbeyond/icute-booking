"use client";

import {
  Box,
  TextField,
  Button,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import PageContainer from "@/components/container/PageContainer";
import { useLocale, useTranslations } from "next-intl";
import Breadcrumb from "@/components/shared/BreadcrumbCustom";
import BaseCard from "@/components/shared/BaseCard";
import { useEffect, useState } from "react";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import EmployeeTabs from "@/components/forms/employees/EmployeeTabs";
import ServiceTabs from "@/components/forms/services/ServiceTabs";
import ServiceTable from "@/components/forms/services/ServiceTable";
import FloatingButton from "@/components/shared/FloatingButton";
import { useRouter } from "next/navigation";
import { ServiceList } from "@/components/forms/services/ServiceList";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { serviceService } from "@/utils/services/api-services/ServiceAPI";
import { Service } from "@/interfaces/Store";
import { initialPaginationMeta, PaginationMeta } from "@/interfaces/Types";
import APIServices from "@/utils/services/APIServices";

const Services = () => {
  const t = useTranslations("HomePage");
  const router = useRouter();
  const localActive = useLocale();

  const { setBreadcrumbs } = useBreadcrumbContext();
  const { setNotify, notify } = useNotifyContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [services, setServices] = useState<Service[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(
    initialPaginationMeta
  );

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
      // setPagination((prev) => ({ ...prev, totalItems: data.totalItems }));
      // setServices(data.data);
    } catch (error: any) {
      setNotify({
        open: true,
        message: error.code,
        color: "error",
      });
    } finally {
      getServices()
      // setLoading(false);
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
      <FloatingButton
        onClick={() =>
          router.push(`/${localActive}/protected/admin/services/new`)
        }
      />
      <Typography variant="h1" mt={2}>
        จัดการบริการ
      </Typography>
      <BaseCard title="">
        {/* <ServiceTable /> */}
        <ServiceList
          services={services}
          pagination={pagination}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDelete={handleDeleteItem}
          onToggleStatus={handleToggleStatus}
          loading={loading}
        />
      </BaseCard>
    </PageContainer>
  );
};

export default Services;
