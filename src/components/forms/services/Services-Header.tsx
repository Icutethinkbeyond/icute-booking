"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
  Box,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  IconButton,
  InputAdornment,
  Chip,
  Collapse,
  Paper,
  Slider,
  Divider,
  Tooltip,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material"

interface ServiceFilters {
  search: string
  category: string
  status: string
  priceRange: [number, number]
  duration: string
}

interface ServicesHeaderProps {
  onAddService: () => void
  onFiltersChange: (filters: ServiceFilters) => void
  onExport: (format: "xlsx" | "csv") => void
  onImport: (file: File, format: "xlsx" | "csv") => void
  totalServices?: number
}

const categories = [
  { id: "all", name: "ทั้งหมด" },
  { id: "hair", name: "ทำผม" },
  { id: "nail", name: "ทำเล็บ" },
  { id: "spa", name: "สปา" },
  { id: "massage", name: "นวด" },
  { id: "facial", name: "ดูแลผิวหน้า" },
]

const statuses = [
  { id: "all", name: "ทั้งหมด" },
  { id: "active", name: "เปิดใช้งาน" },
  { id: "inactive", name: "ปิดใช้งาน" },
]

const durations = [
  { id: "all", name: "ทั้งหมด" },
  { id: "30", name: "30 นาที" },
  { id: "60", name: "1 ชั่วโมง" },
  { id: "90", name: "1.5 ชั่วโมง" },
  { id: "120", name: "2 ชั่วโมง+" },
]

