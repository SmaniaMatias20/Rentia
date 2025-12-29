import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTenant } from './form-tenant';

describe('FormTenant', () => {
  let component: FormTenant;
  let fixture: ComponentFixture<FormTenant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormTenant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormTenant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
