import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/observable/of';
import { Conduit, emptyDataflow, source } from '.';

it('basic', async () => {
  const c: Conduit<{ s: string }, { n: number }> = get => ({
    n: get('s').map(s => s.length),
  });
  const d = emptyDataflow.add(c);
  const d2 = d.add(source({ s: Observable.of('hello') }));
  const n = await d2.run().n.toPromise();
  expect(n).toBe(5);
});

// it('loop', async () => {
//   const c: Conduit<{ n: number }, { n: number }> = get => ({
//     n: get('n').map(n => n + 1),
//   });
// });