export function ServicesHeader({
  onAddService,
  onFiltersChange,
  onExport,
  onImport,
  totalServices = 0,
}: ServicesHeaderProps) {
  const theme = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [filters, setFilters] = useState<ServiceFilters>({
    search: "",
    category: "all",
    status: "all",
    priceRange: [0, 5000],
    duration: "all",
  })

  const [showFilters, setShowFilters] = useState(false)
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null)
  const [importMenuAnchor, setImportMenuAnchor] = useState<null | HTMLElement>(null)
  const [importFormat, setImportFormat] = useState<"xlsx" | "csv">("xlsx")

  const activeFiltersCount = [
    filters.category !== "all",
    filters.status !== "all",
    filters.priceRange[0] > 0 || filters.priceRange[1] < 5000,
    filters.duration !== "all",
  ].filter(Boolean).length

  const handleFilterChange = (key: keyof ServiceFilters, value: unknown) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleClearFilters = () => {
    const defaultFilters: ServiceFilters = {
      search: "",
      category: "all",
      status: "all",
      priceRange: [0, 5000],
      duration: "all",
    }
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget)
  }

  const handleExportClose = () => {
    setExportMenuAnchor(null)
  }

  const handleExport = (format: "xlsx" | "csv") => {
    onExport(format)
    handleExportClose()
  }

  const handleImportClick = (event: React.MouseEvent<HTMLElement>) => {
    setImportMenuAnchor(event.currentTarget)
  }

  const handleImportClose = () => {
    setImportMenuAnchor(null)
  }

  const handleImportSelect = (format: "xlsx" | "csv") => {
    setImportFormat(format)
    handleImportClose()
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onImport(file, importFormat)
    }
    // Reset input
    event.target.value = ""
  }

  return (
    <Box sx={{ mb: 3 }}>
      {/* Top Row: Title, Search and Actions */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", md: "center" },
          gap: 2,
          mb: 2,
        }}
      >
        {/* Title and Count */}
        <Box>
          <Typography
            variant="h4"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 700,
            }}
          >
            จัดการบริการ
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              mt: 0.5,
            }}
          >
            ทั้งหมด {totalServices} บริการ
          </Typography>
        </Box>

        {/* Actions */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1.5,
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          {/* Search */}
          <TextField
            size="small"
            placeholder="ค้นหาบริการ..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
              endAdornment: filters.search && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => handleFilterChange("search", "")}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: { xs: "100%", sm: 250 },
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />

          {/* Filter Toggle */}
          <Button
            variant={showFilters ? "contained" : "outlined"}
            startIcon={<FilterListIcon />}
            endIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{
              borderRadius: 2,
              borderColor: theme.palette.divider,
              color: showFilters ? theme.palette.primary.contrastText : theme.palette.text.primary,
              backgroundColor: showFilters ? theme.palette.primary.main : "transparent",
              "&:hover": {
                borderColor: theme.palette.primary.main,
                backgroundColor: showFilters ? theme.palette.primary.dark : `${theme.palette.primary.main}10`,
              },
            }}
          >
            ตัวกรอง
            {activeFiltersCount > 0 && (
              <Chip
                label={activeFiltersCount}
                size="small"
                sx={{
                  ml: 1,
                  height: 20,
                  minWidth: 20,
                  backgroundColor: showFilters ? theme.palette.background.paper : theme.palette.primary.main,
                  color: showFilters ? theme.palette.primary.main : theme.palette.primary.contrastText,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              />
            )}
          </Button>

          {/* Import/Export */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="นำเข้าข้อมูล">
              <Button
                variant="outlined"
                startIcon={<ImportIcon />}
                onClick={handleImportClick}
                sx={{
                  borderRadius: 2,
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: `${theme.palette.primary.main}10`,
                  },
                }}
              >
                นำเข้า
              </Button>
            </Tooltip>

            <Tooltip title="ส่งออกข้อมูล">
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={handleExportClick}
                sx={{
                  borderRadius: 2,
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: `${theme.palette.primary.main}10`,
                  },
                }}
              >
                ส่งออก
              </Button>
            </Tooltip>
          </Box>

          {/* Add Button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddService}
            sx={{
              borderRadius: 2,
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              fontWeight: 600,
              px: 3,
              boxShadow: `0 4px 14px ${theme.palette.primary.main}40`,
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
                boxShadow: `0 6px 20px ${theme.palette.primary.main}50`,
              },
            }}
          >
            เพิ่มบริการ
          </Button>
        </Box>
      </Box>

      {/* Expandable Filters */}
      <Collapse in={showFilters}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: theme.palette.background.paper,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 2fr" },
              gap: 3,
              alignItems: "end",
            }}
          >
            {/* Category Filter */}
            <FormControl fullWidth size="small">
              <InputLabel>หมวดหมู่</InputLabel>
              <Select
                value={filters.category}
                label="หมวดหมู่"
                onChange={(e) => handleFilterChange("category", e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Status Filter */}
            <FormControl fullWidth size="small">
              <InputLabel>สถานะ</InputLabel>
              <Select
                value={filters.status}
                label="สถานะ"
                onChange={(e) => handleFilterChange("status", e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                {statuses.map((status) => (
                  <MenuItem key={status.id} value={status.id}>
                    {status.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Duration Filter */}
            <FormControl fullWidth size="small">
              <InputLabel>ระยะเวลา</InputLabel>
              <Select
                value={filters.duration}
                label="ระยะเวลา"
                onChange={(e) => handleFilterChange("duration", e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                {durations.map((dur) => (
                  <MenuItem key={dur.id} value={dur.id}>
                    {dur.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Price Range */}
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  display: "block",
                  mb: 1,
                }}
              >
                ช่วงราคา: ฿{filters.priceRange[0].toLocaleString()} - ฿{filters.priceRange[1].toLocaleString()}
              </Typography>
              <Slider
                value={filters.priceRange}
                onChange={(_, newValue) => handleFilterChange("priceRange", newValue as [number, number])}
                valueLabelDisplay="auto"
                min={0}
                max={5000}
                step={100}
                valueLabelFormat={(value) => `฿${value.toLocaleString()}`}
                sx={{
                  color: theme.palette.primary.main,
                  "& .MuiSlider-thumb": {
                    backgroundColor: theme.palette.background.paper,
                    border: `2px solid ${theme.palette.primary.main}`,
                    "&:hover": {
                      boxShadow: `0 0 0 8px ${theme.palette.primary.main}20`,
                    },
                  },
                  "& .MuiSlider-track": {
                    backgroundColor: theme.palette.primary.main,
                  },
                  "& .MuiSlider-rail": {
                    backgroundColor: theme.palette.divider,
                  },
                }}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Filter Actions */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              variant="text"
              onClick={handleClearFilters}
              sx={{
                color: theme.palette.text.secondary,
                "&:hover": {
                  backgroundColor: `${theme.palette.error.main}10`,
                  color: theme.palette.error.main,
                },
              }}
            >
              ล้างตัวกรอง
            </Button>
          </Box>
        </Paper>
      </Collapse>

      {/* Active Filters Chips */}
      {activeFiltersCount > 0 && !showFilters && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
          {filters.category !== "all" && (
            <Chip
              label={`หมวดหมู่: ${categories.find((c) => c.id === filters.category)?.name}`}
              onDelete={() => handleFilterChange("category", "all")}
              size="small"
              sx={{
                backgroundColor: `${theme.palette.primary.main}15`,
                color: theme.palette.primary.main,
                "& .MuiChip-deleteIcon": {
                  color: theme.palette.primary.main,
                  "&:hover": {
                    color: theme.palette.primary.dark,
                  },
                },
              }}
            />
          )}
          {filters.status !== "all" && (
            <Chip
              label={`สถานะ: ${statuses.find((s) => s.id === filters.status)?.name}`}
              onDelete={() => handleFilterChange("status", "all")}
              size="small"
              sx={{
                backgroundColor: `${theme.palette.primary.main}15`,
                color: theme.palette.primary.main,
                "& .MuiChip-deleteIcon": {
                  color: theme.palette.primary.main,
                  "&:hover": {
                    color: theme.palette.primary.dark,
                  },
                },
              }}
            />
          )}
          {(filters.priceRange[0] > 0 || filters.priceRange[1] < 5000) && (
            <Chip
              label={`ราคา: ฿${filters.priceRange[0].toLocaleString()} - ฿${filters.priceRange[1].toLocaleString()}`}
              onDelete={() => handleFilterChange("priceRange", [0, 5000])}
              size="small"
              sx={{
                backgroundColor: `${theme.palette.primary.main}15`,
                color: theme.palette.primary.main,
                "& .MuiChip-deleteIcon": {
                  color: theme.palette.primary.main,
                  "&:hover": {
                    color: theme.palette.primary.dark,
                  },
                },
              }}
            />
          )}
          {filters.duration !== "all" && (
            <Chip
              label={`ระยะเวลา: ${durations.find((d) => d.id === filters.duration)?.name}`}
              onDelete={() => handleFilterChange("duration", "all")}
              size="small"
              sx={{
                backgroundColor: `${theme.palette.primary.main}15`,
                color: theme.palette.primary.main,
                "& .MuiChip-deleteIcon": {
                  color: theme.palette.primary.main,
                  "&:hover": {
                    color: theme.palette.primary.dark,
                  },
                },
              }}
            />
          )}
          <Chip
            label="ล้างทั้งหมด"
            onClick={handleClearFilters}
            size="small"
            sx={{
              backgroundColor: `${theme.palette.error.main}15`,
              color: theme.palette.error.main,
              cursor: "pointer",
              "&:hover": {
                backgroundColor: `${theme.palette.error.main}25`,
              },
            }}
          />
        </Box>
      )}

      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleExportClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            minWidth: 180,
          },
        }}
      >
        <MenuItem onClick={() => handleExport("xlsx")}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              component="span"
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                backgroundColor: "#217346",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                fontWeight: 700,
              }}
            >
              XLS
            </Box>
            <Typography>ส่งออก Excel (.xlsx)</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={() => handleExport("csv")}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              component="span"
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                backgroundColor: "#4CAF50",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                fontWeight: 700,
              }}
            >
              CSV
            </Box>
            <Typography>ส่งออก CSV (.csv)</Typography>
          </Box>
        </MenuItem>
      </Menu>

      {/* Import Menu */}
      <Menu
        anchorEl={importMenuAnchor}
        open={Boolean(importMenuAnchor)}
        onClose={handleImportClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            minWidth: 180,
          },
        }}
      >
        <MenuItem onClick={() => handleImportSelect("xlsx")}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              component="span"
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                backgroundColor: "#217346",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                fontWeight: 700,
              }}
            >
              XLS
            </Box>
            <Typography>นำเข้า Excel (.xlsx)</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={() => handleImportSelect("csv")}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              component="span"
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                backgroundColor: "#4CAF50",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                fontWeight: 700,
              }}
            >
              CSV
            </Box>
            <Typography>นำเข้า CSV (.csv)</Typography>
          </Box>
        </MenuItem>
      </Menu>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept={importFormat === "xlsx" ? ".xlsx,.xls" : ".csv"}
        onChange={handleFileChange}
      />
    </Box>
  )
}
