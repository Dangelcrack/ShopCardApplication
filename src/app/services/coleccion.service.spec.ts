import { TestBed } from '@angular/core/testing';

import { ColeccionService } from './coleccion.service';

describe('ColeccionService', () => {
  let service: ColeccionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColeccionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
