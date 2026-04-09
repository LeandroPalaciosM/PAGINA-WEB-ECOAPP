import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActividadesCrud } from './actividades-crud';

describe('ActividadesCrud', () => {
  let component: ActividadesCrud;
  let fixture: ComponentFixture<ActividadesCrud>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActividadesCrud]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActividadesCrud);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
