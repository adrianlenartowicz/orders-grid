import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersGridComponent } from './orders-grid.component';

describe('OrdersGridComponents', () => {
  let component: OrdersGridComponent;
  let fixture: ComponentFixture<OrdersGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdersGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
