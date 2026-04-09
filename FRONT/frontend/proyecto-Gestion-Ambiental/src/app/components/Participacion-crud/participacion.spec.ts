import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Participacion } from './participacion';

describe('Participacion', () => {
  let component: Participacion;
  let fixture: ComponentFixture<Participacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Participacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Participacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
