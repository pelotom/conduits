import { Conduit, Dataflow, Source, emptyDataflow } from 'conduits';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/never';
import 'rxjs/add/observable/of';

const stringOutput = Observable.of('hello');
const neverOutput = Observable.never<never>();

// Same key can't appear in both input and output with different value types
{
  type C = Conduit<{ a: string }, { a: boolean }>; // $ExpectError
  type D = Dataflow<{ x: number }, { x: string }>; // $ExpectError
}

// $ExpectType CompleteDataflow<{}, {}>
emptyDataflow;

// $ExpectType CompleteDataflow<{}, { hello: string; }>
emptyDataflow.add({ hello: 'world' });

// Adding a conduit
(c: Conduit<{ a: string; b: number }, { c: boolean; b: number }>) => {
  // $ExpectType IncompleteDataflow<{ a: string; b: number; }, { c: boolean; b: number; }>
  const incomplete = emptyDataflow.add(c);
  // $ExpectType CompleteDataflow<{ a: string; b: number; }, { c: boolean; b: number; } & { a: string; }>
  const complete = incomplete.add({ a: 'foo' });
  const outputs = complete.run();
  outputs.a; // $ExpectType Observable<string>
  outputs.b; // $ExpectType Observable<number>
  outputs.c; // $ExpectType Observable<boolean>
  outputs.z; // $ExpectError
};

// Adding 2 conduits
(
  c1: Conduit<{ a: string }, { c: string; b: number; d: boolean }>,
  c2: Conduit<{ a: string; b: number; c: string }, { a: string; b: number }>,
) => {
  const dataflow = emptyDataflow.add(c1).add(c2);
  const outputs = dataflow.run();
  outputs.a; // $ExpectType Observable<string>
  outputs.b; // $ExpectType Observable<number>
  outputs.c; // $ExpectType Observable<string>
  outputs.d; // $ExpectType Observable<boolean>
};

// Adding inconsistent conduits
(d: Dataflow<{ a: string }, {}>, c: Conduit<{ a: number }, {}>) => {
  d.add(c); // $ExpectError
};
(d: Dataflow<{}, { a: string }>, c: Conduit<{ a: number }, {}>) => {
  d.add(c); // $ExpectError
};
(d: Dataflow<{ a: string }, {}>, c: Conduit<{}, { a: number }>) => {
  d.add(c); // $ExpectError
};
(d: Dataflow<{}, { a: string }>, c: Conduit<{}, { a: number }>) => {
  d.add(c); // $ExpectError
};

// Adding inconsistent sources
(d: Dataflow<{ a: string }, {}>, s: Source<{ a: number }>) => {
  d.add(s); // $ExpectError
};
(d: Dataflow<{}, { a: string }>, s: Source<{ a: number }>) => {
  d.add(s); // $ExpectError
};
