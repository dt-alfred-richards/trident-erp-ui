import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
    value: { index },
  };
}

export default function BasicTabs({ tabs, handleChange, selectedValue }) {
  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={selectedValue}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          {tabs.map((item, index) => (
            <Tab
              label={item.label}
              {...a11yProps(item.label)}
            />
          ))}
        </Tabs>
      </Box>
    </Box>
  );
}
