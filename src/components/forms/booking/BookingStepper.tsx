"use client";

import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from "@mui/material";

// components
import DashboardCard from "@/components/shared/DashboardCard";
import { useState, Fragment, useEffect } from "react";
// import AwaitingWithdrawal from "@/components/forms/maintenance/AwaitingWithdrawal";
// import StartRepairForm from "@/components/forms/maintenance/StartRepairForm";
// import UpdateRepairStatus from "@/components/forms/maintenance/UpdateRepairStatus";
// import { DocumentCategory, RepairStatus } from "@prisma/client";
// import RepairComplete from "@/components/forms/maintenance/RepairComplete";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";

export default function BookingStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  function _renderStepContent(step: number) {
    switch (step) {
      case 0:
        return (
          <></>
          //   <AwaitingWithdrawal
          //     documentCategory={DocumentCategory.Maintenance}
          //     handleNext={handleNext}
          //     setActiveStep={setActiveStep}
          //     viewOnly={false}
          //   />
        );
      case 1:
        return (
          <></>
          //   <StartRepairForm
          //     documentCategory={DocumentCategory.Maintenance}
          //     handleNext={handleNext}
          //     viewOnly={false}
          //   />
        );
      case 2:
        return (
          <></>
          //   <UpdateRepairStatus
          //     documentCategory={DocumentCategory.Maintenance}
          //     handleNext={handleNext}
          //     viewOnly={false}

          //   />
        );
      case 3:
        return (
          <></>
          //   <RepairComplete
          //     // status="unrepairable"
          //     documentCategory={DocumentCategory.Maintenance}
          //     handleNext={handleNext}
          //     viewOnly={false}
          //   />
        );
      default:
        return <div>Not Found</div>;
    }
  }

  function _renderStepDescription(step: number) {
    switch (step) {
      case 0:
        return "เมื่อทำการเบิกอะไหล่แล้ว โปรดกดดำเนินการต่อ";
      case 1:
        return "กำลังรอกำหนดวันเริ่มงานซ่อม";
      case 2:
        return "คุณสามารถอัพเดตสถานะการซ่อมแซมได้ที่นี่";
      case 3:
        return "ขั้นตอนสุดท้ายของการซ่อมแซม";
      default:
        return <div>Not Found</div>;
    }
  }

  const steps = [
    "รอการเบิกอะไหล่",
    "เริ่มการซ่อมแซมแล้ว",
    "การซ่อมแซมอยู่ระหว่างดำเนินการ",
    "ซ่อมแซมเสร็จเรียบร้อยแล้ว",
  ];

//   const { setBreadcrumbs } = useBreadcrumbContext();

//   useEffect(() => {
//     setBreadcrumbs([
//       { name: "หน้าแรก", href: "/protected/dashboard" },
//       { name: "ซ่อมแซมอุปกรณ์", href: "/protected/maintenance" },
//       {
//         name: "กำลังดำเนินการซ่อมอุปกรณ์",
//       },
//     ]);
//     return () => {
//       setBreadcrumbs([]);
//     };
//   }, []);

  return (
    <DashboardCard>
      <Box sx={{ width: "100%" }}>
        <Stepper activeStep={activeStep} sx={{ mt: 1 }} orientation="vertical">
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
    </DashboardCard>
  );
}
