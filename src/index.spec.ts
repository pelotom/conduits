import { Conduit, connect, run } from '.';
import 'rxjs/add/operator/map';

it('whee', async () => {
  const c: Conduit<{ s: string }, { n: number }> = getInput => ({
    n: getInput('s').map(x => x.length),
  });
  const n = await run(c, { s: 'hello' }).n.toPromise();
  expect(n).toBe(5);
});
