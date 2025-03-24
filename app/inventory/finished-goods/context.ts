import { createContext, useContext } from "react";
import { Allocations, Order } from "./page";

export const FinishedGoodsContext = createContext<{
    orders: Order[],
    allocations: Allocations[]
}>({
    orders: [],
    allocations: [],
});

