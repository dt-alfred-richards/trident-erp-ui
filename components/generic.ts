
import _ from "lodash"
import moment from "moment";
import { toast } from "./ui/use-toast";
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export const createType = (object: Record<string, any>) => {
    if (!object) return
    const res = Object.entries(object).map(([key, value]) => {
        return [key, typeof value];
    });

    return Object.fromEntries(res);
};

export const getChildObject = (data: any, path: string, _default?: any) => {
    return _.get(data, path, _default)
}


export const convertDate = (date?: Date) => {
    if (!date) return ""
    return moment(date).format("LL")
}

export const removebasicTypes = (refData: any, additionalFields: string[] = []) => {
    const basicKeys: string[] = ["createdBy", "modifiedBy", "modifiedOn", "createdOn", "id"]
    const result = { ...refData } as any
    for (const key of basicKeys.concat(additionalFields || [])) {
        if (result.hasOwnProperty(key)) {
            delete result[key];
        }
    }
    return result;
}


export const excludeKeys = (data: Record<string, any>, keys: string[]) => {
    return Object.fromEntries(
        Object.entries(data).filter(([key]) => !keys.includes(key))
    )
}


const getDateDifference = (givenDate: Date) => {
    // Parse the given date
    const targetDate: Date = new Date(givenDate);

    // Get today's date without time
    const today: Date = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    // Calculate the difference in milliseconds
    const diffInMs = targetDate.getTime() - today.getTime();

    // Convert milliseconds to days
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    return diffInDays;
}

export type CommonStatus = "low" | "medium" | "high"

export const getPriority = (givenDate?: Date): "low" | "medium" | "high" => {
    if (!givenDate) return "low"
    const diff = getDateDifference(givenDate)
    if (diff <= 2) {
        return "high"
    } else if (diff >= 2 && diff <= 5) {
        return "medium"
    } else {
        return "low"
    }
}

export function toCamelCase(input: string): string {
    return input
        .toLowerCase()
        .replace(/[^a-zA-Z0-9 ]/g, '') // remove non-alphanumeric chars except space
        .split(' ')
        .map((word, index) =>
            index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join('');
}



export function formatRelativeTime(date?: Date): string {
    if (!date) return ""
    const mDate = moment(date);
    const now = moment();

    if (mDate.isSame(now, 'day')) {
        return `Today, ${mDate.format('hh:mm A')}`;
    } else if (mDate.isSame(now.clone().subtract(1, 'day'), 'day')) {
        return `Yesterday, ${mDate.format('hh:mm A')}`;
    } else {
        return mDate.format('MMMM D, hh:mm A'); // fallback
    }
}


export function getStartedAgo(timestamp: string | number | Date): string {
    return `Started ${moment(timestamp).fromNow()}`;
}



export const getCummulativeSum = ({ key, refObject, defaultValue = 0 }: { key: string, refObject: any[], defaultValue?: number }) => {
    return refObject.reduce((acc, curr) => {
        acc += getChildObject(curr, key, defaultValue)
    }, 0)
    return acc;
}

export function formatNumberIndian(value: number): string {
    if (value >= 10000000) {
        return `${(value / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`; // Crores
    } else if (value >= 100000) {
        return `${(value / 100000).toFixed(1).replace(/\.0$/, '')}L`; // Lakhs
    } else if (value >= 10000) {
        return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`; // Thousands
    } else {
        return value?.toString() || '';
    }
}


export const getNumber = (value: string = "") => {
    return value ? parseInt(value) : 0
}

export const handleExport = ({ format, data, filename }: { format: "pdf" | "excel" | "csv", data: any[], filename: string }) => {
    // Format the date for the filename
    const date = new Date(), activeTab = filename
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    filename = `${filename}-${formattedDate}`

    if (data.length === 0) {
        toast({
            title: "Export Error",
            description: "No data to export",
            variant: "destructive",
            duration: 3000,
        })
        return // Exit if no data
    }

    // Handle different export formats
    switch (format) {
        case "pdf":
            const doc = new jsPDF()
            const headers = Object.keys(data[0])
            const body = data.map((row) => headers.map((header) => row[header]))

            doc.text(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report`, 14, 15)
            autoTable(doc, {
                head: [headers],
                body,
                startY: 20,
            })
            doc.save(`${filename}.pdf`)
            toast({
                title: "PDF Export",
                description: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} report has been exported as PDF.`,
                duration: 3000,
            })
            break

        case "excel": {
            // Build the worksheet and workbook.
            const ws = XLSX.utils.json_to_sheet(data)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, activeTab.charAt(0).toUpperCase() + activeTab.slice(1))

            // Generate an ArrayBuffer and turn it into a Blob.
            const arrayBuffer = XLSX.write(wb, {
                bookType: "xlsx",
                type: "array",
            }) as ArrayBuffer

            const blob = new Blob([arrayBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            })

            // Trigger a client-side download.
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `${filename}.xlsx`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            toast({
                title: "Excel Export",
                description: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} report has been exported as Excel.`,
                duration: 3000,
            })
            break
        }

        case "csv":
            const headersCsv = Object.keys(data[0])
            const csvContent = [
                headersCsv.join(","),
                ...data.map((row) =>
                    headersCsv
                        .map((header) => {
                            const cell = row[header]
                            // Handle commas and quotes in the data
                            return typeof cell === "string" && (cell.includes(",") || cell.includes('"'))
                                ? `"${cell.replace(/"/g, '""')}"`
                                : cell
                        })
                        .join(","),
                ),
            ].join("\n")

            // Create and download the file
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.setAttribute("href", url)
            link.setAttribute("download", `${filename}.csv`)
            link.style.visibility = "hidden"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast({
                title: "CSV Export",
                description: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} report has been exported as CSV.`,
                duration: 3000,
            })
            break
    }
}