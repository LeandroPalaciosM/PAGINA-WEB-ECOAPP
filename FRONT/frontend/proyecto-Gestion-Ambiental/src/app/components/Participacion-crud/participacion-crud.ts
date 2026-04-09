/**
 * Autora: Gabriela Solange Gonzalez Roman
 * Fecha: 2026-02-04
 * Descripción: Lógica para el CRUD de Participaciones 
 */

import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { Participacion } from '../../models/Participacion'; 
import { ParticipacionService } from '../../services/participacion'; 
import { AuthService } from '../../services/auth.service'; 
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe, CommonModule } from '@angular/common';
import { SectionHeader } from "../../shared/components/section-header/section-header";
import { FeedbackComponent } from '../../shared/components/feedback/feedback';

declare const bootstrap: any;

@Component({
  selector: 'app-participacion-crud',
  standalone: true,
  imports: [ReactiveFormsModule, SectionHeader, DatePipe, FeedbackComponent, CommonModule],
  templateUrl: './participacion-crud.html', 
  styleUrl: './participacion-crud.css',
})
export class ParticipacionCrud implements OnInit, AfterViewInit {

  idUsuarioLogueado: number | null = null; 
  rolUsuario: string | null = null; 

  participaciones: Participacion[] = [];
  formParticipacion!: FormGroup; 
  editingId: number | null = null; 
  
  selectedItem: Participacion | null = null; 

  @ViewChild('feedbackRef') feedback!: FeedbackComponent;
  
  modalRef: any; 
  @ViewChild('participacionModalRef') modalElement!: ElementRef; 

  infoModalRef: any;
  @ViewChild('infoModalHTML') infoModalElement!: ElementRef;

  constructor(
    private miServicio: ParticipacionService, 
    private authService: AuthService, 
    private router: Router, 
    private fb: FormBuilder
  ) {
    this.formParticipacion = this.fb.group({
      id_user: [null], 
      id_actividad: [null, [Validators.required, Validators.min(1)]], 
      rol_en_actividad: ['', [Validators.required]], 
      observaciones: [''], 
      estado: ['Confirmado', Validators.required],
      fecha_inscripcion: [new Date().toISOString().split('T')[0]] 
    });
  }

  ngOnInit(): void {
    this.idUsuarioLogueado = this.authService.getUserId();
    this.rolUsuario = this.authService.getUserRole();

    if (this.rolUsuario === 'Voluntario') {
       this.router.navigate(['/mis-inscripciones']);
       return;
    }

    if (!this.idUsuarioLogueado) {
        this.router.navigate(['/login']);
        return;
    }

    this.loadParticipaciones();
  }

  ngAfterViewInit() {
    if (this.modalElement) {
        this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
        this.modalRef.hide();
    }

    if (this.infoModalElement) {
        this.infoModalRef = new bootstrap.Modal(this.infoModalElement.nativeElement);
        this.infoModalRef.hide();
    }
  }

  loadParticipaciones(): void {
    this.miServicio.getParticipacion().subscribe({
      next: (data: Participacion[]) => {
        this.participaciones = data;
      },
      error: (error) => {
        this.feedback.showError('No se pudieron cargar las inscripciones.', 3000);
      }
    });
  }

  // Buscar
  search(busq: HTMLInputElement) {
    let parametro = busq.value; 
    if (!parametro) {
        this.loadParticipaciones();
        return;
    }
    this.miServicio.searchParticipacions(parametro).subscribe(
      (datos: Participacion[]) => {
          this.participaciones = datos;
      }
    );
  }

  openNew() {
    this.editingId = null; 
    
    this.formParticipacion.reset({
      id_user: null, 
      id_actividad: null,
      rol_en_actividad: '',      
      observaciones: '',
      estado: 'Pendiente', 
      fecha_inscripcion: new Date().toISOString().split('T')[0]
    });
    
    this.modalRef.show(); 
  }

  openEdit(item: Participacion) {
    this.editingId = item.id_participacion ?? null; 
    const datos = { ...item };
    if (datos.fecha_inscripcion) {
      datos.fecha_inscripcion = datos.fecha_inscripcion.toString().split('T')[0];
    }
    this.formParticipacion.patchValue(datos); 
    this.modalRef.show(); 
  }

  openInfo(item: Participacion) {
    this.selectedItem = item; 
    this.infoModalRef.show(); 
  }

  save() {
    if (this.formParticipacion.invalid) {
      this.formParticipacion.markAllAsTouched();
      this.feedback.showError('Por favor, completa los campos obligatorios.', 3000);
      return;
    }

    const datos = this.formParticipacion.value;

    if (this.editingId) {
      let updateItem: Participacion = { ...datos, id_participacion: this.editingId };
      this.miServicio.updateParticipacion(updateItem).subscribe({
        next: () => this.handleSuccess('Registro actualizado correctamente.'),
        error: (err) => this.handleError(err)
      });
    } else {
      let newItem: Participacion = { ...datos };
      this.miServicio.addParticipacion(newItem).subscribe({
        next: () => this.handleSuccess('Inscripción creada correctamente.'),
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleSuccess(msg: string) {
     this.feedback.showSuccess(msg, 3000);
     setTimeout(() => {
        this.modalRef.hide();
        this.loadParticipaciones();
     }, 1500);
  }

  private handleError(err: any) {
    if (err.error && err.error.message && err.error.message.includes("NO existen")) {
        this.formParticipacion.get('id_user')?.setErrors({ noExiste: true });
        this.formParticipacion.get('id_actividad')?.setErrors({ noExiste: true });
        this.feedback.showError(err.error.message, 4000);
     } else {
        this.feedback.showError('Ocurrió un error al procesar la solicitud.', 3000);
     }
  }
  
  cambiarEstado(item: Participacion, nuevoEstado: string) {
    if (item.estado === nuevoEstado) return;

    const participacionActualizada: Participacion = { 
      ...item, 
      estado: nuevoEstado 
    };

    this.miServicio.updateParticipacion(participacionActualizada).subscribe({
      next: () => {
        if(nuevoEstado === 'Confirmado') {
            this.feedback.showSuccess('Voluntario aceptado exitosamente.', 3000);
        } else if (nuevoEstado === 'Asistió') {
            this.feedback.showSuccess('Asistencia marcada correctamente.', 3000);
        } else {
            this.feedback.showSuccess(`Estado actualizado a: ${nuevoEstado}`, 3000);
        }
        this.loadParticipaciones(); 
      },
      error: (err: any) => {
        this.feedback.showError('Error al cambiar el estado.', 3000);
      }
    });
  }

  delete(item: Participacion) {
    if (confirm(`¿Estás seguro de eliminar el registro de participación #${item.id_participacion}?`)) {
       if (item.id_participacion) {
        this.miServicio.deleteParticipacion(item.id_participacion).subscribe(
          () => {
            this.feedback.showSuccess('Registro eliminado correctamente.', 3000);
            this.loadParticipaciones();
          },
          (error) => {
              this.feedback.showError('Error al intentar eliminar.', 3000);
          }
        );
      }
    }
  }
}