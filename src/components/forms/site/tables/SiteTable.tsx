"use client";

import React, { useState, useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import {
  Avatar,
  Box,
  Button,
  Grid2,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import BaseCard from "@/components/shared/BaseCard";
import ConfirmDelete from "@/components/shared/used/ConfirmDelete";
import { Edit, Search, CirclePlus, Baseline, Mail } from "lucide-react";
import { User } from "@/interfaces/User";
import axios, { AxiosError } from "axios";
import { CustomNoRowsOverlay } from "@/components/shared/NoData";
import { useUserContext } from "@/contexts/UserContext";
import { fetchData, formatNumber } from "@/utils/utils";
import StatusUser from "@/components/shared/used/Status";
import { Clear, People, Work } from "@mui/icons-material";
import { RoleName, UserStatus } from "@prisma/client";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Site } from "@/interfaces/Site";
import { useSiteContext } from "@/contexts/SiteContext";
import FloatingButton from "@/components/shared/used/FloatingButton";
import { CustomToolbar } from "@/components/shared/used/CustomToolbar";

interface SiteProps {}

interface SearchFormData {
  siteName: string;
  contactorEmail: string;
  contactorName: string;
}

const SiteTable: React.FC<SiteProps> = ({}) => {
  const { setSiteState, siteState } = useSiteContext();

  const { setNotify, notify } = useNotifyContext();
  const router = useRouter();
  const localActive = useLocale();

  const [rowCount, setRowCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<SearchFormData>({
    siteName: "",
    contactorEmail: "",
    contactorName: "",
  });
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const columns: GridColDef<Site>[] = [
    { field: "rowIndex", headerName: "ลำดับ", width: 70 },
    {
      field: "edit",
      headerName: "",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton
            size="small"
            color="secondary"
            onClick={() => handleEdit(params.row.siteId)}
          >
            <Avatar sx={{ bgcolor: "primary.main", width: 30, height: 30 }}>
              <Edit size={15} />
            </Avatar>
          </IconButton>
          {/* <ConfirmDelete
            dialogTitle="ยืนยันการลบ?"
            itemId={params.row.userId}
            onDelete={handleDeleteItem}
            onDisable={params.row.userStatus === UserStatus.InActice}
            massage={`คุณต้องการลบอุปกรณ์ ${params.row.name} ใช่หรือไม่?`}
          /> */}
        </>
      ),
    },
    {
      field: "fullname",
      headerName: "ชื่อสถานที่",
      width: 150,
      valueGetter: (value, row) => `${row.siteName}`,
    },
    { field: "contactorName", headerName: "ชื่อผู้ติดต่อ", width: 200 },
    { field: "contactorEmail", headerName: "อีเมลผู้ติดต่อ", width: 150 },
    { field: "contactorTel", headerName: "โทรศัพท์ผู้ติดต่อ", width: 200 },
    { field: "siteDesc", headerName: "รายละเอียด", width: 200 },
    // {
    //   field: "userStatus",
    //   headerName: "สถานะ",
    //   width: 150,
    //   renderCell: (params) => (
    //     <>
    //       <StatusUser status={params.row.userStatus} />
    //     </>
    //   ),
    // },
  ];

  // const handleDeleteItem = (userId: string) => {
  //   axios
  //     .delete(`/api/user?userId=${userId}`)
  //     .then((data) => {
  //       setOpenDialog(true);
  //       setNoti({
  //         ...noti,
  //         message: `ระบบได้ปิดการใช้งาน ${data.data.userName} เเล้ว`,
  //         notiColor: "success",
  //       });
  //     })
  //     .catch((error) => {
  //       if (error.name === "AbortError") {
  //         console.log("Request cancelled");
  //       } else {
  //         console.error("Fetch error:", error);
  //         setOpenDialog(true);
  //         setNoti({
  //           ...noti,
  //           message: error.message,
  //           notiColor: "error",
  //         });
  //       }
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //       getData();
  //     });
  // };

  const handleEdit = (userId: string) => {
    router.push(`/${localActive}/protected/site/edit/?siteId=${userId}`);
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
      siteName: "",
      contactorEmail: "",
      contactorName: "",
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
        `/api/site/search?page=${paginationModel.page + 1}&pageSize=${
          paginationModel.pageSize
        }&siteName=${formData.siteName}&contactorEmail=${
          formData.contactorEmail
        }&contactorName=${formData.contactorName}`,
        setSiteState,
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
        `/api/site?page=${paginationModel.page + 1}&pageSize=${
          paginationModel.pageSize
        }`,
        setSiteState,
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
      setSiteState([]);
    };
  }, [paginationModel]);

  return (
    <>
      <FloatingButton
        onClick={() => router.push(`/${localActive}/protected/site/new`)}
      />
      <Typography variant="h4" mt={2}>
        สถานที่ทั้งหมด
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "grid", gap: 3 }} mb={4} mt={4}>
          <Grid2 container spacing={2}>
            <Grid2 size={3}>
              <TextField
                fullWidth
                label="ชื่อสถานที่"
                name="siteName"
                value={formData.siteName}
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
                fullWidth
                label="ชื่อผู้ติดต่อ"
                name="contactorName"
                value={formData.contactorName}
                onChange={handleChange}
                size="small"
                sx={{ background: "#ffffff" }}
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    endAdornment: (
                      <InputAdornment position="start">
                        <People />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid2>
            <Grid2 size={3}>
              <TextField
                fullWidth
                label="อีเมลผู้ติดต่อ"
                name="contactorEmail"
                value={formData.contactorEmail}
                onChange={handleChange}
                size="small"
                sx={{ background: "#ffffff" }}
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    endAdornment: (
                      <InputAdornment position="start">
                        <Mail />
                      </InputAdornment>
                    ),
                  },
                }}
              />
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
            getRowId={(row) => row.siteId}
            initialState={{
              density: "comfortable",
              pagination: { paginationModel },
              columns: {
                columnVisibilityModel: {
                  // Hide columns status and traderName, the other columns will remain visible
                  siteDesc: false,
                },
              },
            }}
            pageSizeOptions={[5, 10, 20, 50, 100]}
            sx={{ border: 0, "--DataGrid-overlayHeight": "300px" }}
            rows={siteState}
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

export default SiteTable;
