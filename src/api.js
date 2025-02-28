import axios from "axios";

const endpoint = process.env.REACT_APP_BACKEND_URL;

export const getSalesOrders = async () => {
  const data = await axios.get(endpoint + "/fact_sales").then((res) => res.data);
  return data;
};

export const deleteOrderBook = async ({ column, value }) => {
  const data = await axios
    .delete(endpoint + `/fact_sales/${column}/${value}`)
    .then((res) => res.data);
  return data;
};

export const getOrderDetails = async ({ orderId }) => {
  const data = await axios
    .get(endpoint + `/fact_sales/orderId/${orderId}`)
    .then((res) => res.data);
  return data;
};

export const addOrder = async ({ payload }) => {
  return await axios.post(endpoint + "/fact_sales", payload).then((res) => res.data);
};
