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
import { Box, IconButton } from "@mui/material";
import BaseCard from "@/components/shared/BaseCard";
import ConfirmDelete from "@/components/shared/used/ConfirmDelete";
import { Edit } from "lucide-react";
import { Category, EquipmentType } from "@/interfaces/Category_Type";
import axios from "axios";
import { CustomNoRowsOverlay } from "@/components/shared/NoData";
import { AutohideSnackbarState } from "@/interfaces/AutohideSnackbarState";
import AutohideSnackbar from "@/components/shared/SnackBarCustom";
import { useCategoryContext } from "@/contexts/CategoryContext";
import { fetchData } from "@/utils/utils";
import { useNotifyContext } from "@/contexts/NotifyContext";

interface TypeProps {
  data?: EquipmentType | null;
  recall?: boolean;
}

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      {/* <GridToolbarFilterButton /> */}
      <GridToolbarDensitySelector
        slotProps={{ tooltip: { title: "Change density" } }}
      />
      <Box sx={{ flexGrow: 1 }} />
      {/* <GridToolbarExport
        slotProps={{
          tooltip: { title: 'Export data' },
          button: { variant: 'outlined' },
        }}
      /> */}
    </GridToolbarContainer>
  );
}

const TypeTable: React.FC<TypeProps> = ({ recall }) => {
  const { typeForm, setTypeForm, typeState, setTypeState, setTypeEdit } =
    useCategoryContext();
    const { setNotify, notify, setOpenBackdrop, openBackdrop } = useNotifyContext()

  const [rowCount, setRowCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const columns: GridColDef[] = [
    { field: "rowIndex", headerName: "ลำดับ", width: 100 },
    {
      field: "actions",
      headerName: "การจัดการ",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <> 
          <IconButton
            size="small"
            color="secondary"
            onClick={() => handleEdit(params.row)}
          >
            <Edit />
          </IconButton>
          <ConfirmDelete
            itemId={params.row.categoryId}
            onDelete={handleDeleteItem}
            massage={`คุณต้องการลบประเภท ${params.row.categoryName} ใช่หรือไม่?`}
          />
        </>
      ),
    },
    { field: "equipmentTypeName", headerName: "ชื่อประเภท", width: 200 },
    { field: "equipmentTypeDesc", headerName: "รายละเอียดประเภท", width: 150 },
    { field: "equipments", headerName: "จำนวนอุปกรณ์", width: 150 },
  ];

  const getData = async () => {
    try {
      await fetchData(
        `/api/equipment/type?page=${paginationModel.page + 1}&pageSize=${
          paginationModel.pageSize
        }`,
        setTypeState,
        setRowCount,
        setLoading
      );
    } catch (error: any) {
      if (error.message !== "Request was canceled") {
        console.error("Unhandled error:", error);
      }
    }
  };

  const handleDeleteItem = (typeId: string) => {
    axios
      .delete(`/api/equipment/type?typeId=${typeId}`)
      .then((data) => {
        // console.log(data);
        setOpenDialog(true);
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
          setOpenDialog(true);
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

  const handleEdit = (type: EquipmentType) => {
    setTypeForm(type);
    setTypeEdit(true);
  };

  useEffect(() => {
    getData();
  }, [paginationModel, recall]);

  //return state
  useEffect(() => {
    setTypeState([]);
  }, []);

  return (
    <BaseCard title="ประเภททั้งหมด">
      <>
        <DataGrid
          getRowId={(row) => row.equipmentTypeId}
          initialState={{
            pagination: { paginationModel },
            columns: {
              columnVisibilityModel: {
                equipments: false,
              },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          sx={{ border: 0, "--DataGrid-overlayHeight": "300px" }}
          rows={typeState}
          columns={columns}
          paginationMode="server"
          rowCount={rowCount}
          onPaginationModelChange={setPaginationModel}
          loading={loading}
          slots={{ noRowsOverlay: CustomNoRowsOverlay, toolbar: CustomToolbar }}
        />
      </>
    </BaseCard>
  );
};

export default TypeTable;
