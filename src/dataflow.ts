import { Observable, Observer, Subject, of as observableOf } from 'rxjs';
import { publishReplay, refCount } from 'rxjs/operators';
import { Conduit, Outputs, Source } from './conduit';
import { ConsistentWith } from './util';

export interface IncompleteDataflow<I, O extends ConsistentWith<O, I>> {
  add<I2 extends ConsistentWith<I2, I & O>, O2 extends ConsistentWith<O2, I & O & I2>>(
    other: Conduit<I2, O2>,
  ): Dataflow<I & I2, O & O2>;
  add<O2 extends {} extends O2 ? never : ConsistentWith<O2, I & O>>(
    o: Source<O2>,
  ): Dataflow<I, O & O2>;
}

export interface CompleteDataflow<I, O extends I> extends IncompleteDataflow<I, O> {
  run(): Outputs<O>;
}

export type Dataflow<I, O extends ConsistentWith<O, I>> = O extends I
  ? CompleteDataflow<I, O>
  : IncompleteDataflow<I, O>;

export const emptyDataflow: Dataflow<{}, {}> = createDataflow([]);

function createDataflow<I, O extends ConsistentWith<O, I>>(
  conduits: Conduit<I, O>[],
): Dataflow<I, O> {
  return {
    add: (o: any) => createDataflow([...conduits, typeof o === 'function' ? o : fromSource(o)]),
    run(): Record<string, Observable<any>> {
      interface IO {
        observer: Observer<any>;
        observable: Observable<any>;
      }
      const subjects: Record<string, IO> = {};

      const get = (name: string): IO => {
        if (!(name in subjects)) {
          const observer = new Subject();
          const observable = observer.pipe(publishReplay(1), refCount());
          observable.subscribe(() => {}); // Avoid hanging
          subjects[name] = { observer, observable };
        }
        return subjects[name];
      };

      const observables: Record<string, Observable<any>> = {};
      conduits.forEach(conduit => {
        const outputs = conduit(name => get(name).observable);
        for (const name in outputs) {
          const output = outputs[name];
          const { observer, observable } = get(name);
          observables[name] = observable;
          output.subscribe(x => observer.next(x), e => observer.error(e));
        }
      });

      return observables;
    },
  } as any;
}

function fromSource<O>(source: Source<O>): Conduit<{}, O> {
  const outputs: Outputs<O> = {} as any;
  for (const k in source) {
    const val = source[k];
    outputs[k] = val instanceof Observable ? val : observableOf(val);
  }
  return () => outputs;
}