import { OrderPriority, OrderStatus } from "@/types/order"

export type Sale = {
    id: number,
    salesId: string,
    orderDate: Date,
    clientId: string,
    deliveryDate: Date,
    reference: string,
    purchaseOrderId: string,
    purchaseOrderDate: Date,
    purchaseOrderNumber: string,
    shippingAddress: string,
    remarks: string,
    status: OrderStatus,
    priority: OrderPriority,
    createdBy: string,
    createdAt: string,
    modifiedBy: string,
    modifiedOn: string,
    subtotal: number,
    discountType: string,
    discount: number,
    taxEnabled: boolean,
    taxType: string,
    taxTotal: number,
    total: number;
}

export type Client = {
    id: number,
    clientName: string,
    contactPerson: string,
    email: string,
    phoneNumber: number,
    address: string,
    clientType: string,
    clientId: string,
    gstNumber: string,
    panNumber: string,
    referenceId: string
}

export type ClientReferences = {
    id: number,
    referenceId: string,
    clientId: string,
    name: string
}
