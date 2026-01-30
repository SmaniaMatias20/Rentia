import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowComment } from './show-comment';

describe('ShowComment', () => {
  let component: ShowComment;
  let fixture: ComponentFixture<ShowComment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowComment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowComment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
