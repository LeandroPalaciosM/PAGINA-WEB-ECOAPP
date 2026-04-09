/**
 * Autor: Sebastian Mendoza
 * Fecha: 2026-02-04
 * Descripción: Gestión completa de Iniciativas (CRUD) con relación a Categorías.
 */

import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Iniciativa } from '../../models/Iniciativa';
import { Categoria } from '../../models/Categoria';
import { IniciativaService } from '../../services/iniciativa';
import { CategoriaService } from '../../services/categoria';
import { AuthService } from '../../services/auth.service';
import { SectionHeader } from "../../shared/components/section-header/section-header";
import { FeedbackComponent } from '../../shared/components/feedback/feedback';

declare const bootstrap: any;

@Component({
  selector: 'app-iniciativas-crud',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SectionHeader, DatePipe, FeedbackComponent],
  templateUrl: './iniciativas-crud.html',
  styleUrls: ['./iniciativas-crud.css'] 
})
export class IniciativasCrud implements OnInit, AfterViewInit {

  iniciativas: Iniciativa[] = [];
  iniciativasFiltradas: Iniciativa[] = []; 
  categorias: Categoria[] = [];

  formIniciativa!: FormGroup;
  editingId: number | null = null;
  rolUsuario: string | null = null;

  @ViewChild('feedbackRef') feedback!: FeedbackComponent;
  
  modalRef: any;
  @ViewChild('iniciativaModalRef') modalElement!: ElementRef;

  constructor(
    private iniciativaService: IniciativaService,
    private categoriaService: CategoriaService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.formIniciativa = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required]],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
      estado: ['Activo', Validators.required], 
      id_categoria: [null, [Validators.required]] 
    });
  }

  ngOnInit(): void {
    this.rolUsuario = this.authService.getUserRole();

    if (this.rolUsuario !== 'Administrador' && this.rolUsuario !== 'Coordinador') {
      this.router.navigate(['/inicio']);
      return;
    }

    this.cargarDatos();
  }

  ngAfterViewInit() {
    if (this.modalElement) {
      this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }
  cargarDatos() {
    this.iniciativaService.getIniciativas().subscribe({
      next: (data) => {
        this.iniciativas = data;
        this.iniciativasFiltradas = data;
      },
      error: () => this.feedback.showError('Error al cargar iniciativas', 3000)
    });

    this.categoriaService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = data.filter(c => c.estado === 'Activo' || c.estado === 'Inactiva');
      },
      error: () => console.error('No se pudieron cargar las categorías')
    });
  }

  search(texto: string) {
    if (!texto) {
      this.iniciativasFiltradas = this.iniciativas;
      return;
    }
    const termino = texto.toLowerCase();
    this.iniciativasFiltradas = this.iniciativas.filter(i => 
      i.nombre.toLowerCase().includes(termino) ||
      i.descripcion.toLowerCase().includes(termino) ||
      i.id_categoriaNavigation?.nombre.toLowerCase().includes(termino)
    );
  }

  openNew() {
    this.editingId = null;
    this.formIniciativa.reset({
      estado: 'Activo',
      fecha_inicio: new Date().toISOString().split('T')[0] 
    });
    this.modalRef.show();
  }

  openEdit(item: Iniciativa) {
    this.editingId = item.id_iniciativa;
    
    const datos = { ...item };
    if (datos.fecha_inicio) datos.fecha_inicio = datos.fecha_inicio.split('T')[0];
    if (datos.fecha_fin) datos.fecha_fin = datos.fecha_fin.split('T')[0];

    this.formIniciativa.patchValue(datos);
    this.modalRef.show();
  }

  save() {
    if (this.formIniciativa.invalid) {
      this.formIniciativa.markAllAsTouched();
      return;
    }

    const formValues = this.formIniciativa.value;
    
    if (new Date(formValues.fecha_inicio) > new Date(formValues.fecha_fin)) {
      this.feedback.showError('La fecha de inicio no puede ser mayor a la de fin.', 4000);
      return;
    }

    const payload: Iniciativa = {
      ...formValues,
      id_iniciativa: this.editingId ?? 0
    };

    if (this.editingId) {
      this.iniciativaService.updateIniciativa(this.editingId, payload).subscribe({
        next: () => {
          this.feedback.showSuccess('Iniciativa actualizada correctamente.', 3000);
          this.modalRef.hide();
          this.cargarDatos();
        },
        error: () => this.feedback.showError('Error al actualizar.', 3000)
      });
    } else {
      this.iniciativaService.createIniciativa(payload).subscribe({
        next: () => {
          this.feedback.showSuccess('Iniciativa creada exitosamente.', 3000);
          this.modalRef.hide();
          this.cargarDatos();
        },
        error: () => this.feedback.showError('Error al crear.', 3000)
      });
    }
  }

  delete(item: Iniciativa) {
    if (confirm(`¿Eliminar la iniciativa "${item.nombre}"? Esto podría afectar actividades relacionadas.`)) {
      this.iniciativaService.deleteIniciativa(item.id_iniciativa).subscribe({
        next: () => {
          this.feedback.showSuccess('Registro eliminado.', 3000);
          this.cargarDatos();
        },
        error: () => this.feedback.showError('No se pudo eliminar. Verifique si tiene dependencias.', 4000)
      });
    }
  }
}