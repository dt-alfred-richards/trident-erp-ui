import { getChildObject, getNumber } from "@/components/generic";

type InputItem = {
    date: Date;
    total: number;
};

type OutputItem = {
    date: Date | string;
    revenue: number;
} & { item: any };

type OutputFormat = {
    week: OutputItem[];
    month: OutputItem[];
    quarter: OutputItem[];
    custom: OutputItem[];
};

type MapValues = {
    revenue: number,
    item: any
}

export function convertToChart(data: InputItem[]): OutputFormat {
    const weekMap = new Map<string, MapValues>();
    const monthMap = new Map<string, MapValues>();
    const quarterMap = new Map<string, MapValues>();
    const custom: OutputItem[] = [];

    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    data.forEach((item, index) => {
        const date = new Date(item.date);

        // Week: by day name
        const day = dayLabels[date.getDay()];
        weekMap.set(day, {
            item,
            value: getNumber((weekMap.get(day)?.value || 0) + '') + item.total,
        });

        // Month: by week number in month
        const weekInMonth = `Week ${Math.ceil(date.getDate() / 7)}`;
        monthMap.set(weekInMonth, {
            item,
            revenue: getNumber((monthMap.get(weekInMonth)?.value || 0) + '') + item.total
        });

        // Quarter: by month name (or adjust to fit actual quarters if needed)
        const monthName = monthLabels[date.getMonth()];
        quarterMap.set(monthName, {
            item,
            revenue: getNumber((quarterMap.get(monthName)?.value || 0) + '') + item.total
        });

        // Custom: just Day 1, Day 2...
        custom.push({
            date: `Day ${index + 1}`,
            revenue: item.total,
            item
        });
    });
    // Convert maps to arrays and sort by label (for better chart display)
    const week = Array.from(weekMap.entries())
        .sort((a, b) => dayLabels.indexOf(a[0]) - dayLabels.indexOf(b[0]))
        .map(([date, item]) => ({ date, ...item }));

    const month = Array.from(monthMap.entries())
        .sort((a, b) => parseInt(a[0].split(" ")[1]) - parseInt(b[0].split(" ")[1]))
        .map(([date, item]) => ({ date, ...item }));

    const quarter = Array.from(quarterMap.entries())
        .sort((a, b) => monthLabels.indexOf(a[0]) - monthLabels.indexOf(b[0]))
        .map(([date, item]) => ({ date, ...item }));

    return { week, month, quarter, custom };
}
