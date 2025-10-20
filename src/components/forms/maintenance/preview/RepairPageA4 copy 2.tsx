"use client"
import { Box, Typography, Grid, Table, TableBody, TableCell, TableRow, TableHead, Checkbox } from "@mui/material"
import { styled } from "@mui/material/styles"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import Image from "next/image"

// Styled Components
const Container = styled(Box)({
  maxWidth: "210mm",
  margin: "20px auto",
  padding: "20px",
  backgroundColor: "white",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  "@media print": {
    margin: 0,
    boxShadow: "none",
    padding: "20mm",
  },
})

const BorderedBox = styled(Box)({
  border: "1px solid black",
  padding: "8px",
})

const BorderedCell = styled(TableCell)({
  border: "1px solid black",
  padding: "8px",
})

const SignatureBox = styled(Box)({
  borderTop: "1px solid black",
  padding: "8px",
  textAlign: "center",
  minHeight: "60px",
})

// Interfaces
interface RepairItem {
  id: number
  description: string
  quantity: string
  btlNo: string
  serialNo: string
}

interface ActivityItem {
  name: string
  activity: string
  hours: string
}

interface MaterialItem {
  no: number
  description: string
  qty: number | string
  unit: string
  price: number
  total: number
  inStock: boolean
}

// Mock Data
const repairItems: RepairItem[] = [
  { id: 1, description: "Welding machine SUMO stick200", quantity: "1", btlNo: "BTL001", serialNo: "SN001" },
  { id: 2, description: "Portable reber bender MC. BE-PRB-22", quantity: "1", btlNo: "BTL002", serialNo: "SN002" },
  { id: 3, description: "Drilling hammer MAKITA HR2475", quantity: "1", btlNo: "BTL003", serialNo: "SN003" },
]

const activityItems: ActivityItem[] = [
  { name: "Mr.Wanchana", activity: "Check and repair this machine", hours: "12 Hrs" },
  { name: "Mr.Sakda", activity: "Replace parts", hours: "12 Hrs." },
]

const materialItems: MaterialItem[] = [
  {
    no: 1,
    description: "Armature assembly for Cutting machine PRB-22",
    qty: 1,
    unit: "Pcs.",
    price: 3050,
    total: 3050,
    inStock: true,
  },
  { no: 2, description: "Hydraulic oil", qty: 0.5, unit: "Liter", price: 250, total: 125, inStock: true },
  {
    no: 3,
    description: "Rubber protection set for Makita HR2470",
    qty: 1,
    unit: "Pcs.",
    price: 288,
    total: 288,
    inStock: true,
  },
  {
    no: 4,
    description: "Tool holder set for Makita HR2470",
    qty: 1,
    unit: "Pcs.",
    price: 518,
    total: 518,
    inStock: true,
  },
]

