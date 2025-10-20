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
import {
  Archive,
  Edit,
  Eye,
  ScanSearch,
  Search,
  CircleUserRound,
  CirclePlus,
  Baseline,
} from "lucide-react";
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

interface UserProps {}

function CustomToolbar() {
  return (
    <>
      <Grid2 container mb={2} mt={2}>
        <GridToolbarContainer>
          <GridToolbarColumnsButton />
          <GridToolbarFilterButton />
          <GridToolbarDensitySelector
            slotProps={{ tooltip: { title: "Change density" } }}
          />
          <Box sx={{ flexGrow: 1 }} />

          {/* <GridToolbarExport
        slotProps={{
          // tooltip: { title: 'Export data' },
          // button: { variant: 'outlined' },
          des
        }}
      /> */}
        </GridToolbarContainer>
      </Grid2>
    </>
  );
}

interface SearchFormData {
  fullname: string;
  department: string;
  position: string;
  role: string;
  status: string;
}

const UserTable: React.FC<UserProps> = ({}) => {
  const { userForm, setUserForm, userState, setUserState, setUserEdit } =
    useUserContext();

  const { setNotify, notify } = useNotifyContext();
  const router = useRouter();
  const localActive = useLocale();

  const [rowCount, setRowCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<SearchFormData>({
    fullname: "",
    department: "",
    position: "",
    role: "",
    status: "",
  });
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const columns: GridColDef<User>[] = [
    { field: "rowIndex", headerName: "ลำดับ", width: 70 },
    {
      field: "actions",
      headerName: "การจัดการ",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton
            size="small"
            color="secondary"
            onClick={() => handleEdit(params.row.userId)}
          >
            <Avatar sx={{ bgcolor: "primary.main", width: 30, height: 30 }}>
              <Edit size={15} />
            </Avatar>
          </IconButton>
          <ConfirmDelete
            dialogTitle="ยืนยันการลบ?"
            itemId={params.row.userId}
            onDelete={handleDeleteItem}
            onDisable={params.row.userStatus === UserStatus.InActice}
            massage={`คุณต้องการลบอุปกรณ์ ${params.row.name} ใช่หรือไม่?`}
          />
        </>
      ),
    },
    {
      field: "fullname",
      headerName: "ชื่อ",
      width: 150,
      valueGetter: (value, row) => `${row.name}`,
    },
    { field: "department", headerName: "แผนก", width: 200 },
    { field: "position", headerName: "ตำแหน่ง", width: 150 },
    {
      field: "role",
      headerName: "สิทธิใช้งาน",
      width: 200,
      renderCell: (params) => (
        <>
          <StatusUser status={params.row.role?.name} />
        </>
      ),
    },
    {
      field: "manDay",
      headerName: "รายได้ต่อวัน",
      width: 200,
      valueGetter: (value, row) => formatNumber(row.manDay),
    },
    { field: "phone", headerName: "โทรศัพท์", width: 200 },
    { field: "address", headerName: "ที่อยู่", width: 200 },
    {
      field: "userStatus",
      headerName: "สถานะ",
      width: 150,
      renderCell: (params) => (
        <>
          <StatusUser status={params.row.userStatus} />
        </>
      ),
    },
  ];

  function CustomToolbar() {
    return (
      <>
        <Grid2 container mb={3}>
          <Grid2 size={6}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<CirclePlus />}
              sx={{ minWidth: 100 }}
              onClick={handleNew}
            >
              เพิ่มผู้ใช้งาน
            </Button>
          </Grid2>
          <Grid2 size={6} justifyItems={"flex-end"}>
            <GridToolbarContainer>
              {/* ปรับปุ่ม Columns ให้เป็น outlined */}
              <GridToolbarColumnsButton
                slotProps={{
                  button: { variant: "outlined" },
                }}
              />

              {/* ปรับปุ่ม Filter ให้เป็น outlined
              <GridToolbarFilterButton
                slotProps={{
                  button: { variant: "outlined" },
                }}
              /> */}

              {/* ปรับปุ่ม Density ให้เป็น outlined */}
              <GridToolbarDensitySelector
                slotProps={{
                  button: { variant: "outlined" },
                  tooltip: { title: "Change density" },
                }}
              />
            </GridToolbarContainer>
          </Grid2>
        </Grid2>
      </>
    );
  }

  const handleNew = () => {
    router.push(`/${localActive}/protected/user-management/new`);
  };

  const handleDeleteItem = (userId: string) => {
    axios
      .delete(`/api/user?userId=${userId}`)
      .then((data) => {
        setNotify({
          ...notify,
          open: true,
          message: `ระบบได้ปิดการใช้งาน ${data.data.userName} เเล้ว`,
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
            message: error.message,
            color: "error",
          });
        }
      })
      .finally(() => {
        setLoading(false);
        getData();
      });
  };

  const handleEdit = (userId: string) => {
    router.push(
      `/${localActive}/protected/user-management/edit/?userId=${userId}`
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
      fullname: "",
      department: "",
      position: "",
      role: "",
      status: "",
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
        `/api/user/search?page=${paginationModel.page + 1}&pageSize=${
          paginationModel.pageSize
        }&fullname=${formData.fullname}&department=${
          formData.department
        }&position=${formData.position}&role=${formData.role}&status=${
          formData.status
        }`,
        setUserState,
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
        `/api/user?page=${paginationModel.page + 1}&pageSize=${
          paginationModel.pageSize
        }`,
        setUserState,
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
      setUserState([]);
    };
  }, [paginationModel]);

  return (
    <>
      <Typography variant="h4" mt={2}>
        ผู้ใช้งานทั้งหมด
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "grid", gap: 3 }} mb={4} mt={4}>
          <Grid2 container spacing={2}>
            <Grid2 size={4}>
              <TextField
                fullWidth
                label="ชื่อ"
                name="fullname"
                value={formData.fullname}
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
            <Grid2 size={4}>
              <TextField
                fullWidth
                label="แผนก"
                name="department"
                value={formData.department}
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
            <Grid2 size={4}>
              <TextField
                fullWidth
                label="ตำแหน่ง"
                name="position"
                value={formData.position}
                onChange={handleChange}
                size="small"
                sx={{ background: "#ffffff" }}
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    endAdornment: (
                      <InputAdornment position="start">
                        <Work />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid2>
            <Grid2 size={4}>
              <TextField
                select
                fullWidth
                label="สิทธิใช้งาน"
                name="role"
                size="small"
                value={formData.role}
                onChange={handleChange}
                sx={{ background: "#ffffff" }}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              >
                <MenuItem value="None">
                  <em>None</em>
                </MenuItem>
                {Object.values(RoleName).map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid2>
            <Grid2 size={4}>
              <TextField
                select
                fullWidth
                label="สถานะ"
                name="status"
                size="small"
                value={formData.status}
                onChange={handleChange}
                sx={{ background: "#ffffff" }}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              >
                <MenuItem value="None">
                  <em>None</em>
                </MenuItem>
                {Object.values(UserStatus).map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid2>
            <Grid2 size={4}>
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleClear}
                sx={{ minWidth: 100, mr: 1 }}
              >
                ล้างฟอร์ม
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Search />}
                sx={{ minWidth: 100 }}
                onClick={handleSubmit}
              >
                ค้นหา
              </Button>
            </Grid2>
          </Grid2>
        </Box>
      </form>
      <BaseCard>
        <>
          <DataGrid
            getRowId={(row) => row.userId}
            initialState={{
              density: "comfortable",
              pagination: { paginationModel },
              columns: {
                columnVisibilityModel: {
                  // Hide columns status and traderName, the other columns will remain visible
                  phone: false,
                  address: false,
                  // department: false,
                  manDay: false,
                },
              },
            }}
            pageSizeOptions={[5, 10, 20, 50, 100]}
            sx={{ border: 0, "--DataGrid-overlayHeight": "300px" }}
            rows={userState}
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

export default UserTable;
