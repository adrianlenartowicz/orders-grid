import { Injectable } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QuotesService {
  private socket$ = webSocket<any>('wss://webquotes.geeksoft.pl/websocket/quotes');

  quotes$ = this.socket$.pipe(
    map(msg => msg.d ?? [])
  )

  subscribeSymbols(symbols: string[]) {
    this.socket$.next({
      p: '/subscribe/addlist',
      d: symbols
    })
  }
}
