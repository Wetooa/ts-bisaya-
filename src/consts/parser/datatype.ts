export const DATA_TYPE = ["INT", "FLOAT", "CHAR", "BOOLEAN", "STRING"] as const;

export type DataType = (typeof DATA_TYPE)[number];
