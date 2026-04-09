// EDUARDO CHAVEZ
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Reporte } from '../../models/Reporte';
import { ReporteService } from '../../services/reporte';
import { ActividadService } from '../../services/actividades'; 
import { IniciativaService } from '../../services/iniciativa';
import { Actividad } from '../../models/Actividad';
import { Iniciativa } from '../../models/Iniciativa';
import { GenericTableComponent } from '../../shared/components/generic-table/generic-table';
import { InfoCardComponent } from '../../shared/components/info-card/info-card';
import { NgIf, NgFor } from '@angular/common';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { FeedbackComponent } from '../../shared/components/feedback/feedback';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

declare const bootstrap: any;

@Component({
  selector: 'app-reportes-crud',
  standalone: true,
  imports: [ReactiveFormsModule, SectionHeader, FormsModule, GenericTableComponent, InfoCardComponent, NgIf, NgFor],
  templateUrl: './reportes-crud.html',
  styleUrls: ['./reportes-crud.css']
})
export class ReportesCrudComponent implements OnInit, AfterViewInit {
  reportes: Reporte[] = [];
  actividad: Actividad[] = []; 
  iniciativas: Iniciativa[] = [];
  allReportes: Reporte[] = [];   
  formReporte!: FormGroup;
  selectedReporte: Reporte | null = null;
  modalRef: any;
  showDialog = false;
  reporteAEliminar: Reporte | null = null;
  searchTerm: string = '';
  rol: string = '';

  @ViewChild('feedback') feedback!: FeedbackComponent;

  columns = [
    { key: 'nombre_iniciativa', label: 'Iniciativa' },
    { key: 'nombre_actividad', label: 'Actividad' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'observaciones', label: 'Observaciones' },
    { key: 'aprobado', label: 'Aprobado' }
  ];
  
  constructor(
    private fb: FormBuilder, 
    private reporteService: ReporteService, 
    private actividadService: ActividadService,
    private iniciativaService: IniciativaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
      this.initForm();
      const role = this.authService.getUserRole();
      this.rol = role ? role.trim() : 'Voluntario';    
      
      const idUsuario = this.authService.getUserId();
      if (!idUsuario) return;
      
      // Si es voluntario, no carga nada
      if (this.rol !== 'Administrador' && this.rol !== 'Coordinador') {
          return;
      }
      
      this.cargarTodo();
  }

  obtenerRol(): string {
    const role = this.authService.getUserRole();
    if (!role) return 'Voluntario'; 
    return role.toLowerCase();    
  }

  cargarTodo() {
    this.iniciativaService.getIniciativas().subscribe(inis => {
      this.iniciativas = inis;
      
      this.actividadService.getActividades().subscribe(acts => {
          this.actividad = acts.map(a => ({
          ...a,
          nombre: a.nombre || (a as any).nombre_actividad || 'Sin nombre'
        }));
        
        this.loadReportes();
      });
    });
  }

  loadReportes(): void {
    let peticion: Observable<Reporte[]> | null = null;

    if (this.rol === 'Administrador') {
      peticion = this.reporteService.getTodosLosReportes();
    } else if (this.rol === 'Coordinador') {
      peticion = this.reporteService.getMisReportes();
    } else {
      this.reportes = [];
      this.showToast("No tienes permisos para ver reportes", true);
      return;
    }

    peticion.subscribe({
      next: (data) => {
        this.reportes = data.map(r => ({
          ...r,
          nombre_iniciativa: r.id_iniciativaNavigation?.nombre || 'Sin iniciativa',
          nombre_actividad: r.id_actividadNavigation?.nombre || 'Sin actividad'
        }));
      },
      error: (err) => {
        if(err.status === 401) {
            this.showToast("Sesión expirada o no válida", true);
        } else {
            this.showToast("Error al cargar los reportes", true);
        }
      }
    });
  }

  initForm() {
    this.formReporte = this.fb.group({
      id_actividad: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
      fecha: ['', Validators.required],
      observaciones: ['', Validators.required],
      aprobado: [false], 
      id_iniciativa: [null], 
      id_user: [null]
    });
  }

  @ViewChild('movieModalRef') modalElement!: ElementRef;
  @ViewChild('toastElement') toastElement!: ElementRef;
  toastRef: any;
  toastMessage: string = '';

  ngAfterViewInit() {
    if(this.modalElement) this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
    if(this.toastElement) this.toastRef = new bootstrap.Toast(this.toastElement.nativeElement);
  }

  newReporte(): void {
    this.selectedReporte = null;
    this.formReporte.reset({ aprobado: false }); 
    
    if (this.rol === 'Coordinador') {
        this.formReporte.get('aprobado')?.disable();
    } else {
        this.formReporte.get('aprobado')?.enable();
    }
    
    this.modalRef.show();
  }


