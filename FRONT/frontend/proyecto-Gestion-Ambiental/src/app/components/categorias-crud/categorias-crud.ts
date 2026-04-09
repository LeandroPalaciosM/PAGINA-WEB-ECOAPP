/*Steven Iñiga
  CRUD de Categorías
  Solo para Administradores
  Permite crear, editar, eliminar y ver detalles de categorías.
  05/06/2024
  */
import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router'; 
import { CategoriaService } from '../../services/categoria';
import { AuthService } from '../../services/auth.service'; 
import { Categoria } from '../../models/Categoria';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { GenericTableComponent } from '../../shared/components/generic-table/generic-table';

declare const bootstrap: any;

@Component({
  selector: 'categorias-crud',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SectionHeader,
    GenericTableComponent
  ],
  templateUrl: './categorias-crud.html',
  styleUrl: './categorias-crud.css'
})
export class CategoriasCrud implements OnInit, AfterViewInit { 

  categorias: Categoria[] = [];
  formCategoria!: FormGroup;
  editingId: number | null = null;
  isViewMode = false;

  @ViewChild('categoriaModalRef') modalElement!: ElementRef;
  modalRef: any;

  columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'estado', label: 'Estado' },
    { key: 'fecha_creacion', label: 'Fecha Creación' }
  ];

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private authService: AuthService, 
    private router: Router            
  ) {
    this.formCategoria = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      estado: [true],
      fecha_creacion: [new Date().toISOString().split('T')[0]]
    });
  }

  ngOnInit(): void {
    const rol = this.authService.getUserRole();
    
    if (rol !== 'Administrador') {
      alert('Acceso Denegado: Solo el Administrador puede gestionar categorías.');
      this.router.navigate(['/inicio']);
      return; 
    }

    this.loadCategorias();
  }

  ngAfterViewInit(): void {
    if (this.modalElement) {
      this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
      
      this.modalElement.nativeElement.addEventListener('hidden.bs.modal', () => {
        this.formCategoria.enable();
        this.formCategoria.reset();
        this.isViewMode = false;
        this.editingId = null;
      });
    }
  }

  loadCategorias(): void {
    this.categoriaService.getCategorias().subscribe({
      next: data => this.categorias = data,
      error: err => console.error('Error cargando categorías', err)
    });
  }

  openNew(): void {
    this.isViewMode = false;
    this.editingId = null;

    this.formCategoria.enable();
    this.formCategoria.reset({
      estado: true,
      fecha_creacion: new Date().toISOString()
    });

    this.modalRef.show();
  }

  //EDITAR
  openEdit(cat: Categoria): void {
    this.isViewMode = false;
    this.editingId = cat.id_categoria ?? null;
    
    const formData = {
        ...cat,
        estado: cat.estado === 'Activo' 
    };

    this.formCategoria.enable();
    this.formCategoria.patchValue(formData);
    this.modalRef.show();
  }

  openView(cat: Categoria): void {
    this.isViewMode = true;
    this.editingId = null;
    
    const formData = {
        ...cat,
        estado: cat.estado === 'Activo'
    };

    this.formCategoria.patchValue(formData);
    this.formCategoria.disable(); 
    this.modalRef.show();
  }

  save(): void {
    if (this.formCategoria.invalid) return;

    const formValue = this.formCategoria.value;

    const payload: Categoria = {
      id_categoria: this.editingId ?? 0,
      nombre: formValue.nombre,
      descripcion: formValue.descripcion,
      estado: formValue.estado ? 'Activo' : 'Inactivo', 
      fecha_creacion: formValue.fecha_creacion
    };

    if (this.editingId !== null) {
      this.categoriaService.updateCategoria(this.editingId, payload)
        .subscribe(() => {
          this.loadCategorias();
          this.modalRef.hide();
        });
    } else {
      this.categoriaService.createCategoria(payload)
        .subscribe(() => {
          this.loadCategorias();
          this.modalRef.hide();
        });
    }
  }

  delete(cat: Categoria): void {
    if (!cat.id_categoria) return;

    const confirmacion = confirm(`¿Eliminar la categoría "${cat.nombre}"?`);
    if (!confirmacion) return;

    this.categoriaService.deleteCategoria(cat.id_categoria)
      .subscribe(() => this.loadCategorias());
  }
}