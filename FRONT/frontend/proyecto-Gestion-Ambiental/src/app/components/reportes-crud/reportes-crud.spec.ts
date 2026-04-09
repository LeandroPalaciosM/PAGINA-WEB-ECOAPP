import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesCrud } from './reportes-crud';

describe('ReportesCrud', () => {
  let component: ReportesCrud;
  let fixture: ComponentFixture<ReportesCrud>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesCrud]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportesCrud);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
