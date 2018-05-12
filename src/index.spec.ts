import { delay, first, map } from 'rxjs/operators';
import { Conduit, emptyDataflow, source } from '.';

it('basic', async () => {
  const c: Conduit<{ s: string }, { n: number }> = get => ({
    n: get('s').pipe(map(({ s }) => s.length)),
  });
  const n = await emptyDataflow
    .add(c)
    .add(source({ s: 'hello' }))
    .run()
    .n.pipe(first())
    .toPromise();
  expect(n).toBe(5);
});

it('loop', done => {
  const c: Conduit<{ n: number }, { n: number }> = get => ({
    n: get('n').pipe(delay(1), map(({ n }) => n + 1)),
  });
  emptyDataflow
    .add(c)
    .add(source({ n: 0 }))
    .run()
    .n.subscribe(n => {
      if (n === 5) done();
    });
});

it('multi', async () => {
  const c: Conduit<{ s1: string; s2: string }, { n: number }> = get => ({
    n: get('s1', 's2').pipe(map(({ s1, s2 }) => s1.length + s2.length)),
  });
  const n = await emptyDataflow
    .add(c)
    .add(source({ s1: 'hello', s2: 'world' }))
    .run()
    .n.pipe(first())
    .toPromise();
  expect(n).toBe(10);
});
