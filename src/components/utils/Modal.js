import { Button } from "@mui/material";
import React, { useState } from "react";
import { FlexBox } from "../Navbar/styles";
import { IoMdClose } from "react-icons/io";
import newStyled from "@emotion/styled";

const ModelWrapper = newStyled.div({
  position: "absolute",
  width: "100%",
  height: "100%",
  top: "0",
  left: "0",
  zIndex: 2,
  background: "rgb(255 255 255 / 50%)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  userSelect: "none",
  overflow: "hidden",
});

const CustomModal = ({
  children = null,
  open = false,
  setOpen,
  onConfirm = () => {},
  header = "Are you sure you want to delete",
  label = "open modal",
  disabled = false,
}) => {
  const handleOpen = () => {
    setOpen((o) => !o);
  };
  return (
    <div>
      <Button variant="contained" onClick={handleOpen} disabled={disabled}>
        {label}
      </Button>

      {open && (
        <ModelWrapper onClick={handleOpen}>
          <FlexBox
            style={{
              border: "1px solid #EFF0F6",
              minHeight: "max-content",
              minWidth: 500,
              opacity: 1,
              borderRadius: 10,
              backgroundColor: "#fff",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <FlexBox
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 18,
                borderBottom: "1px solid #EFF0F6",
                padding: 24,
              }}
            >
              <span>{header}</span>
              <IoMdClose style={{ cursor: "pointer" }} onClick={handleOpen} />
            </FlexBox>
            <FlexBox style={{ padding: 24, borderBottom: "1px solid #EFF0F6" }}>
              {children}
            </FlexBox>
            <FlexBox
              style={{
                padding: 24,
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Button variant="outlined" onClick={handleOpen}>
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={disabled}
                onClick={(event) => {
                  onConfirm(event);
                  handleOpen();
                }}
              >
                Confirm
              </Button>
            </FlexBox>
          </FlexBox>
        </ModelWrapper>
      )}
    </div>
  );
};

export default CustomModal;
