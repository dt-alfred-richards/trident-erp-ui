import React, { Fragment, useState } from "react";
import { FlexBox } from "../Navbar/styles";
import { Button, styled } from "@mui/material";
import BasicTable from "../Table/NormalTable";
import { IoPhonePortraitOutline } from "react-icons/io5";
import { VscAccount } from "react-icons/vsc";
import { FlexCenter } from "../../AppStyles";
import { MdOutlineEmail } from "react-icons/md";

const columns = [
  { field: "productName", headerName: "Product Name", width: 130 },
  { field: "quantity", headerName: "Quantity", width: 130 },
  { field: "amount", headerName: "Amount", width: 130 },
  { field: "total", headerName: "total", width: 130 },
];

const rows = [
  {
    productName: "asd",
    quantity: "112",
    amount: "Jon",
    total: 35,
  },
];

const TabItem = styled(FlexBox)(({ selected }) => ({
  width: "100px",
  textAlign: "center",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "0 0 12px 0",
  cursor: "pointer",
  borderBottom: selected ? "2px solid blue" : "",
  color: selected ? "#6976EB" : "",
}));

const TabWrapper = styled(FlexBox)({});

const NavTabs = ({ selectedTab = "", options, setSelectedTab }) => {
  return (
    <TabWrapper>
      {options.map((item) => (
        <TabItem
          selected={item.label === selectedTab}
          onClick={() => setSelectedTab(item.label)}
        >
          {item.label}
        </TabItem>
      ))}
    </TabWrapper>
  );
};

const CardWrapper = styled(FlexBox)({
  flexDirection: "column",
  gap: 15,
  "h1,h2,h3": {
    height: 20,
  },
  h1: {
    fontSize: 20,
    fontWeight: 600,
    padding: 0,
    margin: 0,
  },
  h2: { fontSize: 12, padding: 0, margin: 0, fontWeight: 400 },
  h3: {
    fontSize: 14,
    padding: 0,
    margin: 0,
    fontWeight: 400,
    color: "#667085",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
    strong: {
      color: "black",
    },
    span: {
      color: "#667085",
    },
  },
});

const ChipWrapper = styled(FlexCenter)(({ status }) => ({
  padding: "10px 20px",
  borderRadius: 10,
  color: status === "paid" ? "#14BA6D" : "#D4D244",
  border: `1px solid ${status === "paid" ? "#14BA6D" : "#D4D244"}`,
  cursor: "default",
}));

const Card = ({ h1 = "", h2 = "", h3, status = Infinity }) => {
  return (
    <CardWrapper>
      <h1>{h1}</h1>
      {h2 && <h2>{h2}</h2>}
      {h3.map((item, index) => {
        let arr = item.split(":").map((item) => item.trim());
        return (
          <h3>
            <strong>{arr[0]}:</strong>
            {status == index ? (
              <ChipWrapper status={arr[1]?.toLowerCase()}>{arr[1]}</ChipWrapper>
            ) : (
              <span>{arr[1]}</span>
            )}
          </h3>
        );
      })}
    </CardWrapper>
  );
};

