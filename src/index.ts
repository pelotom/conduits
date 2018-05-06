import { Observable } from 'rxjs/Observable';

export type Rec = Record<string, {} | null>;

export type ConsistentWith<O> = Partial<O> & Rec;

export interface Conduit<I extends Rec, O extends ConsistentWith<I>> {
  (inputs: <K extends keyof I>(name: K) => Observable<I[K]>): { [K in keyof O]: Observable<O[K]> };
}

export type Omit<T, U> = {
  [K in ({ [P in keyof T]: P } & { [P in keyof U]: never } & { [x: string]: never })[keyof T]]: T[K]
};

export function connect<I1 extends Rec, O1 extends ConsistentWith<I1>>(
  c1: Conduit<I1, O1>,
): Conduit<Omit<I1, O1>, Omit<O1, I1>>;
export function connect<
  I1 extends Rec,
  O1 extends ConsistentWith<I1>,
  I2 extends ConsistentWith<I1 & O1>,
  O2 extends ConsistentWith<I1 & O1 & I2>
>(
  c1: Conduit<I1, O1>,
  c2: Conduit<I2, O2>,
): Conduit<Omit<I1 & I2, O1 & O2>, Omit<O1 & O2, I1 & I2>>;
export function connect<I extends Rec, O extends ConsistentWith<I>>(
  ...conduits: Conduit<I, O>[]
): Conduit<Omit<I, O>, Omit<O, I>> {
  return undefined as any;
}

export function run<O extends Rec>(conduit: Conduit<{}, O>): { [K in keyof O]: Observable<O[K]> };
export function run<I extends Rec, O extends ConsistentWith<I>>(
  conduit: Conduit<I, O>,
  sources: { [K in keyof I]: I[K] | Observable<I[K]> },
): { [K in keyof O]: Observable<O[K]> };
export function run<I extends Rec, O extends ConsistentWith<I>>(
  conduit: Conduit<I, O>,
  sources?: { [K in keyof I]: I[K] | Observable<I[K]> },
): { [K in keyof O]: Observable<O[K]> } {
  return undefined as any;
}
