import React from "react";
import { IoFilterSharp } from "react-icons/io5";
import { PiExportThin } from "react-icons/pi";
import { RiDeleteBin5Line } from "react-icons/ri";
import DataTable from "../utils/Table";
import { FlexBox } from "../Navbar/styles";
import { Button } from "@mui/material";

const GenericTable = ({
  setSelectedRows,
  rows,
  deleteOrder,
  columns,
  h1,
  chipText,
  h5,
  uniqueField = "orderId",
}) => {
  return (
    <FlexBox
      flexDirection="column"
      style={{
        flex: 1,
        padding: "0",
        boxSizing: "border-box",
        maxWidth: "100%",
        minHeight: 500,
        width: "100%",
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
          <h1 style={{ fontSize: 18 }}>
            {h1}
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
              {chipText}
            </span>
          </h1>
          <h5>{h5}</h5>
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
          <Button>
            <IoFilterSharp /> Filters
          </Button>
          <Button variant="outlined" style={{ border: "1px solid #D0D5DD" }}>
            <PiExportThin fill="#344054" /> Export
          </Button>
        </FlexBox>
      </FlexBox>
      <FlexBox style={{ maxWidth: "100%", height: "100%" }}>
        {rows.length > 0 && (
          <DataTable
            columns={columns}
            width={500}
            height={"100%"}
            rows={rows}
            pageSize={10}
            uniqueField={uniqueField}
            onRowSelect={(v) => {
              setSelectedRows(v);
            }}
          />
        )}
      </FlexBox>
    </FlexBox>
  );
};

export default GenericTable;
