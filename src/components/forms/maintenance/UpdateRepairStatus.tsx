import React, { useState } from "react";
import { NextPage } from "next";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Button,
  Input,
  TextField,
  Grid,
  Select,
  MenuItem,
  Grid2,
} from "@mui/material";
import Head from "next/head";
import { Label } from "recharts";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { BrokenItems, DocumentCategory } from "@prisma/client";
import SelectOrAddEquipmentTable from "./tables/SelectOrAddEquipmentTable";
import { Formik } from "formik";
import axios from "axios";
import ConfirmRemove from "@/components/shared/used/ConfirmRemove";
import { Check } from "lucide-react";

interface ComponentProps {
  documentCategory: DocumentCategory;
  handleNext?: () => void;
  handleBack?: () => void;
  viewOnly?: boolean;
}

const UpdateRepairStatus: React.FC<ComponentProps> = ({
  documentCategory,
  handleNext,
  handleBack,
  viewOnly,
}) => {
  const router = useRouter();
  const localActive = useLocale();
  const params = useSearchParams();
  const pathname = usePathname();

  const { setNotify, notify } = useNotifyContext()

  const [loading, setLoading] = useState<boolean>(false);
  const [date, setReturnDate] = useState(new Date());
  const [status, setStatus] = useState("completed");

  const handleWithdraw = () => {
    // Implement withdrawal logic here
    console.log("Withdrawal initiated");
    // You might want to add a state to show a success message or redirect the user
  };

  return (
    <>
      <Box p={3} border="1px solid #ccc" borderRadius="8px">
        <SelectOrAddEquipmentTable repaired={true} handleNext={handleNext}/>
      </Box>
    </>
  );
};

export default UpdateRepairStatus;
