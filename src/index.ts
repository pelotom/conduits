import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/of';

export type Rec = Record<string, {} | null>;

export type ConsistentWith<O> = Partial<O> & Rec;

export type GetInput<I extends Rec> = <K extends keyof I>(name: K) => Observable<I[K]>;

export interface Conduit<I extends Rec, O extends ConsistentWith<I>> {
  (getInput: GetInput<I>): { [K in keyof O]: Observable<O[K]> };
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
  return outerGetInput => {
    const inputs: { [K in keyof I]?: Subject<I[K]> } = {};

    const getInput = <K extends keyof I>(name: K): Subject<I[K]> => {
      if (!inputs[name]) inputs[name] = new Subject<I[typeof name]>();
      return inputs[name]!;
    };

    conduits.forEach(conduit => {
      const outputs = conduit(getInput);
      for (const name in outputs) {
        outputs[name].subscribe(getInput(name));
      }
    });
  };
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
  return conduit(k => {
    const v = sources && sources[k];
    return v instanceof Observable ? v : Observable.of(v);
  });
}
