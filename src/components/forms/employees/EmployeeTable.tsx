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
import StatusEmployee from "@/components/shared/used/Status";
import { Clear } from "@mui/icons-material";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import NotFound from "@/components/shared/used/NotFound";
import FloatingButton from "@/components/shared/used/FloatingButton";
import { CustomToolbar } from "@/components/shared/used/CustomToolbar";
import { Employee } from "@/interfaces/Store";
import { useEmployeeContext } from "@/contexts/EmployeeContext";
import { employeeService } from "@/utils/services/api-services/EmployeeAPI";
import APIServices from "@/utils/services/APIServices";

interface EmployeeProps {
  data?: Employee | null;
  recall?: boolean;
}

const EmployeeTable: React.FC<EmployeeProps> = ({ recall }) => {
  const { employees, setEmployees } = useEmployeeContext();
  const { setNotify, notify } = useNotifyContext();
  const router = useRouter();
  const localActive = useLocale();

  const [rowCount, setRowCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const columns: GridColDef<Employee>[] = [
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
            //   params.row.aboutEmployee?.stockStatus ===
            //     EmployeeStatus.CurrentlyRenting ||
            //   params.row.aboutEmployee?.stockStatus ===
            //     EmployeeStatus.InActive ||
            //   params.row.aboutEmployee?.stockStatus === EmployeeStatus.Damaged
            // }
            massage={`คุณต้องการลบอุปกรณ์ ${params.row.name} ใช่หรือไม่?`}
          />
        </>
      ),
    },
    { field: "name", headerName: "ชื่อ", width: 400 },
    {
      field: "role",
      headerName: "ตำแหน่ง",
      width: 300,
      // renderCell: (params) => <b> {params.row.equipmentName} </b>,
    },
  ];

  const handleDeleteItem = async (equipmentId: string) => {
    let result = await employeeService.deleteEmployee(equipmentId);

    if (result.success) {
      getStore();
    }

    setNotify({
      open: true,
      message: result.message,
      color: result.success ? "success" : "error",
    });
  };

  const handleEdit = (employeeId: string) => {
    router.push(
      `/${localActive}/protected/employees/edit/?employeeId=${employeeId}`
    );
  };

  const getStore = async () => {
    try {
      await APIServices.get(
        `/api/employees?page=${paginationModel.page + 1}&pageSize=${
          paginationModel.pageSize
        }`,
        setEmployees,
        setRowCount,
        setLoading
      );
    } catch (error: any) {
      setNotify({
        open: true,
        message: error.code,
        color: "error",
      });
    }
  };

  useEffect(() => {
    // setIsLoading(true);
    getStore();
    return () => {
      setEmployees([]);
    };
  }, [paginationModel]);

  return (
    <>
      {/* <BaseCard> */}
      <>
        <DataGrid
          getRowId={(row) => row.id}
          initialState={{
            density: "comfortable",
            pagination: { paginationModel },
            columns: {
              columnVisibilityModel: {
                // Hide columns status and traderName, the other columns will remain visible
                // equipmentRemark: false,
                // brand: false,
                // description: false,
                // remark: false,
                // categoryName: false,
                // equipmentType: false,
                // purchaseDate: false,
                // unitName: false,
              },
            },
          }}
          pageSizeOptions={[5, 10, 20, 50, 100]}
          sx={{ border: 0, "--DataGrid-overlayHeight": "300px" }}
          rows={employees}
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
      {/* </BaseCard> */}
    </>
  );
};

export default EmployeeTable;
