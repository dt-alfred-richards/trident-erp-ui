import React, { useState } from "react";
import { FlexBox } from "../Navbar/styles";
import InputField from "../utils/InputField";
import DataTable from "../utils/Table";
import CustomModal from "../utils/Modal";
import { Button } from "@mui/material";

const fieldsConfig = [
  {
    label: "Date",
    name: "date",
    type: "date",
    value: "",
    error: false,
  },
  {
    label: "Client Name",
    name: "clientName",
    type: "text",
    value: "",
    placeholder: "Bharat Traders",
    error: false,
  },
  {
    label: "Client ID",
    name: "clientId",
    type: "text",
    value: "",
    placeholder: "ORDXXXXXX",
    error: false,
  },
  {
    label: "Invoice Number",
    name: "invoiceNumber",
    type: "text",
    value: "",
    placeholder: "INVXXXXXXX",
    error: false,
  },
  {
    label: "Reference Name",
    name: "referenceName",
    type: "text",
    value: "",
    placeholder: "Anwar",
    error: false,
  },
  {
    label: "PO Number",
    name: "poNumber",
    type: "text",
    value: "",
    placeholder: "POXXXX",
    error: false,
  },
  {
    label: "PO Date",
    name: "poDate",
    type: "date",
    value: "",
    error: false,
  },
  {
    label: "PO ID",
    name: "poId",
    type: "text",
    value: "",
    placeholder: "POXXXXX",
    error: false,
  },
  {
    label: "DC",
    name: "dc",
    type: "text",
    value: "",
    placeholder: "DCXXXXXX",
    error: false,
  },
  {
    label: "DC Date",
    name: "dcDate",
    type: "date",
    value: "",
    error: false,
  },
  {
    label: "Remarks",
    name: "remarks",
    type: "text",
    placeholder: "Write some sales description here.",
    value: "",
    error: false,
  },
];

const columns = [
  { field: "id", headerName: "Product ID", width: 130 },
  { field: "cases", headerName: "Cases", width: 130 },
  { field: "price", headerName: "Price", width: 100 },
  {
    field: "basePay",
    headerName: "Base Pay",
    width: 100,
  },
  {
    field: "taxes",
    headerName: "Taxes",
    description: "This column has a value getter and is not sortable.",
    sortable: false,
    width: 100,
  },
  {
    field: "amount",
    headerName: "Amount",
    sortable: false,
    width: 160,
  },
];

const rows = [
  {
    id: 1,
    cases: "Snow",
    price: "Jon",
    basePay: 35,
    taxes: 123,
    amount: 123,
  },
  {
    id: 2,
    cases: "Lannister",
    price: "Cersei",
    basePay: 42,
    taxes: 123,
    amount: 123,
  },
];

const SalesEntry = () => {
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState(
    Object.fromEntries(fieldsConfig.map((item) => [item.name, item]))
  );

  const onChange = (event) => {
    let { name, value } = event.target;
    if (!name) return;
    setFields((prev) => ({ ...prev, [name]: { ...prev[name], value } }));
  };
  return (
    <div>
      <FlexBox
        style={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <h1>Sales order details</h1>
        <CustomModal
          header="Are you sure you want to continue"
          label="Next"
          open={open}
          setOpen={setOpen}
          onConfirm={() => console.log("confirm")}
        >
          <FlexBox flexDirection="column">
            <DataTable
              hideFooterPagination={true}
              rows={rows}
              columns={columns}
              checkboxSelection={false}
              onRowSelect={(selected) => console.log({ selected })}
            />
          </FlexBox>
        </CustomModal>
      </FlexBox>
      <FlexBox gap={20}>
        <FlexBox
          style={{
            border: "1px solid #EFF0F6",
            padding: 20,
            background: "#FAF8F8",
            borderRadius: 10,
            display: "grid",
            flexWrap: "wrap",
            width: "50%",
            gap: "20px",
            justifyContent: "space-between",
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          {Object.values(fields).map((item) => (
            <InputField
              onChange={onChange}
              {...item}
              style={{ width: "100%" }}
            />
          ))}
        </FlexBox>
        <FlexBox
          style={{
            width: "50%",
            flexDirection: "column",
            border: "1px solid #EFF0F6",
            padding: 20,
            background: "#FAF8F8",
            borderRadius: 10,
          }}
        >
          <DataTable
            hideFooterPagination={true}
            rows={rows}
            columns={columns}
            checkboxSelection={false}
            onRowSelect={(selected) => console.log({ selected })}
          />
          <FlexBox
            style={{
              marginTop: "auto",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            <InputField
              label="GST Number"
              placeholder="GSTNXXXXXXXX"
              value=""
            />
            <InputField
              label="PAN Number"
              placeholder="KJIGBSXXXXXX"
              value=""
            />
            <InputField
              label="Bill Amount"
              placeholder="Bill Amount"
              value={rows.reduce((a, curr) => {
                a += curr.amount;
                return a;
              }, 0)}
            />
          </FlexBox>
        </FlexBox>
      </FlexBox>
    </div>
  );
};

export default SalesEntry;
