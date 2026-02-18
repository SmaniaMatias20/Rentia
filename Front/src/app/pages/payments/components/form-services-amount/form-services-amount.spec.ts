import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormServicesAmount } from './form-services-amount';

describe('FormServicesAmount', () => {
  let component: FormServicesAmount;
  let fixture: ComponentFixture<FormServicesAmount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormServicesAmount]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormServicesAmount);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
