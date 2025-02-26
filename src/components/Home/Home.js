import React, { useState } from "react";
import BasicCard from "../Card/Card";
import { LuListTodo } from "react-icons/lu";
import { FlexBox } from "../Navbar/styles";
import { Button } from "@mui/material";
import Dropdown from "../Card/Dropdown";

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
  const [selectedOption, setSelectedOption] = useState(undefined);

  return (
    <FlexBox flexDirection={"column"} gap={40}>
      <FlexBox justifyContent="flex-end">
        <Dropdown
          label="Actions"
          onSelect={setSelectedOption}
          options={[
            { label: "Create New Sales Entry" },
            { label: "Record Payment Info" },
            { label: "Update Inventory" },
          ]}
        />
      </FlexBox>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: 50,
          padding:'0 50px'
        }}
      >
        {cards.map((item) => {
          return (
            <BasicCard
              width={250}
              title={item.title}
              description={item.description}
              icon={<IconRender type={item.type} size={40} />}
              style={{ color: "#000000", ...(item.style ?? {}) }}
            />
          );
        })}
      </div>
    </FlexBox>
  );
};

export default Home;
