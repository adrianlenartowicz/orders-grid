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
      field: 'openPrice',
      aggFunc: 'avg'
    },
    {
      field: 'swap',
      aggFunc: 'sum'
    },
    {
      field: 'size',
      aggFunc: 'sum'
    }
  ]

  ngOnInit() {
    this.api.getOrders().subscribe(data => {
      this.orders.set(data);
    })
  }
}
