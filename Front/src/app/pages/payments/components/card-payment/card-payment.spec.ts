import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPayment } from './card-payment';

describe('CardPayment', () => {
  let component: CardPayment;
  let fixture: ComponentFixture<CardPayment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardPayment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardPayment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
