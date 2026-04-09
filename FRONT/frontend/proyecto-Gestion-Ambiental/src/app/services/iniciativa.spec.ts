import { TestBed } from '@angular/core/testing';

import { Iniciativa } from './iniciativa';

describe('Iniciativa', () => {
  let service: Iniciativa;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Iniciativa);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
