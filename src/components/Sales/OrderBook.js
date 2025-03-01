import { Button } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { IoFilterSharp } from "react-icons/io5";
import { PiExportThin } from "react-icons/pi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { toast } from "react-toastify";
import {
  deleteMultipleRecord,
  deleteOrderBook,
  getSalesOrders,
} from "../../api";
import { FlexBox } from "../Navbar/styles";
import DataTable from "../utils/Table";

const columns = [
  {
    field: "orderId",
    headerName: "Product ID",
    width: 130,
  },
  { field: "date", headerName: "Date", width: 130 },
  { field: "custId", headerName: "clientId", width: 130 },
  { field: "name", headerName: "name", width: 130 },
  { field: "invoiceNumber", headerName: "Invoice", width: 130 },
  { field: "refernceName", headerName: "Reference", width: 130 },
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
    orderId: "123",
  },
];

const OrderBook = () => {
  const fetchRef = useRef(true);
  const [data, setData] = useState({});
  const [selectedData, setSelectedRows] = useState([]);

  const fetchData = useCallback(() => {
    return getSalesOrders()
      .then((res) => {
        setData(res.data ?? []);
      })
      .catch((error) => {
        console.log({ error });
      });
  }, []);

  useEffect(() => {
    if (!fetchRef.current) return;
    fetchRef.current = false;
    fetchData();
  }, []);

  const deleteOrder = useCallback(() => {
    if (selectedData.length <= 0) return;
    deleteMultipleRecord({
      ids: selectedData.map((item) => item.orderId),
    })
      .then((res) => {
        toast("Multiple records deleted");
        fetchData();
      })
      .catch((error) => {
        console.log({ error });
        toast("Failed to delete records", { type: "error" });
      });
  }, [selectedData]);

  const notify = () => toast("Wow so easy !");

  return (
    <FlexBox
      flexDirection="column"
      style={{
        flex: 1,
        padding: "24px 70px",
        boxSizing: "border-box",
        maxWidth: "100%",
      }}
    >
      <FlexBox
        style={{
          justifyContent: "space-between",
          backgroundColor: "white",
          borderTopLeftRadius: "10px",
          borderTopRightRadius: "10px",
          padding: "10px 24px",
        }}
      >
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
              width: 110,
            },
          }}
        >
          <Button onClick={deleteOrder}>
            <RiDeleteBin5Line />
            Delete
          </Button>
          <Button onClick={notify}>
            <IoFilterSharp /> Filters
          </Button>
          <Button variant="outlined" style={{ border: "1px solid #D0D5DD" }}>
            <PiExportThin fill="#344054" /> Export
          </Button>
        </FlexBox>
      </FlexBox>
      <FlexBox style={{ maxWidth: "100%", height: "100%" }}>
        {data.length > 0 && (
          <DataTable
            columns={columns}
            width={500}
            height={"100%"}
            rows={data}
            pageSize={10}
            uniqueField={"orderId"}
            onRowSelect={(v) => {
              setSelectedRows(v);
            }}
          />
        )}
      </FlexBox>
    </FlexBox>
  );
};

export default OrderBook;
