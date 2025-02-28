import React, { useState } from "react";
import { FlexBox } from "../Navbar/styles";
import BasicTabs from "../Tab/Tabs";
import { Button } from "@mui/material";
import BasicTable from "../Table/NormalTable";

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

const OrderDetails = () => {
  const [selectedTab, setSelectedTab] = useState("");
  return (
    <FlexBox flexDirection="column">
      <FlexBox>
        <h1>Order details</h1>
      </FlexBox>
      <FlexBox>
        <Button>Order</Button>
        <Button>Invoice</Button>
      </FlexBox>
      <FlexBox flexDirection="column">
        <FlexBox>
          <span>Customer</span>
          <span>Placed on 12.01.2025 10:00</span>
        </FlexBox>
        <FlexBox>
          <FlexBox>Customer Name</FlexBox>
          <FlexBox>070 123 4567</FlexBox>
          <FlexBox>example@mail.com</FlexBox>
        </FlexBox>
        <FlexBox>
          <span>Payment method</span>
          <span>Shipping method</span>
          <span></span>
        </FlexBox>
        <FlexBox>
          <span>Credit Card</span>
          <span>Carrier</span>
          <span>Fulfillment status : Delivered</span>
        </FlexBox>
        <FlexBox>
          <span>Transaction ID : 000001-TXT</span>
          <span>Tracking Code : 001</span>
          <span>Payment Status :</span>
        </FlexBox>
        <FlexBox>
          <span>Amount : 18500</span>
          <span>Date : 12-02-2025</span>
          <span>Date : 12-02-2025</span>
        </FlexBox>
      </FlexBox>
      <FlexBox>
        <FlexBox flexDirection="column">
          <h1>Billing address</h1>
          <span>First name : xxxxx</span>
          <span>Last name : xxxxxx</span>
          <span>Address : Paradise, Gachibowli</span>
          <span>city : Hyderabad</span>
          <span>Country : India</span>
          <span>State : Telangana</span>
          <span>Zip code : 5413xx</span>
          <span>Phone : xxxxxxxxxx</span>
        </FlexBox>
        <FlexBox flexDirection="column">
          <h1>Shipping address</h1>
          <span>First name : xxxxx</span>
          <span>Last name : xxxxxx</span>
          <span>Address : Paradise, Gachibowli</span>
          <span>city : Hyderabad</span>
          <span>Country : India</span>
          <span>State : Telangana</span>
          <span>Zip code : 5413xx</span>
          <span>Phone : xxxxxxxxxx</span>
        </FlexBox>
      </FlexBox>
      <FlexBox flexDirection="column">
        <h1>Products</h1>
        <BasicTable rows={rows} columns={columns} />
      </FlexBox>
      <FlexBox flexDirection="column">
        <span>Sub Total : xxxxxxx</span>
        <span>Taxes : xxxxx</span>
        <span>Discount : xxxxx</span>
        <span>Total : xxxxxxx</span>
      </FlexBox>
    </FlexBox>
  );
};

export default OrderDetails;
