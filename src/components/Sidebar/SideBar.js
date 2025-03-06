import newStyled from "@emotion/styled";
import { styled } from "@mui/material";
import React, { useCallback, useState } from "react";
import { AiOutlineLogout } from "react-icons/ai";
import { BiPurchaseTag } from "react-icons/bi";
import { FaRegChartBar } from "react-icons/fa";
import { FiUser } from "react-icons/fi";
import { HiUserGroup } from "react-icons/hi2";
import { IoHomeOutline, IoSettingsOutline } from "react-icons/io5";
import {
  MdConnectWithoutContact,
  MdOutlineInventory2,
  MdOutlineProductionQuantityLimits,
} from "react-icons/md";
import { RiSecurePaymentLine } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";
import { FlexBox } from "../Navbar/styles";
import { IoIosArrowDown } from "react-icons/io";

const availablePages = [
  { label: "Home", data: "/", icon: <IoHomeOutline /> },
  { label: "Sales", data: "/sales", icon: <FaRegChartBar /> },
  { label: "Purchase", data: "/purchase", icon: <BiPurchaseTag /> },
  {
    label: "Inventory",
    data: "/inventory",
    icon: <MdOutlineInventory2 />,
    isChildren: true,
    isOpened: false,
    children: [
      { label: "Raw materials", data: "/inventory/raw-materials" },
      { label: "Finished Goods", data: "/inventory/finished-goods" },
    ],
  },
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

const ListItem = styled(FlexBox)(({ disabled }) => ({
  justifyContent: "flex-start",
  alignItems: "center",
  padding: 10,
  borderRadius: 10,
  gap: 10,
  listStyle: "none",
  "&:hover": disabled
    ? { cursor: "pointer" }
    : {
        backgroundColor: "var(--h-bg , #ADB4F3)",
        color: "var(--h-bg, white)",
        cursor: "pointer",
      },
}));

const UIWrapper = newStyled.ul({
  padding: 0,
  display: "flex",
  gap: 10,
  flexDirection: "column",
  marginTop: 24,
  ".selected-li": {
    backgroundColor: "var(--h-bg , #ADB4F3)",
  },
});

const SideBar = ({ showSideBar }) => {
  const navigate = useNavigate();
  const [sideItems, setSideItems] = useState(availablePages);

  const pathname = useLocation().pathname;
  const checkPathname = useCallback(
    (data) => {
      return pathname === data;
    },
    [pathname]
  );

  const toggleChild = (data) => {
    setSideItems((prev) => {
      return prev.map((item) =>
        item.data === data ? { ...item, isOpened: !item.isOpened } : item
      );
    });
  };

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
        {sideItems.map(
          ({
            data,
            label,
            icon = null,
            isChildren = false,
            children = [],
            isOpened,
            isDefault,
          }) => {
            return isChildren ? (
              <div>
                <ListItem
                  disabled
                  onClick={() => toggleChild(data)}
                  style={{ justifyContent: "space-between", gap: 10 }}
                >
                  <FlexBox style={{ gap: 10 }}>
                    {icon}
                    {label}
                  </FlexBox>
                  <IoIosArrowDown
                    style={{
                      transform: `rotate(${isOpened ? "180deg" : "0"})`,
                    }}
                  />
                </ListItem>
                {isOpened && (
                  <FlexBox
                    style={{
                      gap: 10,
                      flexDirection: "column",
                      paddingLeft: 30,
                    }}
                  >
                    {children.map(({ label: childLabel, data: childData }) => (
                      <ListItem
                        onClick={() => navigate(childData)}
                        className={
                          checkPathname(childData) ? "selected-li" : ""
                        }
                      >
                        {childLabel}
                      </ListItem>
                    ))}
                  </FlexBox>
                )}
              </div>
            ) : (
              <ListItem
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
              </ListItem>
            );
          }
        )}
      </UIWrapper>
    </FlexBox>
  );
};

export default SideBar;
