import { Injectable } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';
import { map } from 'rxjs';

interface QuoteMessage {
  p: string;
  d: any;
}

@Injectable({
  providedIn: 'root',
})
export class QuotesService {
  private socket$ = webSocket<QuoteMessage>('wss://webquotes.geeksoft.pl/websocket/quotes');

  quotes$ = this.socket$.pipe(
    map(msg => msg.d ?? [])
  )

  subscribeSymbols(symbols: string[]) {
    this.socket$.next({
      p: '/subscribe/addlist',
      d: symbols
    })
  }

  unsubscribeSymbols(symbols: string[]) {
    this.socket$.next({
      p: '/subscribe/removelist',
      d: symbols
    });
  }
}
