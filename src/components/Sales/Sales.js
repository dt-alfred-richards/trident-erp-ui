import React from "react";
import { FlexBox } from "../Navbar/styles";
import BasicCard from "../Card/Card";
import { LuChartNoAxesCombined } from "react-icons/lu";
import { styled } from "@mui/material";
import { IoArrowDown } from "react-icons/io5";
import { IoMdArrowRoundUp } from "react-icons/io";
import Dropdown from "../Card/Dropdown";
import { useNavigate } from "react-router-dom";

const SalesCardWrapper = styled(FlexBox)({
  justifyContent: "space-between",
  alignItems: "center",
  width: 250,
  height: 100,
  padding: 20,
  borderRadius: 10,
  border: "1px solid #dcdfe4",
  boxShadow:
    "rgba(0, 0, 0, 0.04) 0px 5px 22px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px",
  "h2,h3,h4": {
    margin: 0,
  },
});

const SalesCard = ({
  title,
  subtitle,
  subtitle2,
  icon,
  isNegative,
  className,
}) => {
  return (
    <SalesCardWrapper className={className}>
      <FlexBox gap={10} flexDirection={"column"}>
        <h3>{title}</h3>
        <h2>{subtitle}</h2>
        {subtitle2 && (
          <h4>
            {subtitle2}
            {isNegative ? <IoArrowDown /> : <IoMdArrowRoundUp />}
          </h4>
        )}
      </FlexBox>
      <div style={{ marginRight: 20 }}>{icon}</div>
    </SalesCardWrapper>
  );
};

const salesItems = [
  {
    title: "Today’s sales",
    subtitle: "50.3k",
    icon: <LuChartNoAxesCombined size={40} />,
  },
  {
    title: "MTD Sales",
    subtitle: "12.6L",
    subtitle2: "12.4%",
    isNegative: false,
  },
  {
    title: "Cash in Hand",
    subtitle: "4.5L",
    subtitle2: "-8.6%",
    isNegative: true,
  },
];

const Sales = () => {
  const navigate = useNavigate();
  const onSelect = (option) => {
    navigate(option.route);
  };
  return (
    <FlexBox flexDirection="column">
      <FlexBox justifyContent="flex-end">
        <Dropdown
          onSelect={onSelect}
          label="Actions"
          options={[
            { label: "Create new entry", route: "/sales/entry" },
            { label: "Track orders" },
            { label: "Update orders", route: "/sales/orderbook" },
          ]}
        />
      </FlexBox>
      <FlexBox
        style={{
          height: "calc(100vh - 100px)",
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "center",
          gap: "40px",
          ".sales-card-1": {
            marginTop: -100,
          },
        }}
      >
        {salesItems.map((item, index) => (
          <SalesCard {...item} className={`sales-card-${index}`} />
        ))}
        {/* <BasicCard title={"Today’s Sales"} description={"50.3k"} />
      <BasicCard title={"MTD Sales"} description={"12.6L"} />
      <BasicCard title={"Cash in Hand"} description={"4.5l"} /> */}
      </FlexBox>
    </FlexBox>
  );
};

export default Sales;
