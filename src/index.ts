import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/observable/of';

export type ConsistentWith<O> = Partial<O> & Record<string, {} | null>;

export type GetInput<I> = <K extends keyof I>(name: K) => Observable<I[K]>;
export type Outputs<O> = { [K in keyof O]: Observable<O[K]> };

export interface Conduit<I, O> {
  (getInput: GetInput<I>): Outputs<O>;
}

export interface IncompleteDataflow<I, O> {
  add<I2 extends ConsistentWith<I & O>, O2 extends ConsistentWith<I & O & I2>>(
    other: Conduit<I2, O2>,
  ): Dataflow<I & I2, O & O2>;
}

export interface CompleteDataflow<I, O extends I> extends IncompleteDataflow<I, O> {
  run(): Outputs<O>;
}

export type Dataflow<I, O> = O extends I ? CompleteDataflow<I, O> : IncompleteDataflow<I, O>;

export const dataflow = (): Dataflow<{}, {}> => createDataflow([]);

function createDataflow<I, O>(conduits: Conduit<I, O>[]): Dataflow<I, O> {
  return {
    add: (other: Conduit<any, any>) => createDataflow([...conduits, other]),
    run: (): Outputs<any> => {
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
