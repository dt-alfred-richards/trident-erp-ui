import newStyled from "@emotion/styled";
import { FlexBox } from "./components/Navbar/styles";

export const AppWrapper = newStyled.div({
  display: "flex",
  height: "100vh",
  flexDirection: "column",
  position: "relative",
  fontFamily: "sen",
});

export const FlexCenter = newStyled(FlexBox)({
  justifyContent: "center",
  alignItems: "center",
});
