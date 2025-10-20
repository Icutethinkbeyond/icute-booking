import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  IconButton,
  Grid2,
} from "@mui/material";
import { Close, Download, PictureAsPdf, Print } from "@mui/icons-material";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface A4DialogProps {
  title?: string;
  children: React.ReactNode;
}

const A4Dialog: React.FC<A4DialogProps> = ({ title, children }) => {
  const [open, setOpen] = useState(false);

  // Open the dialog
  const handleClickOpen = () => {
    setOpen(true);
  };

  // Close the dialog
  const handleClose = () => {
    setOpen(false);
  };

  const generatePDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pages = document.querySelectorAll("[id^='repair-paper-page-']");
    const scaleFactor = 3; // ปรับความละเอียดของ canvas

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i] as HTMLElement; // แปลงเป็น HTMLElement

      if (page instanceof HTMLElement) {
        const canvas = await html2canvas(page, { scale: scaleFactor });
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      }
    }

    pdf.save("RepairPaper.pdf");
  };


  // const generatePDF = async () => {
  //   const content = document.getElementById("repair-paper");
  //   if (!content) return;

  //   const pageHeightMM = 297; // A4 height in mm
  //   const pageWidthMM = 210; // A4 width in mm
  //   const scaleFactor = 3; // ปรับความละเอียดของ canvas
  //   const padding = 10; // ระยะขอบของแต่ละหน้า

  //   const pdf = new jsPDF("p", "mm", "a4");
  //   const canvas = await html2canvas(content, { scale: scaleFactor });

  //   console.log(canvas);

  //   const imgWidth = pageWidthMM;
  //   const imgHeight = (canvas.height * imgWidth) / canvas.width;
  //   const totalPages = Math.ceil(imgHeight / (pageHeightMM - padding * 2));

  //   let yOffset = 0;

  //   for (let i = 0; i < totalPages; i++) {
  //     if (i > 0) pdf.addPage();

  //     const pageCanvas = document.createElement("canvas");
  //     console.log(canvas.width);
  //     pageCanvas.width = canvas.width;
  //     pageCanvas.height = canvas.height / totalPages;

  //     const ctx = pageCanvas.getContext("2d");
  //     if (ctx) {
  //       ctx.drawImage(canvas, 0, -yOffset, canvas.width, canvas.height);
  //     }

  //     const pageImgData = pageCanvas.toDataURL("image/png");
  //     pdf.addImage(
  //       pageImgData,
  //       "PNG",
  //       padding,
  //       padding,
  //       imgWidth,
  //       pageHeightMM - padding * 2
  //     );
  //     yOffset += pageCanvas.height;
  //   }

  //   pdf.save("RepairPaper.pdf");
  // };

  return (
    <>
      <IconButton
        size="small"
        color="error"
        onClick={handleClickOpen}
        // disabled={onDisable}
      >
        <Avatar
          sx={{
            bgcolor: "primary.main",
            width: 30,
            height: 30,
          }}
        >
          <PictureAsPdf sx={{ fontSize: "18px" }} />
        </Avatar>
      </IconButton>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        {title && <DialogTitle>{title}</DialogTitle>}
        <DialogContent>{children}</DialogContent>
        <DialogActions sx={{ height: "80px" }}>
          <Grid2
            container
            justifyContent="center"
            alignContent="center"
            alignItems="center"
            spacing={2}
          >
            <Button
              sx={{ width: "150px" }}
              startIcon={<Download />}
              variant="contained"
              onClick={generatePDF}
            >
              ดาวน์โหลด
            </Button>
            <Button
              sx={{ width: "150px", mr: 5 }}
              startIcon={<Close />}
              onClick={handleClose}
              variant="contained"
              color="primary"
            >
              ปิดหน้าต่าง
            </Button>
          </Grid2>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default A4Dialog;
