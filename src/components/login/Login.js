import React from "react";
import { FlexBox } from "../Navbar/styles";
import NavBar from "../Navbar/Navbar";
import newStyled from "@emotion/styled";
import InputField from "../utils/InputField";
import { width } from "@mui/system";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const LoginWrapper = newStyled(FlexBox)({
  width: "100%",
  height: "100%",
  position: "absolute",
  left: 0,
  top: 0,
  border: "1px solid",
  backgroundColor: "white",
  flexDirection: "column",
  alignItems: "center",
});

const ContentWrapper = newStyled(FlexBox)({
  width: "100%",
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
});

const Login = () => {
  const navigate = useNavigate();
  return (
    <LoginWrapper>
      <NavBar />
      <ContentWrapper>
        <FlexBox
          style={{
            width: 500,
            borderRadius: 10,
            justifyContent: "flex-start",
            gap: 30,
            padding: 24,
            flexDirection: "column",
            boxShadow:
              "rgba(0, 0, 0, 0.04) 0px 5px 22px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px",
          }}
        >
          <span style={{ fontSize: 20 }}>Login</span>
          <InputField
            style={{ width: "100%" }}
            name=""
            label="Enter email address"
            type="email"
            required={true}
          />
          <InputField
            style={{ width: "100%" }}
            name=""
            label="Enter password"
            type="password"
          />
          <Button
            variant="contained"
            style={{ height: 50 }}
            onClick={() => {
              navigate("/");
            }}
          >
            Login
          </Button>
        </FlexBox>
      </ContentWrapper>
    </LoginWrapper>
  );
};

export default Login;
