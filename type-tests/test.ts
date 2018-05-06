import { Conduit, connect } from "conduits";

declare const c0: Conduit<{ a: string }, { a: number }>; // $ExpectError

// declare const c1: Conduit<{ a: string; b: string; c: boolean }, { x: number }>
// declare const c2: Conduit<{ x: number }, { a: string; c: boolean }>
