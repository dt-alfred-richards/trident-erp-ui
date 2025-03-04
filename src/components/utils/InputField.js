import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import BasicSelect from "../SelectDropdown/SelectDropdown";

export default function InputField(props) {
  return (
    <Box
      component="form"
      sx={{
        "& > :not(style)": {
          m: 1,
          width: "25ch",
          backgroundColor: "#fff",
          border: "none",
        },
      }}
      noValidate
      autoComplete="off"
    >
      {props.isDropdown && <BasicSelect {...props} />}
      {props.type === "date" && (
        <TextField
          id="outlined-number"
          type="date"
          slotProps={{
            inputLabel: {
              shrink: true,
              min: new Date(),
            },
          }}
          {...props}
        />
      )}
      {props.type != "date" && !props.isDropdown && (
        <TextField
          id="outlined-basic"
          defaultValue={props.value}
          label={props.label}
          variant="outlined"
          disabled={props.disabled}
          {...props}
        />
      )}
    </Box>
  );
}
