import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

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
      {props.type === "date" ? (
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
      ) : (
        <TextField
          id="outlined-basic"
          defaultValue={props.type === "date" ? "19/11/1998" : props.value}
          label={props.label}
          variant="outlined"
          {...props}
        />
      )}
    </Box>
  );
}
