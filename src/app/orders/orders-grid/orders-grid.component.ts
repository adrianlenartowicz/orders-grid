import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { formatDate } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrdersApiService } from '../../services/orders/orders-api.service';
import { Order } from '../../models/order.model';
import { AgGridAngular } from 'ag-grid-angular'
import type { ColDef, GridApi, GridReadyEvent, CellClickedEvent } from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';
import { QuotesService } from '../../services/quotes/quotes.service';

@Component({
  selector: 'app-order-grid',
  imports: [AgGridAngular],
  templateUrl: './orders-grid.component.html',
  styleUrl: './orders-grid.component.scss',
})
export class OrdersGridComponent implements OnInit{
  private ordersService = inject(OrdersApiService);
  private quotesService = inject(QuotesService);
  private destroyRef = inject(DestroyRef);
  private snackBar = inject(MatSnackBar);

  orders = signal<Order[]>([]);
  quotes = signal<Record<string, number>>({});
  isDark = signal(window.matchMedia('(prefers-color-scheme: dark)').matches);

  gridApi?: GridApi;
  
  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  colDef: ColDef[] = [
    {
      field: 'symbol',
      rowGroup: true,
      hide: true
    },
    {
      field: 'id',
      headerName: 'Order ID'
    },
    {
      field: 'side',
      headerName: 'Side'
    },
    {
      field: 'size',
      aggFunc: 'sum',
      headerName: 'Size'
    },
    {
      field: 'openTime',
      headerName: 'Open Time',
      valueFormatter: params => {
        if (params.node && params.node.group) return '';
        return formatDate(params.value, 'dd.MM.yyyy HH:mm:ss','en');
      }
    },
    {
      field: 'openPrice',
      aggFunc: 'avg',
      headerName: 'Open Price',
       valueFormatter: params => {
        if (params.value == null) return '';
        return Number(params.value).toFixed(2);
      } 
    },
    {
      field: 'swap',
      aggFunc: 'sum',
      headerName: 'Swap',
      valueFormatter: params => {
        if (params.value == null) return '';
        if (Math.abs(Number(params.value)) < 0.00005) {
          return '0';
        };
        return Number(params.value).toFixed(4);
      } 
    },
    {
      headerName: 'Profit',
      aggFunc: 'avg',
      colId: 'profit',
      valueGetter: params => {
        if (params.node?.group) return undefined;

        const profit = this.calculateProfit(params.data);

        return Number.isFinite(profit) ? profit : 0;
      },
      valueFormatter: params => {
        return Number(params.value ?? 0).toFixed(4);
      },
      cellStyle: params => {
        const value = Number(params.value);
        if (value > 0) {
          return { color: 'rgb(60, 193, 149)' };
        }
        if (value < 0) {
          return { color: 'rgb(249, 76, 76)' };
        }
        return null;
      }
    },
    {
      headerName: '',
      colId: 'close',
      width: 70,
      sortable: false,
      filter: false,
      cellStyle: {
        cursor: 'pointer'
      },
      cellRenderer: () => {
        const el = document.createElement('div');
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.innerHTML = '<span class="material-icons">close</span>';
        return el;
      },
      onCellClicked: params => this.closeRow(params)
    }
  ];

  autoGroupColumnDef = {
    headerName: 'Symbol',
  };

  lightTheme = themeQuartz
    .withParams({
      backgroundColor: 'rgb(233, 237, 241)',
      foregroundColor: 'rgb(14, 15, 26)',
      oddRowBackgroundColor: 'rgb(220, 225, 229)',
      rowHoverColor: 'rgb(201, 209, 216)',
  });

  darkTheme = themeQuartz
    .withParams({
      backgroundColor: 'rgb(42, 56, 71)',
      foregroundColor: 'rgb(198, 210, 219)',
      oddRowBackgroundColor: 'rgba(14, 15, 26, .25)',
      rowHoverColor: 'rgba(53, 71, 89, .5)',
  });
  
  ngOnInit() {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const listener = (e: MediaQueryListEvent) =>
      this.isDark.set(e.matches);

    media.addEventListener('change', listener);

    this.destroyRef.onDestroy(() => {
      media.removeEventListener('change', listener);
    });

    this.ordersService.getOrders()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        this.orders.set(data);
        const symbols = [...new Set(data.map(o => o.symbol))];
        this.quotesService.subscribeSymbols(symbols);
    });

    this.quotesService.quotes$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(quotes => {
        const updated = { ...this.quotes() };
        for (const q of quotes) {
          updated[q.s] = q.b;
        }
        this.quotes.set(updated);

        this.gridApi?.refreshCells({
          columns: ['profit'],
          force: true
        });

        this.gridApi?.refreshClientSideRowModel('aggregate');
    });
  }

  private getMultiplier(symbol: string): number {
    switch (symbol) {
      case 'AUDCHF':
        return 10 ** 1;
      case 'BTCUSD':
        return 10 ** 2;
      case 'ETHUSD':
        return 10 ** 3;
      default:
        return 1;
    }
  }

  calculateProfit(order: Order): number {
    const priceBid = this.quotes()[order.symbol]

    if (priceBid == null) return 0;

    const multiplier = this.getMultiplier(order.symbol);
    const sideMultiplier = order.side === 'BUY' ? 1 : -1;

    return (order.openPrice - priceBid) * multiplier * sideMultiplier / 100;
  }

  private closeRow(params: CellClickedEvent): void {
    const ids = this.getIdsToClose(params);

    if (!ids.length) return;

    this.orders.update(list =>
      list.filter(order => !ids.includes(order.id))
    );

    this.showCloseMessage(ids);
  }

  private getIdsToClose(params: CellClickedEvent<Order>): number[] {

    if (params.node.group) {
      return (params.node.allLeafChildren ?? [])
        .map((node) => node.data?.id)
        .filter((id): id is number => id != null);
    }

    return [params.data!.id];
  }

  private showCloseMessage(ids: number[]): void {
    this.snackBar.open(
      `Zamknięto zlecenie nr ${ids.join(', ')}`,
      'OK',
      { duration: 3000 }
    );
  }

}
