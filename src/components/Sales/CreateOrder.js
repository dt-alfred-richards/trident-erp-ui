import React, { useCallback, useEffect, useState } from "react";
import { FlexBox } from "../Navbar/styles";
import InputField from "../utils/InputField";
import DataTable from "../utils/Table";
import { Button } from "@mui/material";
import axios from "axios";
import { addOrder, getOrderDetails } from "../../api";
import CustomModal from "../utils/Modal";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

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
    label: "Reference Name*",
    name: "referenceName",
    type: "text",
    value: "",
    placeholder: "Anwar",
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
    label: "GST Number",
    name: "gstNumber",
    type: "text",
    value: "",
    placeholder: "xxxxx",
    error: false,
  },
  {
    label: "PAN Number",
    name: "panNumber",
    type: "text",
    value: "",
    placeholder: "xxxxx",
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
    label: "DC Date",
    name: "dcDate",
    type: "date",
    value: "",
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
    label: "Purchase Order Date",
    name: "poDate",
    type: "date",
    value: "",
    error: false,
  },
  {
    label: "Purchase Order ID",
    name: "poId",
    type: "text",
    value: "",
    placeholder: "POXXXXX",
    error: false,
  },
  {
    label: "Purchase Order Number",
    name: "poNumber",
    type: "text",
    value: "",
    placeholder: "POXXXX",
    error: false,
  },
  {
    label: "Remarks",
    name: "remarks",
    type: "text",
    value: "",
    placeholder: "Please provide feedback",
    error: false,
  },
];

const columns = [
  { field: "productName", headerName: "Product Name", width: 130 },
  { field: "productId", headerName: "Product ", width: 130 },
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
    productId: 1,
    productName: "asd",
    cases: "Snow",
    price: "Jon",
    basePay: 35,
    taxes: 123,
    amount: 123,
  },
];

const CreateOrder = () => {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(
    Object.fromEntries(fieldsConfig.map((item) => [item.name, item]))
  );
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    getOrderDetails({ orderId })
      .then(({ data }) => {
        setOrderDetails(
          Object.fromEntries(
            fieldsConfig.map((item) => [
              item.name,
              { ...item, value: data[0][item.name] },
            ])
          )
        );
      })
      .catch((error) => {
        console.log({ error });
      });
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setOrderDetails((prev) => ({
      ...prev,
      [name]: { ...(prev[name] ?? {}), value },
    }));
  };

  const checkValidations = useCallback(
    (data) => {
      if (!data) return;
      const empty = Object.values(data).filter((item) => !item);
      return empty.length <= 0;
    },
    [orderDetails]
  );

  const onUpdate = (event) => {
    if (!orderDetails) return;
    let paylaod = Object.fromEntries(
      Object.values(orderDetails).map((item) => [item.name, item.value])
    );
    if (checkValidations(paylaod)) {
      toast("Failed to validate", { type: "error" });
      event.stopPropagation();
    } else {
      toast("Successfully updated", { type: "success" });
    }
  };

  const onAddOrder = useCallback(() => {
    let payload = Object.fromEntries(
      Object.values(orderDetails).map((item) => [item.name, item.value])
    );
    if (!checkValidations(payload)) return;
    addOrder({ payload })
      .then((res) => {
        toast("Order added");
      })
      .catch((error) => {
        console.log({ error });
      });
  }, [orderDetails]);

  return (
    <FlexBox
      style={{
        padding: "24px 70px",
        flex: 1,
        height: "100%",
        gap: 20,
        overflow: "hidden",
      }}
    >
      <FlexBox
        style={{
          backgroundColor: "white",
          borderRadius: 10,
          flex: 1,
          maxWidth: "100%",
          flexDirection: "column",
          padding: 24,
          overflowY: "auto",
          gap: 20,
        }}
      >
        <h1
          style={{
            fontSize: 20,
            borderBottom: "1px solid rgb(224 224 224)",
            paddingBottom: 20,
          }}
        >
          {orderId ? "Order details" : "Create Order"}
        </h1>
        <FlexBox
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            columnGap: 20,
            rowGap: 50,
          }}
        >
          {Object.values(orderDetails ?? {}).map((item) => {
            if (item.name === "remarks") return null;
            return (
              <InputField
                style={{
                  width: "100%",
                  height: 32,
                }}
                onChange={handleChange}
                {...item}
              />
            );
          })}
        </FlexBox>
        <InputField
          {...(orderDetails ?? {})["remarks"]}
          onChange={handleChange}
          style={{ width: "100%", marginTop: 40 }}
        />
        <DataTable
          rows={rows}
          columns={columns}
          checkboxSelection={true}
          rowSelection={true}
          uniqueField="productId"
        />
        <FlexBox
          style={{
            flexDirection: "column",
            justifyContent: "flex-end",
            backgroundColor: "#E5F3FA",
            borderRadius: 10,
            alignItems: "flex-end",
            padding: 24,
            span: {
              width: 100,
            },
            h1: {
              fontSize: 16,
              display: "flex",
              gap: 20,
              strong: {
                color: "#757575",
              },
            },
          }}
        >
          <FlexBox
            style={{
              flexDirection: "column",
              width: 400,
              float: "right",
            }}
          >
            <h1>
              <span>Subtotal</span> : <strong>757575</strong>
            </h1>
            <h1>
              <span>Taxes</span> : <strong>757575</strong>
            </h1>
            <h1>
              <span>Discount</span> : <strong>757575</strong>
            </h1>
            <h1 style={{ color: "#0070FF" }}>
              <span>Total</span> :{" "}
              <strong style={{ color: "#0070FF" }}>757575</strong>
            </h1>
          </FlexBox>
        </FlexBox>
        {orderId && (
          <FlexBox
            style={{
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 20,
              padding: "24px 0",
              borderTop: "1px solid #BDBDBD",
            }}
          >
            <CustomModal
              header="Confirm cancel"
              setOpen={setOpenCancel}
              label="Cancel"
              open={openCancel}
              onConfirm={onUpdate}
              disabled={!checkValidations(orderDetails)}
            >
              <span>Are you sure to cancel the order</span>
            </CustomModal>{" "}
            <CustomModal
              header="Confirm update"
              setOpen={setOpenConfirm}
              label="Update"
              open={openConfirm}
              onConfirm={onUpdate}
              disabled={!checkValidations(orderDetails)}
            >
              <span>Are you sure to update the order</span>
            </CustomModal>
          </FlexBox>
        )}
        {!orderId && (
          <>
            <FlexBox
              style={{
                padding: "24px 0",
                borderBottom: "1px solid rgb(224 224 224)",
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
            <FlexBox style={{ padding: "24px 0", justifyContent: "flex-end" }}>
              <Button variant="contained" onClick={onAddOrder}>
                Add order
              </Button>
            </FlexBox>
          </>
        )}
      </FlexBox>
    </FlexBox>
  );
};

export default CreateOrder;
