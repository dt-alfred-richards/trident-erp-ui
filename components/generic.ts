
import _ from "lodash"
export const createType = (object: Record<string, any>) => {
    const res = Object.entries(object).map(([key, value]) => {
        return [key, typeof value];
    });

    return Object.fromEntries(res);
};

export const getChildObject = (data: any, path: string, _default?: any) => {
    return _.get(data, path, _default)
}