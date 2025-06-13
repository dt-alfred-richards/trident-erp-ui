
import _ from "lodash"
import moment from "moment";
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
    const idKeys = Object.keys(refData).filter(item => item.toLowerCase().includes("id"))
    const basicKeys: string[] = ["createdBy", "modifiedBy", "modifiedOn", "createdOn"].concat(idKeys)
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
        return acc;
    }, 0)
}