import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableAdmin } from './table-admin';

describe('TableAdmin', () => {
  let component: TableAdmin;
  let fixture: ComponentFixture<TableAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableAdmin]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TableAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
