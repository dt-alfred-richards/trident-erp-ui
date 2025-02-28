import React from "react";
import { LuListTodo } from "react-icons/lu";
import { FlexBox } from "../Navbar/styles";

export const IconRender = ({ type, ...props }) => {
  switch (type) {
    case "total-orders":
      return <LuListTodo {...props} />;

    default:
      return null;
  }
};

const cards = [
  { title: "Today’s Orders", description: "15", type: "total-orders" },
  { title: "Today’s Sales", description: "50.3k" },
  { title: "Cash Received", description: "20.4k" },
  {
    title: "Today’s Production",
    description: "Dh500 ML - 90<br/>Antera1000 ML - 110",
  },
  { title: "Today’s Dispatch", description: "21/30" },
  { title: "Cash Paid", description: "30k" },
  {
    title: "Low Inventory",
    description: "Dh1000 ML -  50,<br/> Paradise 250 ML - 60",
  },
  { title: "Vehicles in use", description: "14/25" },
  { title: "Today’s Attendance", description: "7/10" },
];

const Home = () => {
  return (
    <FlexBox style={{ padding: "24px 70px", flex: 1 }}>
      
    </FlexBox>
  );
};

export default Home;