  private formatearFechaSegura(fecha: string | Date | undefined): string {
    if (!fecha) return '';
    if (fecha instanceof Date) {
        return fecha.toISOString().split('T')[0];
    }
    if (typeof fecha === 'string') {
        return fecha.split('T')[0];
    }
    return '';
  }

  openEditReporte(reporte: Reporte): void {
    this.selectedReporte = { ...reporte };
    
    const fechaFormateada = this.formatearFechaSegura(reporte.fecha);
    
    this.formReporte.patchValue({
      ...reporte,
      fecha: fechaFormateada
    });
    
    if (this.rol === 'Coordinador') {
        this.formReporte.get('aprobado')?.disable();
    } else {
        this.formReporte.get('aprobado')?.enable();
    }

    this.modalRef.show();
  }
   
  selectedReporteInfo: any = null;

  mostrarInfo(reporte: any): void {
      this.selectedReporteInfo = reporte;
  }

  showToast(message: string, isError: boolean = false) {
    this.toastMessage = message;
    
    if(!this.toastElement) return;
    const element = this.toastElement.nativeElement;

    if (isError) {
      element.classList.remove('text-bg-success');
      element.classList.add('text-bg-danger'); 
    } else {
      element.classList.remove('text-bg-danger');
      element.classList.add('text-bg-success'); 
    }
    
    this.toastRef.show();
  }

  saveReporte(): void {
    if (this.formReporte.invalid) {
      this.formReporte.markAllAsTouched();
      this.showToast("Por favor, completa todos los campos obligatorios.", true);
      return;
    }

    const datosForm = this.formReporte.getRawValue();
    
    const fechaFormateada = this.formatearFechaSegura(datosForm.fecha); 

    const reporteFinal: Reporte = {
      ...datosForm, 
      
      fecha: fechaFormateada,
      id_reporte: this.selectedReporte?.id_reporte || 0,
      
      id_user: this.selectedReporte?.id_user || this.authService.getUserId() || 0, 
      
      id_iniciativa: null 
    };

    if (this.selectedReporte?.id_reporte) {

      reporteFinal.id_reporte = this.selectedReporte.id_reporte;
      
      this.reporteService.updateReporte(reporteFinal).subscribe({
        next: () => { 
          this.showToast("Reporte actualizado correctamente"); 
          this.finalizarAccion(); 
        },
        error: (err) => {
          console.error("Error al actualizar:", err);
          this.showToast("Error al actualizar el reporte.", true);
        }
      });

    } else {
      this.reporteService.addReporte(reporteFinal).subscribe({
        next: () => { 
          this.showToast("Reporte guardado exitosamente"); 
          this.finalizarAccion(); 
        },
        error: (err) => {
          console.error("Error al guardar:", err);
          this.showToast("No se pudo guardar el reporte. Verifica los datos.", true);
        }
      });
    }
  }
  private finalizarAccion() {
    this.modalRef.hide();
    this.loadReportes();
    this.selectedReporte = null;
  }

  deleteReporte(reporte: Reporte): void {
    this.reporteAEliminar = reporte;
    this.showDialog = true;
  }

  confirmarDelete(): void {
    if (this.reporteAEliminar?.id_reporte) {
      this.reporteService.deleteReporte(this.reporteAEliminar.id_reporte).subscribe({
        next: () => {
          this.showToast("Reporte eliminado correctamente");
          this.loadReportes(); 
          this.cerrarDialogo();
        },
        error: (err) => {
          this.showToast("No se pudo eliminar el reporte. Intente más tarde.", true);
          this.cerrarDialogo();
        }
      });
    } else {
      this.cerrarDialogo();
    }
  }

  cerrarDialogo(): void {
    this.showDialog = false;
    this.reporteAEliminar = null;
  }

  cancelarDelete(): void {
    this.cerrarDialogo();
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.loadReportes();
      return;
    }
    this.reporteService.searchReportes(this.searchTerm).subscribe(res => this.reportes = res);
  }

  getActividadNombre(id: number | undefined): string { /* ... */ return ''; }
  getActividadIniciativa(id: number | undefined): string { /* ... */ return ''; }

  generarPDF(reporte: any) {
    if (this.rol !== 'Administrador') {
        this.showToast("No tienes permisos para descargar PDF", true);
        return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('REPORTE DE IMPACTO AMBIENTAL', 105, 20, { align: 'center' });

    const fechaPDF = this.formatearFechaSegura(reporte.fecha);

    autoTable(doc, {
      startY: 40,
      body: [
        ['Iniciativa:', reporte.nombre_iniciativa || ''],
        ['Actividad:', reporte.nombre_actividad || ''],
        ['Fecha Reporte:', fechaPDF], 
        ['Descripcion: ', reporte.descripcion],
        ['Estado:', reporte.aprobado ? 'APROBADO' : 'PENDIENTE']
      ],
      theme: 'plain'
    });

    doc.save(`Reporte_${reporte.id_reporte}.pdf`);
  }
}