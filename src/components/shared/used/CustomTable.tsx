"use client";

import React, { useState } from "react";
import { DataGrid, GridPaginationModel } from "@mui/x-data-grid";
import { CustomNoRowsOverlay } from "@/components/shared/NoData";
import { CustomToolbar } from "./CustomToolbar";

interface CustomTableProps {
  state: any[]; // กำหนดประเภทให้ชัดเจนขึ้นถ้ารู้โครงสร้างข้อมูล
  columns: any[]; // กำหนดประเภทให้ชัดเจนขึ้นถ้ารู้โครงสร้างข้อมูล
  isLoading: boolean;
}

const CustomTable: React.FC<CustomTableProps> = ({
  state,
  columns,
  isLoading,
}) => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  return (
    <DataGrid
      initialState={{
        density: "comfortable",
        pagination: { paginationModel },
      }}
      pageSizeOptions={[5, 10, 20, 50, 100]}
      sx={{ border: 0, "--DataGrid-overlayHeight": "300px" }}
      rows={state}
      columns={columns}
      paginationMode="server"
      onPaginationModelChange={setPaginationModel}
      loading={isLoading}
      slots={{
        noRowsOverlay: CustomNoRowsOverlay,
        toolbar: CustomToolbar,
      }}
    />
  );
};

export default CustomTable;
