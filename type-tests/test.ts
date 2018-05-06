import { Conduit, connect } from 'conduits';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

// Same key can't appear in both input and output with different value types
(c: Conduit<{ a: string; b: number }, { c: string; b: string }>) => {
  connect(c); // $ExpectError
};

// Connecting removes matching keys from input/output
(c: Conduit<{ a: string; b: number }, { c: string; b: number }>) => {
  const res = connect(c)({ a: Observable.of('hello') });
  res.c; // $ExpectType Observable<string>
  res.b; // $ExpectError
};
