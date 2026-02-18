import { Component, inject, OnInit, signal } from '@angular/core';
import { formatDate } from '@angular/common';
import { OrdersApiService } from '../../services/orders/orders-api.service';
import { Order } from '../../models/order.model';
import { AgGridAngular } from 'ag-grid-angular'
import type { ColDef } from 'ag-grid-community';
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

  orders = signal<Order[]>([]);
  quotes = signal<Record<string, number>>({});

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
      headerName: 'Swap'
    },
    {
      headerName: 'Profit'
    },
  ];

  autoGroupColumnDef = {
    headerName: 'Symbol',
  };
  

  ngOnInit() {
    this.ordersService.getOrders().subscribe(data => {
      this.orders.set(data);
      const symbols = [...new Set(data.map(o => o.symbol))];
      this.quotesService.subscribeSymbols(symbols);
    });

    this.quotesService.quotes$.subscribe(quotes => {
      const updated = { ...this.quotes() };
      for (const q of quotes) {
        updated[q.s] = q.b;
      }
      this.quotes.set(updated);
  });
  }
}
