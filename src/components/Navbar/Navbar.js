import React from "react";
import { IoIosMenu } from "react-icons/io";
import { RiContactsLine } from "react-icons/ri";
import { FlexBox, NavItems, NavWrapper } from "./styles.js";
import { IoNotificationsOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const NavBar = ({ closeSideBar }) => {
  const navigate = useNavigate();
  return (
    <NavWrapper>
      <NavItems>
        <IoIosMenu
          size={20}
          style={{ cursor: "pointer" }}
          onClick={closeSideBar}
        />
        <FlexBox gap={20}>
          <IoNotificationsOutline size={20} style={{ cursor: "pointer" }} />
          <RiContactsLine
            size={20}
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/login")}
          />
        </FlexBox>
      </NavItems>
    </NavWrapper>
  );
};

export default NavBar;
