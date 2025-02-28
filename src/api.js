import axios from "axios";

const endpoint = "http://localhost:4000/v1";

export const getSalesOrders = async () => {
  const data = await axios.get(endpoint + "/sales").then((res) => res.data);
  return data;
};

export const deleteOrderBook = async ({ column, value }) => {
  const data = await axios
    .delete(endpoint + `/sales/${column}/${value}`)
    .then((res) => res.data);
  return data;
};

export const getOrderDetails = async ({ orderId }) => {
  const data = await axios
    .get(endpoint + `/sales/orderId/${orderId}`)
    .then((res) => res.data);
  return data;
};

export const addOrder = async ({ payload }) => {
  return await axios.post(endpoint + "/sales", payload).then((res) => res.data);
};
