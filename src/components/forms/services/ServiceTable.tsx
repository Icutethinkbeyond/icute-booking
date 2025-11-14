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
  TextField,
  Typography,
} from "@mui/material";
import BaseCard from "@/components/shared/BaseCard";
import ConfirmDelete from "@/components/shared/used/ConfirmDelete";
import { Barcode, Baseline, CirclePlus, Edit, Search } from "lucide-react";
import axios, { AxiosError } from "axios";
import { CustomNoRowsOverlay } from "@/components/shared/NoData";
import { fetchData, formatNumber } from "@/utils/utils";
import StatusService from "@/components/shared/used/Status";
import { Clear } from "@mui/icons-material";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import NotFound from "@/components/shared/used/NotFound";
import FloatingButton from "@/components/shared/used/FloatingButton";
import { CustomToolbar } from "@/components/shared/used/CustomToolbar";
import { Service } from "@/interfaces/Store";
import { useServiceContext } from "@/contexts/ServiceContext";

interface ServiceProps {
  data?: Service | null;
  recall?: boolean;
}

interface SearchFormData {
  equipmentName: string;
  serialNo: string;
  stockStatus: string;
}

const ServiceTable: React.FC<ServiceProps> = ({ recall }) => {
  const { services, setServices } = useServiceContext();
  const { setNotify, notify } = useNotifyContext();
  const router = useRouter();
  const localActive = useLocale();

  const [rowCount, setRowCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<SearchFormData>({
    equipmentName: "",
    serialNo: "",
    stockStatus: "",
  });

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const columns: GridColDef<Service>[] = [
    { field: "rowIndex", headerName: "ลำดับ", width: 70 },
    {
      field: "edit",
      headerName: "",
      width: 50,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton
            size="small"
            color="secondary"
            onClick={() => handleEdit(params.row.id)}
          >
            <Avatar sx={{ bgcolor: "primary.main", width: 30, height: 30 }}>
              <Edit size={15} />
            </Avatar>
          </IconButton>
        </>
      ),
    },
    {
      field: "remove",
      headerName: "",
      width: 50,
      sortable: false,
      renderCell: (params) => (
        <>
          <ConfirmDelete
            dialogTitle="ยืนยันการลบ?"
            itemId={params.row.id}
            onDelete={handleDeleteItem}
            // onDisable={
            //   params.row.aboutService?.stockStatus ===
            //     ServiceStatus.CurrentlyRenting ||
            //   params.row.aboutService?.stockStatus ===
            //     ServiceStatus.InActive ||
            //   params.row.aboutService?.stockStatus === ServiceStatus.Damaged
            // }
            // massage={`คุณต้องการลบอุปกรณ์ ${params.row.equipmentName} ใช่หรือไม่?`}
          />
        </>
      ),
    },
    { field: "serialNo", headerName: "SerialNo.", width: 200 },
    {
      field: "equipmentName",
      headerName: "ชื่ออุปกรณ์",
      width: 200,
      // renderCell: (params) => <b> {params.row.equipmentName} </b>,
    },
    { field: "brand", headerName: "แบรนด์", width: 150 },
    { field: "description", headerName: "รายละเอียด", width: 200 },
    { field: "remark", headerName: "บันทึกเพิ่มเติม", width: 200 },
    {
      field: "equipmentType",
      headerName: "ประเภท",
      width: 200,
      // valueGetter: (value, row) => row.equipmentType?.equipmentTypeName,
    },
    {
      field: "categoryName",
      headerName: "หมวดหมู่",
      width: 200,
      // valueGetter: (value, row) => row.category?.categoryName,
    },
    {
      field: "rentalPriceCurrent",
      headerName: "ราคาเช่า",
      width: 150,
      // valueGetter: (value, row) =>
        // formatNumber(row.aboutService?.rentalPriceCurrent),
    },
    {
      field: "purchaseDate",
      headerName: "วันที่ซื้อ",
      width: 150,
      // valueGetter: (value, row) => row.aboutService?.purchaseDate,
    },
    {
      field: "unitName",
      headerName: "หน่วยเรียก",
      width: 150,
      // valueGetter: (value, row) => row.aboutService?.unitName,
    },
    {
      field: "stockStatus",
      headerName: "สถานะ",
      width: 150,
      // valueGetter: (value, row) => row.aboutService?.stockStatus,
      renderCell: (params) => (
        <>
          {/* <StatusService status={params.row.aboutService?.stockStatus} /> */}
        </>
      ),
    },
  ];

  const handleDeleteItem = (equipmentId: string) => {
    axios
      .delete(`/api/equipment?equipmentId=${equipmentId}`)
      .then((data) => {
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
        setLoading(false);
        getData();
      });
  };

  const handleEdit = (equipmentId: string) => {
    router.push(
      `/${localActive}/protected/inventory/edit/?equipmentId=${equipmentId}`
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
      equipmentName: "",
      serialNo: "",
      stockStatus: "",
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
        `/api/equipment/search?page=${paginationModel.page + 1}&pageSize=${
          paginationModel.pageSize
        }&serialNo=${formData.serialNo}&equipmentName=${
          formData.equipmentName
        }&stockStatus=${formData.stockStatus}`,
        setServices,
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
        `/api/equipment?page=${paginationModel.page + 1}&pageSize=${
          paginationModel.pageSize
        }`,
        setServices,
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
      setServices([]);
    };
  }, [paginationModel, recall]);

  return (
    <>
      {/* <FloatingButton
        onClick={() => router.push(`/${localActive}/protected/inventory/new`)}
      /> */}
      {/* <Typography variant="h4" mt={2}>
        อปุกรณ์ทั้งหมด
      </Typography> */}
      {/* <form onSubmit={handleSubmit}>
        <Box sx={{ display: "grid", gap: 3 }} mb={4} mt={4}>
          <Grid2 container spacing={2}>
            <Grid2 size={3}>
              <TextField
                fullWidth
                label="S/N"
                name="serialNo"
                value={formData.serialNo}
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
                label="ชื่ออุปกรณ์"
                name="equipmentName"
                value={formData.equipmentName}
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
                label="สถานะอุปกรณ์"
                name="stockStatus"
                size="small"
                value={formData.stockStatus}
                onChange={handleChange}
                sx={{ background: "#ffffff" }}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              >
                {Object.values(ServiceStatus).map((option) => (
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
      </form> */}
      <BaseCard>
        <>
          <DataGrid
            getRowId={(row) => row.id}
            initialState={{
              density: "comfortable",
              pagination: { paginationModel },
              columns: {
                columnVisibilityModel: {
                  // Hide columns status and traderName, the other columns will remain visible
                  equipmentRemark: false,
                  brand: false,
                  description: false,
                  remark: false,
                  categoryName: false,
                  equipmentType: false,
                  purchaseDate: false,
                  unitName: false,
                },
              },
            }}
            pageSizeOptions={[5, 10, 20, 50, 100]}
            sx={{ border: 0, "--DataGrid-overlayHeight": "300px" }}
            rows={services}
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

export default ServiceTable;
