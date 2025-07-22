'use client';

import { createBoilerContext } from "@/components/custom/context-boilercode";

export type EventLogger = {
    id: number,
    eventId: string,
    tableName: string,
    fieldValue: string,
    category: string,
    tableId: number,
    createdOn: Date,
    createdBy: string,
    payload: string
}


export const { BoilerProvider: EventsProvider, useBoiler: useEvents } = createBoilerContext<EventLogger>("events_logger")