import { delay, map } from 'rxjs/operators';
import { Conduit, emptyDataflow, source } from '.';

it('basic', done => {
  const c: Conduit<{ s: string }, { n: number }> = get => ({
    n: get('s').pipe(map(({ s }) => s.length)),
  });
  const sink: Conduit<{ n: number }, {}> = get => {
    get('n').subscribe(({ n }) => {
      expect(n).toBe(5);
      done();
    });
    return {};
  };
  const d = emptyDataflow.add(source({ s: 'hello' })).add(c);
  emptyDataflow
    .add(source({ s: 'hello' }))
    .add(c)
    .add(sink)
    .run();
});

it('loop', done => {
  const c: Conduit<{ n: number }, { n: number }> = get => ({
    n: get('n').pipe(delay(1), map(({ n }) => n + 1)),
  });
  const sink: Conduit<{ n: number }, {}> = get => {
    get('n').subscribe(({ n }) => {
      if (n === 5) done();
    });
    return {};
  };
  emptyDataflow
    .add(source({ n: 0 }))
    .add(c)
    .add(sink)
    .run();
});

it('multi', done => {
  const c: Conduit<{ s1: string; s2: string }, { n: number }> = get => ({
    n: get('s1', 's2').pipe(map(({ s1, s2 }) => s1.length + s2.length)),
  });
  const sink: Conduit<{ n: number }, {}> = get => {
    get('n').subscribe(({ n }) => {
      expect(n).toBe(10);
      done();
    });
    return {};
  };
  emptyDataflow
    .add(source({ s1: 'hello', s2: 'world' }))
    .add(c)
    .add(sink)
    .run();
});
