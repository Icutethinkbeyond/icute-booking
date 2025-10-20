"use client";
import {
  Box,
  Typography,
  StepLabel,
  StepContent,
  Step,
  Stepper,
  Grid2,
  Chip,
} from "@mui/material";

// components
import DashboardCard from "@/components/shared/DashboardCard";
import { Fragment, useEffect, useState } from "react";
import { DocumentCategory, DocumentStep } from "@prisma/client";
import DocumentForm from "@/components/forms/document/DocumentDetails";
import { useDocumentContext } from "@/contexts/DocumentContext";
import { useSearchParams } from "next/navigation";
import { initialDocument } from "@/interfaces/Document";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import RentalEquipmentForm from "@/components/forms/rental/RentalEquipmentForm";
import PendingApproval from "@/components/forms/maintenance/PendingApproval";
import SiteSelectComponent from "@/components/forms/site/SiteSelect";
import Status from "@/components/shared/used/Status";

function _renderStepDescription(step: number) {
  switch (step) {
    case 0:
      return "กำหนดหมายเลขเอกสารใหม่";
    case 1:
      return "กำหนดสถานที่ สำหรับนำอุปกรณ์ไปติดตั้ง หรือพื้นที่ทำงาน";
    case 2:
      return "เลือกอุปกรณ์ที่ต้องการให้ยืมจากคลังอุปกรณ์";
    case 3:
      return "รอการอนุมัติ";
    default:
      return <div>Not Found</div>;
  }
}

const steps = ["เกี่ยวกับเอกสาร", "สถานที่", "กำหนดอุปกรณ์", "รอการอนุมัติ"];

const AddRentingPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const { documentForm, setDocumentForm, documentId, setDocumentId } = useDocumentContext();
  const [skipped, setSkipped] = useState(new Set<number>());
  const params = useSearchParams();

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const { setBreadcrumbs } = useBreadcrumbContext();

  useEffect(() => {
    setDocumentForm(initialDocument);
    setBreadcrumbs([
      { name: "หน้าแรก", href: "/protected/dashboard" },
      { name: "เช่าอุปกรณ์", href: "/protected/rental" },
      { name: "เพิ่มรายการเช่า" },
    ]);
    return () => {
      setBreadcrumbs([]);
      setDocumentId('')
    };
  }, []);


  function _renderStepContent(step: number) {
    switch (step) {
      case 0:
        return (
          <DocumentForm
            documentCategory={DocumentCategory.Rental}
            handleNext={handleNext}
            setActiveStep={setActiveStep}
            viewOnly={false}
          />
        );
      case 1:
        return (
          <SiteSelectComponent
            documentCategory={DocumentCategory.Rental}
            handleNext={handleNext}
            handleBack={handleBack}
            viewOnly={false}
          />
        );
      case 2:
        return (
          <RentalEquipmentForm
            handleBack={handleBack}
            handleNext={handleNext}
          />
        );
      case 3:
        return (
          <PendingApproval
            documentCategory={DocumentCategory.Rental}
            handleBack={handleBack}
            viewOnly={false}
          />
        );
      default:
        return <div>Not Found</div>;
    }
  }

  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: "/protected/dashboard" },
      { name: "เช่าอุปกรณ์", href: "/protected/rental" },
      { name: "เพิ่มรายการเช่าอุปกรณ์", href: "/protected/rental/add" },
    ]);
    return () => {
      setBreadcrumbs([]);
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

export default AddRentingPage;
