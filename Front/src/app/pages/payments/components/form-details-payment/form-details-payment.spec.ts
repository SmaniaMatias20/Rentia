import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDetailsPayment } from './form-details-payment';

describe('FormDetailsPayment', () => {
  let component: FormDetailsPayment;
  let fixture: ComponentFixture<FormDetailsPayment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormDetailsPayment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormDetailsPayment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
