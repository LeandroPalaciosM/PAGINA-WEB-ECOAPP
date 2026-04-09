import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariosCrud } from './usuarios-crud';

describe('UsuariosCrud', () => {
  let component: UsuariosCrud;
  let fixture: ComponentFixture<UsuariosCrud>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosCrud]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuariosCrud);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
