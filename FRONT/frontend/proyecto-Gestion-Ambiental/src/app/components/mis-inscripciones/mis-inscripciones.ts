/* Autora: Gabriela Gonzalez */
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router'; 
import { Participacion } from '../../models/Participacion';
import { ParticipacionService } from '../../services/participacion';
import { AuthService } from '../../services/auth.service';
import { SectionHeader } from "../../shared/components/section-header/section-header";
import { FeedbackComponent } from '../../shared/components/feedback/feedback';

@Component({
  selector: 'app-mis-inscripciones',
  standalone: true,
  imports: [CommonModule, RouterLink, SectionHeader, DatePipe, FeedbackComponent],
  templateUrl: './mis-inscripciones.html',
  styleUrls: ['./mis-inscripciones.css']
})
export class MisInscripcionesComponent implements OnInit {
  
  participaciones: Participacion[] = [];
  idUsuarioLogueado: number | null = null;
  
  estaLogueado: boolean = false; 

  @ViewChild('feedbackRef') feedback!: FeedbackComponent;

  constructor(
    private participacionService: ParticipacionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.estaLogueado = this.authService.isLoggedIn(); 
    
    if (this.estaLogueado) {
      this.idUsuarioLogueado = this.authService.getUserId();
      this.cargarMisInscripciones();
    } else {
      console.log('Usuario no logueado. Esperando acción.');
    }
  }

  cargarMisInscripciones() {
    if (!this.estaLogueado) return;

    this.participacionService.getMisInscripciones().subscribe({
      next: (data) => {
        this.participaciones = data;
      },
      error: (err) => {
        console.error(err);
        this.feedback.showError('Error al cargar tus inscripciones.', 3000);
      }
    });
  }

  cancelarInscripcion(item: Participacion) {
    if (confirm('¿Estás seguro de que deseas cancelar tu inscripción a esta actividad?')) {
      if (item.id_participacion) {
        this.participacionService.deleteParticipacion(item.id_participacion).subscribe({
          next: () => {
            this.feedback.showSuccess('Inscripción cancelada correctamente.', 3000);
            this.cargarMisInscripciones(); 
          },
          error: () => this.feedback.showError('No se pudo cancelar la inscripción.', 3000)
        });
      }
    }
  }
}