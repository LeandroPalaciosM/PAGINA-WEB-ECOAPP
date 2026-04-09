// Autora: Dominica Torres
import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActividadService } from '../../services/actividades'; 
import { IniciativaService } from '../../services/iniciativa'; 
import { AuthService } from '../../services/auth.service';
import { Actividad } from '../../models/Actividad';
import { Iniciativa } from '../../models/Iniciativa';
import { FeedbackComponent } from '../../shared/components/feedback/feedback';
import { DialogComponent } from "../../shared/components/confirm-dialog/confirm-dialog";
import { SectionHeader } from '../../shared/components/section-header/section-header';

declare const bootstrap: any;

@Component({
  selector: 'actividades-crud',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FeedbackComponent, DialogComponent, SectionHeader],
  providers: [ActividadService, IniciativaService],
  templateUrl: './actividades-crud.html',
  styleUrl: './actividades-crud.css',
})
export class ActividadesCrud implements OnInit, AfterViewInit {
  idUsuarioLogueado: number | null = null; 
  rolUsuario: string | null = null; 
  actividad: Actividad[] = [];
  iniciativas: Iniciativa[] = []; 
  
  formActividad!: FormGroup;
  editingId: number | null = null;
  minDate = '1940-01-01';
  maxDate = new Date().toISOString().split('T')[0];
  dialogVisible = false;
  dialogTitle = '';
  dialogMessage = '';
  dialogData: any = null;

  @ViewChild('actividadModalRef') modalElement!: ElementRef;
  modalRef: any;

  @ViewChild('feedback') feedback!: FeedbackComponent;

  constructor(
    private actividadService: ActividadService,
    private iniciativaService: IniciativaService,
    private authService: AuthService, 
    private fb: FormBuilder,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.idUsuarioLogueado = this.authService.getUserId();
    this.rolUsuario = this.authService.getUserRole();

    if (!this.idUsuarioLogueado) {
        this.router.navigate(['/login']);
        return;
    }

    this.loadActividad();
    this.loadIniciativas(); 
  }

  ngAfterViewInit() {
    if (this.modalElement) {
        this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }

  initForm() {
    this.formActividad = this.fb.group({
      id_iniciativa: ['', Validators.required], 
      nombre: ['', [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern('^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]+$'),
        ]
      ],
      descripcion: ['', [Validators.required, Validators.maxLength(255)]],
      fecha: ['', Validators.required],
      lugar: ['', Validators.required],
      cupo_maximo: [1, [Validators.required, Validators.min(1)]],
      estado: ['Pendiente', Validators.required]
    });
  }

  loadActividad(): void {
    this.actividadService.getActividades().subscribe({
      next: (data: Actividad[]) => this.actividad = data,
      error: (err) => {
          console.error("Error cargando actividades", err);
          this.feedback.showError("Error al cargar la lista.", 3000);
      }
    });
  }

  loadIniciativas(): void {
    this.iniciativaService.getIniciativas().subscribe({
      next: (data) => {
        this.iniciativas = data;
      },
      error: (err) => console.error("Error cargando iniciativas", err)
    });
  }

  getTipoIniciativa(idRecibido: any): string {
    if (!this.iniciativas || this.iniciativas.length === 0) return 'Cargando...';
    if (!idRecibido) return '---';
    
    const encontrada = this.iniciativas.find(i => i.id_iniciativa == idRecibido);
    return encontrada ? encontrada.nombre : 'Desconocida';
  }

  openNew() {
    if (this.rolUsuario !== 'Administrador' && this.rolUsuario !== 'Coordinador') {
        this.feedback.showError("Acceso denegado: Solo Administradores o Coordinadores.", 3000);
        return;
    }

    this.editingId = null;
    this.formActividad.reset({
      id_iniciativa: '', 
      nombre: '',
      descripcion: '',
      fecha: this.maxDate,
      lugar: '',
      cupo_maximo: 1,     
      estado: 'Pendiente'
    });
    this.modalRef.show();
  }

  openEdit(item: Actividad) {
    if (this.rolUsuario !== 'Administrador' && this.rolUsuario !== 'Coordinador') {
        this.feedback.showError("Acceso denegado: Solo Administradores o Coordinadores.", 3000);
        return;
    }

    this.editingId = item.id_actividad || (item as any).idActividad || null;
    this.formActividad.patchValue(item);
    this.modalRef.show();
  }

  save() {
    if (this.rolUsuario !== 'Administrador' && this.rolUsuario !== 'Coordinador') {
        this.feedback.showError("No tienes permisos para guardar cambios.", 3000);
        return;
    }

    if (this.formActividad.invalid) {
      this.formActividad.markAllAsTouched();
      this.feedback.showError("Formulario incompleto o inválido", 3000);
      return;
    }

    const datos = this.formActividad.value;
    datos.id_iniciativa = Number(datos.id_iniciativa);

    if (this.editingId !== null) {
      const actividadActualizada = { 
          ...datos, 
          id_actividad: this.editingId 
      };

      this.actividadService.updateActividad(this.editingId, actividadActualizada)
        .subscribe({
            next: () => {
                this.feedback.showSuccess("Actividad actualizada", 3000);
                this.cerrarYRecargar();
            },
            error: () => this.feedback.showError("Error al actualizar", 3000)
        });
    } else {
      this.actividadService.createActividad(datos)
        .subscribe({
            next: () => {
                this.feedback.showSuccess("Actividad creada", 3000);
                this.cerrarYRecargar();
            },
            error: () => this.feedback.showError("Error al crear", 3000)
        });
    }
  }

  eliminarActividad(item: Actividad) {
    if (this.rolUsuario !== 'Administrador') {
        this.feedback.showError("Acceso denegado: Solo Administradores.", 3000);
        return;
    }

    const idBorrar = item.id_actividad || (item as any).idActividad;
    
    if (confirm(`¿Eliminar la actividad "${item.nombre}"?`) && idBorrar) {
      this.actividadService.deleteActividad(idBorrar)
        .subscribe({
            next: () => {
                this.feedback.showSuccess("Actividad eliminada", 3000);
                this.loadActividad();
            },
            error: () => this.feedback.showError('Error al eliminar', 3000)
        });
    }
  }

  cerrarYRecargar(){
      setTimeout(() => {
        this.modalRef.hide();
        this.loadActividad();
      }, 1500);
  }

  search(texto: string) {
    const parametro = texto.toLowerCase();
    
    if (parametro === '') {
        this.loadActividad(); 
    } else {
        this.actividadService.searchActividades(parametro)
          .subscribe((datos: Actividad[]) => {
            this.actividad = datos;
          });
    }
  }

  openInfo(actividad: Actividad) {
    const categoria = this.getTipoIniciativa(actividad.id_iniciativa);
    
    this.dialogTitle = actividad.nombre;
    this.dialogData = {
      nombre: actividad.nombre,
      descripcion: actividad.descripcion,
      detalle: `Lugar: ${actividad.lugar} | Cupos: ${(actividad as any).cupo_maximo}`,
      categoria: categoria,
      fechaInicio: actividad.fecha,
      estado: actividad.estado 
    };
    this.dialogVisible = true;
  }
}