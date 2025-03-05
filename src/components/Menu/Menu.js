import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/zoom.css";

export default function Dropdown({ button, options, onOptionSelect }) {
  return (
    <Menu
      position="anchor"
      direction="left"
      portal
      menuButton={
        <MenuButton
          style={{
            border: "none",
            width: 40,
            height: 40,
            backgroundColor: "transparent",
            cursor: "pointer",
          }}
        >
          {button}
        </MenuButton>
      }
      transition
    >
      {options.map(({ element, data }) => (
        <MenuItem onClick={() => onOptionSelect(data)}>{element}</MenuItem>
      ))}
    </Menu>
  );
}
