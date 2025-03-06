import React from "react";
import { FlexBox } from "../Navbar/styles";
import { InventoryHeader } from "./FinishedProducts";
import newStyled from "@emotion/styled";
import RePieChart from "../charts/RePieChart";
import ReBarChart from "../charts/ReBarChart";
import BasicSelect from "../SelectDropdown/SelectDropdown";
import { FlexCenter } from "../../AppStyles";
import GenericTable from "../Sales/GenericTable";
import Cap from "./cap.svg";
export const CardWrapper = newStyled(FlexBox)({
  height: 400,
  width: 400,
  backgroundColor: "white",
  flexDirection: "column",
  borderRadius: 10,
  boxSizing: "border-box",
  padding: 24,
});

const caps = [
  {
    title: "Red caps",
    quantity: 12,
    // filter: "",
  },
  {
    title: "White Caps",
    quantity: 6,
    filter:
      "brightness(0) saturate(100%) invert(76%) sepia(1%) saturate(0%) hue-rotate(5deg) brightness(100%) contrast(92%)",
  },
  {
    title: "Black Caps",
    quantity: 12,
    color: "",
    filter: "brightness(0) saturate(100%)",
  },
  {
    title: "Pink Caps",
    quantity: 1,
    filter:
      "brightness(0) saturate(100%) invert(76%) sepia(58%) saturate(4947%) hue-rotate(234deg) brightness(96%) contrast(89%)",
  },
  {
    title: "Yellow Caps",
    quantity: 17,
    filter:
      "brightness(0) saturate(100%) invert(72%) sepia(90%) saturate(478%) hue-rotate(348deg) brightness(107%) contrast(105%)",
  },
  {
    title: "Orange Caps",
    quantity: 8,
    filter:
      "brightness(0) saturate(100%) invert(55%) sepia(69%) saturate(3521%) hue-rotate(1deg) brightness(103%) contrast(103%)",
  },
];

const consumables = [
  {
    title: "Red Handles",
    quantity: "12",
  },
  {
    title: "White Handles",
    quantity: "12",
  },
  {
    title: "Nilkamal Ink Bottles",
    quantity: "12",
  },
  {
    title: "Nilkamal Make Up",
    quantity: "12",
  },
  {
    title: "Best Code Wash Bottles",
    quantity: "12",
  },
];

const CapCard = ({ title, quantity, filter, showIcon = true }) => {
  return (
    <FlexBox style={{ gap: 40 }}>
      {showIcon && (
        <img src={Cap} alt="" style={{ height: 40, width: 40, filter }} />
      )}
      <FlexBox
        style={{
          justifyContent: "flex-start",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <span>{title}</span>
        <p style={{ margin: 0, color: "#667085" }}>
          Quantity : {quantity} Boxes
        </p>
      </FlexBox>
    </FlexBox>
  );
};

const RawMaterials = () => {
  return (
    <FlexBox
      style={{
        padding: "20px 70px",
        flex: 1,
        alignItems: "flex-start",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <InventoryHeader>Raw materials</InventoryHeader>
      <FlexBox
        style={{
          gap: 20,
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          width: "100%",
        }}
      >
        <FlexBox
          style={{
            flexDirection: "column",
            gap: 20,
            width: "100%",
          }}
        >
          <FlexBox style={{ gap: 20 }}>
            <CardWrapper
              style={{
                gap: 20,
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <FlexCenter style={{ justifyContent: "flex-start", gap: 70 }}>
                <span>Preforms</span>
                <FlexBox style={{ width: 100, gap: 10 }}>
                  <BasicSelect
                    value={"Boxes"}
                    onChange={(value) => console.log({ value })}
                    list={[{ label: "Boxes", value: "Boxes" }]}
                    height={40}
                  />
                  <BasicSelect
                    value={"Kgs"}
                    onChange={(value) => console.log({ value })}
                    list={[{ label: "Kgs", value: "Kgs" }]}
                    height={40}
                  />
                </FlexBox>
              </FlexCenter>
              <ReBarChart height={250} />
            </CardWrapper>
            <CardWrapper style={{ width: "100%" }}>
              <p>Skrink</p>
              <RePieChart />
            </CardWrapper>
          </FlexBox>
          <GenericTable
            setSelectedRows={() => {}}
            rows={[{ orderId: "123" }]}
            deleteOrder={() => {}}
            columns={[
              {
                field: "orderId",
                headerName: "Order id",
                width: 130,
              },
            ]}
            h1={"Labels"}
            chipText={"In Rolls"}
            h5={""}
          />
        </FlexBox>
        <FlexBox style={{ flexDirection: "column", gap: 20 }}>
          <CardWrapper
            style={{
              height: 470,
              gap: 40,
              width: "100%",
              img: { fill: "#BDBDBD" },
            }}
          >
            <span style={{ fontSize: 16 }}>Caps Available</span>
            <FlexBox style={{ flexDirection: "column", gap: 20 }}>
              {caps.map((item) => (
                <CapCard {...item} />
              ))}
            </FlexBox>
          </CardWrapper>
          <CardWrapper
            style={{ height: "max-content", gap: 20, width: "100%" }}
          >
            <span style={{ fontSize: 20 }}>Consumables Available</span>
            <FlexBox style={{ flexDirection: "column", gap: 20 }}>
              {consumables.map((item) => (
                <CapCard showIcon={false} {...item} />
              ))}
            </FlexBox>
          </CardWrapper>
        </FlexBox>
      </FlexBox>
    </FlexBox>
  );
};

export default RawMaterials;
