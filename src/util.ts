export type ConsistentWith<T, U> = Pick<U, keyof T & keyof U>;
