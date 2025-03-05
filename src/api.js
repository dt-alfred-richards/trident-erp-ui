import axios from "axios";

const endpoint = process.env.REACT_APP_BACKEND_URL;

export const getSalesOrders = async () => {
  const data = await axios
    .get(endpoint + "/fact_sales")
    .then((res) => res.data);
  return data;
};

export const deleteOrderBook = async ({ column, value }) => {
  const data = await axios
    .delete(endpoint + `/fact_sales/${column}/${value}`)
    .then((res) => res.data);
  return data;
};

export const deleteMultipleRecord = async ({ ids }) => {
  return await axios
    .post(endpoint + `/fact_sales`, {
      ids,
      type: "delete",
      field: "orderId",
    })
    .then((res) => res.data);
};

export const getOrderDetails = async ({ orderId }) => {
  const data = await axios
    .get(endpoint + `/fact_sales/orderId/${orderId}`)
    .then((res) => res.data);
  return data;
};

export const addOrder = async ({ payload }) => {
  return await axios
    .post(endpoint + "/fact_sales", payload)
    .then((res) => res.data);
};
export const getClientDetails = async () => {
  return await axios.get(endpoint + "/dim_client").then((res) => res.data);
};

export const getByTableName = async (tableName) => {
  return await axios.get(endpoint + `/${tableName}`).then((res) => res.data);
};

export const updateByTableName = async ({
  tableName,
  column,
  identifier,
  payload,
}) => {
  return await axios
    .patch(endpoint + `/${tableName}/${column}/${identifier}`, payload)
    .then((res) => res.data);
};
