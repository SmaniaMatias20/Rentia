import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTotalRentAmount } from './form-total-rent-amount';

describe('FormTotalRentAmount', () => {
  let component: FormTotalRentAmount;
  let fixture: ComponentFixture<FormTotalRentAmount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormTotalRentAmount]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormTotalRentAmount);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
