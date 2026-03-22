/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export const encrypt: (a: number, b: number, c: number, d: number) => [number, number, number, number];
export const decrypt: (a: number, b: number, c: number, d: number) => [number, number, number, number];
export const sha256_bytes: (a: number, b: number) => [number, number];
export const sha256_hex: (a: number, b: number) => [number, number];
export const capacity_bytes: (a: number, b: number) => number;
export const embed: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
export const extract: (a: number, b: number, c: number, d: number) => [number, number, number, number];
export const __wbindgen_exn_store: (a: number) => void;
export const __externref_table_alloc: () => number;
export const __wbindgen_externrefs: WebAssembly.Table;
export const __wbindgen_malloc: (a: number, b: number) => number;
export const __externref_table_dealloc: (a: number) => void;
export const __wbindgen_free: (a: number, b: number, c: number) => void;
export const __wbindgen_start: () => void;
