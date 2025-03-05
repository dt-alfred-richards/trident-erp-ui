import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { FlexCenter } from "../../AppStyles";
import { FlexBox } from "../Navbar/styles";
import Chart from "../charts/ReactECharts";
import newStyled from "@emotion/styled";
import GenericTable from "../Sales/GenericTable";
import { getByTableName } from "../../api";
import { AppContext } from "../context/AppContext";
export const DashboardCard = newStyled(FlexBox)({
  backgroundColor: "white",
  borderRadius: 10,
  padding: 10,
});

const Inventory = () => {
  const [rows, setRows] = useState([]);
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

  console.log({ rows });

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
      <FlexBox
        style={{
          padding: "12px 24px",
          backgroundColor: "white",
          borderRadius: 10,
          width: "100%",
          flex: 1,
          maxHeight: 42,
        }}
      >
        Finished Products
      </FlexBox>
      <FlexBox
        style={{
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <DashboardCard>
          <Chart
            data={[
              { value: 1048, name: "Search Engine" },
              { value: 735, name: "Direct" },
              { value: 580, name: "Email" },
              { value: 484, name: "Union Ads" },
              { value: 300, name: "Video Ads" },
            ]}
            series={[]}
            height={300}
            width={500}
            type="pie"
          />
        </DashboardCard>
        <DashboardCard>
          <Chart
            title="Customized"
            series={[
              {
                name: "2011",
                type: "bar",
                data: [18203, 23489, 29034, 104970, 131744, 630230],
              },
              {
                name: "2012",
                type: "bar",
                data: [19325, 23438, 31000, 121594, 134141, 681807],
              },
            ]}
            height={300}
            width={500}
            type="horizontal-bar"
          />
        </DashboardCard>
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

export default Inventory;
