"use client";

import React, { useState, useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import {
  Avatar,
  Box,
  Button,
  Grid2,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import BaseCard from "@/components/shared/BaseCard";
import ConfirmDelete from "@/components/shared/used/ConfirmDelete";
import { Baseline, Edit, Search } from "lucide-react";
import { Category } from "@/interfaces/Category_Type";
import axios from "axios";
import { CustomNoRowsOverlay } from "@/components/shared/NoData";
import { useCategoryContext } from "@/contexts/CategoryContext";
import { fetchData } from "@/utils/utils";
import { Clear } from "@mui/icons-material";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { CustomToolbar } from "@/components/shared/used/CustomToolbar";
import FloatingButton from "@/components/shared/used/FloatingButton";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  CATEGORY_API_BASE_URL,
  categoryService,
} from "@/utils/services/api-services/CategoryApi";
import APIServices from "@/utils/services/APIServices";

interface CategoryProps {
  data?: Category | null;
  recall?: boolean;
}

interface SearchFormData {
  categoryName: string;
}

const CategoryTable: React.FC<CategoryProps> = ({ recall }) => {
  const {
    categoryForm,
    setCategoryForm,
    categoryState,
    setCategoryState,
    setCategoryEdit,
  } = useCategoryContext();
  const { setNotify, notify, setOpenBackdrop, openBackdrop } =
    useNotifyContext();

  // const localActive = useLocale();
  // const router = useRouter();

  const [rowCount, setRowCount] = useState<number>(0);
  const [formData, setFormData] = useState<SearchFormData>({
    categoryName: "",
  });

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const columns: GridColDef<Category>[] = [
    { field: "rowIndex", headerName: "ลำดับ", width: 50 },
    {
      field: "edit",
      headerName: "",
      width: 60,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          color="secondary"
          onClick={() => handleEdit(params.row)}
        >
          <Avatar sx={{ bgcolor: "primary.main", width: 30, height: 30 }}>
            <Edit size={15} />
          </Avatar>
        </IconButton>
      ),
    },

    {
      field: "delete",
      headerName: "",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <ConfirmDelete
          itemId={params.row.categoryId}
          onDelete={handleDeleteCategory}
          massage={`คุณต้องการลบหมวดหมู่ ${params.row.categoryName} ใช่หรือไม่?`}
        />
      ),
    },
    { field: "categoryName", headerName: "ชื่อหมวดหมู่", width: 300 },
    { field: "categoryDesc", headerName: "รายละเอียดหมวดหมู่", width: 150 },
    // {
    //   field: "equipments",
    //   headerName: "จำนวนอุปกรณ์",
    //   width: 150,
    //   valueGetter: (value, row) => row._count?.equipments,
    // },
  ];

  const getCategory = async () => {
    await APIServices.get(
      `${CATEGORY_API_BASE_URL}?page=${paginationModel.page + 1}&pageSize=${
        paginationModel.pageSize
      }`,
      setCategoryState,
      setRowCount,
      setOpenBackdrop
    );
  };

  const searchCategory = async () => {
    await APIServices.get(
      `${CATEGORY_API_BASE_URL}/search?page=${
        paginationModel.page + 1
      }&pageSize=${paginationModel.pageSize}&categoryName=${
        formData.categoryName
      }`,
      setCategoryState,
      setRowCount,
      setOpenBackdrop
    );
  };

  const handleDeleteCategory = async (categoryId: string) => {
    setOpenBackdrop(true);
    const result = await categoryService.deleteCategory(categoryId);
    setOpenBackdrop(false);
    setNotify({
      open: true,
      message: result.message,
      color: result.success ? "success" : "error",
    });
    if (result.success) {
      getCategory();
    }
  };

  const handleEdit = (category: Category) => {
    setCategoryForm(category);
    setCategoryEdit(true);
  };

  const handleClear = () => {
    setFormData({
      categoryName: "",
    });
    getCategory();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    searchCategory();
  };

  useEffect(() => {
    getCategory();
  }, [paginationModel, recall]);

  useEffect(() => {
    setCategoryState([]);
  }, []);

  return (
    <>
      <Typography variant="h4" mt={2}>
        หมวดหมู่ทั้งหมด
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "grid", gap: 3 }} mb={4} mt={4}>
          <Grid2 container spacing={2}>
            <Grid2 size={7}>
              <TextField
                fullWidth
                label="ชื่อหมวดหมู่"
                name="categoryName"
                value={formData.categoryName}
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

            <Grid2 size={5} container spacing={1}>
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
      <BaseCard title="หมวดหมู่ทั้งหมด">
        <DataGrid
          getRowId={(row) => row.categoryId}
          initialState={{
            density: "comfortable",
            pagination: { paginationModel },
            columns: {
              columnVisibilityModel: {
                // Hide columns status and traderName, the other columns will remain visible
                categoryDesc: false,
              },
            },
          }}
          pageSizeOptions={[5, 10, 20, 50, 100]}
          sx={{ border: 0, "--DataGrid-overlayHeight": "300px" }}
          rows={categoryState}
          columns={columns}
          paginationMode="server"
          rowCount={rowCount}
          onPaginationModelChange={setPaginationModel}
          slots={{ noRowsOverlay: CustomNoRowsOverlay, toolbar: CustomToolbar }}
        />
      </BaseCard>
    </>
  );
};

export default CategoryTable;
