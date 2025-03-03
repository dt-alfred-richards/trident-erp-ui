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
import { deleteMultipleRecord, getSalesOrders } from "../../api";
import { AppContext } from "../context/AppContext";
import { FlexBox } from "../Navbar/styles";
import DataTable from "../utils/Table";
import { useNavigate } from "react-router-dom";

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

  const columns = useMemo(
    () => [
      {
        field: "orderId",
        headerName: "Product ID",
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
      { field: "refernceName", headerName: "Reference", width: 130 },
      { field: "poNumber", headerName: "PO Number", width: 130 },
      { field: "poDate", headerName: "poDate", width: 130 },
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
