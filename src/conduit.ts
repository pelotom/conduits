import { Observable, of as observableOf } from 'rxjs';
import { ConsistentWith } from './util';

export interface GetInputs<I> {
  <K1 extends keyof I>(k1: K1): Observable<Pick<I, K1>>;
  <K1 extends keyof I, K2 extends keyof I>(k1: K1, k2: K2): Observable<Pick<I, K1 | K2>>;
  <K1 extends keyof I, K2 extends keyof I, K3 extends keyof I>(k1: K1, k2: K2, k3: K3): Observable<
    Pick<I, K1 | K2 | K3>
  >;
  <K1 extends keyof I, K2 extends keyof I, K3 extends keyof I, K4 extends keyof I>(
    k1: K1,
    k2: K2,
    k3: K3,
    k4: K4,
  ): Observable<Pick<I, K1 | K2 | K3 | K4>>;
  <
    K1 extends keyof I,
    K2 extends keyof I,
    K3 extends keyof I,
    K4 extends keyof I,
    K5 extends keyof I
  >(
    k1: K1,
    k2: K2,
    k3: K3,
    k4: K4,
    k5: K5,
  ): Observable<Pick<I, K1 | K2 | K3 | K4 | K5>>;
  <
    K1 extends keyof I,
    K2 extends keyof I,
    K3 extends keyof I,
    K4 extends keyof I,
    K5 extends keyof I,
    K6 extends keyof I
  >(
    k1: K1,
    k2: K2,
    k3: K3,
    k4: K4,
    k5: K5,
    k6: K6,
  ): Observable<Pick<I, K1 | K2 | K3 | K4 | K5 | K6>>;
}
export type Outputs<O> = { [K in keyof O]: Observable<O[K]> };

export interface Conduit<I, O extends ConsistentWith<I>> {
  (get: GetInputs<I>): Outputs<O>;
}

export function source<O>(src: { [K in keyof O]: O[K] | Observable<O[K]> }): Conduit<{}, O> {
  const outputs: Outputs<O> = {} as any;
  for (const k in src) {
    const val = src[k];
    outputs[k] = val instanceof Observable ? val : observableOf(val);
  }
  return () => outputs;
}
