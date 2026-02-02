import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormContract } from './form-contract';

describe('FormContract', () => {
  let component: FormContract;
  let fixture: ComponentFixture<FormContract>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormContract]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormContract);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
