import { Component } from '@angular/core';
import { OrdersGridComponent } from './orders/orders-grid/orders-grid.component';


@Component({
  selector: 'app-root',
  imports: [OrdersGridComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

}
