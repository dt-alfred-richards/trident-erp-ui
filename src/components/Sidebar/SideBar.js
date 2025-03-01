import React, { useCallback, useState } from "react";
import { ListItems, SideBarItemsWrapper, SideBarWrapper } from "./styles";
import { useLocation, useNavigate } from "react-router-dom";
import menu from "./icons/menu.svg";
import { FlexBox } from "../Navbar/styles";
import newStyled from "@emotion/styled";
import { AiOutlineLogout } from "react-icons/ai";
import { IoHomeOutline } from "react-icons/io5";
import { FaRegChartBar } from "react-icons/fa";
import { BiPurchaseTag } from "react-icons/bi";
import { MdOutlineInventory2 } from "react-icons/md";
import { RiSecurePaymentLine } from "react-icons/ri";
import { MdOutlineProductionQuantityLimits } from "react-icons/md";
import { HiUserGroup } from "react-icons/hi2";
import { MdConnectWithoutContact } from "react-icons/md";
import { FiUser } from "react-icons/fi";
import { IoSettingsOutline } from "react-icons/io5";
import { IoIosMenu } from "react-icons/io";
import { Button } from "@mui/material";

const items = [
  { label: "Home", data: "", icon: <IoHomeOutline /> },
  { label: "Sales", data: "/sales", icon: <FaRegChartBar /> },
  { label: "Purchase", data: "/purchase", icon: <BiPurchaseTag /> },
  { label: "Inventory", data: "/inventory", icon: <MdOutlineInventory2 /> },
  { label: "Payment", data: "/payment", icon: <RiSecurePaymentLine /> },
  {
    label: "Products",
    data: "/products",
    icon: <MdOutlineProductionQuantityLimits />,
  },
  { label: "Customers", data: "/customers", icon: <HiUserGroup /> },
  { label: "Suppliers", data: "/suppliers", icon: <MdConnectWithoutContact /> },
  { label: "Users", data: "/users", icon: <FiUser /> },
  { label: "Settings", data: "/settings", icon: <IoSettingsOutline /> },
  { label: "Log out", data: "/logout", icon: <AiOutlineLogout /> },
];

const UIWrapper = newStyled.ul({
  padding: 0,
  display: "flex",
  gap: 10,
  flexDirection: "column",
  marginTop: 24,
  ".selected-li": {
    backgroundColor: "var(--h-bg , #ADB4F3)",
  },
  li: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    gap: 10,
    listStyle: "none",
    "&:hover": {
      backgroundColor: "var(--h-bg , #ADB4F3)",
      color: "var(--h-bg, white)",
      cursor: "pointer",
    },
  },
});

const SideBar = ({ showSideBar }) => {
  const navigate = useNavigate();

  const pathname = useLocation().pathname;

  const checkPathname = useCallback(
    (data) => {
      let pathnameArray = pathname.split("/").filter((item) => item),
        parentPath = data.split("/").filter((item) => item)[0];
      return pathnameArray.includes(parentPath);
    },
    [pathname]
  );

  return (
    <FlexBox
      style={{
        padding: showSideBar ? "0 20px" : "0 24px",
        minWidth: showSideBar ? 240 : 40,
        flexDirection: "column",
        userSelect: "none",
        transition: "width 0.5s ease-in-out",
        background: "white",
        height: "100%",
        zIndex: 1,
      }}
    >
      <UIWrapper>
        {items.map(({ data, label, icon = null }) => {
          return (
            <li
              onClick={() => navigate(data)}
              className={checkPathname(data) ? "selected-li" : ""}
            >
              <div style={{ width: 20 }}>{icon}</div>
              <label
                style={{
                  opacity: showSideBar ? 1 : 0,
                  transition: "opacity 0.6s ease-in-out",
                  visibility: showSideBar ? "visible" : "hidden",
                }}
              >
                {showSideBar && label}
              </label>
            </li>
          );
        })}
      </UIWrapper>
    </FlexBox>
  );
};

export default SideBar;
