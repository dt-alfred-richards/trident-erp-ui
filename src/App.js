import { useState } from "react";
import { AppWrapper } from "./AppStyles";
import NavBar from "./components/Navbar/Navbar";
import SideBar from "./components/Sidebar/SideBar";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import NotFound from "./components/NotFound/NotFound";
import Home from "./components/Home/Home";
import Sales from "./components/Sales/Sales";
import SalesEntry from "./components/Sales/SalesEntry";
import { Button } from "@mui/material";
import { IoMdArrowBack } from "react-icons/io";
import OrderBook from "./components/Sales/OrderBook";
import Login from "./components/login/Login";
import { FlexBox } from "./components/Navbar/styles";
import ToastProvider from "./ToastContainer";
import CreateOrder from "./components/Sales/CreateOrder";

const backEnabledRoutes = ["/sales/entry", "/sales/orderbook"];

function App() {
  const [showSideBar, setShowSideBar] = useState(true);

  const navigate = useNavigate();
  const pathname = useLocation().pathname;

  const closeSideBar = () => {
    setShowSideBar((s) => !s);
  };

  return (
    <AppWrapper>
      <NavBar closeSideBar={closeSideBar} />
      <FlexBox style={{ flex: 1, height: "calc(100vh - 75px)" }}>
        <SideBar showSideBar={showSideBar} />
        <FlexBox
          style={{
            backgroundColor: "var(--main-bg, #EDF1F5)",
            overflowY: "auto",
            overflowX: "hidden",
            flex: 1,
            boxSizing: "border-box",
          }}
        >
          <Routes>
            <Route path="/" Component={Home} />
            <Route path="/sales" Component={Sales} />
            <Route path="/sales/entry" Component={SalesEntry} />
            <Route path="/sales/orderbook" Component={OrderBook} />
            <Route path="/sales/create-order" Component={CreateOrder} />
            <Route path="/sales/:orderId" Component={CreateOrder} />
            <Route path="/login" Component={Login} />
            <Route path="*" Component={NotFound} />
          </Routes>
        </FlexBox>
      </FlexBox>
    </AppWrapper>
  );
}

export default App;
