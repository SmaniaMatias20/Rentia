import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardProperty } from './card-property';

describe('CardProperty', () => {
  let component: CardProperty;
  let fixture: ComponentFixture<CardProperty>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardProperty]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardProperty);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
