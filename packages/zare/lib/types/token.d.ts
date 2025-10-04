export type Token = {
    type: string,
    value: string,
    line: number,
    column: number,
    filePath: string
};

export type OrArray<T> = T | T[];
export type OrPromise<T> = T | Promise<T>;