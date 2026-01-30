import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormEditTenant } from './form-edit-tenant';

describe('FormEditTenant', () => {
  let component: FormEditTenant;
  let fixture: ComponentFixture<FormEditTenant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormEditTenant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormEditTenant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