const OrderDetails = () => {
  const [selectedTab, setSelectedTab] = useState("Order");
  return (
    <FlexBox
      flexDirection="column"
      style={{ flex: 1, padding: "30px 160px", gap: 20 }}
    >
      <FlexBox
        style={{
          backgroundColor: "white",
          borderRadius: 10,
          padding: "0 27px",
          fontSize: 14,
        }}
      >
        <h1>Order details</h1>
      </FlexBox>
      <FlexBox
        style={{
          flexDirection: "column",
          background: "white",
          borderRadius: 10,
          padding: "31px 28px",
          gap: 20,
        }}
      >
        <NavTabs
          selectedTab={selectedTab}
          options={[{ label: "Order" }, { label: "Invoice" }]}
          setSelectedTab={setSelectedTab}
        />
        {selectedTab === "Order" ? (
          <FlexBox flexDirection="column" style={{ gap: 10 }}>
            <FlexBox
              flexDirection="column"
              style={{
                border: "1px solid #D9D9D9",
                padding: 21,
                borderRadius: 10,
              }}
            >
              <FlexBox
                style={{
                  fontSize: 20,
                  fontWeight: 500,
                  justifyContent: "space-between",
                  paddingBottom: 25,
                  borderBottom: "1px solid #D0D5DD",
                }}
              >
                <span>Customer</span>
                <span>Placed on 12.01.2025 10:00</span>
              </FlexBox>
              <FlexBox
                style={{
                  borderBottom: "1px solid #D0D5DD",
                  padding: "25px 0",
                  gap: 30,
                }}
              >
                <FlexCenter style={{ gap: 10 }}>
                  <VscAccount />
                  Customer Name
                </FlexCenter>
                <FlexCenter style={{ gap: 10 }}>
                  <IoPhonePortraitOutline />
                  070 123 4567
                </FlexCenter>
                <FlexCenter style={{ gap: 10 }}>
                  <MdOutlineEmail /> example@mail.com
                </FlexCenter>
              </FlexBox>
              <FlexBox
                style={{
                  gap: 20,
                  padding: "20px 0",
                  borderBottom: "1px solid #D0D5DD",
                  justifyContent: "space-between",
                }}
              >
                <Card
                  h1="Payment Method"
                  h2="Credit card"
                  h3={["Transaction ID:000001-TXT", "Amount:18500"]}
                />
                <Card
                  h1="Shipping method"
                  h2="Carrier"
                  h3={["Tracking Code:001", "Date:12-02-2025"]}
                />
                <Card
                  h1=""
                  h2=""
                  h3={["Fulfillment status:Delivered", "Payment Status:Paid"]}
                  status={1}
                />
              </FlexBox>
              <FlexBox
                style={{
                  gap: 20,
                  padding: "20px 0",
                }}
              >
                <Card
                  h1="Billing address"
                  h2=""
                  h3={[
                    "First name:xxxxx",
                    "Last name:xxxx",
                    "Address:Paradise, Gachibowli",
                    "city :Hyderabad",
                    "Country :India",
                    "State  :Telangana",
                    "Zip code  :5413xx",
                    "Phone   :xxxxxxxxxx ",
                  ]}
                />
                <Card
                  h1="Shipping address"
                  h2=""
                  h3={[
                    "First name:xxxxx",
                    "Last name:xxxx",
                    "Address:Paradise, Gachibowli",
                    "city :Hyderabad",
                    "Country :India",
                    "State :Telangana",
                    "Zip code :5413xx",
                    "Phone:xxxxxxxxxx ",
                  ]}
                />
              </FlexBox>
            </FlexBox>

            <FlexBox
              flexDirection="column"
              style={{
                border: "1px solid #D9D9D9",
                padding: 21,
                borderRadius: 10,
                gap: 20,
              }}
            >
              <h1
                style={{
                  backgroundColor: "white",
                  fontSize: 20,
                  height: 50,
                  borderBottom: "1px solid #D9D9D9",
                }}
              >
                Products
              </h1>
              <BasicTable rows={rows} columns={columns} />
              <FlexBox
                flexDirection="column"
                style={{
                  backgroundColor: "#E5F3FA",
                  gap: 20,
                  borderRadius: 10,
                  padding: 32,
                  textAlign: "end",
                  strong: {
                    width: 100,
                    fontWeight: 400,
                  },
                }}
              >
                <span>
                  <strong>Sub Total :</strong> xxxxxxx
                </span>
                <span>
                  <strong>Taxes :</strong> xxxxxxx
                </span>
                <span>
                  <strong>Discount :</strong> xxxxxxx
                </span>
                <span style={{ color: "#0070FF" }}>
                  <strong>Total :</strong> xxxxxxx
                </span>
              </FlexBox>
            </FlexBox>
          </FlexBox>
        ) : (
          <FlexBox
            style={{
              border: "1px solid #D9D9D9",
              borderRadius: 10,
              padding: 24,
              flexDirection: "column",
            }}
          >
            <h1
              style={{
                fontSize: 16,
                borderBottom: "1px solid #D0D5DD",
                paddingBottom: 20,
                flex: 1,
              }}
            >
              Invoice #125863478945
            </h1>
            <Card
              h3={[
                "Trident Beverages",
                "Address : xxxxxx",
                "example@mail.com",
                "+91 xxxxxxxxxx",
              ]}
            />
            <FlexBox
              style={{
                gap: 20,
                flexDirection: "row",
                marginTop: 20,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
              }}
            >
              <Card
                h3={[
                  "Customer:",
                  "Address : Paradise, Gachibowli,               Hyderabad, Telangana. xxxxxx",
                  "example@mail.com",
                  "+91 xxxxxxxxxx",
                ]}
              />
              <Card
                h3={[
                  "Order Details : ",
                  "Date : 12-02-2025",
                  "Status : Pending",
                  "Order ID : 002",
                ]}
                status={2}
              />
            </FlexBox>
            <FlexBox
              flexDirection="column"
              style={{
                padding: 21,
                borderRadius: 10,
                gap: 20,
              }}
            >
              <h1
                style={{
                  backgroundColor: "white",
                  fontSize: 20,
                  height: 50,
                  borderBottom: "1px solid #D9D9D9",
                }}
              >
                Products
              </h1>
              <BasicTable rows={rows} columns={columns} />
              <FlexBox
                flexDirection="column"
                style={{
                  backgroundColor: "#E5F3FA",
                  gap: 20,
                  borderRadius: 10,
                  padding: 32,
                  textAlign: "end",
                  strong: {
                    width: 100,
                    fontWeight: 400,
                  },
                }}
              >
                <span>
                  <strong>Sub Total :</strong> xxxxxxx
                </span>
                <span>
                  <strong>Taxes :</strong> xxxxxxx
                </span>
                <span>
                  <strong>Discount :</strong> xxxxxxx
                </span>
                <span style={{ color: "#0070FF" }}>
                  <strong>Total :</strong> xxxxxxx
                </span>
              </FlexBox>
            </FlexBox>
            <FlexBox
              style={{
                padding: "24px 0",
                flexDirection: "column",
              }}
            >
              <span>Terms and Condition:*</span>
              <h3
                style={{
                  height: 50,
                  fontSize: 16,
                  backgroundColor: "rgb(226 222 222)",
                  borderRadius: 10,
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  padding: "0 27px",
                }}
              >
                I acknowledge terms and conditions.
              </h3>
            </FlexBox>
            <FlexBox
              style={{
                justifyContent: "center",
                alignItems: "center",
                gap: 20,
              }}
            >
              <Button variant="contained">Export</Button>
              <Button variant="contained">Print</Button>
            </FlexBox>
          </FlexBox>
        )}
      </FlexBox>
    </FlexBox>
  );
};

export default OrderDetails;
