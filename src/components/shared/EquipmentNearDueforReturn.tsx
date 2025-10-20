import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  TableContainer,
  IconButton,
} from "@mui/material";
import BaseCard from "./DashboardCard";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { ManageSearch } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { formatNumber } from "@/utils/utils";

interface BorrowingEqipmentDocument {
  id: string;
  documentId: string;
  borrower: string;
  siteName: string;
  equipmentName: string;
  totalPrice: number;
  daysLeft: number;
}

const EquipmentNearDueforReturn = () => {
  const router = useRouter();
  const [rows, setRows] = useState<BorrowingEqipmentDocument[]>([]);
  const [rowCount, setRowCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const columns: GridColDef[] = [
    { field: "documentId", headerName: "Document ID", width: 150 },
    { field: "borrower", headerName: "Borrower", width: 150 },
    { field: "siteName", headerName: "Sitename", width: 150 },
    { field: "equipmentName", headerName: "Equipment Name", width: 150 },
    {
      field: "totalPrice",
      headerName: "Charge Price (bath)",
      width: 150,
      renderCell: (params) => formatNumber(params.value),
    },
    { field: "daysLeft", headerName: "Days Left", width: 150 },
    {
      field: "actions",
      headerName: "",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton
            size="small"
            color="secondary"
            onClick={() => handleUpdate(params.row.id)}
          >
            <ManageSearch />
          </IconButton>
        </>
      ),
    },
  ];
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/deshboard/equipment-near-due-for-return/?page=${
          paginationModel.page + 1
        }&pageSize=${paginationModel.pageSize}`
      );
      const result = await response.json();

      setRows(result.data);
      setRowCount(result.total);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [paginationModel]);

  const handleUpdate = (id: string) => {
    router.push(`/borrowing-system/returning/${id}`);
  };

  return (
    <BaseCard title="Equipment Near Due For Return">
      <DataGrid
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10, 20]}
        checkboxSelection
        sx={{ border: 0 }}
        rows={rows}
        columns={columns}
        paginationMode="server"
        rowCount={rowCount}
        onPaginationModelChange={setPaginationModel}
        loading={loading}
      />
    </BaseCard>
  );
};

export default EquipmentNearDueforReturn;
