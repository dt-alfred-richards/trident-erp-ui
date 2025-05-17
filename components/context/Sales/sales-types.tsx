export type Sale = {
    id: "number",
    salesId: "string",
    orderDate: "string",
    clientId: "string",
    deliveryDate: "string",
    reference: "string",
    purchaseOrderId: "string",
    purchaseOrderDate: "string",
    purchaseOrderNumber: "string",
    shippingAddress: "string",
    remarks: "string"
}

export type Client = {
    id: "number",
    clientName: "string",
    contactPerson: "string",
    email: "string",
    phoneNumber: "number",
    address: "string",
    clientType: "string",
    clientId: "string",
    gstNumber: "string",
    panNumber: "string",
    referenceId: "string"
}

export type ClientReferences = {
    id: "number",
    referenceId: "string",
    clientId: "string",
    name: "string"
}
