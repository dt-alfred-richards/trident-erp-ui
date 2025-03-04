import axios from "axios";

const endpoint = process.env.REACT_APP_BACKEND_URL;

export const getSalesOrders = async () => {
  const data = await axios
    .get(endpoint + "/fact_sales_duplicate")
    .then((res) => res.data);
  return data;
};

export const deleteOrderBook = async ({ column, value }) => {
  const data = await axios
    .delete(endpoint + `/fact_sales_duplicate/${column}/${value}`)
    .then((res) => res.data);
  return data;
};

export const deleteMultipleRecord = async ({ ids }) => {
  return await axios
    .post(endpoint + `/fact_sales_duplicate`, {
      ids,
      type: "delete",
      field: "orderId",
    })
    .then((res) => res.data);
};

export const getOrderDetails = async ({ orderId }) => {
  const data = await axios
    .get(endpoint + `/fact_sales_duplicate/orderId/${orderId}`)
    .then((res) => res.data);
  return data;
};

export const addOrder = async ({ payload }) => {
  return await axios
    .post(endpoint + "/fact_sales_duplicate", payload)
    .then((res) => res.data);
};
export const getClientDetails = async () => {
  return await axios.get(endpoint + "/dim_client").then((res) => res.data);
};
