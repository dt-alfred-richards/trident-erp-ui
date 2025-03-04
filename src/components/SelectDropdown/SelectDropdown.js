import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

export default function BasicSelect({
  list = [],
  label = "",
  value,
  name = "",
  onChange,
  placeholder = "",
}) {
  const selected = React.useMemo(() => {
    return list.find((item) => item.value === value);
  }, [value]);

  return (
    <Box
      sx={{
        minWidth: "100%",
      }}
    >
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">{label}</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={selected}
          name={name}
          label={placeholder}
          onChange={onChange}
        >
          {list.map(({ label, value }) => (
            <MenuItem value={value}>{label}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

// export default function BasicSelect({ list = [], label = "", ...props }) {
//   const selected = React.useMemo(() => {
//     return list.find((item) => item.value === props.value);
//   }, []);
//   return (
//     <Box sx={{ width: "100%", height: "100%" }}>
//       <FormControl fullWidth sx={{ height: "100%" }}>
//         <InputLabel id="demo-simple-select-label">{label}</InputLabel>
//         <Select
//           labelId="demo-simple-select-label"
//           id="demo-simple-select"
//           sx={{ width: "100%", height: "100%" }} // Apply 100% width and height here
//           value={selected}
//           {...props}
//         >
//           {list.map(({ label, value }) => (
//             <MenuItem value={value}>{label}</MenuItem>
//           ))}
//         </Select>
//       </FormControl>
//     </Box>
//   );
// }
