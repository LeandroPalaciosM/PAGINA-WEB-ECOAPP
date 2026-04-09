/*Dominica Torres */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ActividadService } from '../../services/actividades';
import { AuthService } from '../../services/auth.service';
import { Actividad } from '../../models/Actividad';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-actividades-disponibles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './actividades-disponibles.html',
  styleUrls: ['./actividades-disponibles.css']
})
export class ActividadesDisponiblesComponents implements OnInit {

  actividades: Actividad[] = [];
  actividadesOriginales: Actividad[] = [];
  loading: boolean = true;
  titulo: string = 'Catálogo de Actividades';
  estaLogueado: boolean = false;
  userRole: string = '';

  constructor(
    private actividadService: ActividadService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.estaLogueado = this.authService.isLoggedIn();
    this.userRole = this.authService.getUserRole() || '';

    this.route.paramMap.subscribe(params => {
      const idIniciativa = params.get('id');

      if (idIniciativa) {
        this.cargarPorIniciativa(+idIniciativa);
      } else {
        this.cargarTodas();
      }
    });
  }

  cargarTodas() {
    this.loading = true;
    this.titulo = 'Oportunidades de Voluntariado';

    this.actividadService.getActividades().subscribe({
      next: (data) => this.procesarDatos(data),
      error: (err) => this.manejarError(err)
    });
  }

  cargarPorIniciativa(id: number) {
    this.loading = true;
    this.titulo = 'Actividades de la Iniciativa Seleccionada';

    this.actividadService.getActividadesPorIniciativa(id).subscribe({
      next: (data) => this.procesarDatos(data),
      error: (err) => this.manejarError(err)
    });
  }

  private procesarDatos(data: Actividad[]) {
    this.actividadesOriginales = data;
    this.actividades = data.filter(a => a.estado === 'Abierta' || a.estado === 'Planificada');
    this.loading = false;
  }

  searchActividades(texto: string) {
    if (!texto) {
      this.actividades = this.actividadesOriginales.filter(a => 
        a.estado === 'Abierta' || a.estado === 'Planificada'
      );
      return;
    }

    const t = texto.toLowerCase();

    this.actividades = this.actividadesOriginales.filter(a => {
      const estadoValido = a.estado === 'Abierta' || a.estado === 'Planificada';
      const coincideTexto = 
        (a.nombre || '').toLowerCase().includes(t) ||
        (a.descripcion || '').toLowerCase().includes(t) ||
        (a.lugar || '').toLowerCase().includes(t);

      return estadoValido && coincideTexto;
    });
  }

  irAGestion() {
    this.router.navigate(['/actividades']);
  }

  inscribirse(item: Actividad) {
    if (!this.estaLogueado) {
      Swal.fire({
        title: '¡Únete a nuestra comunidad!',
        text: 'Para inscribirte necesitas iniciar sesión. ¿Vamos al login?',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Sí, ir al Login',
        cancelButtonText: 'Seguir mirando',
        confirmButtonColor: '#3085d6'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }

    Swal.fire({
      title: '¿Te unes al equipo?',
      text: `Vas a inscribirte en: "${item.nombre}"`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, ¡inscribirme!',
      confirmButtonColor: '#198754'
    }).then((result) => {
      if (result.isConfirmed) {
        this.realizarInscripcion(item.id_actividad!);
      }
    });
  }

  private realizarInscripcion(id: number) {
    this.actividadService.inscribirse(id).subscribe({
      next: () => Swal.fire('¡Felicidades!', 'Te has inscrito correctamente.', 'success'),
      error: (err) => {
        if (err.status === 404) {
          Swal.fire('Error Técnico', 'Ruta no encontrada (404).', 'error');
        } else if (err.status === 400) {
          Swal.fire('Aviso', 'Ya estás inscrito en esta actividad.', 'warning');
        } else {
          Swal.fire('Error', 'No pudimos inscribirte en este momento.', 'error');
        }
      }
    });
  }

  private manejarError(err: any) {
    console.error(err);
    this.loading = false;
  }
}