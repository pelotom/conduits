import { Conduit, connect, run } from '.';
import 'rxjs/add/operator/map';

it('simple run', async () => {
  const c: Conduit<{ s: string }, { n: number }> = get => ({
    n: get('s').map(s => s.length),
  });
  const n = await run(c, { s: 'hello' }).n.toPromise();
  expect(n).toBe(5);
});
