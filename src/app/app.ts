import { Component, inject, OnInit } from '@angular/core';
import { OrdersApiService } from './services/orders-api.service';
import { Order } from './models/order.model';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private api = inject(OrdersApiService);

  orders: Order[] = [];

  ngOnInit() {
    this.api.getOrders().subscribe(orders => {
      this.orders = orders;
      console.log(this.orders)
    })
  }
}
