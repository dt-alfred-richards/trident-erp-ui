import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

export default function BasicSelect({
  list = [],
  label,
  selectedValue,
  handleChange,
}) {
  const handler = (event) => {
    handleChange(event);
  };

  return (
    <Box style={{ width: "100%" }}>
      <FormControl fullWidth style={{ flex: 1 }}>
        <InputLabel id="demo-simple-select-label">{label}</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={selectedValue}
          label="Age"
          onChange={handler}
        >
          {list.map(({ label, data }) => (
            <MenuItem value={data}>{label}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
