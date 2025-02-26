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

const backEnabledRoutes = ["/sales/entry","/sales/orderbook"];

function App() {
  const [showSideBar, setShowSideBar] = useState(true);

  const navigate = useNavigate();
  const pathname = useLocation().pathname;

  const closeSideBar = () => {
    setShowSideBar((s) => !s);
  };

  return (
    <AppWrapper>
      <SideBar showSideBar={showSideBar} />
      <div style={{ width: "100%", background: "rgb(255 248 248)" }}>
        <NavBar closeSideBar={closeSideBar} />
        <div style={{ padding: "24px 24px 0 24px" }}>
          {backEnabledRoutes.includes(pathname) && (
            <Button
              variant="contained"
              style={{ display: "flex", gap: 10, marginBottom: 30 }}
              onClick={() => navigate(-1)}
            >
              <IoMdArrowBack size={20} />
              Back
            </Button>
          )}
          <Routes>
            <Route path="/" Component={Home} />
            <Route path="/sales" Component={Sales} />
            <Route path="/sales/entry" Component={SalesEntry} />
            <Route path="/sales/orderbook" Component={OrderBook} />
            <Route path="/login" Component={Login} />
            <Route path="*" Component={NotFound} />
          </Routes>
        </div>
      </div>
    </AppWrapper>
  );
}

export default App;
