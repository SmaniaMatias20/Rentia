import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateComment } from './create-comment';

describe('CreateComment', () => {
  let component: CreateComment;
  let fixture: ComponentFixture<CreateComment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateComment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateComment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
