import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormPayment } from './form-payment';

describe('FormPayment', () => {
  let component: FormPayment;
  let fixture: ComponentFixture<FormPayment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormPayment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormPayment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
