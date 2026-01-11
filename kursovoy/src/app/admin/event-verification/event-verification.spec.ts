import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventVerification } from './event-verification';

describe('EventVerification', () => {
  let component: EventVerification;
  let fixture: ComponentFixture<EventVerification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventVerification]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventVerification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
