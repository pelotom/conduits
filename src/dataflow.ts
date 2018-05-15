import { Observable, Observer, Subject, combineLatest } from 'rxjs';
import { map, publishReplay, refCount } from 'rxjs/operators';
import { Conduit, GetInputs } from './conduit';
import { ConsistentWith } from './util';

export interface BaseDataflow<I, O extends I> {
  add<C extends Conduit<O, ConsistentWith<O>>>(
    other: C,
  ): C extends Conduit<infer I2, infer O2> ? Dataflow<I & I2, O & I2 & O2> : never;
}

export interface CompleteDataflow<X> extends BaseDataflow<X, X> {
  run(): void;
}

export interface IncompleteDataflow<I, O extends I> extends BaseDataflow<I, O> {}

export type Dataflow<I, O extends I> = I extends O ? CompleteDataflow<I> : IncompleteDataflow<I, O>;

export const emptyDataflow: Dataflow<{}, {}> = createDataflow([]);

function createDataflow<I, O extends I>(conduits: Conduit<I, O>[]): Dataflow<I, O> {
  return {
    add: (c: any) => createDataflow([...conduits, c]),
    run(): Record<string, Observable<any>> {
      const observers: Record<string, Observer<any>> = {};
      const observables: Record<string, Observable<any>> = {};

      const getInputs = (((...names: (keyof I)[]) => {
        const observablePairs = names.map(name =>
          observables[name].pipe(map(value => tuple(name, value))),
        );
        return combineLatest(observablePairs).pipe(
          map(pairs =>
            pairs.reduce(
              (o, [key, value]) => {
                o[key] = value;
                return o;
              },
              {} as I,
            ),
          ),
        );
      }) as any) as GetInputs<I>;

      conduits.forEach(conduit => {
        const outputs = conduit(getInputs);
        for (const name in outputs) {
          const output = outputs[name];
          let observer = observers[name];
          if (!observer) {
            const subject = new Subject();
            const observable = subject.pipe(publishReplay(1), refCount());
            observable.subscribe(() => {}); // Avoid hanging
            observers[name] = observer = subject;
            observables[name] = observable;
          }
          output.subscribe(x => observer.next(x), e => observer.error(e));
        }
      });

      return observables;
    },
  } as any;
}

function tuple<A, B>(x: A, y: B): [A, B] {
  return [x, y];
}
