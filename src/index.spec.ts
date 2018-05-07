import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/observable/of';
import { Conduit, dataflow } from '.';

it('basic', async () => {
  const c: Conduit<{ s: string }, { n: number }> = get => ({
    n: get('s').map(s => s.length),
  });
  const d = dataflow().add(c);
  const c2: Conduit<{}, { s: string }> = () => ({ s: Observable.of('hello') });
  const d2 = d.add(c2);
  const n = await d2.run().n.toPromise();
  expect(n).toBe(5);
});

// it('loop', async () => {
//   const c: Conduit<{ n: number }, { n: number }> = get => ({
//     n: get('n').map(n => n + 1),
//   });
// });
