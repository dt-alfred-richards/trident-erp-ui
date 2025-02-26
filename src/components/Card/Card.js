import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { IconRender } from "../Home/Home";
import { FlexBox } from "../Navbar/styles";

const HTMLConverter = ({ html }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

export default function BasicCard({
  width,
  title,
  description,

}) {
  return (
    <FlexBox
      gap={20}
      width={width}
      height={100}
      padding={20}
      justifyContent={"space-between"}
      border={"1px solid #dcdfe4"}
      borderRadius={10}
      style={{boxShadow:"rgba(0, 0, 0, 0.04) 0px 5px 22px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px"}}
    >
      <div
        class="MuiStack-root mui-9305xi"
        style={{
          gap: 10,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          class="MuiStack-root mui-1821gv5"
          style={{ gap: 10, display: "flex", flexDirection: "column" }}
        >
          <span
            class="MuiTypography-root MuiTypography-overline mui-1en300r"
            style={{ fontSize: 16 }}
          >
            {title}
          </span>
          <h4
            class="MuiTypography-root MuiTypography-h4 mui-1ayhbgf"
            style={{ fontSize: 20, margin: 0 }}
          >
            <div dangerouslySetInnerHTML={{ __html: description }} />{" "}
          </h4>
        </div>
      </div>
      <FlexBox justifyContent="center" alignItems="center"
        class="MuiStack-root mui-1y3ojfh"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <IconRender type="total-orders" size={40} />
      </FlexBox>
    </FlexBox>
  );
}
