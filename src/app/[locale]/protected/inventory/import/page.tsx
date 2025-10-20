"use client";

import PageContainer from "@/components/container/PageContainer";
import { useTranslations } from "next-intl";
import Breadcrumb from "@/components/shared/used/BreadcrumbCustom";
import BaseCard from "@/components/shared/BaseCard";
import { useEffect, useState } from "react";
import XlsxImportPage from "@/components/forms/equipment/import/ImportFileForProcess";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";

const ImportInvertoryPage = () => {
  const t = useTranslations("HomePage");

  const [issueDate, setIssueDate] = useState("");
  const [repairLocation, setRepairLocation] = useState<string>("");
  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRepairLocation(event.target.value);
  };

  const { setBreadcrumbs } = useBreadcrumbContext();

  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: "/dashboard" },
      { name: "คลังอุปกรณ์", href: "/inventory" },
      { name: "นำเข้าอุปกรณ์" },
    ]);
    return () => {
      setBreadcrumbs([]);
    };
  }, []);

  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <BaseCard title="นำเข้าอุปกรณ์">
        <XlsxImportPage />
      </BaseCard>
    </PageContainer>
  );
};

export default ImportInvertoryPage;
