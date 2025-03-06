import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { FlexCenter } from "../../AppStyles";
import { FlexBox } from "../Navbar/styles";
import Chart from "../charts/ReactECharts";
import newStyled from "@emotion/styled";
import GenericTable from "../Sales/GenericTable";
import { getByTableName } from "../../api";
import { AppContext } from "../context/AppContext";
import { CardWrapper } from "./RawMaterials";
import RePieChart from "../charts/RePieChart";
import ReBarChart from "../charts/ReBarChart";
export const DashboardCard = newStyled(FlexBox)({
  backgroundColor: "white",
  borderRadius: 10,
  padding: 10,
});

export const InventoryHeader = newStyled(FlexBox)({
  padding: "12px 24px",
  alignItems: "center",
  backgroundColor: "white",
  borderRadius: 10,
  width: "100%",
  flex: 1,
  maxHeight: 42,
});

const TabButton = newStyled(FlexCenter)(({ selected }) => ({
  borderRadius: 13,
  width: 80,
  color: "#9291A5",
  height: 30,
  cursor: "pointer",
  userSelect: "none",
  ...(selected ? { backgroundColor: "black", color: "white" } : {}),
}));

const FinishedProducts = () => {
  const [rows, setRows] = useState([]);
  const [selectedCustom, setSelectedCustom] = useState("bottles");
  const fetchRef = useRef(true);
  const { setIsLoading } = useContext(AppContext);
  const columns = useMemo(() => {
    return [
      { field: "productId", headerName: "Product ID", width: 130 },
      { field: "name", headerName: "Name", width: 130 },
      { field: "type", headerName: "Type", width: 130 },
      { field: "stock", headerName: "Stock In Hand", width: 130 },
    ];
  });

  useEffect(() => {
    if (!fetchRef.current) return;
    fetchRef.current = false;
    setIsLoading(true);
    Promise.allSettled([
      getByTableName("cumulative_inventory"),
      getByTableName("dim_product"),
    ])
      .then((responses) => {
        const inventoryRes = responses[0].value.data,
          productRes = responses[1].value.data;
        setRows(
          inventoryRes.map((item) => ({
            ...item,
            ...(productRes.find((i) => i.productId === item.productId) ?? {}),
          }))
        );
      })
      .finally(() => setIsLoading(false));
  }, []);
  console.log({ selectedCustom });
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
      <InventoryHeader>Finished Products</InventoryHeader>
      <FlexBox
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
        }}
      >
        <CardWrapper style={{ height: 330, width: "100%", gap: 20 }}>
          <span style={{ fontSize: 20 }}>Dhaara</span>
          <FlexBox style={{ gap: 20, height: "100%" }}>
            <FlexBox style={{ flexDirection: "column" }} />
            <RePieChart />
          </FlexBox>
        </CardWrapper>
        <CardWrapper
          style={{ height: 330, width: "100%", flexDirection: "column" }}
        >
          <FlexCenter style={{ justifyContent: "space-between" }}>
            <span style={{ fontSize: 20 }}>Customized</span>
            <FlexCenter
              style={{
                justifyContent: "space-between",
                width: "max-content",
                borderRadius: 14,
                backgroundColor: "#F8F8FF",
              }}
            >
              <TabButton
                name={"bottles"}
                selected={selectedCustom === "bottles"}
                onClick={(event) => setSelectedCustom("bottles")}
              >
                Bottles
              </TabButton>
              <TabButton
                name={"cases"}
                selected={selectedCustom === "cases"}
                onClick={(event) => setSelectedCustom("cases")}
              >
                Cases
              </TabButton>
            </FlexCenter>
          </FlexCenter>
        </CardWrapper>
      </FlexBox>
      <GenericTable
        setSelectedRows={() => {}}
        rows={rows}
        deleteOrder={() => {}}
        columns={columns}
        h1={"Finished Goods Ín Hand"}
        chipText={"Stock In Hand"}
        h5={""}
        uniqueField={"productId"}
      />
    </FlexBox>
  );
};

export default FinishedProducts;
