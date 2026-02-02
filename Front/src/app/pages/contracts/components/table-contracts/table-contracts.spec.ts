import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableContracts } from './table-contracts';

describe('TableContracts', () => {
  let component: TableContracts;
  let fixture: ComponentFixture<TableContracts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableContracts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableContracts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
