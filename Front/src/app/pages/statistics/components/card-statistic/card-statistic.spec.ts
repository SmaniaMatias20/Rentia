import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardStatistic } from './card-statistic';

describe('CardStatistic', () => {
  let component: CardStatistic;
  let fixture: ComponentFixture<CardStatistic>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardStatistic]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardStatistic);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
