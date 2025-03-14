"use client";

import { DataByTableName } from '@/components/utils/api';
import { useOrders } from '@/contexts/order-context';
import React, { Fragment, useEffect, useRef, useState } from 'react'

const ClientComponent = () => {
    const fetchRef = useRef(true);
    const { createClientProposedPrice } = useOrders();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!fetchRef.current) return;

                fetchRef.current = false;
                const clientInstance = new DataByTableName("client_proposed_price");
                const dimClient = new DataByTableName("dim_client");

                const clientPrice = await clientInstance.get();
                const clientDetails = await dimClient.get();

                if (clientPrice?.data) {
                    createClientProposedPrice(clientPrice.data, clientDetails.data);
                }
            } catch (error) {
                console.error("Error fetching client_proposed_price:", error);
            }
        }
        fetchData()
    }, [createClientProposedPrice])

    return <Fragment />
}

export default ClientComponent