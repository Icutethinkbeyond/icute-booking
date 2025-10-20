import React, { useState, useEffect } from "react";
import {
  TextField,
  Box,
  InputAdornment,
  Grid,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface SearchFormProps {
  onSearch?: (query: string) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce the search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500); // Adjust the debounce delay as needed

    // Cleanup the timeout if the user types again before the delay finishes
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Call the onSearch function whenever the debounced query changes
  //   useEffect(() => {
  //     if (debouncedQuery) {
  //       onSearch(debouncedQuery);
  //     }
  //   }, [debouncedQuery, onSearch]);

  return (
    <>
      {/* Search Input */}
      <Grid container>
        <Grid item xs={4}>
          <TextField
            label="Search"
            value={searchQuery}
            size="small"
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            variant="outlined"
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          /> 
        </Grid>
      </Grid>
    </>
  );
};

export default SearchForm;
