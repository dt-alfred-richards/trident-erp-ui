import newStyled from "@emotion/styled";
import React from "react";

import "./loader.scss";
import { FlexCenter } from "../../AppStyles";

const Loader = () => {
  return (
    <FlexCenter
      style={{
        flex: 1,
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundColor: "#EDF1F5",
        zIndex: 10,
      }}
    >
      <span class="loader" />
    </FlexCenter>
  );
};

export default Loader;
