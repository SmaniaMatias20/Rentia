import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardTenant } from './card-tenant';

describe('CardTenant', () => {
  let component: CardTenant;
  let fixture: ComponentFixture<CardTenant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardTenant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardTenant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
