import { Component, inject, OnInit, signal } from '@angular/core';
import { OrdersApiService } from './services/orders-api.service';
import { Order } from './models/order.model';
import { AgGridAngular } from 'ag-grid-angular'
import type { ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-root',
  imports: [AgGridAngular],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private api = inject(OrdersApiService);

  orders = signal<Order[]>([]);

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
      headerName: 'Open Time'
    },
    {
      field: 'openPrice',
      aggFunc: 'avg',
      headerName: 'Open Price'
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
    this.api.getOrders().subscribe(data => {
      this.orders.set(data);
      console.log(this.orders())
    })
  }
}
