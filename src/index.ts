import { Observable, Subscribable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/publishReplay';
import { connectableObservableDescriptor } from 'rxjs/observable/ConnectableObservable';
import { Observer } from 'rxjs/Observer';

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
      interface Foo {
        observer: Observer<any>;
        observable: Observable<any>;
      }
      const subjects: Record<string, Foo> = {};

      const getFoo = (name: string): Foo => {
        if (!(name in subjects)) {
          const observer = new Subject();
          const observable = observer.publishReplay(1).refCount();
          observable.subscribe(() => {}); // Avoid hanging
          subjects[name] = { observer, observable };
        }
        return subjects[name];
      };

      const allOutputs: Outputs<any> = {};
      conduits.forEach(conduit => {
        const outputs = conduit(name => getFoo(name).observable);
        for (const name in outputs) {
          const output = outputs[name];
          const { observer, observable } = getFoo(name);
          allOutputs[name] = observable;
          output.subscribe(x => observer.next(x), e => observer.error(e));
        }
      });

      return allOutputs;
    },
  } as any;
}
