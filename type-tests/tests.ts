import { Conduit, Dataflow, emptyDataflow, source } from 'conduits';
import { never as observableNever, of as observableOf } from 'rxjs';

const stringOutput = observableOf('hello');
const neverOutput = observableNever();

// Same key can't appear in both input and output with different value types
{
  type C = Conduit<{ a: string }, { a: boolean }>; // $ExpectError
  type D = Dataflow<{ x: number }, { x: string }>; // $ExpectError
}

{
  // $ExpectType CompleteDataflow<{}>
  emptyDataflow;
  // $ExpectType void
  emptyDataflow.run();
}

{
  // $ExpectType IncompleteDataflow<{}, { hello: string; }>
  const d = emptyDataflow.add(source({ hello: 'world' }));
  // $ExpectError
  d.run();
}

// Adding a conduit
(
  c1: Conduit<{ a: string; b: number }, { c: boolean; b: number }>,
  sink: Conduit<{ a: string; c: boolean }, {}>,
) => {
  // $ExpectError
  emptyDataflow.add(c1);
  // $ExpectType IncompleteDataflow<{}, { a: string; }>
  const incomplete1 = emptyDataflow.add(source({ a: 'foo' }));
  // $ExpectError
  incomplete1.add(c1);
  // $ExpectType IncompleteDataflow<{}, { a: string; } & { b: number; }>
  const incomplete2 = incomplete1.add(source({ b: 42 }));
  // $ExpectType CompleteDataflow<{ a: string; b: number; } & { a: string; c: boolean; }>
  const complete = incomplete2.add(c1).add(sink);
  // $ExpectType void
  complete.run();
};

// Adding 2 conduits
(
  c1: Conduit<{}, { c: string; b: number; d: boolean }>,
  c2: Conduit<{ b: number; c: string }, { a: string; b: number }>,
  c3: Conduit<{ a: string; d: boolean }, {}>,
) => {
  const dataflow = emptyDataflow.add(c1).add(c2);
  // $ExpectError
  dataflow.run();
  dataflow.add(c3).run();
};

// Adding inconsistent conduits
(d: Dataflow<{ a: string }, { a: string }>, c: Conduit<{ a: number }, {}>) => {
  d.add(c); // $ExpectError
};
(d: Dataflow<{}, { a: string }>, c: Conduit<{ a: number }, {}>) => {
  d.add(c); // $ExpectError
};
(d: Dataflow<{ a: string }, { a: string }>, c: Conduit<{}, { a: number }>) => {
  d.add(c); // $ExpectError
};
(d: Dataflow<{}, { a: string }>, c: Conduit<{}, { a: number }>) => {
  d.add(c); // $ExpectError
};
