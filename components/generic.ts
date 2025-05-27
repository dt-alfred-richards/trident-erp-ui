
import _ from "lodash"
import moment from "moment";
export const createType = (object: Record<string, any>) => {
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

export const removebasicTypes = (refData: any, additionalFields: string[]) => {
    const basicKeys: string[] = ["createdBy", "modifiedBy", "modifiedOn", "createdOn"]
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

export const getPriority = (givenDate?: Date) => {
    if (!givenDate) return ""
    const diff = getDateDifference(givenDate)
    if (diff <= 2) {
        return "high"
    } else if (diff >= 2 && diff <= 5) {
        return "medium"
    } else {
        return "low"
    }
}