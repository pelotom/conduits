import { Conduit, connect, run } from '.';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';

it('simple run', async () => {
  const c: Conduit<{ s: string }, { n: number }> = get => ({
    n: get('s').map(s => s.length),
  });
  const n = await run(c, { s: 'hello' }).n.toPromise();
  expect(n).toBe(5);
});

it('loop', async () => {
  const c: Conduit<{ n: number }, { n: number }> = get => ({
    n: get('n').map(n => n + 1),
  });

  run(connect(c));
});
