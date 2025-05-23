"use client"

import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { DataByTableName } from "../api";
import { error } from "console";
import { getChildObject } from "../generic";

export type Vehicle = {
    id: number,
    vehicleId: string,
    vehicleType: string,
    model: string,
    capacity: string,
    registrationNumber: string,
    createdOn: Date,
    createdBy: string,
    modifiedOn: Date,
    modifiedBy: string
}
export type Driver = {
    id: number,
    driverId: string,
    fullName: string,
    licenseNumber: string,
    contactNumber: string,
    address: string,
    joiningDate: Date,
    createdOn: Date,
    createdBy: string,
    modifiedOn: Date,
    modifiedBy: string
}

const VehicleContext = createContext<{
    vehicles: Vehicle[],
    drivers: Driver[],
    addVehicle: (payload: Partial<Vehicle>) => Promise<void>,
    updateVehicle: (id: string, payload: any) => Promise<void>,
    deleteVehicle: (id: string) => Promise<void>,
    addDriver: (payload: Partial<Driver>) => Promise<void>,
    updateDriver: (id: string, payload: any) => Promise<void>,
    deleteDriver: (id: string) => Promise<void>
}>({
    vehicles: [],
    drivers: [],
    addVehicle: (payload: Partial<Vehicle>) => Promise.resolve(),
    updateVehicle: (id: string, payload: any) => Promise.resolve(),
    deleteVehicle: (id: string) => Promise.resolve(),
    addDriver: (payload: Partial<Driver>) => Promise.resolve(),
    updateDriver: (id: string, payload: any) => Promise.resolve(),
    deleteDriver: (id: string) => Promise.resolve()
})

export const VehicleProvider = ({ children }: { children: ReactNode }) => {
    const vehicleInstance = new DataByTableName("v1_vehicles")
    const driverInstance = new DataByTableName("v1_drivers")
    const [vehicles, setVehicles] = useState([])
    const [drivers, setDrivers] = useState([])
    const fetchRef = useRef(true)

    const fetchData = () => {
        Promise.allSettled([
            vehicleInstance.get(),
            driverInstance.get()
        ]).then((responses) => {
            const vehicleResponse = getChildObject(responses, "0.value.data", [])
            const driverResponse = getChildObject(responses, "1.value.data", [])
            setVehicles(vehicleResponse)
            setDrivers(driverResponse)
        })
    }


    useEffect(() => {
        if (!fetchRef.current) return;
        fetchRef.current = false

        fetchData();
    }, [])

    const addVehicle = (payload: Partial<Vehicle>) => {
        return vehicleInstance.post(payload)
            .then(() => {
                fetchData()
            }).catch(error => {
                console.log({ error })
            })
    }

    const updateVehicle = (id: string, payload: any) => {
        return vehicleInstance.patch({ key: "vehicle_id", value: id }, payload)
            .then(() => {
                fetchData()
            }).catch(error => {
                console.log({ error })
            })
    }

    const deleteVehicle = (id: string) => {
        return vehicleInstance.deleteById({ key: "vehicle_id", value: id })
            .then(() => {
                fetchData()
            }).catch(error => {
                console.log({ error })
            })
    }

    const addDriver = (payload: Partial<Driver>) => {
        return driverInstance.post(payload)
            .then(() => {
                fetchData()
            }).catch(error => {
                console.log({ error })
            })
    }

    const updateDriver = (id: string, payload: any) => {
        return driverInstance.patch({ key: "driver_id", value: id }, payload)
            .then(() => {
                fetchData()
            }).catch(error => {
                console.log({ error })
            })
    }

    const deleteDriver = (id: string) => {
        return driverInstance.deleteById({ key: "driver_id", value: id })
            .then(() => {
                fetchData()
            }).catch(error => {
                console.log({ error })
            })
    }

    return <VehicleContext.Provider value={{
        addVehicle,
        vehicles,
        updateVehicle,
        deleteVehicle,
        addDriver,
        updateDriver,
        deleteDriver,
        drivers
    }}>
        {children}
    </VehicleContext.Provider>
}


export const useVehicleContext = () => {
    const context = useContext(VehicleContext)

    if (!context) {
        console.log("Please wrap a vehicle provider")
    }

    return context;
}