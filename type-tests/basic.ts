import { Conduit } from 'conduits';

// Same key can't appear in both input and output with different value types
{
  type X = Conduit<{ a: string }, { a: boolean }>; // $ExpectError
}

// Can't use undefined values
{
  type X = Conduit<{ a: undefined }, {}>; // $ExpectError
  type Y = Conduit<{}, { b: undefined }>; // $ExpectError
}
