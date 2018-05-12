import { Observable } from 'rxjs';
import { ConsistentWith } from './util';

export type GetInput<I> = <K extends keyof I>(name: K) => Observable<I[K]>;
export type Outputs<O> = { [K in keyof O]: Observable<O[K]> };

export interface Conduit<I, O extends ConsistentWith<O, I>> {
  (getInput: GetInput<I>): Outputs<O>;
}

export type Source<O> = { [K in keyof O]: O[K] | Observable<O[K]> };
