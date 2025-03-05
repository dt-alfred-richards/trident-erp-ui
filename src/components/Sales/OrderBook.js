import { Button } from "@mui/material";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { IoFilterSharp } from "react-icons/io5";
import { PiExportThin } from "react-icons/pi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { toast } from "react-toastify";
import {
  deleteMultipleRecord,
  getOrderDetails,
  getSalesOrders,
} from "../../api";
import { AppContext } from "../context/AppContext";
import { FlexBox } from "../Navbar/styles";
import DataTable from "../utils/Table";
import { useNavigate } from "react-router-dom";
import Dropdown from "../Menu/Menu";
import { CiMenuKebab } from "react-icons/ci";
import { CiDeliveryTruck } from "react-icons/ci";
import { MdModeEdit } from "react-icons/md";
import { MdOutlineCancel } from "react-icons/md";
import { SiTicktick } from "react-icons/si";

import { FlexCenter } from "../../AppStyles";
import GenericTable from "./GenericTable";

const ChipRender = ({ status }) => {
  if (!status) return "";
  return <span style={{}}>{status}</span>;
};

const OrderBook = () => {
  const { isLoading, setIsLoading } = useContext(AppContext);
  const fetchRef = useRef(true);
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [selectedData, setSelectedRows] = useState([]);

  const handleMenu = ({ row: { orderId }, data }) => {
    switch (data) {
      case "edit":
        navigate(`/sales/${orderId}`);
        break;
      case "track-order":
        navigate(`/sales/order-details/${orderId}`);
        break;
      default:
        toast("Havent implemented yet", { type: "error" });
        break;
    }
  };

  const columns = useMemo(
    () => [
      {
        field: "orderId",
        headerName: "Order id",
        width: 130,
        renderCell: ({ row: { orderId } }) => (
          <span
            style={{
              cursor: "pointer",
              color: "blue",
              textDecoration: "underline",
            }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/sales/${orderId}`);
            }}
          >
            {orderId}
          </span>
        ),
      },
      { field: "date", headerName: "Date", width: 130 },
      { field: "custId", headerName: "clientId", width: 130 },
      { field: "name", headerName: "name", width: 130 },
      { field: "invoiceNumber", headerName: "Invoice", width: 130 },
      { field: "referenceName", headerName: "Reference", width: 130 },
      { field: "poNumber", headerName: "PO Number", width: 130 },
      { field: "poDate", headerName: "Purchase date", width: 130 },
      { field: "poId", headerName: "PO Id", width: 130 },
      { field: "dc", headerName: "DC", width: 130 },
      { field: "dcDate", headerName: "DC Date", width: 130 },
      {
        field: "status",
        headerName: "Status",
        width: 130,
        renderCell: ({ row: { status = "" } }) => {
          return <ChipRender status={status} />;
        },
      },
      {
        field: "",
        headerName: "",
        width: 100,
        renderCell: ({ row }) => (
          <Dropdown
            button={<CiMenuKebab />}
            options={[
              {
                element: (
                  <FlexCenter style={{ gap: 10, height: 32 }}>
                    <MdModeEdit />
                    Edit
                  </FlexCenter>
                ),
                data: "edit",
              },
              {
                element: (
                  <FlexCenter style={{ gap: 10, height: 32 }}>
                    <CiDeliveryTruck />
                    Track order
                  </FlexCenter>
                ),
                data: "track-order",
              },
              {
                element: (
                  <FlexCenter style={{ gap: 10, height: 32 }}>
                    <SiTicktick />
                    Approve
                  </FlexCenter>
                ),
                data: "approve",
              },
              {
                element: (
                  <FlexCenter style={{ gap: 10, height: 32 }}>
                    <MdOutlineCancel />
                    Cancel order
                  </FlexCenter>
                ),
                data: "cancel",
              },
            ]}
            onOptionSelect={(data) => handleMenu({ row, data })}
          />
        ),
      },
    ],
    []
  );

  const fetchData = useCallback(() => {
    return getSalesOrders()
      .then((res) => {
        setData(res.data ?? []);
      })
      .catch((error) => {
        console.log({ error });
      })
      .finally(() => setIsLoading(false));
  }, [isLoading]);

  useEffect(() => {
    if (!fetchRef.current) return;
    fetchRef.current = false;
    setIsLoading(true);
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

  return (
    <GenericTable
      setSelectedRows={setSelectedRows}
      rows={data}
      deleteOrder={deleteOrder}
      columns={columns}
      h1={"Sales"}
      chipText={"Order Book"}
      h5={"Only Admin can Edit the Content of Table"}
    />
  );
};

export default OrderBook;
