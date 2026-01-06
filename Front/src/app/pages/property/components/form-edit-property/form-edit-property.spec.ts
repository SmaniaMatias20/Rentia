import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormEditProperty } from './form-edit-property';

describe('FormEditProperty', () => {
  let component: FormEditProperty;
  let fixture: ComponentFixture<FormEditProperty>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormEditProperty]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormEditProperty);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
