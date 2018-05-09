import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/first';
import { Conduit, emptyDataflow, source } from '.';

it('basic', async () => {
  const c: Conduit<{ s: string }, { n: number }> = get => ({
    n: get('s').map(s => s.length),
  });
  const n = await emptyDataflow
    .add(c)
    .add(source({ s: 'hello' }))
    .run()
    .n.first()
    .toPromise();
  expect(n).toBe(5);
});

it('loop', done => {
  const c: Conduit<{ n: number }, { n: number }> = get => ({
    n: get('n')
      .delay(1)
      .map(n => n + 1),
  });
  emptyDataflow
    .add(c)
    .add(source({ n: 0 }))
    .run()
    .n.subscribe(n => {
      if (n === 5) done();
    });
});
