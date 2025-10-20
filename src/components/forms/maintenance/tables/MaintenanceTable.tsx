"use client";

import React, { useState, useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import {
  Avatar,
  Box,
  Button,
  Grid2,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import BaseCard from "@/components/shared/BaseCard";
import {
  Barcode,
  Baseline,
  CirclePlus,
  FilePenLine,
  Monitor,
  Search,
  View,
} from "lucide-react";
import { Maintenance } from "@/interfaces/Maintenance";
import axios, { AxiosError } from "axios";
import { CustomNoRowsOverlay } from "@/components/shared/NoData";
import { fetchData } from "@/utils/utils";
import { Document } from "@/interfaces/Document";
import { Clear, Close, PictureAsPdf, Preview } from "@mui/icons-material";
import { DocumentStatus, DocumentStep } from "@prisma/client";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Status from "@/components/shared/used/Status";
import { useDocumentContext } from "@/contexts/DocumentContext";
import TypeToConfirmRemove from "@/components/shared/used/TypeToConfirmRemove";
import FloatingButton from "@/components/shared/used/FloatingButton";
import { CustomToolbar } from "@/components/shared/used/CustomToolbar";

interface MaintenanceProps {
  data?: Maintenance | null;
  recall?: boolean;
}

interface SearchFormData {
  documentIdno: string;
  siteIdNo: string;
  documentStatus: string;
}

const MaintenanceTable: React.FC<MaintenanceProps> = ({ recall }) => {
  const { setDocumentState, documentState } = useDocumentContext();
  const { setNotify, notify, setOpenBackdrop, openBackdrop } =
    useNotifyContext();
  const router = useRouter();
  const localActive = useLocale();

  const [rowCount, setRowCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<SearchFormData>({
    documentIdno: "",
    siteIdNo: "",
    documentStatus: "",
  });
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const columns: GridColDef<Document>[] = [
    { field: "rowIndex", headerName: "ลำดับ", width: 70 },
    {
      field: "actions",
      headerName: "แก้ไข",
      width: 50,
      sortable: false,
      headerAlign: "left",
      align: "left",
      renderCell: (params) => (
        <>
          <IconButton
            size="small"
            color="secondary"
            onClick={() =>
              handleEdit(
                params.row.documentId,
                params.row.documentIdNo,
                params.row.documentStatus,
                params.row.maintenance.maintenanceId,
                params.row.documentStep
              )
            }
          >
            <Avatar sx={{ bgcolor: "primary.main", width: 30, height: 30 }}>
              <FilePenLine size={16} />
            </Avatar>
          </IconButton>
        </>
      ),
    },

    {
      field: "progress",
      headerName: "จัดการการซ่อม",
      width: 50,
      headerAlign: "left",
      align: "left",
      sortable: false,
      renderCell: (params) => (
        <>
          {params.row.documentStatus !== DocumentStatus.Draft && (
            <>
              <IconButton
                size="small"
                color="secondary"
                onClick={() =>
                  handleProgress(
                    params.row.documentId,
                    params.row.documentIdNo,
                    params.row.maintenance.maintenanceId
                  )
                }
              >
                <Avatar sx={{ bgcolor: "primary.main", width: 30, height: 30 }}>
                  <Monitor size={16} />
                </Avatar>
              </IconButton>
            </>
          )}
        </>
      ),
    },
    {
      field: "cencle",
      headerName: "ยกเลิกเอกสาร",
      width: 50,
      headerAlign: "left",
      align: "left",
      sortable: false,
      renderCell: (params) => (
        <>
          {params.row.documentStatus !== DocumentStatus.Draft && (
            <>
              <TypeToConfirmRemove
                documentIdNo={params.row.documentIdNo}
                documentStatus={params.row.documentStatus}
                documentStep={params.row.documentStep}
                onDelete={handleCloseDocument}
                iconButton={<Close />}
                documentId={params.row.documentId}
                colorButton="error"
                massage={`โปรดกรอก "หมายเลขเอกสาร" เพื่อยืนยันการลบ เเละเอกสารฉบับนี้จะไม่ถูกนำไปจัดทำ "รายงาน" \n หากดำเนินการยืนยันเเล้วจะไม่สามารถเเก้ไขได้`}
              />
            </>
          )}
        </>
      ),
    },
    {
      field: "preview",
      headerName: "ดูเอกสาร",
      width: 50,
      headerAlign: "left",
      align: "left",
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton
            size="small"
            color="secondary"
            onClick={() =>
              handlePreview(
                params.row.documentId,
                params.row.documentIdNo,
                params.row.maintenance.maintenanceId
              )
            }
          >
            <Avatar sx={{ bgcolor: "primary.main", width: 30, height: 30 }}>
              <PictureAsPdf sx={{ fontSize: "16px" }} />
            </Avatar>
          </IconButton>
        </>
      ),
    },

    { field: "documentIdNo", headerName: "รหัสเอกสาร.", width: 350, valueGetter: (value, row) => `${row.docType}-${row.docYear}-${row.docMonth}-${row.documentIdNo}` },
    {
      field: "site",
      headerName: "เเจ้งซ่อมโดย",
      width: 250,
      valueGetter: (value, row) =>
        row.site?.siteName ? row.site?.siteName : "N/A",
    },
    {
      field: "documentStatus",
      headerName: "สถานะเอกสาร",
      width: 200,
      renderCell: (params) => (
        <>
          <Status status={params.row.documentStatus} />
        </>
      ),
    },
  ];

  const handlePreview = (
    documentId: string,
    documentIdNo: string,
    maintenanceId?: string
  ) => {
    window.open(
      `/${localActive}/protected/maintenance/preview?documentId=${documentId}&documentIdNo=${documentIdNo}&maintenanceId=${maintenanceId}`,
      "_blank"
    );
  };

  const handleEdit = (
    documentId: string,
    documentIdNo: string,
    documentStatus: DocumentStatus,
    maintenanceId?: string,
    documentStep?: DocumentStep
  ) => {
    const unEditStatus = [
      "Approve",
      "WithdrawPart",
      "RepairStared",
      "RepairComplete",
    ];

    let message = "";
    if (documentStatus === DocumentStatus.Cancel) {
      message = "เอกสารถูกยกเลิกแล้ว";
    }

    if (documentStatus === DocumentStatus.Close) {
      message = "เอกสารนี้ได้ดำเนินการเสร็จสิ้นเเล้ว";
    }

    if (documentStep) {
      if (
        documentStatus === DocumentStatus.Open &&
        unEditStatus.includes(documentStep.toString())
      ) {
        message = "เอกสารนี้ได้การอนุมัติเแล้ว ไม่สามารถเเก้ไขได้";
      }
    }

    if (message && message !== "") {
      setNotify({
        ...notify,
        open: true,
        message: message,
        color: "error",
      });
      return;
    }
    router.push(
      `/${localActive}/protected/maintenance/edit/?documentId=${documentId}&documentIdNo=${documentIdNo}&maintenanceId=${maintenanceId}`
    );
  };

  const handleCloseDocument = (
    documentId: string,
    documentIdNo: string,
    documentStatus: DocumentStatus,
    documentStep?: DocumentStep
  ) => {
    // console.log(documentId, documentStatus, documentStep, documentIdNo);

    let message = "";
    if (documentStatus === DocumentStatus.Cancel) {
      message = "เอกสารถูกยกเลิก";
    }

    if (documentStatus === DocumentStatus.Close) {
      message = "เอกสารนี้ได้ดำเนินการเสร็จสิ้นเเล้ว";
    }

    if (message && message !== "") {
      setNotify({
        ...notify,
        open: true,
        message: message,
        color: "error",
      });
      return;
    }

    axios
      .delete(`/api/document?documentId=${documentId}`)
      .then(({ data }) => {
        setNotify({
          ...notify,
          open: true,
          message: "การดำเนินการสำเร็จ",
          color: "success",
        });

        getData();
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Request cancelled");
        } else {
          console.error("Fetch error:", error);
          setNotify({
            ...notify,
            open: true,
            message: "พบปัญหาบางอย่างโปรดติดต่อผู้พัฒนา",
            color: "error",
          });
        }
      })
      .finally(() => {});
  };

  const handleProgress = (
    documentId: string,
    documentIdNo: string,
    maintenanceId: string | undefined
  ) => {
    if (!maintenanceId) {
      setNotify({
        ...notify,
        open: true,
        message: "พบปัญหาบางอย่างโปรดติดต่อผู้พัฒนา",
        color: "error",
      });
      return;
    }
    router.push(
      `/${localActive}/protected/maintenance/progress/?documentId=${documentId}&documentIdNo=${documentIdNo}&maintenanceId=${maintenanceId}`
    );
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClear = () => {
    setFormData({
      documentIdno: "",
      siteIdNo: "",
      documentStatus: "",
    });
    getData();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    searchData();
  };

  const searchData = async () => {
    try {
      await fetchData(
        `/api/maintenance/search?page=${paginationModel.page + 1}&pageSize=${
          paginationModel.pageSize
        }&documentIdno=${formData.documentIdno}&siteIdNo=${
          formData.siteIdNo
        }&documentStatus=${formData.documentStatus}`,
        setDocumentState,
        setRowCount,
        setLoading
      );
    } catch (error: any) {
      if (error.message !== "Request was canceled") {
        console.error("Unhandled error:", error);
      }
    }
  };

  const getData = async () => {
    try {
      await fetchData(
        `/api/maintenance?page=${paginationModel.page + 1}&pageSize=${
          paginationModel.pageSize
        }`,
        setDocumentState,
        setRowCount,
        setLoading
      );
    } catch (error: any) {
      if (error.message !== "Request was canceled") {
        console.error("Unhandled error:", error);
      }
    }
  };

  useEffect(() => {
    getData();
    return () => {
      setDocumentState([]);
    };
  }, [paginationModel, recall]);

  return (
    <>
      <FloatingButton
        onClick={() => router.push(`/${localActive}/protected/maintenance/new`)}
      />
      <Typography variant="h4" mt={2}>
        รายการเเจ้งซ่อมอุปกรณ์
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "grid", gap: 3 }} mb={4} mt={4}>
          <Grid2 container spacing={2}>
            <Grid2 size={3}>
              <TextField
                fullWidth
                label="เลขที่เอกสาร"
                name="documentIdno"
                value={formData.documentIdno}
                onChange={handleChange}
                size="small"
                sx={{ background: "#ffffff" }}
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    endAdornment: (
                      <InputAdornment position="start">
                        <Barcode />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid2>
            <Grid2 size={3}>
              <TextField
                fullWidth
                label="ชื่อสถานที่"
                name="siteIdNo"
                value={formData.siteIdNo}
                onChange={handleChange}
                size="small"
                sx={{ background: "#ffffff" }}
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    endAdornment: (
                      <InputAdornment position="start">
                        <Baseline />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid2>
            <Grid2 size={3}>
              <TextField
                select
                fullWidth
                label="สถานะเอกสาร"
                name="documentStatus"
                size="small"
                value={formData.documentStatus}
                onChange={handleChange}
                sx={{ background: "#ffffff" }}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              >
                {Object.values(DocumentStatus).map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid2>
            <Grid2 size={3} container spacing={1}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Search />}
                sx={{ minWidth: 100, width: "48%" }}
                onClick={handleSubmit}
              >
                ค้นหา
              </Button>
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleClear}
                sx={{ minWidth: 100, width: "48%" }}
              >
                ล้างฟอร์ม
              </Button>
            </Grid2>
          </Grid2>
        </Box>
      </form>
      <BaseCard>
        <>
          <DataGrid
            getRowId={(row) => row.documentId}
            initialState={{
              density: "comfortable",
              pagination: { paginationModel },
              columns: {
                columnVisibilityModel: {
                  // Hide columns status and traderName, the other columns will remain visible
                  maintenanceRemark: false,
                  brand: false,
                  description: false,
                  remark: false,
                  categoryName: false,
                  maintenanceType: false,
                  purchaseDate: false,
                  unitName: false,
                },
              },
            }}
            pageSizeOptions={[5, 10, 20, 50, 100]}
            sx={{ border: 0, "--DataGrid-overlayHeight": "300px" }}
            rows={documentState}
            columns={columns}
            paginationMode="server"
            rowCount={rowCount}
            onPaginationModelChange={setPaginationModel}
            loading={loading}
            slots={{
              noRowsOverlay: CustomNoRowsOverlay,
              toolbar: CustomToolbar,
            }}
          />
        </>
      </BaseCard>
    </>
  );
};

export default MaintenanceTable;
