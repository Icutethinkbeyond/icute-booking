"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Alert,
  Snackbar,
  Grid2,
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  CloudUpload,
  CheckCircleOutline,
  Download,
  Cancel,
  CleanHands,
} from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import axios from "axios";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { MonitorCog, SheetIcon } from "lucide-react";

interface CalculationResult {
  sheetName: string;
  rowCount: number;
  columnCount: number;
}

export default function XlsxImportPage() {
  const { setNotify, notify, setOpenBackdrop } = useNotifyContext();
  const [totalRows, setTotalRows] = useState<number>(0);

  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [rejectCount, setRejectCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorRows, setErrorRows] = useState<any[]>([]);
  const [uploadCanceled, setUploadCanceled] = useState<boolean>(false);
  const [readingFile, setReadingFile] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const fileReaderRef = useRef<FileReader | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadCanceled(false);
    setReadingFile(true);
    setLoading(true);
    setFile(acceptedFiles[0]);
    setProgress(0);
    setRejectCount(0);
    setErrorRows([]);
    processExcelFile(acceptedFiles[0]);
    setTotalRows(0);
  }, []);

  async function downloadFile(filename: string, endpoint: string) {
    try {
      const response = await axios.get(endpoint, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("ไม่สามารถดาวน์โหลดไฟล์ได้", error);
      setNotify({
        ...notify,
        open: true,
        message: "พบปัญหาบางอย่างโปรดติดต่อผู้พัฒนา",
        color: "error",
      });
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    multiple: false,
    disabled: loading || readingFile,
  });

  const downloadErrorFile = (errorRows: any[]) => {
    const worksheet = XLSX.utils.json_to_sheet(errorRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rejected Rows");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Rejected_Rows.xlsx";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const processExcelFile = async (file: File) => {
    fileReaderRef.current = new FileReader();

    fileReaderRef.current.onload = async (e) => {
      if (uploadCanceled) return;

      setReadingFile(false);
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawRows: any[] = XLSX.utils.sheet_to_json(sheet);
      setTotalRows(rawRows.length);

      const cleanedRows = rawRows.map((row) => {
        const cleanedRow: any = {};

        Object.keys(row).forEach((key) => {
          const newKey = key
            .toLowerCase()
            .replace(/\*/g, "") // ลบเครื่องหมาย *
            .replace(/\s+/g, "") // ลบช่องว่างทั้งหมด
            .replace(/\./g, ""); // ลบจุด (.)

          let value = row[key];

          // แปลง Excel date serial เป็น ISO string (ถ้าเป็นตัวเลขและค่าดูเหมือนวันที่)
          if (typeof value === "number" && newKey.includes("date")) {
            const parsed = XLSX.SSF.parse_date_code(value);
            if (parsed) {
              const jsDate = new Date(parsed.y, parsed.m - 1, parsed.d);
              value = jsDate.toISOString(); // หรือ .toLocaleDateString() แล้วแต่ backend ต้องการ
            }
          }

          cleanedRow[newKey] = value;
        });

        return cleanedRow;
      });

      let successCount = 0;
      let errors: any[] = [];
      abortControllerRef.current = new AbortController();

      for (const row of cleanedRows) {
        if (uploadCanceled) break;

        try {
          await axios.post("/api/equipment/importrow", row, {
            signal: abortControllerRef.current.signal,
          });
          successCount++;
        } catch (error: any) {
          errors.push({
            ...row,
            errorMessage:
              error.response?.data || "Unknown Error Or User Cancel Upload",
          });
        }

        setProgress(successCount);
        setRejectCount(errors.length);
      }

      setErrorRows(errors);
      if (errors.length > 0) {
        downloadErrorFile(errors);
      }

      setLoading(false);
    };

    fileReaderRef.current.readAsBinaryString(file);
  };

  // const processExcelFile = async (file: File) => {
  //   fileReaderRef.current = new FileReader();

  //   fileReaderRef.current.onload = async (e) => {
  //     if (uploadCanceled) return;

  //     setReadingFile(false);
  //     const data = e.target?.result;
  //     const workbook = XLSX.read(data, { type: "binary" });
  //     const sheetName = workbook.SheetNames[0];
  //     const sheet = workbook.Sheets[sheetName];
  //     const rows: any[] = XLSX.utils.sheet_to_json(sheet);
  //     setTotalRows(rows.length);

  //     let successCount = 0;
  //     let errors: any[] = [];
  //     abortControllerRef.current = new AbortController();

  //     for (const row of rows) {
  //       if (uploadCanceled) break;

  //       try {
  //         await axios.post("/api/equipment/importrow", row, {
  //           signal: abortControllerRef.current.signal,
  //         });
  //         successCount++;
  //       } catch (error: any) {
  //         errors.push({
  //           ...row,
  //           errorMessage:
  //             error.response?.data || "Unknown Error Or User Cancle Upload",
  //         });
  //       }

  //       setProgress(successCount);
  //       setRejectCount(errors.length);
  //     }

  //     setErrorRows(errors);
  //     if (errors.length > 0) {
  //       downloadErrorFile(errors);
  //     }

  //     setLoading(false);
  //   };

  //   fileReaderRef.current.readAsBinaryString(file);
  // };

  const cancelUpload = () => {
    setUploadCanceled(true);
    fileReaderRef.current?.abort();
    setReadingFile(false);
    abortControllerRef.current?.abort();
    setLoading(false);
    setFile(null);
  };

  return (
    <Box sx={{ maxWidth: 800, margin: "auto", p: 3 }}>
      <Grid2 container mb={3}>
        <Grid2 container size={6}>
          <Grid2 size={{ xs: 12 }} mb={2}>
            <Grid2 container alignItems="center">
              <Avatar sx={{ bgcolor: "primary.main" }}>
                <MonitorCog size={20} />
              </Avatar>
              <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                นำเข้าอุปกรณ์
              </Typography>
            </Grid2>
          </Grid2>
        </Grid2>
        <Grid2 container size={6} justifyContent="flex-end">
          <Button
            variant="contained"
            color="success"
            size="small"
            sx={{ height: "40px" }}
            onClick={() => {
              downloadFile(
                "EquipmentTemplate.xlsx",
                "/api/equipment/importrow?get-template=true&filename=EquipmentTemplate.xlsx"
              );
              setProgress(0);
              // setRejectFile(0);
              setRejectCount(0);
            }}
            startIcon={<SheetIcon />}
          >
            ดาวน์โหลด template
          </Button>
        </Grid2>
      </Grid2>
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          mb: 3,
          textAlign: "center",
          cursor: "pointer",
          backgroundColor: isDragActive ? "action.hover" : "background.paper",
          border: "2px dashed",
          borderColor: isDragActive ? "primary.main" : "divider",
        }}
      >
        <input {...getInputProps()} disabled={loading} />
        <CloudUpload sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          ลากและวางไฟล์ XLSX ของคุณที่นี่
        </Typography>
        <Typography variant="body2" color="textSecondary" mb={4}>
          หรือคลิกเพื่อเลือกไฟล์
        </Typography>
        {file && (
          <Typography variant="body2" sx={{ mt: 2 }}>
            เลือกไฟล์: {file.name}
          </Typography>
        )}
      </Paper>

      {loading && <CircularProgress sx={{ mt: 2, mb: 2 }} />}
      {!uploadCanceled && loading && file && (
        <>
          <Typography variant="body2">
            กำลังนำเข้า {progress} / {totalRows} แถว พบข้อมูลที่มีปัญหา
            {rejectCount}
          </Typography>
          <Typography mt={4} variant="h1">
            กำลังอัพโหลดโปรดอย่าดำเนินการใดๆ
          </Typography>
        </>
      )}
      {uploadCanceled && loading && (
        <Typography variant="body2">
          กำลังยกเลิกการอัพโหลดโปรดอย่าดำเนินการใดๆ
        </Typography>
      )}
      {!loading && file && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          นำเข้าสำเร็จ {progress} | ผิดพลาด {rejectCount}
        </Typography>
      )}

      <Grid2 container justifyContent="center" mt={5}>
        <Button
          variant="contained"
          color="primary"
          sx={{ mr: 2 }}
          onClick={() => {
            setFile(null);
            setProgress(0);
            // setRejectFile(0);
            setRejectCount(0);
          }}
          startIcon={<CleanHands />}
          disabled={!file || loading}
        >
          ล้างและอัปโหลดไฟล์ใหม่
        </Button>

        {loading && (
          <Button
            variant="contained"
            color="error"
            startIcon={<Cancel />}
            onClick={cancelUpload}
          >
            ยกเลิกการอัปโหลด
          </Button>
        )}
      </Grid2>
    </Box>
  );
}
