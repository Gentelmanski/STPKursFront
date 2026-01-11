import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEventDialog } from './create-event-dialog';

describe('CreateEventDialog', () => {
  let component: CreateEventDialog;
  let fixture: ComponentFixture<CreateEventDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEventDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateEventDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
