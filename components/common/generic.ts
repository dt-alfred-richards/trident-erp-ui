import get from 'lodash.get';

export const lodashGet = ({ data, path }: { data: any, path: string, default?: any }) => get(data, path)