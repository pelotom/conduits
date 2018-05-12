import { Observable, of as observableOf } from 'rxjs';
import { ConsistentWith } from './util';

export type GetInput<I> = <K extends keyof I>(name: K) => Observable<I[K]>;
export type Outputs<O> = { [K in keyof O]: Observable<O[K]> };

export interface Conduit<I, O extends ConsistentWith<O, I>> {
  (getInput: GetInput<I>): Outputs<O>;
}

export const source = <O>(src: { [K in keyof O]: O[K] | Observable<O[K]> }): Conduit<{}, O> => {
  const outputs: Outputs<O> = {} as any;
  for (const k in src) {
    const val = src[k];
    outputs[k] = val instanceof Observable ? val : observableOf(val);
  }
  return () => outputs;
};
