import { TestBed } from '@angular/core/testing';

import { AdminStatistics } from './admin';

describe('AdminStatistics', () => {
  let service: AdminStatistics;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminStatistics);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
