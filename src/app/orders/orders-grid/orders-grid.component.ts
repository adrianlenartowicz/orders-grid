import { Component, inject, OnInit, signal } from '@angular/core';
import { formatDate } from '@angular/common';
import { OrdersApiService } from '../../services/orders/orders-api.service';
import { Order } from '../../models/order.model';
import { AgGridAngular } from 'ag-grid-angular'
import type { ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-order-grid',
  imports: [AgGridAngular],
  templateUrl: './orders-grid.component.html',
  styleUrl: './orders-grid.component.scss',
})
export class OrdersGridComponent implements OnInit{
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
    this.api.getOrders().subscribe(data => {
      this.orders.set(data);
      console.log(this.orders())
    })
  }
}
