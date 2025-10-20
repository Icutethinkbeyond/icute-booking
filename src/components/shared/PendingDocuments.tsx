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
import { formatNumber } from "@/utils/utils";
import { useRouter } from "next/navigation";
import StatusChip from "./StatusChipCustom";

interface BorrowingDocument {
  id: string;
  documentId: string;
  issueDate: string;
  returnDate: string;
  status: string;
  itemReturned: number;
  itemBorrow: number;
  totalPrice: number;
}

const PendingDocuments = () => {
  const router = useRouter();
  const [rows, setRows] = useState<BorrowingDocument[]>([]);
  const [rowCount, setRowCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 5,
  });

  const columns: GridColDef[] = [
    { field: "documentId", headerName: "Document ID", width: 150 },
    { field: "typeRequest", headerName: "Type Request", width: 150 },
    { field: "requestFrom", headerName: "Request From", width: 150 },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => <StatusChip status={params.value} />,
    },
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
        `/api/deshboard/pending-reviews/?page=${paginationModel.page + 1}&pageSize=${
          paginationModel.pageSize
        }`
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
    router.push(`/maintenance-request/progress/${id}`);
  };

  return (
    <BaseCard title="Pending Request Documents">
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

export default PendingDocuments;
