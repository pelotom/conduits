import { Conduit, connect } from 'conduits';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/never';

const stringOutput = Observable.of('hello');
const neverOutput = Observable.never<never>();

// Connecting removes matching keys from input/output
(c: Conduit<{ a: string; b: number }, { c: string; b: number }>) => {
  const result = connect(c);
  result((x: 'b') => stringOutput); // $ExpectError
  const outputs = result((x: 'a') => stringOutput);
  outputs.b; // $ExpectError
  outputs.c; // $ExpectType Observable<string>
};

// Connecting 2 conduits
(
  c1: Conduit<{ a: string }, { c: string; b: number; d: boolean }>,
  c2: Conduit<{ a: string; b: number; c: string }, { a: string; b: number }>,
) => {
  const result = connect(c1, c2);
  const outputs = result(() => neverOutput);
  outputs.a; // $ExpectError
  outputs.b; // $ExpectError
  outputs.c; // $ExpectError
  outputs.d; // $ExpectType Observable<boolean>
};

// Same key can't appear in multiple places with different value types
(c1: Conduit<{ a: string }, {}>, c2: Conduit<{ a: number }, {}>) => {
  connect(c1, c2); // $ExpectError
};
(c1: Conduit<{}, { a: string }>, c2: Conduit<{ a: number }, {}>) => {
  connect(c1, c2); // $ExpectError
};
(c1: Conduit<{ a: string }, {}>, c2: Conduit<{}, { a: number }>) => {
  connect(c1, c2); // $ExpectError
};
(c1: Conduit<{}, { a: string }>, c2: Conduit<{}, { a: number }>) => {
  connect(c1, c2); // $ExpectError
};
