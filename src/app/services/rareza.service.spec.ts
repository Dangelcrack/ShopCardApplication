import { TestBed } from '@angular/core/testing';

import { RarezaService } from './rareza.service';

describe('RarezaService', () => {
  let service: RarezaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RarezaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
