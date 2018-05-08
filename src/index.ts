import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/observable/of';

export type ConsistentWith<T, U> = Pick<U, keyof T & keyof U>;

export type GetInput<I> = <K extends keyof I>(name: K) => Observable<I[K]>;
export type Outputs<O> = { [K in keyof O]: Observable<O[K]> };

export interface Conduit<I, O> {
  (getInput: GetInput<I>): Outputs<O>;
}

export interface IncompleteDataflow<I, O> {
  add<I2 extends ConsistentWith<I2, I & O>, O2 extends ConsistentWith<O2, I & O & I2>>(
    other: Conduit<I2, O2>,
  ): Dataflow<I & I2, O & O2>;
}

export interface CompleteDataflow<I, O extends I> extends IncompleteDataflow<I, O> {
  run(): { [K in keyof O]: Observable<O[K]> };
}

export type Dataflow<I, O> = O extends I ? CompleteDataflow<I, O> : IncompleteDataflow<I, O>;

export const emptyDataflow: Dataflow<{}, {}> = createDataflow([]);

export const source = <O>(o: { [K in keyof O]: O[K] | Observable<O[K]> }): Conduit<{}, O> => {
  const outputs: Outputs<O> = {} as any;
  for (const k in o) {
    const val = o[k];
    outputs[k] = val instanceof Observable ? val : Observable.of(val);
  }
  return () => outputs;
};

function createDataflow<I, O>(conduits: Conduit<I, O>[]): Dataflow<I, O> {
  return {
    add: (other: Conduit<any, any>) => createDataflow([...conduits, other]),
    run: (): Record<string, Observable<any>> => {
      const inputs: { [K in string]: Subject<any> } = {};

      const getInput = (name: string): Subject<any> => {
        if (!(name in inputs)) inputs[name] = new ReplaySubject();
        return inputs[name];
      };

      const allOutputs: Outputs<any> = {};
      conduits.forEach(conduit => {
        const outputs = conduit(getInput);
        for (const name in outputs) {
          const output = outputs[name];
          if (!(name in allOutputs)) allOutputs[name] = output;
          output.subscribe(getInput(name));
        }
      });

      return allOutputs;
    },
  } as any;
}
