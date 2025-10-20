"use client";

import type React from "react";
import { useRef, useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Checkbox,
  Grid2,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Image from "next/image";
import { uniqueId } from "lodash";
import { Add, Close, Download, Remove } from "@mui/icons-material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useSearchParams } from "next/navigation";
import { useNotifyContext } from "@/contexts/NotifyContext";

const A4Paper = styled(Paper)(({ theme }) => ({
  width: "210mm",
  minHeight: "297mm",
  padding: "20mm",
  margin: "20px auto",
  backgroundColor: "white",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  pageBreakAfter: "always",
  position: "relative",
  "@media print": {
    margin: 0,
    boxShadow: "none",
  },
}));

const BorderedBox = styled(Box)({
  border: "1px solid black",
  padding: "8px",
});

const BorderedCell = styled(TableCell)({
  border: "1px solid black",
  padding: "10px",
  "&.gray-bg": {
    backgroundColor: "#f5f5f5",
  },
});

const RemarksCell = styled(TableCell)({
  border: "1px solid black",
  padding: "8px",
  width: "25%",
  verticalAlign: "top",
});

const SignatureCell = styled(TableCell)({
  border: "1px solid black",
  padding: "8px",
  width: "25%",
});

interface RepairItem {
  id: number;
  description: string;
  quantity: string;
}

interface ActivityItem {
  name: string;
  activity: string;
  hours: string;
}

interface MaterialItem {
  no: number;
  description: string;
  qty: number | string;
  unit: string;
  price: number;
  total: number;
  inStock: boolean;
}

const repairItems: RepairItem[] = [
  { id: 1, description: "Welding machine SUMO stick200", quantity: "1 Pcs." },
  {
    id: 2,
    description: "Portable reber bender MC. BE-PRB-22",
    quantity: "1 Pcs.",
  },
  { id: 3, description: "Drilling hammer MAKITA HR2475", quantity: "1 Pcs." },
  { id: 3, description: "Drilling hammer MAKITA HR2475", quantity: "1 Pcs." },
  { id: 3, description: "Drilling hammer MAKITA HR2475", quantity: "1 Pcs." },
  { id: 3, description: "Drilling hammer MAKITA HR2475", quantity: "1 Pcs." },
  { id: 3, description: "Drilling hammer MAKITA HR2475", quantity: "1 Pcs." },
  { id: 3, description: "Drilling hammer MAKITA HR2475", quantity: "1 Pcs." },
];

const activityItems: ActivityItem[] = [
  {
    name: "Mr.Wanchana",
    activity: "Check and repair this machine",
    hours: "12 Hrs.",
  },
  { name: "Mr.Sukda", activity: "Replace parts", hours: "12 Hrs." },
  { name: "Mr.Sukda", activity: "Replace parts", hours: "12 Hrs." },
  { name: "Mr.Sukda", activity: "Replace parts", hours: "12 Hrs." },
  { name: "Mr.Sukda", activity: "Replace parts", hours: "12 Hrs." },
];

const materialItems: MaterialItem[] = [
  {
    no: 1,
    description: "Armature assembly for Cutting machine PRB-22",
    qty: 1,
    unit: "Pcs.",
    price: 3050,
    total: 3050,
    inStock: true,
  },
  {
    no: 2,
    description: "Hydraulic oil",
    qty: 0.5,
    unit: "Liter",
    price: 250,
    total: 125,
    inStock: true,
  },
  {
    no: 3,
    description: "Rubber protection set for Makita HR2470",
    qty: 1,
    unit: "Pcs.",
    price: 288,
    total: 288,
    inStock: true,
  },
  {
    no: 4,
    description: "Tool holder set for Makita HR2470",
    qty: 1,
    unit: "Pcs.",
    price: 518,
    total: 518,
    inStock: true,
  },
  {
    no: 4,
    description: "Tool holder set for Makita HR2470",
    qty: 1,
    unit: "Pcs.",
    price: 518,
    total: 518,
    inStock: true,
  },
  {
    no: 4,
    description: "Tool holder set for Makita HR2470",
    qty: 1,
    unit: "Pcs.",
    price: 518,
    total: 518,
    inStock: true,
  },
  {
    no: 4,
    description: "Tool holder set for Makita HR2470",
    qty: 1,
    unit: "Pcs.",
    price: 518,
    total: 518,
    inStock: true,
  },
  {
    no: 4,
    description: "Tool holder set for Makita HR2470",
    qty: 1,
    unit: "Pcs.",
    price: 518,
    total: 518,
    inStock: true,
  },
  {
    no: 4,
    description: "Tool holder set for Makita HR2470",
    qty: 1,
    unit: "Pcs.",
    price: 518,
    total: 518,
    inStock: true,
  },
  {
    no: 4,
    description: "Tool holder set for Makita HR2470",
    qty: 1,
    unit: "Pcs.",
    price: 518,
    total: 518,
    inStock: true,
  },
  {
    no: 4,
    description: "Tool holder set for Makita HR2470",
    qty: 1,
    unit: "Pcs.",
    price: 518,
    total: 518,
    inStock: true,
  },
];

export default function RepairPaperForm() {
  const { setOpenBackdrop } = useNotifyContext();
  const [pages, setPages] = useState<React.ReactNode[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const [hideContent, setHideContent] = useState<boolean>(false);
  const [goodsEmptyRows, setGoodsEmptyRows] = useState<number>(0);
  const [activityEmptyRows, setActivityEmptyRows] = useState<number>(0);
  const [materialEmptyRows, setMaterialEmptyRows] = useState<number>(0);

  const params = useSearchParams();

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const pageHeight = 297 * 3.7795275591 - 100; // A4 height in pixels (297mm) minus padding
    const contentHeight = content.scrollHeight;
    const pageCount = Math.ceil(contentHeight / pageHeight);

    const newPages = [];
    for (let i = 0; i < pageCount; i++) {
      newPages.push(
        <A4Paper key={i} elevation={0} id={`repair-paper-page-${i}`}>
          {/* {i === 0 && <FormHeader />} */}
          <Box
            sx={{
              height: `${pageHeight - 100}px`,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                // top: i === 0 ? 0 : `-${i * pageHeight}px`,
                top: `-${i * pageHeight - 100}px`,
                left: 0,
                right: 0,
              }}
            >
              <FormContent />
            </Box>
          </Box>
          {/* {i === pageCount - 1 && <FormFooter />} */}
          <Typography
            variant="body2"
            sx={{ position: "absolute", bottom: "10mm", right: "20mm" }}
          >
            Page {i + 1} of {pageCount}
          </Typography>
        </A4Paper>
      );
    }
    setPages(newPages);
    setHideContent(true);
  }, []);

  const generatePDF = async () => {
    setOpenBackdrop(true);
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
        // pdf.addImage(imgData, "PNG", 15, 15, imgWidth - 30, imgHeight - 40);
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      }
    }

    pdf.save(`${params.get("documentIdNo")}.pdf`);
    setOpenBackdrop(false);
  };

  // Functions to handle empty rows
  const handleAddEmptyRow = (section: "goods" | "activity" | "material") => {
    switch (section) {
      case "goods":
        setGoodsEmptyRows((prev) => prev + 1);
        break;
      case "activity":
        setActivityEmptyRows((prev) => prev + 1);
        break;
      case "material":
        setMaterialEmptyRows((prev) => prev + 1);
        break;
    }
  };

  const handleRemoveEmptyRow = (section: "goods" | "activity" | "material") => {
    switch (section) {
      case "goods":
        setGoodsEmptyRows((prev) => Math.max(0, prev - 1));
        break;
      case "activity":
        setActivityEmptyRows((prev) => Math.max(0, prev - 1));
        break;
      case "material":
        setMaterialEmptyRows((prev) => Math.max(0, prev - 1));
        break;
    }
  };

  const RowManagementButtons = ({
    section,
  }: {
    section: "goods" | "activity" | "material";
  }) => (
    <Box sx={{ display: "flex", gap: 1, my: 1 }}>
      <Button
        size="small"
        variant="outlined"
        startIcon={<Add />}
        onClick={() => handleAddEmptyRow(section)}
      >
        เพิ่มแถวว่าง
      </Button>
      <Button
        size="small"
        variant="outlined"
        startIcon={<Remove />}
        onClick={() => handleRemoveEmptyRow(section)}
        color="error"
      >
        ลบแถวว่าง
      </Button>
    </Box>
  );

  // Component for empty rows
  const EmptyRow = ({ cellCount }: { cellCount: number }) => (
    <TableRow>
      {[...Array(cellCount)].map((_, index) => (
        <BorderedCell key={`empty-cell-${index}`}>&nbsp;</BorderedCell>
      ))}
    </TableRow>
  );

  function FormContent() {
    return (
      <>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Box sx={{ width: "100px", height: "70px", position: "relative" }}>
            <Image
              src="/images/logos/image004.png"
              alt="Bouygues Thai Logo"
              width={80}
              height={50}
            />
          </Box>

          <Box sx={{ flex: 1, textAlign: "center", mx: 4 }}>
            <BorderedBox sx={{ display: "inline-block", px: 4 }}>
              <Typography variant="h6">REPAIR PAPER</Typography>
            </BorderedBox>
          </Box>

          <BorderedBox sx={{ minWidth: "200px" }}>
            <Typography variant="body2">REF:RP/ REF-202</Typography>
            <Typography variant="body2">
              LPR.......................................
            </Typography>
            <Typography variant="body2">
              Q:........................................
            </Typography>
          </BorderedBox>
        </Box>

        {/* Site and Date Section */}
        <Table sx={{ mb: 2, border: 1 }}>
          <TableBody>
            <TableRow key={"Site-1"}>
              <BorderedCell>Site</BorderedCell>
              <BorderedCell colSpan={3}>
                Student Home Koala Project
              </BorderedCell>
            </TableRow>
            <TableRow key={"Date-1"}>
              <BorderedCell>Date</BorderedCell>
              <BorderedCell>30 Oct 2024</BorderedCell>
              <BorderedCell>Time</BorderedCell>
              <BorderedCell>10:00 AM</BorderedCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Description of goods */}
        <Typography
          variant="subtitle1"
          textAlign="center"
          sx={{ mb: 3, mt: 3 }}
        >
          Description of goods
        </Typography>
        <RowManagementButtons section="goods" />
        <Table sx={{ mb: 3, border: 1 }}>
          <TableHead>
            <TableRow key={"Description-Head"}>
              <BorderedCell>No.</BorderedCell>
              <BorderedCell>Description</BorderedCell>
              <BorderedCell>Quantity</BorderedCell>
              <BorderedCell>Serial No.</BorderedCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {repairItems.map((item) => (
              <TableRow key={`${uniqueId()}`}>
                <BorderedCell>{item.id}</BorderedCell>
                <BorderedCell>{item.description}</BorderedCell>
                <BorderedCell>{item.quantity}</BorderedCell>
                <BorderedCell>SE-3435</BorderedCell>
              </TableRow>
            ))}
            {[...Array(goodsEmptyRows)].map((_, index) => (
              <EmptyRow key={`goods-empty-${index}`} cellCount={4} />
            ))}
          </TableBody>
        </Table>

        {/* Breakdown Information */}
        <BorderedBox sx={{ mb: 3 }}>
          <Grid2 container>
            <Grid2 size={6}>
              <Typography sx={{ mb: 1 }}>Nature of breakdown :</Typography>
              <Typography color="primary">
                The machine damage and motor is burn
              </Typography>
            </Grid2>
            <Grid2 size={6}>
              <Typography sx={{ mb: 1 }}>Causes :</Typography>
              <Typography color="primary">Machine Deterioration.</Typography>
            </Grid2>
          </Grid2>
        </BorderedBox>

        <Typography variant="h6" align="center" sx={{ mb: 2 }}>
          Status of repairing
        </Typography>
        <Table sx={{ mb: 3, border: 1 }}>
          <TableBody>
            <TableRow key={"Status"}>
              <BorderedCell sx={{ width: "50%" }}>
                <Box>
                  <Typography>IN Ref : DD</Typography>
                  <Typography color="primary" sx={{ ml: 4 }}>
                    18113, 18104, 18179
                  </Typography>
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Typography>Date :</Typography>
                  <Typography color="primary" sx={{ ml: 4 }}>
                    30 Sep 2024
                  </Typography>
                </Box>
              </BorderedCell>
              <BorderedCell sx={{ width: "50%" }}>
                <Box>
                  <Typography>OUT Ref : DD</Typography>
                  <Typography color="primary" sx={{ ml: 4 }}>
                    16145
                  </Typography>
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Typography>Date :</Typography>
                  <Typography color="primary" sx={{ ml: 4 }}>
                    29 Oct 2024
                  </Typography>
                </Box>
              </BorderedCell>
            </TableRow>
            <TableRow key={"Time"}>
              <BorderedCell sx={{ bgcolor: "#f5f5f5", width: "50%" }}>
                Time of breakdown
              </BorderedCell>
              <BorderedCell sx={{ bgcolor: "#f5f5f5", width: "50%" }}>
                Parts Ordering :
              </BorderedCell>
            </TableRow>
            <TableRow key={"TimeStart"}>
              <BorderedCell sx={{ width: "50%" }}>Start :</BorderedCell>
              <BorderedCell sx={{ width: "50%" }}>Finish :</BorderedCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Activity of Repairing */}
        <Typography variant="h6" align="center" sx={{ mb: 2 }}>
          Activity of repairing
        </Typography>

        <Table>
          <TableHead>
            <TableRow key={"Activity-Head"}>
              <BorderedCell>Name</BorderedCell>
              <BorderedCell>Activities</BorderedCell>
              <BorderedCell>Man Hours</BorderedCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activityItems.map((item, index) => (
              <TableRow key={`${uniqueId()}`}>
                <BorderedCell>{item.name}</BorderedCell>
                <BorderedCell>{item.activity}</BorderedCell>
                <BorderedCell>{item.hours}</BorderedCell>
              </TableRow>
            ))}
            {[...Array(activityEmptyRows)].map((_, index) => (
              <EmptyRow key={`activity-empty-${index}`} cellCount={3} />
            ))}
          </TableBody>
        </Table>

        <Table sx={{ border: 1 }}>
          <TableBody>
            <TableRow key={"Time-of-repairing"}>
              <BorderedCell sx={{ width: "30%" }}>
                Time of repairing
              </BorderedCell>
              <BorderedCell sx={{ width: "30%" }}>Start: </BorderedCell>
              <BorderedCell sx={{ width: "30%" }}>Finish: </BorderedCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Materials Table */}
        <Typography variant="h6" align="center" sx={{ mb: 3, mt: 3 }}>
          Material & Spare Parts for repairing
        </Typography>

        <Table sx={{ border: 1 }}>
          <TableHead>
            <TableRow key={"Material-of-repairing"}>
              <BorderedCell>No.</BorderedCell>
              <BorderedCell>Description of goods</BorderedCell>
              <BorderedCell>QTY.</BorderedCell>
              <BorderedCell>Unit</BorderedCell>
              <BorderedCell>Price</BorderedCell>
              <BorderedCell>Total</BorderedCell>
              <BorderedCell>Stock</BorderedCell>
              <BorderedCell>Order</BorderedCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {materialItems.map((item, index) => (
              <TableRow key={`${uniqueId()}`}>
                <BorderedCell>{item.no}</BorderedCell>
                <BorderedCell>{item.description}</BorderedCell>
                <BorderedCell>{item.qty}</BorderedCell>
                <BorderedCell>{item.unit}</BorderedCell>
                <BorderedCell>{item.price}</BorderedCell>
                <BorderedCell>{item.total}</BorderedCell>
                <BorderedCell>
                  {item.inStock && <CheckCircleIcon color="success" />}
                </BorderedCell>
                <BorderedCell />
              </TableRow>
            ))}
            {/* Empty rows */}
            {/* {[...Array(9)].map((_, index) => (
              <TableRow key={`empty-${index}`}>
                {[...Array(8)].map((_, cellIndex) => (
                  <BorderedCell key={`empty-cell-${cellIndex}`}>
                    &nbsp;
                  </BorderedCell>
                ))}
              </TableRow>
            ))} */}
            {[...Array(materialEmptyRows)].map((_, index) => (
              <EmptyRow key={`material-empty-${index}`} cellCount={8} />
            ))}
            <TableRow key={"Material-Sum"}>
              <BorderedCell colSpan={5} />
              <BorderedCell>Total</BorderedCell>
              <BorderedCell>3981</BorderedCell>
              <BorderedCell />
            </TableRow>
          </TableBody>
        </Table>

        <>
          {/* Footer */}
          <Box
            sx={{
              mt: 5,
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox />
              <Typography>Included in rental price</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox defaultChecked />
              <Typography>Back charge to site</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox />
              <Typography>Make quotation</Typography>
            </Box>
          </Box>

          {/* Signatures and Remarks Table */}
          <Table sx={{ mt: 3 }}>
            <TableBody>
              <TableRow key={"Remark"}>
                <RemarksCell rowSpan={2}>
                  <Typography>Remarks:</Typography>
                </RemarksCell>
              </TableRow>
            </TableBody>
          </Table>
          <Table sx={{ border: 1 }}>
            <TableBody>
              <TableRow key={"Sign"}>
                <SignatureCell>
                  <Typography>Technician</Typography>
                  <Box className="signature-area" sx={{ height: "50px" }}></Box>
                  <Typography className="name" sx={{ fontSize: "13px" }}>
                    Name:
                  </Typography>
                </SignatureCell>
                <SignatureCell>
                  <Typography>Plant Engineer</Typography>
                  <Box className="signature-area" sx={{ height: "50px" }}></Box>
                  <Typography className="name" sx={{ fontSize: "13px" }}>
                    Name:
                  </Typography>
                </SignatureCell>
                <SignatureCell>
                  <Typography>Plant Approval</Typography>
                  <Box className="signature-area" sx={{ height: "50px" }}></Box>
                  <Typography className="name" sx={{ fontSize: "13px" }}>
                    Name:
                  </Typography>
                </SignatureCell>
              </TableRow>
            </TableBody>
          </Table>
        </>
      </>
    );
  }

  return (
    <>
      <Box ref={contentRef} style={{ display: hideContent ? "none" : "block" }}>
        <FormContent />
      </Box>
      <Grid2
        container
        sx={{
          backgroundColor: "#fff",
          width: "100%",
          position: "fixed",
          bottom: 0,
          left: 150,
          padding: "16px",
          boxShadow: "0px -2px 4px rgba(0, 0, 0, 0.1)",
          zIndex: 999,
          justifyContent: "center", // จัดให้ปุ่มอยู่กลาง
          gap: 2, // ระยะห่างระหว่างปุ่มถ้ามีหลายปุ่ม
        }}
      >
        <Button
          startIcon={<Download />}
          variant="contained"
          sx={{
            minWidth: "150px",
            borderRadius: "8px",
            textTransform: "none", // ไม่ต้องการให้ text เป็นตัวพิมพ์ใหญ่
            fontSize: "1rem",
          }}
          onClick={generatePDF}
        >
          ดาวน์โหลดเอกสาร
        </Button>
      </Grid2>
      {pages}
    </>
  );
}
