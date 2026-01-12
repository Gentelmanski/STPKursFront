import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvetEditDialog } from './evet-edit-dialog';

describe('EvetEditDialog', () => {
  let component: EvetEditDialog;
  let fixture: ComponentFixture<EvetEditDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvetEditDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvetEditDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
