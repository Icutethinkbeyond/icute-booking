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
import ConfirmDelete from "@/components/shared/ConfirmDelete";
import {
  Barcode,
  Baseline,
  CirclePlus,
  Edit,
  Eraser,
  Search,
} from "lucide-react";
import axios, { AxiosError } from "axios";
import { CustomNoRowsOverlay } from "@/components/shared/NoData";
import { fetchData, formatNumber } from "@/utils/lib/utils";
import StatusBooking from "@/components/shared/Status";
import { Brush } from "lucide-react";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { CustomToolbar } from "@/components/shared/CustomToolbar";
import { Booking } from "@/interfaces/Booking";
import { useBookingContext } from "@/contexts/BookingContext";

interface BookingProps {
  data?: Booking | null;
  recall?: boolean;
}

interface SearchFormData {
  equipmentName: string;
  serialNo: string;
  stockStatus: string;
}

const BookingTable: React.FC<BookingProps> = ({ recall }) => {
  const { bookings, setBookings } = useBookingContext();
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

  const columns: GridColDef<Booking>[] = [
    // { field: "rowIndex", headerName: "ลำดับ", width: 70 },
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
            //   params.row.aboutBooking?.stockStatus ===
            //     BookingStatus.CurrentlyRenting ||
            //   params.row.aboutBooking?.stockStatus ===
            //     BookingStatus.InActive ||
            //   params.row.aboutBooking?.stockStatus === BookingStatus.Damaged
            // }
            // massage={`คุณต้องการลบอุปกรณ์ ${params.row.equipmentName} ใช่หรือไม่?`}
          />
        </>
      ),
    },
    {
      field: "equipmentName",
      headerName: "ชื่อลูกค้า",
      width: 250,
      // renderCell: (params) => <b> {params.row.equipmentName} </b>,
    },
    { field: "brand", headerName: "บริการ", width: 200 },
    { field: "description", headerName: "วัน/เวลา", width: 200 },
    {
      field: "stockStatus",
      headerName: "สถานะ",
      width: 150,
      // valueGetter: (value, row) => row.aboutBooking?.stockStatus,
      renderCell: (params) => (
        <>
          {/* <StatusBooking status={params.row.aboutBooking?.stockStatus} /> */}
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
      `/${localActive}/protected/admin/inventory/edit/?equipmentId=${equipmentId}`
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
    // try {
    //   await fetchData(
    //     `/api/equipment/search?page=${paginationModel.page + 1}&pageSize=${
    //       paginationModel.pageSize
    //     }&serialNo=${formData.serialNo}&equipmentName=${
    //       formData.equipmentName
    //     }&stockStatus=${formData.stockStatus}`,
    //     setBookings,
    //     setRowCount,
    //     setLoading
    //   );
    // } catch (error: any) {
    //   if (error.message !== "Request was canceled") {
    //     console.error("Unhandled error:", error);
    //   }
    // }
  };

  const getData = async () => {
    // try {
    //   await fetchData(
    //     `/api/equipment?page=${paginationModel.page + 1}&pageSize=${
    //       paginationModel.pageSize
    //     }`,
    //     setBookings,
    //     setRowCount,
    //     setLoading
    //   );
    // } catch (error: any) {
    //   if (error.message !== "Request was canceled") {
    //     console.error("Unhandled error:", error);
    //   }
    // }
  };

  useEffect(() => {
    getData();
    return () => {
      setBookings([]);
    };
  }, [paginationModel, recall]);

  return (
    <>
      <Grid2 size={{ xs: 12 }} container justifyContent={"center"}>
        <Typography variant="h4" mt={2}>
          ค้นหารายการจอง
        </Typography>
      </Grid2>

      <Grid2 container size={{ xs: 12 }} justifyContent={"center"}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "grid" }} mb={4} mt={4}>
            <Grid2 container spacing={1} size={{ xs: 12 }}>
              <Grid2 size={2.4}>
                <TextField
                  fullWidth
                  label="ชื่อลูกค้า"
                  name="ชื่อลูกค้า"
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
              <Grid2 size={2.4}>
                <TextField
                  fullWidth
                  label="Booking ID"
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
              <Grid2 size={2.4}>
                <TextField
                  fullWidth
                  label="Booking ID"
                  name="เบอร์โทรศัพท์"
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
              <Grid2 size={2.4}>
                <TextField
                  select
                  fullWidth
                  label="สถานะ"
                  name="stockStatus"
                  size="small"
                  value={formData.stockStatus}
                  onChange={handleChange}
                  sx={{ background: "#ffffff" }}
                  slotProps={{
                    inputLabel: { shrink: true },
                  }}
                >
                  {/* {Object.values(BookingStatus).map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))} */}
                </TextField>
              </Grid2>
              <Grid2 size={2.4} container spacing={1}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Search />}
                  sx={{ minWidth: 80, width: "40%" }}
                  onClick={handleSubmit}
                >
                  ค้นหา
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Eraser />}
                  onClick={handleClear}
                  sx={{ minWidth: 80, width: "40%" }}
                >
                  ล้าง
                </Button>
              </Grid2>
            </Grid2>
          </Box>
        </form>
        <Grid2 container size={{ xs: 12}}>
          <DataGrid
            getRowId={(row) => row.id}
            initialState={{
              density: "comfortable",
              pagination: { paginationModel },
              columns: {
                columnVisibilityModel: {
                  // Hide columns status and traderName, the other columns will remain visible
                  // equipmentRemark: false,
                },
              },
            }}
            pageSizeOptions={[5, 10, 20, 50, 100]}
            sx={{ border: 0, "--DataGrid-overlayHeight": "300px" }}
            rows={bookings}
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
        </Grid2>
      </Grid2>
    </>
  );
};

export default BookingTable;
