import React from "react";

import image from "../../icons/NotFound.jpg";
import { FlexBox } from "../Navbar/styles";

const NotFound = () => {
  return (
    <FlexBox
      justifyContent="center"
      alignItems="center"
      style={{ height: 500 }}
    >
      <img src={image} alt="not found" />
    </FlexBox>
  );
};

export default NotFound;
