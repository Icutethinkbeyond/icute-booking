import React, { ChangeEvent, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const formatNumber = (value: number) => {
  return new Intl.NumberFormat().format(value);
};

const SummaryPrice: React.FC = () => {
  const [footerForm, setFooterForm] = useState({
    total: 1000,
    discountPrice: 100,
    priceAfterDiscount: 900,
    includeVat: false,
    vatPrice: 63,
    totalAmount: 963,
    withholdingTax: 0,
    withholdingTaxPrice: 0,
    totalAmountDue: 963,
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | any>
  ) => {
    const { name, value, type, checked } = e.target;
    setFooterForm({
      ...footerForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleChangeSelect = (e: SelectChangeEvent<number>) => {
    const { value } = e.target;

    let newValue = Number(value);

    if (footerForm.withholdingTax !== newValue) {
      setFooterForm({
        ...footerForm,
        withholdingTax: newValue,
        withholdingTaxPrice: (newValue / 100) * footerForm.totalAmount,
        totalAmountDue:
          footerForm.totalAmount - (newValue / 100) * footerForm.totalAmount,
      });
    }
  };

  return (
    <Box component="form" noValidate autoComplete="off">
      <Grid container item xs={12} justifyContent="flex-end">
        <Grid item xs={6}>
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
                    <Typography color="textSecondary" variant="h4">
                      Total
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="textSecondary" variant="h6">
                      {formatNumber(footerForm.total)}
                    </Typography>
                  </TableCell>
                </TableRow>
                {/* <TableRow>
                  <TableCell>
                    <Typography color="textSecondary" variant="h6">
                      Discount Price
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="textSecondary" variant="h6">
                      {formatNumber(footerForm.discountPrice)}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography color="textSecondary" variant="h6">
                      Price After Discount
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="textSecondary" variant="h6">
                      {formatNumber(footerForm.priceAfterDiscount)}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <FormControl sx={{ mb: 1, mt: 1 }} fullWidth size="small">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={footerForm.includeVat}
                            onChange={handleChange}
                            name="includeVat"
                          />
                        }
                        label="Vat 7%"
                      />
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Typography color="textSecondary" variant="h6">
                      {formatNumber(footerForm.vatPrice)}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography color="textSecondary" variant="h4">
                      Total Amount
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="textSecondary" variant="h6">
                      {formatNumber(footerForm.totalAmount)}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <FormControl sx={{ mb: 1, mt: 1 }} fullWidth size="small">
                      <InputLabel id="demo-simple-select-label">
                        Withholding Tax
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={footerForm.withholdingTax}
                        label="Withholding Tax"
                        onChange={handleChangeSelect}
                      >
                        <MenuItem value={0}>0%</MenuItem>
                        <MenuItem value={1}>1%</MenuItem>
                        <MenuItem value={2}>2%</MenuItem>
                        <MenuItem value={3}>3%</MenuItem>
                        <MenuItem value={4}>4%</MenuItem>
                        <MenuItem value={5}>5%</MenuItem>
                        <MenuItem value={6}>6%</MenuItem>
                        <MenuItem value={7}>7%</MenuItem>
                        <MenuItem value={8}>8%</MenuItem>
                        <MenuItem value={9}>9%</MenuItem>
                        <MenuItem value={10}>10%</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Typography color="textSecondary" variant="h6">
                      {formatNumber(footerForm.withholdingTaxPrice)}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography color="textSecondary" variant="h3">
                      Total Amount Due
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="textSecondary" variant="h6">
                      {formatNumber(footerForm.totalAmountDue)}
                    </Typography>
                  </TableCell>
                </TableRow> */}
              </TableHead>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SummaryPrice;
