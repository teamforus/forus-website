import { QueryParamConfig } from 'serialize-query-params/src/types';

export const CommaDelimitedArrayParam: QueryParamConfig<Array<string> | null, (string | null)[] | null | undefined> = {
    encode: (array?: Array<string>) => array?.join(),
    decode: (string?: string) => string?.split(','),
};
