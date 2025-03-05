import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FlexBox } from "../Navbar/styles";
import InputField from "../utils/InputField";
import DataTable from "../utils/Table";
import { Button } from "@mui/material";
import { MdDelete } from "react-icons/md";
import {
  addOrder,
  getByTableName,
  getClientDetails,
  getOrderDetails,
  getProposedProductPrice,
  updateByTableName,
} from "../../api";
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
    label: "Client name",
    name: "clientName",
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
    disabled: true,
  },
  {
    label: "Client ID",
    name: "custId",
    type: "text",
    value: "",
    placeholder: "Bharat Traders",
    error: false,
    disabled: true,
  },
  {
    label: "GST Number",
    name: "gstNumber",
    type: "text",
    value: "",
    placeholder: "xxxxx",
    error: false,
    disabled: true,
  },
  {
    label: "PAN Number",
    name: "panNumber",
    type: "text",
    value: "",
    placeholder: "xxxxx",
    error: false,
    disabled: true,
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

const CreateOrder = () => {
  const { setIsLoading } = useContext(AppContext);

  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(
    Object.fromEntries(fieldsConfig.map((item) => [item.name, item]))
  );
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [productList, setProductList] = useState([]);
  const [clientDetails, setClientDetails] = useState([]);
  const [addModal, setAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({});

  const onDelete = ({ productId }) => {
    setProductList((prev) =>
      prev.filter((item) => item.productId !== productId)
    );
  };

  const columns = useMemo(
    () => [
      { field: "brand", headerName: "Product Name", width: 130 },
      { field: "productId", headerName: "Product id", width: 130, hide: true },
      { field: "stock", headerName: "Cases", width: 130 },
      { field: "proposedPrice", headerName: "Price", width: 100 },
      {
        field: "basePay",
        headerName: "Base Pay",
        width: 100,
        renderCell: ({ row: { proposedPrice, stock } }) => {
          return <span>{proposedPrice * stock}</span>;
        },
      },
      {
        field: "taxes",
        headerName: "Taxes",
        description: "This column has a value getter and is not sortable.",
        sortable: false,
        width: 100,
        renderCell: ({ row: { proposedPrice, stock } }) => {
          return <span>{proposedPrice * stock * 0.1}</span>;
        },
      },
      {
        field: "amount",
        headerName: "Amount",
        sortable: false,
        width: 160,
        renderCell: ({ row: { proposedPrice, stock } }) => {
          return (
            <span>{proposedPrice * stock + proposedPrice * stock * 0.1}</span>
          );
        },
      },
      {
        field: "",
        headerName: null,
        sortable: false,
        width: 160,
        renderCell: ({ row }) => {
          return <MdDelete cursor={"pointer"} onClick={() => onDelete(row)} />;
        },
      },
    ],
    []
  );

  const subTotal = useMemo(() => {
    return productList.reduce((acc, { proposedPrice, stock }) => {
      acc += proposedPrice * stock;
      return acc;
    }, 0);
  }, [productList]);
  const taxes = useMemo(() => {
    return subTotal * 0.1;
  }, [productList, subTotal]);

  const total = useMemo(() => {
    return (subTotal + taxes) * 0.9;
  }, [subTotal, taxes]);

  useEffect(() => {
    setIsLoading(true);
    Promise.allSettled([
      getClientDetails(),
      getOrderDetails({ orderId }),
      getByTableName("client_proposed_price"),
      getByTableName("dim_product"),
      getByTableName("cumulative_inventory"),
    ])
      .then((responses) => {
        const clientResponse = responses[0].value?.data ?? [];
        const orderRespose = (responses[1].value?.data ?? [])[0] ?? {};
        const proposedPrices = responses[2].value?.data ?? [];
        let products = responses[3].value?.data ?? [];
        const inventory = responses[4].value?.data ?? [];

        products = products.map((item) => ({
          ...item,
          label: item.brand,
          value: item.productId,
          ...(proposedPrices.find((i) => i.productId === item.productId) ?? {}),
          ...(inventory.find((i) => i.productId === item.productId) ?? {}),
        }));

        setAvailableProducts(products);
        setClientDetails(clientResponse);

        const updatedOrderDetails = Object.fromEntries(
          fieldsConfig.map((item) => [
            item.name,
            {
              ...item,
              value: orderRespose[item.name],
              list:
                item.name === "clientName"
                  ? clientResponse.map(({ name, clientId, ...item }) => ({
                      label: name,
                      value: clientId,
                      ...item,
                    }))
                  : [],
            },
          ])
        );
        if (orderId) {
          const {
            reference,
            pan,
            gst = "",
          } = clientResponse.find(
            (item) => item.clientId === orderRespose.custId
          );
          updatedOrderDetails["referenceName"].value = reference;
          updatedOrderDetails["panNumber"].value = pan;
          updatedOrderDetails["gstNumber"].value = gst;
          updatedOrderDetails["custId"].value = orderRespose.custId;
          updatedOrderDetails["clientName"].value = orderRespose.custId;
        }
        setOrderDetails(updatedOrderDetails);
      })
      .finally(() => {
        setIsLoading(false);
        if (orderId) {
          setIsEditMode(true);
        }
      });
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setOrderDetails((prev) => {
      const prevClone = { ...prev };
      prevClone[name].value = value;
      if (name === "clientName") {
        const { reference, label, pan, gst } = prevClone[name].list.filter(
          (item) => item.value === value
        )[0];
        prevClone["referenceName"].value = reference;
        prevClone["panNumber"].value = pan;
        prevClone["gstNumber"].value = gst;
        prevClone["custId"].value = value;
      }
      return prevClone;
    });
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
    let payload = Object.fromEntries(
      Object.values(orderDetails)
        .map((item) => [item.name, item.value])
        .filter((item) => [
          "clientName",
          "gstNumber",
          "panNumber",
          "invoiceNumber",
        ])
    );

    if (!checkValidations(payload)) {
      toast("Failed to validate", { type: "error" });
      event.stopPropagation();
    } else {
      const toastId = toast("Please wait...", { isLoading: true });
      updateByTableName({
        tableName: "fact_sales",
        column: "orderId",
        identifier: orderId,
      })
        .then((response) => {
          toast.update(toastId, {
            type: "success",
            render: "Successfully updated",
            isLoading: false,
          });
        })
        .catch((error) => {
          toast.update(toastId, {
            type: "success",
            render: "Failed to update",
            isLoading: false,
          });
        });
    }
  };

  const includes = [
    "date",
    "custId",
    "productId",
    "invoiceNumber",
    "referenceName",
    "remarks",
    "poNumber",
    "poDate",
    "poId",
    "dc",
    "dcDate",
  ];

  const onAddOrder = useCallback(() => {
    let payload = Object.fromEntries(
      Object.values(orderDetails)
        .filter((item) => includes.includes(item.name))
        .map((item) => [item.name, item.value])
    );

    if (!checkValidations(payload)) {
      toast("Please check the required fields", { type: "error" });
      return;
    }

    payload["status"] = "pending";
    addOrder({ payload })
      .then((res) => {
        toast("Order added");
      })
      .catch((error) => {
        toast(error.response.data.message ?? error.message);
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
          rows={productList}
          columns={columns}
          checkboxSelection={false}
          uniqueField={"productId"}
        />
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
              <InputField
                label="Product name"
                name="productName"
                value=""
                placeholder="Please select product"
                list={availableProducts}
                isDropdown={true}
                onChange={(event) => {
                  const { name, value } = event.target;
                  const productDetails = availableProducts.find(
                    (item) => item.productId === value
                  );
                  setNewProduct(productDetails);
                }}
                style={{ width: "100%" }}
              />
              <InputField
                label="Cases"
                name="stock"
                value={newProduct?.stock ?? ""}
                placeholder=""
                style={{ width: "100%" }}
                onChange={(event) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    stock: event.target.value,
                  }))
                }
              />
              <InputField
                label="Price"
                name="proposedPrice"
                value={newProduct?.proposedPrice ?? ""}
                placeholder=""
                style={{ width: "100%" }}
              />
            </FlexBox>
            <FlexBox style={{ gap: 20 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowAddItem(false);
                  setNewProduct({});
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setProductList((prev) => prev.concat(newProduct));
                  setShowAddItem(false);
                  setNewProduct({});
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
              <span>Subtotal</span> : <strong>{subTotal}</strong>
            </h1>
            <h1>
              <span>Taxes</span> : <strong>{taxes}</strong>
            </h1>
            <h1>
              <span>Discount</span> :<strong>{(subTotal + taxes) * 0.1}</strong>
            </h1>
            <h1 style={{ color: "#0070FF" }}>
              <span>Total</span> :{" "}
              <strong style={{ color: "#0070FF" }}>{total}</strong>
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
              label="Cancel order"
              open={openCancel}
              onConfirm={onUpdate}
              disabled={!checkValidations(orderDetails)}
            >
              <span>Are you sure to cancel the order</span>
            </CustomModal>{" "}
            <CustomModal
              header="Approve order"
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
                <DataTable
                  rows={productList}
                  columns={columns}
                  checkboxSelection={false}
                  uniqueField={"productId"}
                />
                <FlexBox
                  style={{
                    justifyContent: "space-between",
                    height: 42,
                    // borderBottom: "1px solid #D9D9D9",
                  }}
                >
                  <span>Bill amount</span> {total}
                </FlexBox>
              </CustomModal>
            </FlexBox>
          </>
        )}
      </FlexBox>
    </FlexBox>
  );
};

export default CreateOrder;
