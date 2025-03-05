import { useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AppWrapper } from "./AppStyles";
import Home from "./components/Home/Home";
import Login from "./components/login/Login";
import NavBar from "./components/Navbar/Navbar";
import { FlexBox } from "./components/Navbar/styles";
import NotFound from "./components/NotFound/NotFound";
import CreateOrder from "./components/Sales/CreateOrder";
import OrderBook from "./components/Sales/OrderBook";
import OrderDetails from "./components/Sales/OrderDetails";
import Sales from "./components/Sales/Sales";
import SalesEntry from "./components/Sales/SalesEntry";
import SideBar from "./components/Sidebar/SideBar";
import { AiOutlineLoading } from "react-icons/ai";
import Loader from "./components/loader/Loader";
import { AppProvider } from "./components/context/AppContext";
import Inventory from "./components/Inventory/Inventory";

const backEnabledRoutes = ["/sales/entry", "/sales/orderbook"];

function App() {
  const [showSideBar, setShowSideBar] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const pathname = useLocation().pathname;

  const closeSideBar = () => {
    setShowSideBar((s) => !s);
  };

  return (
    <AppProvider value={{ isLoading, setIsLoading }}>
      <AppWrapper>
        <ToastContainer position="bottom-left" />
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
              position: "relative",
            }}
          >
            {isLoading ? <Loader /> : null}
            <Routes>
              <Route path="/" Component={Home} />
              <Route path="/sales" Component={Sales} />
              <Route path="/sales/entry" Component={SalesEntry} />
              <Route path="/sales/orderbook" Component={OrderBook} />
              <Route path="/sales/create-order" Component={CreateOrder} />
              <Route
                path="/sales/order-details/:orderId"
                Component={OrderDetails}
              />
              <Route path="/sales/:orderId" Component={CreateOrder} />
              <Route path="/inventory" Component={Inventory} />
              <Route path="/login" Component={Login} />
              <Route path="*" Component={NotFound} />
            </Routes>
          </FlexBox>
        </FlexBox>
      </AppWrapper>
    </AppProvider>
  );
}

export default App;
