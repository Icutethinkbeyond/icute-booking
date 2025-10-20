import React from "react";
import { Card, CardContent, Typography, Box, Button } from "@mui/material";
import { Wrench } from "lucide-react";
interface EquipmentWaitingRepairProps {
  count: number;
}
const EquipmentWaitingRepair: React.FC<EquipmentWaitingRepairProps> = ({
  count,
}) => {
  return (
    <Card sx={{ height: "100%", bgcolor: "white", boxShadow: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" color="text.secondary">
            Equipment
          </Typography>
          <Box
            sx={{
              bgcolor: "#FCD34D",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Wrench size={24} color="#000000" style={{ padding: 2 }} />
          </Box>
        </Box>
        <Typography
          variant="h4"
          component="div"
          sx={{ mt: 2, mb: 1, fontWeight: "bold" }}
        >
          {count}
        </Typography>
        {/* Waiting Repair */}
        <Box
          sx={{
            width: "100%",
            height: 4,
            bgcolor: "#E5E7EB",
            borderRadius: 2,
            mt: 2,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: "60%",
              height: "100%",
              bgcolor: "#3B82F6",
              borderRadius: 2,
              position: "absolute",
            }}
          />
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          Items Awaiting Repair
        </Typography>
      </CardContent>
    </Card>
  );
};
export default EquipmentWaitingRepair;
