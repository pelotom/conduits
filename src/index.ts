import { Observable } from 'rxjs/Observable'

export type Rec = Record<string, {} | null>

export type Observables<T extends Rec> = { [K in keyof T]: Observable<T[K]> }

export interface Conduit<I extends Rec, O extends Rec> {
  // tslint:disable-next-line callable-types
  (inputs: Observables<I>): Observables<O>
}

export type Mutex<O> = { [_ in keyof O]?: never } & Rec

export type ConsistentWith<O> = Partial<O> & Rec

export type Omit<T, U> = { [K in Exclude<keyof T, keyof U>]: T[K] }

export function connect<
  I1 extends Rec,
  O1 extends ConsistentWith<I1>,
>(c1: Conduit<I1, O1>): Conduit<Omit<I1, O1>, Omit<O1, I1>> {
// function connect<
//   I1 extends Rec,
//   O1 extends Rec,
//   I2 extends ConsistentWith<O1>,
//   O2 extends ConsistentWith<I1> & Mutex<O1>
// >(c1: Conduit<I1, O1>, c2: Conduit<I2, O2>): Conduit<I1 & I2, O1 & O2> {
  return undefined as any
}

