"use client";

import React, { useState, useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
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
import ConfirmDelete from "@/components/shared/used/ConfirmDelete";
import {
  Archive,
  Barcode,
  Baseline,
  BookDown,
  FilePenLine,
  Search,
} from "lucide-react";
import { Rental } from "@/interfaces/Rental";
import axios, { AxiosError } from "axios";
import { CustomNoRowsOverlay } from "@/components/shared/NoData";
import { useRentalContext } from "@/contexts/RentalContext";
import { fetchData, formatNumber } from "@/utils/utils";
import { Document } from "@/interfaces/Document";
import { Clear, Close } from "@mui/icons-material";
import { DocumentStatus, DocumentStep, RentalStatus } from "@prisma/client";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import Status from "@/components/shared/used/Status";
import { useDocumentContext } from "@/contexts/DocumentContext";
import ConfirmRemove from "@/components/shared/used/ConfirmRemove";
import A4Dialog from "@/components/shared/used/A4Dialog";
import FloatingButton from "@/components/shared/used/FloatingButton";
import { CustomToolbar } from "@/components/shared/used/CustomToolbar";

interface RentalProps {
  data?: Rental | null;
  recall?: boolean;
}

interface SearchFormData {
  documentIdno: string;
  siteIdNo: string;
  documentStatus: string;
}

const RentalTable: React.FC<RentalProps> = ({ recall }) => {
  const { setDocumentState, documentState } = useDocumentContext();
  const { setNotify, notify } = useNotifyContext();
  const router = useRouter();
  const localActive = useLocale();
  const params = useSearchParams();

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

  const unEditStatus = [
    "Approve",
    "WithdrawPart",
    "RepairStared",
    "RepairComplete",
  ];

  const unReturn = ["Cancel", "Close", "Draft", "WaitingApprove"];

  // DocumentStatus.WaitingApprove

  const columns: GridColDef<Document>[] = [
    { field: "rowIndex", headerName: "ลำดับ", width: 70 },
    {
      field: "actions",
      headerName: "",
      width: 70,
      sortable: false,
      headerAlign: "center",
      align: "center",
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
      field: "return",
      headerName: "",
      width: 70,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => (
        <>
          {!unReturn.includes(params.row.documentStatus.toString()) && (
            <>
              <IconButton
                size="small"
                color="secondary"
                onClick={() =>
                  handleReturn(
                    params.row.documentId,
                    params.row.documentIdNo,
                    params.row.documentStatus,
                    params.row.documentStep
                  )
                }
              >
                <Avatar sx={{ bgcolor: "primary.main", width: 30, height: 30 }}>
                  <BookDown size={16} />
                </Avatar>
              </IconButton>
            </>
          )}
        </>
      ),
    },
    {
      field: "cancle",
      headerName: "",
      width: 70,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <>
          <ConfirmRemove
            iconOnly={true}
            itemId={params.row.documentId}
            onDelete={cancleDocument}
            massage={`หากคุณยกเลิกเอกสาร ข้อมูลการยืมของเอกสารฉบับนี้จะไม่ถูกนำไปประมวณผลในการออกรายงานทุกรูปแบบ "กดยืนยันเพื่อดำเนินการต่อ"`}
          />
        </>
      ),
    },
    // {
    //   field: "preview",
    //   headerName: "ดูเอกสาร",
    //   width: 70,
    //   headerAlign: "left",
    //   align: "left",
    //   sortable: false,
    //   renderCell: (params) => (
    //     <>
    //       {/* {params.row.documentStatus === DocumentStatus.Open && ( */}
    //         <>
    //           <A4Dialog title="เอกสาร A4">
    //             Demo Paper
    //             {/* <RepairPaperForm /> */}
    //           </A4Dialog>
    //         </>
    //       {/* )} */}
    //     </>
    //   ),
    // },
    { field: "documentIdNo", headerName: "รหัสเอกสาร.", width: 300, valueGetter: (value, row) => `${row.docType}-${row.docYear}-${row.docMonth}-${row.documentIdNo}`, },
    {
      field: "site",
      headerName: "เช่าโดย",
      width: 200,
      valueGetter: (value, row) => row.site?.siteName,
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
    // {
    //   field: "amount",
    //   headerName: "จำนวนอุปกรณ์",
    //   width: 200,
    //   valueGetter: (value, row) => row.rental?.length,
    // },
  ];

  const cancleDocument = (documentId: string | null) => {
    if (!documentId) {
      setNotify({
        ...notify,
        open: true,
        message: "พบปัญหาบางอย่างโปรดติดต่อผู้พัฒนา",
        color: "error",
      });
    }
    axios
      .patch(`/api/rental/cancel?cancle=true&documentId=${documentId}`)
      .then(({ data }) => {
        setNotify({
          ...notify,
          open: true,
          message: "การดำเนินการสำเร็จ",
          color: "success",
        });
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
      .finally(() => {
        getData();
      });
  };

  const handleEdit = (
    documentId: string,
    documentIdNo: string,
    documentStatus: DocumentStatus,
    documentStep?: DocumentStep
  ) => {
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
      `/${localActive}/protected/rental/edit/?documentId=${documentId}&documentIdNo=${documentIdNo}`
    );
  };

  const handleReturn = (
    documentId: string,
    documentIdNo: string,
    documentStatus: DocumentStatus,
    documentStep?: DocumentStep
  ) => {
    let message = "";
    if (documentStatus === DocumentStatus.Cancel) {
      message = "เอกสารถูกยกเลิกแล้ว";
    }

    if (documentStatus === DocumentStatus.Close) {
      message = "เอกสารนี้ได้ดำเนินการเสร็จสิ้นเเล้ว";
    }

    if (
      documentStatus === DocumentStatus.Draft ||
      documentStatus === DocumentStatus.WaitingApprove
    ) {
      message = "เอกสารนี้ยังไม่ได้รับการอนุมัติ";
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
      `/${localActive}/protected/rental/return/?documentId=${documentId}&documentIdNo=${documentIdNo}`
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
        `/api/rental/search?page=${paginationModel.page + 1}&pageSize=${
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
        `/api/rental?page=${paginationModel.page + 1}&pageSize=${
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
        onClick={() => router.push(`/${localActive}/protected/rental/new`)}
      />
      <Typography variant="h4" mt={2}>
        รายการเช่าอุปกรณ์
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
                  // input: {
                  //   endAdornment: (
                  //     <InputAdornment position="start">
                  //       <Baseline />
                  //     </InputAdornment>
                  //   ),
                  // },
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
                  rentalRemark: false,
                  brand: false,
                  description: false,
                  remark: false,
                  categoryName: false,
                  rentalType: false,
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

export default RentalTable;
