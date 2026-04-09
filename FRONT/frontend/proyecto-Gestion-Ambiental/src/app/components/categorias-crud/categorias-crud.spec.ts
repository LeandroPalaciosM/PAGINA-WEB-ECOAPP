import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriasCrud } from './categorias-crud';

describe('CategoriasCrud', () => {
  let component: CategoriasCrud;
  let fixture: ComponentFixture<CategoriasCrud>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriasCrud]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriasCrud);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
