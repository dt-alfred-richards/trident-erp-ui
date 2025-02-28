import React from "react";
import { IoIosMenu } from "react-icons/io";
import { RiContactsLine } from "react-icons/ri";
import { FlexBox, NavItems, NavWrapper } from "./styles.js";
import { IoNotificationsOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { IoSettingsOutline } from "react-icons/io5";
import { Button } from "@mui/material";
import logo from "./logo.svg";

const NavBar = ({ closeSideBar }) => {
  const navigate = useNavigate();
  return (
    <NavWrapper>
      <FlexBox
        style={{
          justifyContent: "space-between",
          borderBottom: "1px solid #dcdfe4",
          maxHeight: 65,
          alignItems: "center",
          padding: "12px 0",
          boxSizing: "border-box",
          width: 240,
        }}
      >
        <img
          src={logo}
          alt=""
          style={{ width: 100, height: 50, cursor: "pointer" }}
        />
        <Button
          variant="text"
          style={{ minWidth: 30, height: "100%" }}
          onClick={closeSideBar}
        >
          <IoIosMenu size={20} fill={"#000000"} />
        </Button>
      </FlexBox>
      <FlexBox gap={10} style={{ svg: { cursor: "pointer" } }}>
        <IoNotificationsOutline />
        <IoSettingsOutline />
        <RiContactsLine />
      </FlexBox>
    </NavWrapper>
  );
};

export default NavBar;
