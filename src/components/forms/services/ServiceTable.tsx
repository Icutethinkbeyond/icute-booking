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
import APIServices from "@/utils/services/APIServices";
import { serviceService } from "@/utils/services/api-services/ServiceAPI";

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
    { field: "name", headerName: "บริการ", width: 400 },
    {
      field: "durationMinutes",
      headerName: "ระยะเวลาให้บริการ/นาที",
      width: 300,
      // renderCell: (params) => <b> {params.row.equipmentName} </b>,
    },
    {
      field: "price",
      headerName: "ราคา/บาท",
      width: 150,
      // valueGetter: (value, row) => row.aboutEmployee?.stockStatus,
      // renderCell: (params) => (
      //   <>
      //     <StatusEmployee status={params.row.aboutEmployee?.stockStatus} />
      //   </>
      // ),
    },
  ];

    const handleDeleteItem = async (serviceId: string) => {
      let result = await serviceService.deleteService(serviceId);
  
      if (result.success) {
        getServices();
      }
  
      setNotify({
        open: true,
        message: result.message,
        color: result.success ? "success" : "error",
      });
    };

  const handleEdit = (serviceId: string) => {
    router.push(
      `/${localActive}/protected/services/edit/?serviceId=${serviceId}`
    );
  };

  const getServices = async () => {
    try {
      await APIServices.get(
        `/api/services?page=${paginationModel.page + 1}&pageSize=${
          paginationModel.pageSize
        }`,
        setServices,
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
    getServices();
    return () => {
      setServices([]);
    };
  }, [paginationModel]);

  return (
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
  );
};

export default ServiceTable;
