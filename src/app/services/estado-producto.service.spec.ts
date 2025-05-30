import { TestBed } from '@angular/core/testing';

import { EstadoProductoService } from './estado-producto.service';

describe('EstadoProductoService', () => {
  let service: EstadoProductoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstadoProductoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
