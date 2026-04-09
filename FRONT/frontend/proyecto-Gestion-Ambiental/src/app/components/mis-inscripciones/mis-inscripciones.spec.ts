import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisInscripciones } from './mis-inscripciones';

describe('MisInscripciones', () => {
  let component: MisInscripciones;
  let fixture: ComponentFixture<MisInscripciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisInscripciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisInscripciones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
