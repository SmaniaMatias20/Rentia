import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardOption } from './card-option';

describe('CardOption', () => {
  let component: CardOption;
  let fixture: ComponentFixture<CardOption>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardOption]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardOption);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
