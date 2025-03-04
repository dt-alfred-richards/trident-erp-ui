import React, { useCallback, useContext, useEffect, useState } from "react";
import { FlexBox } from "../Navbar/styles";
import InputField from "../utils/InputField";
import DataTable from "../utils/Table";
import { Button } from "@mui/material";
import axios from "axios";
import { addOrder, getClientDetails, getOrderDetails } from "../../api";
import CustomModal from "../utils/Modal";
import { toast, ToastContainer } from "react-toastify";
import { useParams } from "react-router-dom";
import BasicTable from "../Table/NormalTable";
import { AppContext } from "../context/AppContext";

const fieldsConfig = [
  {
    label: "Date",
    name: "date",
    type: "date",
    value: "",
    error: false,
  },
  {
    label: "Client ID",
    name: "clientId",
    type: "text",
    value: "",
    placeholder: "ORDXXXXXX",
    error: false,
    isDropdown: true,
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
    label: "Client Name",
    name: "clientName",
    type: "text",
    value: "",
    placeholder: "Bharat Traders",
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
  const { setIsLoading } = useContext(AppContext);

  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(
    Object.fromEntries(fieldsConfig.map((item) => [item.name, item]))
  );
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [productList, setProductList] = useState([...rows]);
  const [clientDetails, setClientDetails] = useState([]);
  const [tempList, setTempProduct] = useState({
    productName: {
      label: "Product Name",
      name: "productName",
      type: "text",
      value: "",
      placeholder: "Please provide product name",
      error: false,
      style: { width: "100%" },
    },
    cases: {
      label: "Cases",
      name: "cases",
      type: "number",
      value: "",
      placeholder: "Please provide cases",
      error: false,
      style: { width: "100%" },
    },
    price: {
      label: "Price",
      name: "price",
      type: "number",
      value: "",
      placeholder: "Please provide price",
      error: false,
      style: { width: "100%" },
    },
  });
  const [addModal, setAddModal] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    setIsLoading(true);
    Promise.allSettled([getClientDetails(), getOrderDetails({ orderId })])
      .then((responses) => {
        const clientResponse = responses[0].value?.data ?? [];
        const orderRespose = responses[1].value?.data ?? [];

        setClientDetails(clientResponse);
        setOrderDetails(
          Object.fromEntries(
            fieldsConfig.map((item) => [
              item.name,
              {
                ...item,
                value: orderRespose[0][item.name],
                list:
                  item.name === "clientId"
                    ? clientResponse.map(({ name, clientId }) => ({
                        label: name,
                        value: clientId,
                      }))
                    : [],
              },
            ])
          )
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setOrderDetails((prev) => ({
      ...prev,
      [name]: { ...(prev[name] ?? {}), value },
    }));
  };
  const handleProduct = (event) => {
    const { name, value } = event.target;
    setTempProduct((prev) => ({
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
        toast(error.response.data.message ?? error.message);
      });
  }, [orderDetails]);
  console.log({ orderDetails });
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
        <BasicTable rows={productList} columns={columns} />
        <Button
          variant="outlined"
          style={{ width: 150 }}
          onClick={() => setShowAddItem(true)}
        >
          Add item
        </Button>
        {showAddItem && (
          <FlexBox flexDirection="column">
            <FlexBox
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                columnGap: 20,
              }}
            >
              {Object.values(tempList).map((item) => (
                <InputField {...item} onChange={handleProduct} />
              ))}
            </FlexBox>
            <FlexBox style={{ gap: 20 }}>
              <Button variant="outlined" onClick={() => setShowAddItem(false)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setProductList((p) =>
                    p.concat(
                      Object.fromEntries(
                        Object.values(tempList).map((item) => [
                          item.name,
                          item.value,
                        ])
                      )
                    )
                  );
                  setShowAddItem(false);
                }}
              >
                Confirm
              </Button>
            </FlexBox>
          </FlexBox>
        )}
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
              <CustomModal
                label="Add order"
                setOpen={setAddModal}
                header="Order summary"
                open={addModal}
                footerText="Send for admin approval"
                onConfirm={onAddOrder}
                style={{ flexDirection: "column", gap: 20 }}
              >
                <FlexBox style={{ justifyContent: "space-between" }}>
                  <FlexBox>
                    <span>Date:</span>
                    <span>23-04-2024</span>
                  </FlexBox>
                  <FlexBox>
                    <span>Name:</span>
                    <span>Pradeep</span>
                  </FlexBox>
                  <FlexBox>
                    <span>Reference ::</span>
                    <span>Anwar</span>
                  </FlexBox>
                </FlexBox>
                <BasicTable rows={productList} columns={columns} />
              </CustomModal>
            </FlexBox>
          </>
        )}
      </FlexBox>
    </FlexBox>
  );
};

export default CreateOrder;
