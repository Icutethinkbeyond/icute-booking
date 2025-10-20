import { Box, Grid2 } from "@mui/material";
import { GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarFilterButton } from "@mui/x-data-grid";

export function CustomToolbar() {
    return (
      <Grid2 container mb={2} mt={2}>
        <GridToolbarContainer>
          <GridToolbarColumnsButton />
          <GridToolbarFilterButton />
          <GridToolbarDensitySelector
            slotProps={{ tooltip: { title: "Change density" } }}
          />
          <Box sx={{ flexGrow: 1 }} />
        </GridToolbarContainer>
      </Grid2>
    );
  }