import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

export default function Dropdown({ label = "", options, onSelect, variant }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (option) => {
    setAnchorEl(null);
    onSelect(option);
  };

  return (
    <div>
      <Button
        id="basic-button"
        variant={variant ?? "contained"}
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        {label}
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        style={{ border: "1px solid" }}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {options.map((item) => (
          <MenuItem onClick={() => handleClose(item)}>{item.label}</MenuItem>
        ))}
      </Menu>
    </div>
  );
}
