import { OrderPriority, OrderStatus } from "@/types/order"
import { string } from "zod";

export type Sale = {
    id: number;
    saleId: string;
    clientId: string;
    orderDate: Date,
    deliveryDate: Date; // ISO timestamp string
    reference: string;
    poId: string;
    poDate: Date; // ISO timestamp string
    poNumber: string;
    shippingAddressId: string;
    remarks: string;
    subtotal: number;
    discountType: string;
    discount: number;
    taxType: string;
    taxTotal: number;
    total: number;
    taxesEnabled: boolean;
    createdOn: Date; // ISO timestamp string
    modifiedOn: Date; // ISO timestamp string
    createdBy: string;
    modifiedBy: string;
    priority?: string;
    status: string
}

export type Basic = {
    createdOn: Date,
    modifiedOn: Date,
    createdBy: string,
    modifiedBy: string
}

export type Client = {
    id: number,
    name: string,
    clientId: string,
    gstNumber: string,
    panNumber: string,
    contactPerson: string,
    email: string,
    phoneNumber: number,
    shippingAddressId: string,
    clientType: string,
    referenceId: string
} & Basic

export type ClientReferences = {
    id: number,
    referenceId: string,
    clientId: string,
    name: string
}
