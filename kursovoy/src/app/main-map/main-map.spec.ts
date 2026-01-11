import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainMap } from './main-map';

describe('MainMap', () => {
  let component: MainMap;
  let fixture: ComponentFixture<MainMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainMap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