export default function RepairPaperForm() {
  return (
    <Container>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ width: "100px", position: "relative" }}>
          <Image src="/images/logos/image004.png" alt="logo" width={105} height={70} priority />
        </Box>

        <Box sx={{ flex: 1, textAlign: "center", mx: 4 }}>
          <BorderedBox sx={{ display: "inline-block", px: 4 }}>
            <Typography variant="h6">REPAIR PAPER</Typography>
          </BorderedBox>
        </Box>

        <BorderedBox sx={{ minWidth: "200px" }}>
          <Typography variant="body2">REF:RP/ REF-202</Typography>
          <Typography variant="body2">LPR.......................................</Typography>
          <Typography variant="body2">Q..........................................</Typography>
        </BorderedBox>
      </Box>

      {/* Site and Date Table */}
      <Table sx={{ mb: 3 }}>
        <TableBody>
          <TableRow>
            <BorderedCell>Site</BorderedCell>
            <BorderedCell colSpan={3}>Student Home Koala Project</BorderedCell>
          </TableRow>
          <TableRow>
            <BorderedCell>Date</BorderedCell>
            <BorderedCell>30 Oct 2024</BorderedCell>
            <BorderedCell>Time</BorderedCell>
            <BorderedCell>10:00 AM</BorderedCell>
          </TableRow>
        </TableBody>
      </Table>

      {/* Description of goods Table */}
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Description of goods
      </Typography>
      <Table sx={{ mb: 3 }}>
        <TableHead>
          <TableRow>
            <BorderedCell>No.</BorderedCell>
            <BorderedCell>Description</BorderedCell>
            <BorderedCell>Quantity</BorderedCell>
            <BorderedCell>BTL No.</BorderedCell>
            <BorderedCell>Serial No.</BorderedCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {repairItems.map((item) => (
            <TableRow key={item.id}>
              <BorderedCell>{item.id}</BorderedCell>
              <BorderedCell>{item.description}</BorderedCell>
              <BorderedCell>{item.quantity}</BorderedCell>
              <BorderedCell>{item.btlNo}</BorderedCell>
              <BorderedCell>{item.serialNo}</BorderedCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Breakdown Information */}
      <BorderedBox sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography sx={{ mb: 1 }}>Nature of breakdown :</Typography>
            <Typography color="primary">The machine damage and motor is burn</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography sx={{ mb: 1 }}>Causes :</Typography>
            <Typography color="primary">Machine Deterioration.</Typography>
          </Grid>
        </Grid>
      </BorderedBox>

      {/* Status of repairing */}
      <Typography variant="h6" align="center" sx={{ mb: 2 }}>
        Status of repairing
      </Typography>
      <Table sx={{ mb: 3 }}>
        <TableBody>
          <TableRow>
            <BorderedCell sx={{ width: "50%" }}>
              <Box>
                <Typography>IN Ref : DD</Typography>
                <Typography color="primary" sx={{ ml: 4 }}>
                  18113, 18104, 18179
                </Typography>
              </Box>
              <Box sx={{ mt: 1 }}>
                <Typography>Date :</Typography>
                <Typography color="primary" sx={{ ml: 4 }}>
                  30 Sep 2024
                </Typography>
              </Box>
              <Box sx={{ mt: 1 }}>
                <Typography>Parts Ordering :</Typography>
                <Typography sx={{ ml: 4 }}></Typography>
              </Box>
            </BorderedCell>
            <BorderedCell sx={{ width: "50%" }}>
              <Box>
                <Typography>OUT Ref : DD</Typography>
                <Typography color="primary" sx={{ ml: 4 }}>
                  16145
                </Typography>
              </Box>
              <Box sx={{ mt: 1 }}>
                <Typography>Date :</Typography>
                <Typography color="primary" sx={{ ml: 4 }}>
                  29 Oct 2024
                </Typography>
              </Box>
            </BorderedCell>
          </TableRow>
          <TableRow>
            <BorderedCell sx={{ bgcolor: "#f5f5f5", width: "33%" }}>Time of breakdown</BorderedCell>
            <BorderedCell sx={{ width: "33%" }}>Start :</BorderedCell>
            <BorderedCell sx={{ width: "33%" }}>Finish :</BorderedCell>
          </TableRow>
        </TableBody>
      </Table>

      {/* Activity of repairing */}
      <Typography variant="h6" align="center" sx={{ mb: 2 }}>
        Activity of repairing
      </Typography>
      <Table sx={{ mb: 3 }}>
        <TableHead>
          <TableRow>
            <BorderedCell sx={{ bgcolor: "#f5f5f5", width: "30%" }}>Name</BorderedCell>
            <BorderedCell sx={{ bgcolor: "#f5f5f5", width: "50%" }}>Activities</BorderedCell>
            <BorderedCell sx={{ bgcolor: "#f5f5f5", width: "20%" }}>Man Hours</BorderedCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {activityItems.map((item, index) => (
            <TableRow key={index}>
              <BorderedCell>{item.name}</BorderedCell>
              <BorderedCell>{item.activity}</BorderedCell>
              <BorderedCell>{item.hours}</BorderedCell>
            </TableRow>
          ))}
          {/* Empty rows */}
          {[...Array(3)].map((_, index) => (
            <TableRow key={`empty-${index}`}>
              <BorderedCell>&nbsp;</BorderedCell>
              <BorderedCell>&nbsp;</BorderedCell>
              <BorderedCell>&nbsp;</BorderedCell>
            </TableRow>
          ))}
          <TableRow>
            <BorderedCell sx={{ bgcolor: "#f5f5f5" }}>Time of repairing</BorderedCell>
            <BorderedCell>Start :</BorderedCell>
            <BorderedCell>Finish :</BorderedCell>
          </TableRow>
        </TableBody>
      </Table>

      {/* Materials Table */}
      <Typography variant="h6" align="center" sx={{ mb: 2 }}>
        Material & Spare Parts for repairing
      </Typography>
      <Table sx={{ mb: 3 }}>
        <TableHead>
          <TableRow>
            <BorderedCell>No.</BorderedCell>
            <BorderedCell>Description</BorderedCell>
            <BorderedCell>QTY.</BorderedCell>
            <BorderedCell>Unit</BorderedCell>
            <BorderedCell>Price</BorderedCell>
            <BorderedCell>Total</BorderedCell>
            <BorderedCell>Stock</BorderedCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {materialItems.map((item) => (
            <TableRow key={item.no}>
              <BorderedCell>{item.no}</BorderedCell>
              <BorderedCell>{item.description}</BorderedCell>
              <BorderedCell>{item.qty}</BorderedCell>
              <BorderedCell>{item.unit}</BorderedCell>
              <BorderedCell>{item.price}</BorderedCell>
              <BorderedCell>{item.total}</BorderedCell>
              <BorderedCell>{item.inStock && <CheckCircleIcon color="success" />}</BorderedCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Checkboxes */}
      <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Checkbox />
          <Typography>Included in rental price</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Checkbox defaultChecked />
          <Typography>Back charge to site</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Checkbox />
          <Typography>Make quotation</Typography>
        </Box>
      </Box>

      {/* Signatures */}
      <Grid container spacing={2} sx={{ mt: 4 }}>
        <Grid item xs={4}>
          <SignatureBox>
            <Typography>Technician</Typography>
            <Box sx={{ mt: 2 }}>Mr.Wanchana</Box>
          </SignatureBox>
        </Grid>
        <Grid item xs={4}>
          <SignatureBox>
            <Typography>Plant Engineer</Typography>
            <Box sx={{ mt: 2 }}>Mr.Eakkachai</Box>
          </SignatureBox>
        </Grid>
        <Grid item xs={4}>
          <SignatureBox>
            <Typography>Plant Approval</Typography>
            <Box sx={{ mt: 2 }}>Mr.Pairoj</Box>
          </SignatureBox>
        </Grid>
      </Grid>
    </Container>
  )
}

