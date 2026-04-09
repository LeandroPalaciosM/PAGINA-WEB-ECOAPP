import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActividadesDisponiblesComponents } from './actividades-disponibles';

describe('ActividadesDisponiblesComponents', () => {
  let component: ActividadesDisponiblesComponents;
  let fixture: ComponentFixture<ActividadesDisponiblesComponents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActividadesDisponiblesComponents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActividadesDisponiblesComponents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
