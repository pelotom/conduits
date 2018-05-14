import { Conduit, Dataflow, emptyDataflow, source } from 'conduits';
import { never as observableNever, of as observableOf } from 'rxjs';

const stringOutput = observableOf('hello');
const neverOutput = observableNever();

// Same key can't appear in both input and output with different value types
{
  type C = Conduit<{ a: string }, { a: boolean }>; // $ExpectError
  type D = Dataflow<{ x: number }, { x: string }>; // $ExpectError
}

// $ExpectType CompleteDataflow<{}>
emptyDataflow;

// $ExpectType IncompleteDataflow<{}, { hello: string; }>
emptyDataflow.add(source({ hello: 'world' }));

// Adding a conduit
(
  c1: Conduit<{ a: string; b: number }, { c: boolean; b: number }>,
  sink: Conduit<{ a: string; c: boolean }, {}>,
) => {
  // $ExpectType IncompleteDataflow<{ a: string; b: number; }, { c: boolean; b: number; }>
  const incomplete1 = emptyDataflow.add(c1);
  // $ExpectType IncompleteDataflow<{ a: string; b: number; }, { c: boolean; b: number; } & { a: string; }>
  const incomplete2 = incomplete1.add(source({ a: 'foo' }));
  // $ExpectType CompleteDataflow<{ a: string; b: number; } & { a: string; c: boolean; }>
  const complete = incomplete2.add(sink);
  // $ExpectType void
  complete.run();
};

// Adding 2 conduits
(
  c1: Conduit<{ a: string }, { c: string; b: number; d: boolean }>,
  c2: Conduit<{ a: string; b: number; c: string }, { a: string; b: number }>,
  c3: Conduit<{ d: boolean }, {}>,
) => {
  const dataflow = emptyDataflow.add(c1).add(c2);
  // $ExpectError
  dataflow.run();
  dataflow.add(c3).run();
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
