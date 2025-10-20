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

interface Equipment {
  id: number;
  partCode: string;
  partName: string;
  partModel: string;
  partDetails: string;
  partPrice: number;
  quantity: number;
}

const initialData: Equipment[] = [
  {
    id: 1,
    partCode: "73IDU",
    partName: "Excavator",
    quantity: 2,
    partModel: "TH495883",
    partDetails: "test",
    partPrice: 500,
  },
  {
    id: 2,
    partCode: "73IDU",
    partName: "Excavator",
    quantity: 2,
    partModel: "TH495883",
    partDetails: "test",
    partPrice: 300,
  },
];


const PartsTable: React.FC = () => {
  const [equipments, setEquipments] = useState<Equipment[]>(initialData);

  // const handleStatusChange = (index: number, newStatus: string) => {
  //   const updatedEquipments = [...equipments];
  //   updatedEquipments[index].status = newStatus;
  //   setEquipments(updatedEquipments);
  // };

  return (
    <BaseCard title="Parts Table">
      <TableContainer>
        <Table
          aria-label="simple table"
          sx={{
            whiteSpace: "nowrap",
            mt: 2,
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Part SKU</TableCell>
              <TableCell>Part Name</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell>Part Serial</TableCell>
              <TableCell>Part Detail</TableCell>
              <TableCell>Part Price</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Edit</TableCell>
              <TableCell>Remove</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {equipments.map((equipment, index) => (
              <TableRow key={index}>
                <TableCell>{equipment.id}</TableCell>
                <TableCell>{equipment.partName}</TableCell>
                <TableCell>Hydraforce</TableCell>
                <TableCell>{equipment.partCode}</TableCell>
                <TableCell>{equipment.partDetails}</TableCell>
                <TableCell>{equipment.partPrice}</TableCell>
                <TableCell>{equipment.quantity}</TableCell>
                <TableCell>Liter</TableCell>
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
      </TableContainer>
    </BaseCard>
  );
};

export default PartsTable;
