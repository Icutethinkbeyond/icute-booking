"use client";
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Grid2,
} from "@mui/material";
import DashboardCard from "@/components/shared/DashboardCard";
import DocumentForm from "@/components/forms/document/DocumentDetails";
import { useEffect, useState, Fragment } from "react";
import { DocumentCategory } from "@prisma/client";
import SelectOrAddEquipmentForm from "@/components/forms/maintenance/SelectOrAddEquipmentForm";
import RepairManForm from "@/components/forms/maintenance/RepairManForm";
import AddPartForm from "@/components/forms/maintenance/AddPartsForm";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import PendingApproval from "@/components/forms/maintenance/PendingApproval";
import AdditionalForm from "@/components/forms/maintenance/AdditionalForm";
import SiteSelectComponent from "@/components/forms/site/SiteSelect";
import { useDocumentContext } from "@/contexts/DocumentContext";

const AddMaintenancePage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());
  const { documentId, setDocumentId } = useDocumentContext();

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  function _renderStepDescription(step: number) {
    switch (step) {
      case 0:
        return "กำหนดหมายเลขเอกสารใหม่ หรือสามารถค้นหาหมายเลขเอกสารเดิมเพื่อเพิ่มข้อมูลในเอกสารเดิม";
      case 1:
        return "กำหนดสถานที่ สำหรับการซ่อมเเซม";
      case 2:
        return "เลือกอุปกรณ์ที่จะซ่อมเเซม หากโรงงานเป็นเจ้าของอุปกรณ์ โปรดเลือกอุปกรณ์จากคลังอุปกรณ์";
      case 3:
        return "กำหนดอะไหล่สำหรับการซ่อม";
      case 4:
        return "กำหนดผู้รับผิดชอบเเละระยะเวลาการซ่อม";
      case 5:
        return "กำหนดค่าใช้จ่ายเพิ่มเติม";
      case 6:
        return "รอการอนุมัติ";
      default:
        return <div>Not Found</div>;
    }
  }

  const steps = [
    "เกี่ยวกับเอกสาร",
    "สถานที่",
    "กำหนดอุปกรณ์",
    "อะไหล่สำหรับการซ่อมเเซม",
    "ผู้รับผิดชอบการซ่อมแซม",
    "ค่าใช้จ่ายเพิ่มเติม",
    "รอการอนุมัติ",
  ];

  function _renderStepContent(step: number) {
    switch (step) {
      case 0:
        return (
          <DocumentForm
            documentCategory={DocumentCategory.Maintenance}
            handleNext={handleNext}
            setActiveStep={setActiveStep}
            viewOnly={false}
          />
        );
      case 1:
        return (
          <SiteSelectComponent
            documentCategory={DocumentCategory.Maintenance}
            handleNext={handleNext}
            handleBack={handleBack}
            viewOnly={false}
          />
        );
      case 2:
        return (
          <SelectOrAddEquipmentForm
            documentCategory={DocumentCategory.Maintenance}
            handleNext={handleNext}
            handleBack={handleBack}
            viewOnly={false}
            setActiveStep={setActiveStep}
          />
        );
      case 3:
        return (
          <AddPartForm
            documentCategory={DocumentCategory.Maintenance}
            handleNext={handleNext}
            handleBack={handleBack}
            viewOnly={false}
          />
        );
      case 4:
        return (
          <RepairManForm
            documentCategory={DocumentCategory.Maintenance}
            handleNext={handleNext}
            handleBack={handleBack}
            viewOnly={false}
          />
        );
      case 5:
        return (
          <AdditionalForm
            documentCategory={DocumentCategory.Maintenance}
            handleNext={handleNext}
            handleBack={handleBack}
            viewOnly={false}
          />
        );
      case 6:
        return (
          <PendingApproval
            documentCategory={DocumentCategory.Maintenance}
            handleBack={handleBack}
            viewOnly={false}
          />
        );
      default:
        return <div>Not Found</div>;
    }
  }

  const { setBreadcrumbs } = useBreadcrumbContext();

  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: "/protected/dashboard" },
      { name: "ซ่อมแซมอุปกรณ์", href: "/protected/maintenance" },
      {
        name: "เพิ่มรายการซ่อมอุปกรณ์",
        href: "/protected/maintenance/new",
      },
    ]);
    return () => {
      setBreadcrumbs([]);
      setDocumentId("");
    };
  }, []);

  return (
    <DashboardCard>
      <>
        <Box>
          <Grid2 container justifyContent="flex-end" mr={2}>
            {/* {documentId && ( */}
            <Chip
              sx={{
                pl: "4px",
                pr: "4px",
                backgroundColor: "success.main",
                color: "#fff",
              }}
              size="small"
              label={`เลขที่เอกสาร ${documentId}`}
            ></Chip>
            {/* )} */}
          </Grid2>
        </Box>
        <Box sx={{ width: "100%" }}>
          <Stepper
            activeStep={activeStep}
            sx={{ mt: 1 }}
            orientation="vertical"
          >
            {steps.map((label, index) => {
              const stepProps: { completed?: boolean } = {};
              const labelProps: {
                optional?: React.ReactNode;
              } = {};
              labelProps.optional = (
                <Typography variant="caption">
                  {_renderStepDescription(index)}
                </Typography>
              );
              if (isStepSkipped(index)) {
                stepProps.completed = false;
              }
              return (
                <Step key={label} {...stepProps} sx={{ width: "100%" }}>
                  <StepLabel {...labelProps}>{label}</StepLabel>
                  <StepContent sx={{ width: "100%" }}>
                    <Fragment>
                      <Box sx={{ p: 3 }}>{_renderStepContent(index)}</Box>
                    </Fragment>
                  </StepContent>
                </Step>
              );
            })}
          </Stepper>
        </Box>
      </>
    </DashboardCard>
  );
};

export default AddMaintenancePage;
