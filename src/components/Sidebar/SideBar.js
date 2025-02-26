import React, { useCallback, useState } from "react";
import { ListItems, SideBarItemsWrapper, SideBarWrapper } from "./styles";
import { useLocation, useNavigate } from "react-router-dom";

const items = [
  { label: "Home", data: "", isdefault: true },
  { label: "Sales", data: "/sales" },
  { label: "Purchase", data: "/purchase" },
  { label: "Inventory", data: "/inventory" },
  { label: "Payment", data: "/payment" },
  { label: "Products", data: "/products" },
  { label: "Customers", data: "/customers" },
  { label: "Suppliers", data: "/suppliers" },
  { label: "Users", data: "/users" },
  { label: "Settings", data: "/settings" },
  { label: "Log out", data: "/logout" },
];

const SideBar = ({ showSideBar }) => {
  const navigate = useNavigate();

  const pathname = useLocation().pathname;

  const onRouteChange = useCallback(({ data }) => {
    navigate(data);
  }, []);

  const checkPathname = useCallback(
    (data) => {
      let pathnameArray = pathname.split("/").filter((item) => item),
        parentPath = data.split("/").filter((item) => item)[0];
      return pathnameArray.includes(parentPath);
    },
    [pathname]
  );

  return (
    <SideBarWrapper showSideBar={showSideBar}>
      <div className="logo" onClick={() => navigate("/")}>
        Trident <strong> .</strong>
      </div>
      <SideBarItemsWrapper showSideBar={showSideBar}>
        {items.map(({ label, data, isDefault }, index) => {
          return (
            <ListItems
              showSideBar={showSideBar}
              key={index + label}
              onClick={() => onRouteChange({ data })}
              selected={
                (pathname === "/" && label === "Home") ||
                checkPathname(data, isDefault)
              }
            >
              {label}
            </ListItems>
          );
        })}
      </SideBarItemsWrapper>
    </SideBarWrapper>
  );
};

export default SideBar;
