import { Observable } from 'rxjs/Observable';

export type Rec = Record<string, {} | null>;

export type Observables<T extends Rec> = { [K in keyof T]: Observable<T[K]> };

export type ConsistentWith<O> = Partial<O> & Rec;

export interface Conduit<I extends Rec, O extends ConsistentWith<I>> {
  // tslint:disable-next-line callable-types
  (inputs: Observables<I>): Observables<O>;
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
