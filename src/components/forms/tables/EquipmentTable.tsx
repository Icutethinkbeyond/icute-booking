import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Select,
  MenuItem,
} from "@mui/material";
import { EditNoteTwoTone, DeleteSweepTwoTone } from "@mui/icons-material";
import BaseCard from "@/components/shared/BaseCard";
import { formatNumber } from "@/utils/utils";
import EquipmentRepairForm from "../unused/EquipmentRepairForm";

interface Equipment {
  equipmentId: number;
  equipmentName: string;
  quantity: number;
  status: string;
  rentalPricePerDay: number;
  rentalDays: number;
  totalPrice: number;
}

const initialData: Equipment[] = [
  {
    equipmentId: 1,
    equipmentName: "Excavator",
    quantity: 2,
    status: "Borrow",
    rentalPricePerDay: 500,
    rentalDays: 5,
    totalPrice: 2500,
  },
  {
    equipmentId: 2,
    equipmentName: "Bulldozer",
    quantity: 1,
    status: "Under Maintenance",
    rentalPricePerDay: 800,
    rentalDays: 3,
    totalPrice: 2400,
  },
];

const EquipmentTable: React.FC = () => {
  const [equipments, setEquipments] = useState<Equipment[]>(initialData);

  const handleStatusChange = (index: number, newStatus: string) => {
    const updatedEquipments = [...equipments];
    updatedEquipments[index].status = newStatus;
    setEquipments(updatedEquipments);
  };

  return (
    <BaseCard title="Equipment Rental">
      <TableContainer
        sx={{
          width: {
            xs: "254px",
            sm: "100%",
          },
        }}
      >
        <Table
          aria-label="simple table"
          sx={{
            whiteSpace: "nowrap",
            mt: 2,
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography color="textSecondary" variant="h6">
                  #S/N
                </Typography>
              </TableCell>
              <TableCell>
                <Typography color="textSecondary" variant="h6">
                  Equipment Name
                </Typography>
              </TableCell>
              <TableCell>
                <Typography color="textSecondary" variant="h6">
                  Rental period (days)
                </Typography>
              </TableCell>
              <TableCell>
                <Typography color="textSecondary" variant="h6">
                  Amount
                </Typography>
              </TableCell>
              <TableCell>
                <Typography color="textSecondary" variant="h6">
                  Total Price
                </Typography>
              </TableCell>
              <TableCell>
                <Typography color="textSecondary" variant="h6">
                  Remake
                </Typography>
              </TableCell>
              <TableCell>
                <Typography color="textSecondary" variant="h6">
                  Edit
                </Typography>
              </TableCell>
              <TableCell>
                <Typography color="textSecondary" variant="h6">
                  Remove
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* {products.map((product) => ( */}
            <>
              <TableRow key={1}>
                <TableCell colSpan={6}>Category 1</TableCell>

                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    // onClick={() => handleEditProduct(product)}
                  >
                    <EditNoteTwoTone />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="error"
                    // onClick={() =>
                    //   handleRemoveProduct(product.productServiceNumber)
                    // }
                  >
                    <DeleteSweepTwoTone />
                  </IconButton>
                </TableCell>
              </TableRow>
              {/* {product.subProductList && */}
              {/* // product.subProductList.map((subProduct) => ( */}
              <TableRow key={1}>
                <TableCell style={{ paddingLeft: 34 }}>S/N123456</TableCell>
                <TableCell>Product 1</TableCell>
                <TableCell align="right">10</TableCell>
                <TableCell align="right">3</TableCell>

                <TableCell align="right">3000</TableCell>
                <TableCell align="left">-</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    // onClick={() => handleEditSubProduct(subProduct)}
                  >
                    <EditNoteTwoTone />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="error"
                    // onClick={() =>
                    //   handleRemoveSubProduct(
                    //     product.productServiceNumber,
                    //     subProduct.subProductServiceNumber
                    //   )
                    // }
                  >
                    <DeleteSweepTwoTone />
                  </IconButton>
                </TableCell>
              </TableRow>
              <TableRow key={1}>
                <TableCell style={{ paddingLeft: 34 }}>S/N124356</TableCell>
                <TableCell>Product 2</TableCell>
                <TableCell align="right">10</TableCell>
                <TableCell align="right">3</TableCell>

                <TableCell align="right">3000</TableCell>
                <TableCell align="left">-</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    // onClick={() => handleEditSubProduct(subProduct)}
                  >
                    <EditNoteTwoTone />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="error"
                    // onClick={() =>
                    //   handleRemoveSubProduct(
                    //     product.productServiceNumber,
                    //     subProduct.subProductServiceNumber
                    //   )
                    // }
                  >
                    <DeleteSweepTwoTone />
                  </IconButton>
                </TableCell>
              </TableRow>
              <TableRow key={1}>
                <TableCell style={{ paddingLeft: 34 }}>S/N563456</TableCell>
                <TableCell>Product 3</TableCell>
                <TableCell align="right">10</TableCell>
                <TableCell align="right">3</TableCell>

                <TableCell align="right">3000</TableCell>
                <TableCell align="left">-</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    // onClick={() => handleEditSubProduct(subProduct)}
                  >
                    <EditNoteTwoTone />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="error"
                    // onClick={() =>
                    //   handleRemoveSubProduct(
                    //     product.productServiceNumber,
                    //     subProduct.subProductServiceNumber
                    //   )
                    // }
                  >
                    <DeleteSweepTwoTone />
                  </IconButton>
                </TableCell>
              </TableRow>
              {/* ))} */}
              <TableRow key={1} sx={{ backgroundColor: "#E67E5F", color: '#fff' }}>
                <TableCell colSpan={3} sx={{ textAlign: "center" }}>
                  <Typography sx={{ fontWeight: 700, color: '#fff' }}>Total</Typography>
                </TableCell>
                <TableCell align="right"></TableCell>
                <TableCell align="right"></TableCell>
                <TableCell align="right" sx={{ color: '#fff'}}>
                  <Typography sx={{ fontWeight: 500 }}>
                    {/* {product.sumTotal} */}
                    {formatNumber(9000)} ฿
                  </Typography>
                </TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            </>
            {/* ))} */}
          </TableBody>
        </Table>
      </TableContainer>
      {/* <TableContainer>
        <Table
          aria-label="simple table"
          sx={{
            whiteSpace: "nowrap",
            mt: 2,
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Equipment ID</TableCell>
              <TableCell>Equipment Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Equipment Status</TableCell>
              <TableCell>Rental Price per Day</TableCell>
              <TableCell>Number of Rental Days</TableCell>
              <TableCell>TotalPrice</TableCell>
              <TableCell>Edit</TableCell>
              <TableCell>Remove</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {equipments.map((equipment, index) => (
              <TableRow key={equipment.equipmentId}>
                <TableCell>{equipment.equipmentId}</TableCell>
                <TableCell>{equipment.equipmentName}</TableCell>
                <TableCell>{equipment.quantity}</TableCell>
                <TableCell>
                  <Select
                    value={equipment.status}
                    onChange={(e) => handleStatusChange(index, e.target.value)}
                  >
                    <MenuItem value="Borrow">Borrow</MenuItem>
                    <MenuItem value="Under Maintenance">Under Maintenance</MenuItem>
                    <MenuItem value="Returned">Returned</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>{equipment.rentalPricePerDay}</TableCell>
                <TableCell>{equipment.rentalDays}</TableCell>
                <TableCell>{equipment.totalPrice}</TableCell>
                <TableCell>
                  <IconButton color="primary">
                    <EditNoteTwoTone />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <IconButton color="error">
                    <DeleteSweepTwoTone />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer> */}
    </BaseCard>
  );
};

export default EquipmentTable;
