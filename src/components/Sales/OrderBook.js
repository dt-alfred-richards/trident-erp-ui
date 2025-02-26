import React, { useEffect, useState } from "react";
import { FlexBox } from "../Navbar/styles";
import DataTable from "../utils/Table";
import { Button } from "@mui/material";
import { RiDeleteBin5Line } from "react-icons/ri";
import { PiExportThin } from "react-icons/pi";
import { IoFilterSharp } from "react-icons/io5";
import { FaPlus } from "react-icons/fa";

const columns = [
  { field: "id", headerName: "Product ID", width: 130 },
  { field: "date", headerName: "Date", width: 130 },
  { field: "clientId", headerName: "clientId", width: 130 },
  { field: "name", headerName: "name", width: 130 },
  { field: "invoice", headerName: "Invoice", width: 130 },
  { field: "reference", headerName: "Reference", width: 130 },
  { field: "poNumber", headerName: "PO Number", width: 130 },
  { field: "poDate", headerName: "poDate", width: 130 },
  { field: "poId", headerName: "PO Id", width: 130 },
  { field: "dc", headerName: "DC", width: 130 },
  { field: "dcDate", headerName: "DC Date", width: 130 },
  { field: "status", headerName: "Status", width: 130 },
];

const rows = [
  {
    id: "some text",
    date: "some text",
    clientId: "some text",
    name: "some text",
    invoice: "some text",
    reference: "some text",
    poNumber: "some text",
    poDate: "some text",
    poId: "some text",
    dc: "some text",
    dcDate: "some text",
    status: "some text",
  },
];

const OrderBook = () => {
  const [data, setData] = useState({});

  return (
    <FlexBox flexDirection="column" style={{ userSelect: "none" }}>
      <FlexBox style={{ justifyContent: "space-between" }}>
        <FlexBox
          flexDirection="column"
          style={{
            marginBottom: 20,
            "h1,h5": {
              margin: 0,
              fontWeight: 500,
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
            },
            h5: { color: "#667085", fontWeight: 400 },
          }}
        >
          <h1>
            Sales{" "}
            <span
              style={{
                fontSize: "14px",
                padding: "3px",
                borderRadius: "10px",
                color: "#0070FF",
                background: "#F7FAFF",
                marginTop: 5,
                marginLeft: 5,
              }}
            >
              Order Book
            </span>
          </h1>
          <h5>Only Admin can Edit the Content of Table</h5>
        </FlexBox>
        <FlexBox
          style={{
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
            button: {
              display: "flex",
              gap: 10,
              height: 48,
              borderRadius: 10,
              textTransform: "unset",
              color: "#344054",
            },
          }}
        >
          <Button>
            <RiDeleteBin5Line />
            Delete
          </Button>
          <Button>
            <IoFilterSharp /> Filters
          </Button>
          <Button variant="outlined" style={{ border: "1px solid #D0D5DD" }}>
            <PiExportThin fill="#344054" /> Export
          </Button>
          <Button variant="contained" style={{ color: "#fff" }}>
            <FaPlus fill="#fff" />
            New Order
          </Button>
        </FlexBox>
      </FlexBox>
      <DataTable
        columns={columns}
        rows={Array.from({ length: 20 }).map((_) => rows[0])}
        checkboxSelection={false}
        pageSize={10}
        onRowSelect={(v) => console.log(v)}
      />
    </FlexBox>
  );
};

export default OrderBook;
